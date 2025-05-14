from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import requests
import time

# Path to custom certificate (if needed)
cert_path = "X:/TraCuuThue/TraCuuToKhai/.venv/Lib/site-packages/certifi/custom_cacert.pem"

# Configure headless Chrome
chrome_options = Options()
chrome_options.add_argument("--headless")  # Run in headless mode
chrome_options.add_argument("--disable-gpu")  # Disable GPU
chrome_options.add_argument("--ignore-certificate-errors")  # Ignore SSL errors
chrome_options.add_argument("--no-sandbox")  # Optional: for stability
chrome_options.add_argument("--disable-dev-shm-usage")  # Optional: for stability

# Initialize WebDriver
driver = webdriver.Chrome(options=chrome_options)

# Set window size for screenshot (optional)
driver.set_window_size(1920, 1080)

try:
    # Step 1: Access the initial URL to get session parameters
    url_initial = "https://thuedientu.gdt.gov.vn/etaxnnt/Request"
    driver.get(url_initial)

    # Wait for the page to load
    time.sleep(2)  # Adjust if needed

    # Extract session parameters
    session_id = driver.find_element(By.NAME, 'dse_sessionId').get_attribute('value')
    application_id = driver.find_element(By.NAME, 'dse_applicationId').get_attribute('value')
    page_id = driver.find_element(By.NAME, 'dse_pageId').get_attribute('value')

    print(f"dse_sessionId: {session_id}")
    print(f"dse_applicationId: {application_id}")
    print(f"dse_pageId: {page_id}")

    # Step 2: Construct the new URL with session parameters
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

    # Access the new URL
    driver.get(url_new)

    # Wait for the CAPTCHA to load
    time.sleep(2)  # Adjust if needed

    # Step 3: Extract the CAPTCHA image URL
    captcha_image_element = driver.find_element(By.ID, "safecode")
    captcha_image_url = captcha_image_element.get_attribute('src')
    print(f"CAPTCHA Image URL: {captcha_image_url}")

    # Step 4: Get cookies from the browser
    browser_cookies = driver.get_cookies()
    cookies = {cookie['name']: cookie['value'] for cookie in browser_cookies}
    print("Cookies:", cookies)

    # Step 5: Set up headers to mimic the browser
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
        'Referer': url_new,
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en,vi;q=0.9',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'same-origin',
    }

    # Step 6: Download the CAPTCHA image using requests
    response = requests.get(
        captcha_image_url,
        headers=headers,
        cookies=cookies,
        verify=cert_path  
    )

    # Step 7: Save the CAPTCHA image
    if response.status_code == 200:
        with open("captcha_image.jpg", "wb") as file:
            file.write(response.content)
        print("CAPTCHA image saved successfully as 'captcha_image.jpg'.")
    else:
        print(f"Failed to download CAPTCHA image. Status code: {response.status_code}")
        print(f"Response content: {response.text}")

    # Optional: Save a screenshot for debugging
    driver.save_screenshot('new_page_full.png')
    print("Screenshot saved as 'new_page_full.png'.")

finally:
    # Close the browser
    driver.quit()