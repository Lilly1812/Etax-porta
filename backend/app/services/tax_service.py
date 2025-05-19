import time
import re
from io import BytesIO
import requests
from fastapi import HTTPException, Form
from fastapi.responses import StreamingResponse
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, WebDriverException, TimeoutException

def check_session(driver):
    try:
        current_url = driver.current_url
        if current_url == "data:," or "login" in current_url.lower():
            return False
        return True
    except Exception as e:
        print(f"Error checking session: {str(e)}")
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
        driver.find_element(By.ID, "_userName").send_keys(username)
        driver.find_element(By.ID, "password").send_keys(password)
        driver.find_element(By.ID, "vcode").send_keys(captcha_code)
        driver.find_element(By.ID, "dangnhap").click()
        time.sleep(2)
        try:
            if "login" in driver.current_url.lower():
                raise HTTPException(
                    status_code=401, 
                    detail={
                        "message": "Đăng nhập thất bại, vui lòng thử lại",
                        "refresh_captcha": True
                    }
                )
            error_messages = driver.find_elements(By.CSS_SELECTOR, ".error-message, .alert-danger")
            if error_messages:
                error_text = error_messages[0].text.strip()
                raise HTTPException(
                    status_code=401, 
                    detail={
                        "message": f"Đăng nhập thất bại: {error_text}",
                        "refresh_captcha": True
                    }
                )
            menu = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "li.li-3")))
            menu.click()
            time.sleep(1)
            search_menu = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "li[onclick*='traCuuToKhaiProc']")))
            search_menu.click()
            time.sleep(1)
            return {"message": "Login successful"}
        except NoSuchElementException:
            raise HTTPException(
                status_code=401, 
                detail={
                    "message": "Đăng nhập thất bại, vui lòng thử lại",
                    "refresh_captcha": True
                }
            )
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail={
                "message": f"Lỗi đăng nhập: {str(e)}",
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
                raise HTTPException(status_code=500, detail=f"Failed to navigate to search page: {str(e)}")
        try:
            iframe = wait.until(EC.presence_of_element_located((By.ID, "tranFrame")))
            driver.switch_to.frame(iframe)
        except Exception as e:
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
                pass
        try:
            from_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input#qryFromDate")))
            to_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input#qryToDate")))
            driver.execute_script("arguments[0].value = '';", from_input)
            driver.execute_script("arguments[0].value = arguments[1];", from_input, from_date)
            driver.execute_script("arguments[0].value = '';", to_input)
            driver.execute_script("arguments[0].value = arguments[1];", to_input, to_date)
        except Exception as e:
            driver.switch_to.default_content()
            raise HTTPException(status_code=500, detail=f"Failed to set dates: {str(e)}")
        try:
            search_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "input.button_vuong.awesome")))
            driver.execute_script("arguments[0].click();", search_button)
        except Exception as e:
            driver.switch_to.default_content()
            raise HTTPException(status_code=500, detail=f"Failed to click search button: {str(e)}")
        time.sleep(3)
        driver.switch_to.default_content()
        return {"message": "Search completed"}
    except NoSuchElementException as e:
        driver.switch_to.default_content()
        raise HTTPException(status_code=400, detail=f"Element not found: {str(e)}")
    except WebDriverException as e:
        driver.switch_to.default_content()
        raise HTTPException(status_code=500, detail=f"Selenium error: {str(e)}")
    except Exception as e:
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