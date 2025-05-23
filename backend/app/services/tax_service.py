import time
import re
from io import BytesIO
import requests
from fastapi import HTTPException, Form
from fastapi.responses import StreamingResponse
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, WebDriverException, TimeoutException
import json
import os
from datetime import datetime
import pandas as pd
from contextlib import contextmanager

def check_session(driver):
    try:
        current_url = driver.current_url
        print(f"[DEBUG] Current URL: {current_url}")  # In ra URL hiện tại

        if current_url == "data:,":
            print("[DEBUG] Session invalid: current_url is 'data:,'")
            return False
        if "login" in current_url.lower():
            print("[DEBUG] Session invalid: current_url contains 'login'")
            return False

        print("[DEBUG] Session is valid")
        return True
    except Exception as e:
        print(f"[ERROR] Error checking session: {str(e)}")
        return False

def access_login_page(driver, wait, url_manager):
    url_initial = "https://thuedientu.gdt.gov.vn/etaxnnt/Request"
    driver.get(url_initial)
    try:
        session_id = wait.until(EC.presence_of_element_located((By.NAME, 'dse_sessionId'))).get_attribute('value')
        application_id = wait.until(EC.presence_of_element_located((By.NAME, 'dse_applicationId'))).get_attribute('value')
        page_id = wait.until(EC.presence_of_element_located((By.NAME, 'dse_pageId'))).get_attribute('value')
        url_new = (
            f"https://thuedientu.gdt.gov.vn/etaxnnt/Request?"
            f"&dse_sessionId={session_id}"
            f"&dse_applicationId={application_id}"
            f"&dse_pageId={page_id}"
            f"&dse_operationName=corpIndexProc"
            f"&dse_errorPage=error_page.jsp"
            f"&dse_processorState=initial"
            f"&dse_nextEventName=login"
        )
        url_manager.current_url = url_new
        driver.get(url_new)
        return {"message": "Accessed login page."}
    except TimeoutException:
        raise HTTPException(status_code=500, detail="Timeout waiting for page elements")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error accessing page: {str(e)}")

def get_captcha(driver, wait):
    try:
        captcha_image_element = wait.until(
            EC.presence_of_element_located((By.ID, "safecode")),
            message="Waiting for captcha image to load"
        )
        captcha_image_url = captcha_image_element.get_attribute('src')
        browser_cookies = driver.get_cookies()
        cookies = {cookie['name']: cookie['value'] for cookie in browser_cookies}
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
            'Referer': driver.current_url,
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        }
        response = requests.get(
            captcha_image_url,
            headers=headers,
            cookies=cookies,
            verify=False,
            timeout=10,
            stream=True
        )
        if response.status_code == 200:
            image_data = response.content
            return StreamingResponse(
                BytesIO(image_data),
                media_type="image/jpeg",
                headers={
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    "Pragma": "no-cache",
                    "Expires": "0",
                    "Content-Type": "image/jpeg",
                    "Content-Length": str(len(image_data))
                }
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to fetch captcha image")
    except TimeoutException:
        raise HTTPException(status_code=500, detail="Timeout waiting for captcha element")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting captcha: {str(e)}")

def refresh(driver, url_manager):
    driver.get(url_manager.current_url)
    time.sleep(2)
    return {"message": "Captcha refreshed"}

def refresh_captcha(driver, wait):
    try:
        driver.get("https://thuedientu.gdt.gov.vn/etaxnnt/Request")
        time.sleep(2)
        captcha_image_element = wait.until(
            EC.presence_of_element_located((By.ID, "safecode")),
            message="Waiting for new captcha to load"
        )
        captcha_image_url = captcha_image_element.get_attribute('src')
        browser_cookies = driver.get_cookies()
        cookies = {cookie['name']: cookie['value'] for cookie in browser_cookies}
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
            'Referer': driver.current_url,
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        }
        response = requests.get(
            captcha_image_url,
            headers=headers,
            cookies=cookies,
            verify=False,
            timeout=10,
            stream=True
        )
        if response.status_code == 200:
            image_data = response.content
            return StreamingResponse(
                BytesIO(image_data),
                media_type="image/jpeg",
                headers={
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    "Pragma": "no-cache",
                    "Expires": "0",
                    "Content-Type": "image/jpeg",
                    "Content-Length": str(len(image_data))
                }
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to fetch new captcha image")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error refreshing captcha: {str(e)}")

def login(driver, wait, username, password, captcha_code):
    try:
        try:
            username_input = wait.until(EC.presence_of_element_located((By.ID, "_userName")))
            password_input = wait.until(EC.presence_of_element_located((By.ID, "password")))
            captcha_input = wait.until(EC.presence_of_element_located((By.ID, "vcode")))
            login_button = wait.until(EC.element_to_be_clickable((By.ID, "dangnhap")))

            username_input.clear()
            username_input.send_keys(username)
            password_input.clear()
            password_input.send_keys(password)
            captcha_input.clear()
            captcha_input.send_keys(captcha_code)

            login_button.click()
            time.sleep(3)  # Wait for login process
            
            # Check for login success
            if "login" in driver.current_url.lower():
                error_messages = driver.find_elements(By.CSS_SELECTOR, ".error-message, .alert-danger")
                if error_messages:
                    error_text = error_messages[0].text.strip()
                    print(f"[DEBUG] Found error message: {error_text}")
                    raise HTTPException(
                        status_code=401, 
                        detail={
                            "message": f"Đăng nhập thất bại: {error_text}",
                            "refresh_captcha": True
                        }
                    )
                else:
                    raise HTTPException(
                        status_code=401, 
                        detail={
                            "message": "Đăng nhập thất bại, vui lòng thử lại",
                            "refresh_captcha": True
                        }
                    )
            
            try:
                menu = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "li.li-3")))
                menu.click()
                time.sleep(2)
                
                search_menu = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "li[onclick*='traCuuToKhaiProc']")))
                search_menu.click()
                time.sleep(2)
                
                return {"message": "Login successful"}
                
            except Exception as nav_error:
                print(f"[ERROR] Navigation error: {str(nav_error)}")
                raise HTTPException(
                    status_code=500,
                    detail={
                        "message": "Đăng nhập thành công nhưng không thể chuyển trang",
                        "refresh_captcha": False
                    }
                )
                
        except NoSuchElementException as e:
            print(f"[ERROR] Element not found: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail={
                    "message": "Không thể tìm thấy các phần tử đăng nhập",
                    "refresh_captcha": True
                }
            )
            
    except WebDriverException as e:
        print(f"[ERROR] WebDriver error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Lỗi trình duyệt, vui lòng thử lại",
                "refresh_captcha": True
            }
        )
        
    except Exception as e:
        print(f"[ERROR] Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "message": f"Lỗi không xác định: {str(e)}",
                "refresh_captcha": True
            }
        )

def search(driver, wait, from_date, to_date, maTKhai):
    try:
        
        if not check_session(driver):
            raise HTTPException(status_code=401, detail="Session expired, please login again")

        current_url = driver.current_url

        if current_url == "data:," or "login" in current_url.lower():
            driver.get("https://thuedientu.gdt.gov.vn/etaxnnt/Request")
            time.sleep(2)
            raise HTTPException(status_code=401, detail="Please login first")

        if "traCuuToKhaiProc" not in current_url:
            try:
                menu = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "li.li-3")))
                menu.click()
                time.sleep(2)

                search_menu = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "li[onclick*='traCuuToKhaiProc']")))
                search_menu.click()
                time.sleep(2)
            except Exception as e:
                print("[ERROR] Failed to navigate to search page:", str(e))
                raise HTTPException(status_code=500, detail=f"Failed to navigate to search page: {str(e)}")

        try:
            iframe = wait.until(EC.presence_of_element_located((By.ID, "tranFrame")))
            driver.switch_to.frame(iframe)
        except Exception as e:
            print("[ERROR] Failed to switch to iframe:", str(e))
            driver.switch_to.default_content()
            raise HTTPException(status_code=500, detail=f"Failed to switch to iframe: {str(e)}")

        if maTKhai != "00":
            try:
                tax_type_select = wait.until(EC.presence_of_element_located((By.ID, "maTKhai")))
                driver.execute_script("arguments[0].value = '';", tax_type_select)
                
                script = f"""
                    var select = arguments[0];
                    var value = arguments[1];
                    for(var i = 0; i < select.options.length; i++) {{
                        if(select.options[i].value === value) {{
                            select.selectedIndex = i;
                            select.dispatchEvent(new Event('change'));
                            break;
                        }}
                    }}
                """
                driver.execute_script(script, tax_type_select, maTKhai)

                selected_value = driver.execute_script("return arguments[0].value;", tax_type_select)

                if selected_value != maTKhai:
                    tax_type_select.click()
                    time.sleep(1)
                    option = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, f"select#maTKhai option[value='{maTKhai}']")))
                    option.click()
                    time.sleep(1)
            except Exception as e:
                print("[WARN] Failed to select maTKhai but continuing:", str(e))
                pass

        try:
            from_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input#qryFromDate")))
            to_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input#qryToDate")))
            driver.execute_script("arguments[0].value = '';", from_input)
            driver.execute_script("arguments[0].value = arguments[1];", from_input, from_date)
            driver.execute_script("arguments[0].value = '';", to_input)
            driver.execute_script("arguments[0].value = arguments[1];", to_input, to_date)
        except Exception as e:
            print("[ERROR] Failed to set dates:", str(e))
            driver.switch_to.default_content()
            raise HTTPException(status_code=500, detail=f"Failed to set dates: {str(e)}")

        try:
            search_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "input.button_vuong.awesome")))
            driver.execute_script("arguments[0].click();", search_button)
        except Exception as e:
            print("[ERROR] Failed to click search button:", str(e))
            driver.switch_to.default_content()
            raise HTTPException(status_code=500, detail=f"Failed to click search button: {str(e)}")

        time.sleep(3)
        driver.switch_to.default_content()
        return {"message": "Search completed"}

    except NoSuchElementException as e:
        print("[ERROR] Element not found:", str(e))
        driver.switch_to.default_content()
        raise HTTPException(status_code=400, detail=f"Element not found: {str(e)}")

    except WebDriverException as e:
        print("[ERROR] Selenium error:", str(e))
        driver.switch_to.default_content()
        raise HTTPException(status_code=500, detail=f"Selenium error: {str(e)}")

    except Exception as e:
        print("[ERROR] Unexpected error:", str(e))
        driver.switch_to.default_content()
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

def display(driver, wait):
    try:
        if not check_session(driver):
            raise HTTPException(status_code=401, detail="Session expired, please login again")
        iframe = wait.until(EC.presence_of_element_located((By.ID, "tranFrame")))
        driver.switch_to.frame(iframe)
        try:
            table = wait.until(EC.presence_of_element_located((By.ID, "data_content_onday")))
            rows = table.find_elements(By.TAG_NAME, "tr")
            data = []
            skip_indices = set()
            for i, row in enumerate(rows):
                headers = row.find_elements(By.TAG_NAME, "th")
                if headers:
                    header_texts = [th.text.strip() for th in headers]
                    for idx, text in enumerate(header_texts):
                        if text in ["Gửi phụ lục", "Tải thông báo"]:
                            skip_indices.add(idx)
                    filtered_header = [text for idx, text in enumerate(header_texts) if idx not in skip_indices]
                    data.append(filtered_header)
                    continue
                cols = row.find_elements(By.TAG_NAME, "td")
                if cols:
                    row_data = []
                    for idx, col in enumerate(cols):
                        if idx in skip_indices:
                            continue
                        cell_text = col.text.strip()
                        row_data.append(cell_text)
                    data.append(row_data)
            if len(data) <= 1:
                driver.switch_to.default_content()
                return {
                    "table": [["Không có dữ liệu"]],
                    "style": {
                        "textAlign": "center",
                        "fontSize": "24px",
                        "fontWeight": "bold",
                        "padding": "20px"
                    }
                }
            driver.switch_to.default_content()
            return {"table": data}
        except TimeoutException:
            driver.switch_to.default_content()
            return {
                "table": [["Không có dữ liệu"]],
                "style": {
                    "textAlign": "center",
                    "fontSize": "24px",
                    "fontWeight": "bold",
                    "padding": "20px"
                }
            }
    except Exception as e:
        driver.switch_to.default_content()
        return {
            "table": [["Không có dữ liệu"]],
            "style": {
                "textAlign": "center",
                "fontSize": "24px",
                "fontWeight": "bold",
                "padding": "20px"
            }
        }

def download(driver, wait, ma_giao_dich):
    try:
        try:
            driver.switch_to.default_content()
            iframe = wait.until(
                EC.presence_of_element_located((By.ID, "tranFrame"))
            )
            driver.switch_to.frame(iframe)
        except Exception:
            driver.switch_to.default_content()
        try:
            session_id = wait.until(EC.presence_of_element_located((By.NAME, 'dse_sessionId'))).get_attribute('value')
            application_id = wait.until(EC.presence_of_element_located((By.NAME, 'dse_applicationId'))).get_attribute('value')
            page_id = wait.until(EC.presence_of_element_located((By.NAME, 'dse_pageId'))).get_attribute('value')
            processor_id = wait.until(EC.presence_of_element_located((By.NAME, 'dse_processorId'))).get_attribute('value')
            if not session_id or not processor_id:
                raise ValueError("Could not find session_id or processor_id")
        except Exception:
            raise HTTPException(status_code=401, detail="Session expired or invalid")
        cookies = {cookie['name']: cookie['value'] for cookie in driver.get_cookies()}
        download_url = (
            f"https://thuedientu.gdt.gov.vn/etaxnnt/Request"
            f"?dse_sessionId={session_id}"
            f"&dse_applicationId={application_id}"
            f"&dse_operationName=traCuuToKhaiProc"
            f"&dse_pageId={page_id}"
            f"&dse_processorState=viewTraCuuTkhai"
            f"&dse_processorId={processor_id}"
            f"&dse_nextEventName=downTkhai"
            f"&messageId={ma_giao_dich}"
        )
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
            'Accept': 'application/xml,application/x-pdf,application/octet-stream,*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
            'Referer': driver.current_url,
            'Connection': 'keep-alive'
        }
        try:
            response = requests.get(
                download_url,
                cookies=cookies,
                headers=headers,
                verify=False,
                stream=True,
                timeout=30
            )
            if response.status_code == 200:
                temp_file = BytesIO(response.content)
                content_type = response.headers.get('Content-Type', 'application/xml')
                filename = f"ETAX{ma_giao_dich}.xml"
                return StreamingResponse(
                    temp_file,
                    media_type=content_type,
                    headers={
                        'Content-Disposition': f'attachment; filename={filename}',
                        'Content-Type': content_type,
                        'Content-Length': str(len(response.content))
                    }
                )
            else:
                raise HTTPException(status_code=response.status_code, 
                                  detail=f"Download failed with status {response.status_code}")
        except requests.RequestException as e:
            raise HTTPException(status_code=500, detail=f"Request error: {str(e)}")
    except Exception as e:
        try:
            driver.switch_to.default_content()
        except:
            pass
        raise HTTPException(status_code=500, detail=f"Lỗi tải file: {str(e)}")
    finally:
        try:
            driver.switch_to.default_content()
        except:
            pass

@contextmanager
def safe_file_operation():
    try:
        yield
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Không tìm thấy file to_khai_thue.json")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Lỗi khi phân tích file JSON")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi xử lý file: {str(e)}")

def displaylisttax(driver, wait, fromdate=None, todate=None):
    try:
        print(f"[DEBUG] displaylisttax called with fromdate={fromdate}, todate={todate}")
        
        if not check_session(driver):
            raise HTTPException(status_code=401, detail="Session expired, please login again")

        # Đọc file JSON
        current_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        json_path = os.path.join(current_dir, 'to_khai_thue.json')
        print(f"[DEBUG] JSON file path: {json_path}")

        tax_data = None
        with safe_file_operation():
            with open(json_path, 'r', encoding='utf-8') as file:
                tax_data = json.load(file)

        if not tax_data:
            raise HTTPException(status_code=500, detail="Không thể đọc dữ liệu từ file")
        
        print(f"[DEBUG] Loaded tax data with {len(tax_data)} categories")
        for category, items in tax_data.items():
            print(f"[DEBUG] Category '{category}': {len(items)} items")

        # Lấy năm hiện tại
        current_year = datetime.now().year
        print(f"[DEBUG] Current year: {current_year}")

        try:
            # Gọi hàm xử lý danh sách tờ khai
            df_result = hien_thi_to_khai_phai_nop(tax_data, current_year, theo_quy=True)
            print(f"[DEBUG] Generated {len(df_result)} required tax declarations")
            print(f"[DEBUG] Columns: {list(df_result.columns)}")
            print(f"[DEBUG] First 3 declarations:")
            for i, row in df_result.head(3).iterrows():
                print(f"[DEBUG]   {i}: {row['Tên tờ khai']} - {row['Kỳ kê khai']}")

            # Xác định khoảng thời gian để tìm kiếm
            search_fromdate = fromdate
            search_todate = todate
            
            # Nếu không có ngày được cung cấp, sử dụng toàn bộ năm hiện tại
            if not fromdate or not todate:
                search_fromdate = f"01/01/{current_year}"
                search_todate = f"31/12/{current_year}"
            
            print(f"[DEBUG] Search period: {search_fromdate} to {search_todate}")

            # Lọc theo khoảng thời gian nếu có
            if fromdate and todate:
                print(f"[DEBUG] Filtering by date range: {fromdate} to {todate}")
                from_date = datetime.strptime(fromdate, "%d/%m/%Y")
                to_date = datetime.strptime(todate, "%d/%m/%Y")
                print(f"[DEBUG] Parsed dates: from {from_date} to {to_date}")
                
                print(f"[DEBUG] Before filtering: {len(df_result)} rows")
                print(f"[DEBUG] Sample due dates before filtering:")
                for i, row in df_result.head(5).iterrows():
                    print(f"[DEBUG]   Row {i}: {row['Tên tờ khai']} - Due: {row['Hạn nộp']}")
                
                # Chuyển đổi cột Hạn nộp thành datetime để so sánh
                df_result['Hạn nộp dt'] = pd.to_datetime(df_result['Hạn nộp'], format='%d/%m/%Y', errors='coerce')
                
                print(f"[DEBUG] Sample parsed due dates:")
                for i, row in df_result.head(5).iterrows():
                    print(f"[DEBUG]   Row {i}: {row['Hạn nộp']} -> {row['Hạn nộp dt']}")
                
                # Lọc dữ liệu trong khoảng thời gian
                mask = (df_result['Hạn nộp dt'] >= from_date) & (df_result['Hạn nộp dt'] <= to_date)
                print(f"[DEBUG] Filter mask: {mask.sum()} rows match out of {len(mask)}")
                
                df_result = df_result[mask]
                
                # Xóa cột tạm thời
                df_result = df_result.drop('Hạn nộp dt', axis=1)
                print(f"[DEBUG] After date filtering: {len(df_result)} declarations remain")
            else:
                print(f"[DEBUG] No date filtering applied, keeping all {len(df_result)} rows")

            # Chuyển thành bảng hiển thị với trạng thái mặc định là "Chưa hoàn thành"
            table_data = []
            table_data.append(["STT", "Tên tờ khai", "Mã", "Kỳ kê khai", "Hạn nộp", "Trạng thái"])

            print(f"[DEBUG] Processing {len(df_result)} declarations")
            for idx, row in df_result.iterrows():
                table_data.append([
                    str(idx + 1),
                    row["Tên tờ khai"],
                    row["Mã"],
                    row["Kỳ kê khai"],
                    row["Hạn nộp"],
                    "Chưa hoàn thành"  # Default status, will be updated in frontend
                ])

            total_count = len(table_data) - 1  # Trừ header row
            
            print(f"[DEBUG] Final result: {total_count} tax obligations")

            return {
                "message": f"Danh sách {total_count} tờ khai doanh nghiệp phải nộp" + 
                          (f" từ {fromdate} đến {todate}" if fromdate and todate else f" năm {current_year}"),
                "data": table_data
            }
        except Exception as e:
            print(f"[ERROR] Error in processing: {str(e)}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Lỗi khi xử lý dữ liệu: {str(e)}")

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Unexpected error in displaylisttax: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Lỗi khi lấy danh sách tờ khai: {str(e)}")
    finally:
        try:
            driver.switch_to.default_content()
        except:
            pass

def tinh_han_nop(ky: str) -> str:
    try:
        print(f"[DEBUG] Calculating due date for period: '{ky}'")
        if ky.startswith("Q"):
            quy, nam = ky.split("/")
            thang = int(quy[1]) * 3
            han = datetime(int(nam), thang, 30)  # giả định ngày 30
            result = han.strftime("%d/%m/%Y")
            print(f"[DEBUG] Quarter {ky} -> Due date: {result}")
            return result
        elif ky.startswith("T"):
            thang, nam = ky[1:].split("/")
            han = datetime(int(nam), int(thang), 20)
            result = han.strftime("%d/%m/%Y")
            print(f"[DEBUG] Month {ky} -> Due date: {result}")
            return result
        elif ky.isdigit():
            result = f"31/03/{int(ky)+1}"  # Hạn quyết toán năm sau
            print(f"[DEBUG] Year {ky} -> Due date: {result}")
            return result
        else:
            result = "Theo từng lần phát sinh"
            print(f"[DEBUG] Other period {ky} -> Due date: {result}")
            return result
    except Exception as e:
        print(f"[DEBUG] Error calculating due date for '{ky}': {str(e)}")
        return "Không xác định"

def hien_thi_to_khai_phai_nop(data, nam, theo_quy=True):
    bang_ket_qua = []

    for loai_thue, danh_sach_to_khai in data.items():
        for tk in danh_sach_to_khai:
            ten = tk["ten_to_khai"]
            ma = tk["ten_viet_tat"]
            ky_ke_khai = tk["ky_ke_khai"].strip().lower()

            if ky_ke_khai == "tháng/quý":
                if theo_quy:
                    ky = [f"Q{i}/{nam}" for i in range(1, 5)]
                else:
                    ky = [f"T{m}/{nam}" for m in range(1, 13)]
            elif ky_ke_khai == "quý":
                ky = [f"Q{i}/{nam}" for i in range(1, 5)]
            elif ky_ke_khai == "tháng":
                ky = [f"T{m}/{nam}" for m in range(1, 13)]
            elif ky_ke_khai == "năm":
                ky = [str(nam)]
            elif ky_ke_khai == "từng lần phát sinh":
                ky = ["Từng lần phát sinh"]
            else:
                ky = ["Không xác định"]

            for k in ky:
                han_nop = tinh_han_nop(k)
                bang_ket_qua.append({
                    "Loại thuế": loai_thue,
                    "Tên tờ khai": ten,
                    "Mã": ma,
                    "Kỳ kê khai": k,
                    "Hạn nộp": han_nop,
                    "Trạng thái": "Chưa hoàn thành"
                })

    df = pd.DataFrame(bang_ket_qua)
    return df

