from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import csv
from openpyxl import Workbook
# Cấu hình cho trình duyệt headless
chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--disable-gpu")  # Tắt GPU (nếu cần)
chrome_options.add_argument("--ignore-certificate-errors")

# Khởi tạo WebDriver
driver = webdriver.Chrome(options=chrome_options)

# Thiết lập kích thước cửa sổ trình duyệt để chụp toàn bộ màn hình
driver.set_window_size(1920, 1080)  # Thiết lập kích thước cửa sổ

# Truy cập trang đầu tiên để lấy giá trị của các tham số
url_initial = "https://thuedientu.gdt.gov.vn/etaxnnt/Request"
driver.get(url_initial)

# Lấy các giá trị dse_sessionId, dse_applicationId, dse_pageId từ trang
session_id = driver.find_element(By.NAME, 'dse_sessionId').get_attribute('value')
application_id = driver.find_element(By.NAME, 'dse_applicationId').get_attribute('value')
page_id = driver.find_element(By.NAME, 'dse_pageId').get_attribute('value')

print(f"dse_sessionId: {session_id}")
print(f"dse_applicationId: {application_id}")
print(f"dse_pageId: {page_id}")

# Xây dựng URL mới với các tham số lấy được
url_new = f"https://thuedientu.gdt.gov.vn/etaxnnt/Request?&dse_sessionId={session_id}&dse_applicationId={application_id}&dse_pageId={page_id}&dse_operationName=corpIndexProc&dse_errorPage=error_page.jsp&dse_processorState=initial&dse_nextEventName=login"

# Truy cập vào URL mới
driver.get(url_new)

# Chụp toàn bộ màn hình (bao gồm phần cuộn)
driver.save_screenshot('new_page_full.png')

# Yêu cầu người dùng nhập thông tin đăng nhập và captcha từ terminal
username = "0109798789-ql"
password = "tct@123"
captcha_code = input("Nhập mã captcha (hiển thị trên màn hình): ")

# Điền Tên đăng nhập, Mật khẩu và Mã xác nhận vào các trường tương ứng
driver.find_element(By.ID, "_userName").send_keys(username)
driver.find_element(By.ID, "password").send_keys(password)
driver.find_element(By.ID, "vcode").send_keys(captcha_code)

# Nhấn nút Đăng nhập (sử dụng .click() để ấn vào nút)
login_button = driver.find_element(By.ID, "dangnhap")
login_button.click()

# Đợi một chút để trang xử lý đăng nhập
time.sleep(5)
li_element = driver.find_element(By.CSS_SELECTOR, "li.li-3")
li_element.click()

# Wait để đảm bảo các thay đổi đã diễn ra (nếu có)
time.sleep(5)

li_element2 = driver.find_element(By.CSS_SELECTOR, "li[onclick*='traCuuToKhaiProc']")
li_element2.click()
    
# Chờ phần tử "Từ ngày" (qryFromDate) có thể nhìn thấy
time.sleep(5)

# Chuyển vào iframe với id "tranFrame"
iframe = driver.find_element(By.ID, "tranFrame")
driver.switch_to.frame(iframe)

# Tìm các phần tử và thực hiện thao tác
from_date_input = driver.find_element(By.CSS_SELECTOR, "input#qryFromDate.dateMSB.hasDatepicker")
to_date_input = driver.find_element(By.CSS_SELECTOR, "input#qryToDate.dateMSB.hasDatepicker")

# Tiến hành nhập giá trị
from_date_input.clear()
from_date_input.send_keys("01/01/2025")

to_date_input.clear()
to_date_input.send_keys("14/05/2025")

button = driver.find_element(By.CSS_SELECTOR, "input.button_vuong.awesome")
button.click()

time.sleep(5)

# Tìm bảng với id "data_content_onday"
table = driver.find_element(By.ID, "data_content_onday")
# Lấy tất cả các dòng trong bảng
rows = table.find_elements(By.TAG_NAME, "tr")

# Danh sách để lưu dữ liệu
data = []
skip_indices = set()

# Xử lý dòng tiêu đề để xác định các cột cần bỏ
for i, row in enumerate(rows):
    headers = row.find_elements(By.TAG_NAME, "th")
    if headers:
        header_texts = [th.text.strip() for th in headers]
        # Xác định index cần bỏ
        for idx, text in enumerate(header_texts):
            if text in ["Gửi phụ lục", "Tải thông báo"]:
                skip_indices.add(idx)
        # Lưu header đã loại bỏ các cột cần bỏ
        filtered_header = [text for idx, text in enumerate(header_texts) if idx not in skip_indices]
        data.append(filtered_header)
        continue

    # Xử lý các dòng dữ liệu (td)
    cols = row.find_elements(By.TAG_NAME, "td")
    if cols:
        filtered_row = [col.text.strip() for idx, col in enumerate(cols) if idx not in skip_indices]
        data.append(filtered_row)

# Xuất ra Excel
wb = Workbook()
ws = wb.active
ws.title = "Dữ liệu tờ khai"

for row in data:
    ws.append(row)

wb.save("table_data.xlsx")
# Trở lại trang chính
driver.switch_to.default_content()
# Chụp màn hình sau khi đăng nhập
driver.save_screenshot('login_page_after_input.png')

# Đóng trình duyệt
driver.quit()
