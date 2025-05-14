from fastapi import FastAPI, HTTPException, Form
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from io import BytesIO
from uuid import uuid4
import certifi
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time
from selenium.common.exceptions import NoSuchElementException, WebDriverException

app = FastAPI()

cert_path = "X:/TraCuuThue/TraCuuToKhai/.venv/Lib/site-packages/certifi/custom_cacert.pem"

chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--ignore-certificate-errors")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")

driver = webdriver.Chrome(options=chrome_options)
driver.set_window_size(1920, 1080)

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

@app.get("/access")
def access():
    global url_new
    url_initial = "https://thuedientu.gdt.gov.vn/etaxnnt/Request"
    driver.get(url_initial)
    time.sleep(2)

    session_id = driver.find_element(By.NAME, 'dse_sessionId').get_attribute('value')
    application_id = driver.find_element(By.NAME, 'dse_applicationId').get_attribute('value')
    page_id = driver.find_element(By.NAME, 'dse_pageId').get_attribute('value')

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

@app.get("/captcha")
def get_captcha():
    captcha_image_element = driver.find_element(By.ID, "safecode")
    captcha_image_url = captcha_image_element.get_attribute('src')
    browser_cookies = driver.get_cookies()
    cookies = {cookie['name']: cookie['value'] for cookie in browser_cookies}
    headers = {
        'User-Agent': 'Mozilla/5.0',
        'Referer': driver.current_url,
    }

    response = requests.get(captcha_image_url, headers=headers, cookies=cookies, verify=cert_path)

    if response.status_code == 200:
        return StreamingResponse(BytesIO(response.content), media_type="image/jpeg")
    else:
        raise HTTPException(status_code=500, detail="Failed to fetch captcha image")
@app.get("/refresh")
def refresh():
    driver.get(url_new)
    time.sleep(2)
    return {"message": "Captcha refreshed"}
    
    
@app.post("/login")
def login(username: str = Form(...), password: str = Form(...), captcha_code: str = Form(...)):
    # Gửi thông tin vào các trường trên trang login
    driver.find_element(By.ID, "_userName").send_keys(username)
    driver.find_element(By.ID, "password").send_keys(password)
    driver.find_element(By.ID, "vcode").send_keys(captcha_code)

    # Nhấn nút Đăng nhập
    driver.find_element(By.ID, "dangnhap").click()
    time.sleep(2)

    # Chuyển sang trang sau khi đăng nhập
    driver.find_element(By.CSS_SELECTOR, "li.li-3").click()
    time.sleep(1)
    driver.find_element(By.CSS_SELECTOR, "li[onclick*='traCuuToKhaiProc']").click()
    return {"message": "Login successful"}

@app.post("/search")
def search(from_date_input: str = Form(...), to_date_input: str = Form(...)):
    try:
        # Switch to iframe
        iframe = driver.find_element(By.ID, "tranFrame")
        driver.switch_to.frame(iframe)

        # Input dates
        from_input = driver.find_element(By.CSS_SELECTOR, "input#qryFromDate")
        to_input = driver.find_element(By.CSS_SELECTOR, "input#qryToDate")
        from_input.clear()
        from_input.send_keys(from_date_input)
        to_input.clear()
        to_input.send_keys(to_date_input)

        # Click search button
        search_button = driver.find_element(By.CSS_SELECTOR, "input.button_vuong.awesome")
        search_button.click()

        time.sleep(3)  # Wait for search results
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
    
    
@app.get("/display")
def display():
    iframe = driver.find_element(By.ID, "tranFrame")
    driver.switch_to.frame(iframe)

    table = driver.find_element(By.ID, "data_content_onday")
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

    driver.switch_to.default_content()
    return {"table": data}