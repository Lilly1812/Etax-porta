from fastapi import FastAPI, HTTPException, Form
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from io import BytesIO
from uuid import uuid4
import certifi
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
from selenium.common.exceptions import NoSuchElementException, WebDriverException, TimeoutException
import os

app = FastAPI()

# Disable SSL verification for requests
requests.packages.urllib3.disable_warnings()

cert_path = "D:/biznext/EtaxSystem/etaxinvoice/Etax-porta/.venv/Lib/site-packages/certifi/custom_cacert.pem"

chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--ignore-certificate-errors")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
chrome_options.add_argument("--ignore-ssl-errors")

driver = webdriver.Chrome(options=chrome_options)
driver.set_window_size(1920, 1080)
wait = WebDriverWait(driver, 10)  # 10 seconds timeout

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["x-session-id"],
)

session_map = {}
url_new = ""

def check_session():
    """Kiểm tra session của trang thuế mà không làm thay đổi trạng thái trình duyệt"""
    try:
        current_url = driver.current_url
        if current_url == "data:," or "login" in current_url.lower():
            return False
        # Có thể kiểm tra thêm các dấu hiệu khác nếu cần
        return True
    except Exception as e:
        print(f"Error checking session: {str(e)}")
        return False

@app.get("/check-session")
def check_session_status():
    """API endpoint để kiểm tra trạng thái session"""
    is_valid = check_session()
    if not is_valid:
        raise HTTPException(status_code=401, detail="Session expired")
    return {"status": "valid"}

@app.get("/access")
def access():
    global url_new
    url_initial = "https://thuedientu.gdt.gov.vn/etaxnnt/Request"
    driver.get(url_initial)
    
    try:
        # Wait for elements to be present
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

        driver.get(url_new)
        driver.save_screenshot('new_page_full.png')
        return {"message": "Accessed login page."}
    except TimeoutException:
        raise HTTPException(status_code=500, detail="Timeout waiting for page elements")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error accessing page: {str(e)}")

@app.get("/captcha")
def get_captcha():
    try:
        # Tăng timeout cho việc đợi captcha xuất hiện
        captcha_image_element = wait.until(
            EC.presence_of_element_located((By.ID, "safecode")),
            message="Waiting for captcha image to load"
        )
        
        # Lấy URL của ảnh captcha
        captcha_image_url = captcha_image_element.get_attribute('src')
        print(f"Captcha URL: {captcha_image_url}")
        
        # Lấy cookies và headers
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

        # Tải ảnh với các tham số tối ưu
        response = requests.get(
            captcha_image_url,
            headers=headers,
            cookies=cookies,
            verify=False,
            timeout=10,  # Timeout 10 giây
            stream=True  # Sử dụng stream để tải nhanh hơn
        )

        if response.status_code == 200:
            # Đọc dữ liệu ảnh
            image_data = response.content
            
            # Tạo response với các header tối ưu
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
            print(f"Failed to fetch captcha: Status code {response.status_code}")
            raise HTTPException(status_code=500, detail="Failed to fetch captcha image")
            
    except TimeoutException:
        print("Timeout waiting for captcha element")
        raise HTTPException(status_code=500, detail="Timeout waiting for captcha element")
    except Exception as e:
        print(f"Error getting captcha: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting captcha: {str(e)}")

@app.get("/refresh")
def refresh():
    driver.get(url_new)
    time.sleep(2)
    return {"message": "Captcha refreshed"}

@app.get("/refresh-captcha")
def refresh_captcha():
    """Làm mới captcha và trả về ảnh mới"""
    try:
        # Truy cập trang login để lấy captcha mới
        driver.get("https://thuedientu.gdt.gov.vn/etaxnnt/Request")
        time.sleep(2)
        
        # Đợi captcha xuất hiện
        captcha_image_element = wait.until(
            EC.presence_of_element_located((By.ID, "safecode")),
            message="Waiting for new captcha to load"
        )
        
        # Lấy URL của ảnh captcha mới
        captcha_image_url = captcha_image_element.get_attribute('src')
        print(f"New captcha URL: {captcha_image_url}")
        
        # Lấy cookies và headers
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

        # Tải ảnh mới
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
            print(f"Failed to fetch new captcha: Status code {response.status_code}")
            raise HTTPException(status_code=500, detail="Failed to fetch new captcha image")
            
    except Exception as e:
        print(f"Error refreshing captcha: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error refreshing captcha: {str(e)}")

@app.post("/login")
def login(username: str = Form(...), password: str = Form(...), captcha_code: str = Form(...)):
    try:
        # Gửi thông tin vào các trường trên trang login
        driver.find_element(By.ID, "_userName").send_keys(username)
        driver.find_element(By.ID, "password").send_keys(password)
        driver.find_element(By.ID, "vcode").send_keys(captcha_code)

        # Nhấn nút Đăng nhập
        driver.find_element(By.ID, "dangnhap").click()
        time.sleep(2)

        # Kiểm tra xem đăng nhập có thành công không
        try:
            # Nếu vẫn ở trang login hoặc có thông báo lỗi, đăng nhập thất bại
            if "login" in driver.current_url.lower():
                print("Login failed - still on login page")
                raise HTTPException(
                    status_code=401, 
                    detail={
                        "message": "Đăng nhập thất bại, vui lòng thử lại",
                        "refresh_captcha": True
                    }
                )

            # Kiểm tra thông báo lỗi
            error_messages = driver.find_elements(By.CSS_SELECTOR, ".error-message, .alert-danger")
            if error_messages:
                error_text = error_messages[0].text.strip()
                print(f"Login failed - error message: {error_text}")
                raise HTTPException(
                    status_code=401, 
                    detail={
                        "message": f"Đăng nhập thất bại: {error_text}",
                        "refresh_captcha": True
                    }
                )

            # Nếu đăng nhập thành công, chuyển đến trang tìm kiếm
            print("Login successful, navigating to search page")
            menu = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "li.li-3")))
            menu.click()
            time.sleep(1)
            
            search_menu = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "li[onclick*='traCuuToKhaiProc']")))
            search_menu.click()
            time.sleep(1)
            
            return {"message": "Login successful"}

        except NoSuchElementException:
            print("Login failed - could not find expected elements")
            raise HTTPException(
                status_code=401, 
                detail={
                    "message": "Đăng nhập thất bại, vui lòng thử lại",
                    "refresh_captcha": True
                }
            )

    except Exception as e:
        print(f"Error during login: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail={
                "message": f"Lỗi đăng nhập: {str(e)}",
                "refresh_captcha": True
            }
        )

@app.post("/search")
def search(from_date: str = Form(...), to_date: str = Form(...), maTKhai: str = Form(...)):
    print(f"Received search request: from_date={from_date}, to_date={to_date}, maTKhai={maTKhai}")
    
    try:
        # Check session before proceeding
        if not check_session():
            raise HTTPException(status_code=401, detail="Session expired, please login again")

        # Navigate to search page if not already there
        current_url = driver.current_url
        print(f"Current URL: {current_url}")
        
        if current_url == "data:," or "login" in current_url.lower():
            print("Need to login first, redirecting to login page...")
            driver.get("https://thuedientu.gdt.gov.vn/etaxnnt/Request")
            time.sleep(2)
            raise HTTPException(status_code=401, detail="Please login first")

        # Navigate to search page if not already there
        if "traCuuToKhaiProc" not in current_url:
            print("Not on search page, navigating to search page...")
            try:
                # Wait for menu to be visible
                menu = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "li.li-3")))
                menu.click()
                time.sleep(2)
                
                # Wait for search menu item and click it
                search_menu = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "li[onclick*='traCuuToKhaiProc']")))
                search_menu.click()
                time.sleep(2)
            except Exception as e:
                print(f"Error navigating to search page: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Failed to navigate to search page: {str(e)}")

        # Switch to iframe
        try:
            iframe = wait.until(EC.presence_of_element_located((By.ID, "tranFrame")))
            driver.switch_to.frame(iframe)
            print("Successfully switched to iframe")
        except Exception as e:
            print(f"Error switching to iframe: {str(e)}")
            driver.switch_to.default_content()
            raise HTTPException(status_code=500, detail=f"Failed to switch to iframe: {str(e)}")

        # Select tax declaration type if not "00" (Tất cả)
        if maTKhai != "00":
            try:
                print(f"Attempting to select tax type: {maTKhai}")
                
                # Find and click the select element
                tax_type_select = wait.until(EC.presence_of_element_located((By.ID, "maTKhai")))
                print("Found tax type select element")
                
                # Clear any existing selection
                driver.execute_script("arguments[0].value = '';", tax_type_select)
                
                # Try to select the option using JavaScript
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
                print("Executed JavaScript to select tax type")
                
                # Verify the selection
                selected_value = driver.execute_script("return arguments[0].value;", tax_type_select)
                print(f"Selected value after change: {selected_value}")
                
                if selected_value != maTKhai:
                    print("JavaScript selection failed, trying alternative method")
                    # Try alternative method using Selenium
                    tax_type_select.click()
                    time.sleep(1)
                    option = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, f"select#maTKhai option[value='{maTKhai}']")))
                    option.click()
                    time.sleep(1)
                
                print("Successfully selected tax type")
            except Exception as e:
                print(f"Error in tax type selection: {str(e)}")
                # Continue with search even if tax type selection fails

        # Input dates
        try:
            print("Setting date inputs")
            from_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input#qryFromDate")))
            to_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input#qryToDate")))
            
            # Clear and set dates using JavaScript
            driver.execute_script("arguments[0].value = '';", from_input)
            driver.execute_script("arguments[0].value = arguments[1];", from_input, from_date)
            driver.execute_script("arguments[0].value = '';", to_input)
            driver.execute_script("arguments[0].value = arguments[1];", to_input, to_date)
            
            print(f"Successfully set dates: from={from_date}, to={to_date}")
        except Exception as e:
            print(f"Error setting dates: {str(e)}")
            driver.switch_to.default_content()
            raise HTTPException(status_code=500, detail=f"Failed to set dates: {str(e)}")

        # Click search button
        try:
            print("Clicking search button")
            search_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "input.button_vuong.awesome")))
            driver.execute_script("arguments[0].click();", search_button)
            print("Successfully clicked search button")
        except Exception as e:
            print(f"Error clicking search button: {str(e)}")
            driver.switch_to.default_content()
            raise HTTPException(status_code=500, detail=f"Failed to click search button: {str(e)}")

        time.sleep(3)  # Wait for search results
        driver.switch_to.default_content()
        print("Search completed successfully")
        return {"message": "Search completed"}
    except NoSuchElementException as e:
        print(f"Element not found error: {str(e)}")
        driver.switch_to.default_content()
        raise HTTPException(status_code=400, detail=f"Element not found: {str(e)}")
    except WebDriverException as e:
        print(f"Selenium error: {str(e)}")
        driver.switch_to.default_content()
        raise HTTPException(status_code=500, detail=f"Selenium error: {str(e)}")
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        driver.switch_to.default_content()
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    
    
@app.get("/display")
def display():
    try:
        # Check session before proceeding
        if not check_session():
            raise HTTPException(status_code=401, detail="Session expired, please login again")

        # Switch to iframe
        iframe = wait.until(EC.presence_of_element_located((By.ID, "tranFrame")))
        driver.switch_to.frame(iframe)
        print("Switched to iframe for display")

        # Wait for either the results table or the no data message
        try:
            # First try to find the results table
            table = wait.until(EC.presence_of_element_located((By.ID, "data_content_onday")))
            print("Found results table")
            
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
                    filtered_row = [col.text.strip() for idx, col in enumerate(cols) if idx not in skip_indices]
                    data.append(filtered_row)

            # Check if we have any data
            if len(data) <= 1:  # Only headers or empty
                print("No data found in table")
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
            print("No results table found")
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
        print(f"Error in display function: {str(e)}")
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

@app.get("/download")
def download(ma_giao_dich: str):
    """
    Tải file tờ khai theo mã giao dịch bằng Selenium và trả file về cho frontend.
    """
    try:
        # Vào đúng iframe chứa bảng
        iframe = wait.until(EC.presence_of_element_located((By.ID, "tranFrame")))
        driver.switch_to.frame(iframe)

        # Tìm thẻ <a> có onclick="downloadTkhai('ma_giao_dich')"
        download_link = wait.until(EC.element_to_be_clickable(
            (By.XPATH, f"//a[contains(@onclick, \"downloadTkhai('{ma_giao_dich}')\")]" )
        ))
        download_link.click()

        # Đợi file tải về (giả sử file tải về thư mục download mặc định)
        download_dir = 'D:/biznext/EtaxSystem/Etax-porta/downloads'  # Cập nhật đúng đường dẫn thư mục download của bạn
        timeout = 30
        file_path = None
        for _ in range(timeout):
            files = [os.path.join(download_dir, f) for f in os.listdir(download_dir)]
            files = [f for f in files if os.path.isfile(f)]
            if files:
                file_path = max(files, key=os.path.getctime)
                if not file_path.endswith('.crdownload'):
                    break
            time.sleep(1)
        driver.switch_to.default_content()

        if not file_path or not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Không tìm thấy file tải về")

        # Trả file về frontend
        return FileResponse(file_path, filename=os.path.basename(file_path), media_type='application/octet-stream')
    except Exception as e:
        driver.switch_to.default_content()
        raise HTTPException(status_code=500, detail=f"Lỗi tải file: {str(e)}")