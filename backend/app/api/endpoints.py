from fastapi import APIRouter, HTTPException, Form , Request
from app.utils.selenium_utils import create_driver
from app.services import tax_service
from app.utils.url_manager import URLStateManager
from app.db.oracle import get_connection

router = APIRouter()

driver, wait = create_driver()
url_manager = URLStateManager()

@router.post("/api/login")
async def app_login(request: Request):
    data = await request.json()
    username = data.get("username")
    password = data.get("password")
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM E_TAX.users WHERE username=:1 AND password=:2", (username, password))
        user = cur.fetchone()
        if user:
            return {"success": True, "user": username}
        else:
            raise HTTPException(status_code=401, detail="Tên đăng nhập hoặc mật khẩu không đúng.")
    finally:
        cur.close()
        conn.close()

@router.get("/api/companies")
def get_companies():
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT 
                TAX_CODE, COMPANY_NAME, ADDRESS, PHONE, WEBSITE, ESTABLISHED_DATE
            FROM 
                E_TAX.companies
        """)
        rows = cur.fetchall()
        companies = []
        for row in rows:
            companies.append({
                "TAX_CODE": row[0],
                "COMPANY_NAME": row[1],
                "ADDRESS": row[2],
                "PHONE": row[3],
                "WEBSITE": row[4],
                "ESTABLISHED_DATE": row[5],
            })
        return companies
    finally:
        cur.close()
        conn.close()

@router.get("/check-session")
def check_session_status():
    is_valid = tax_service.check_session(driver)
    if not is_valid:
        raise HTTPException(status_code=401, detail="Session expired")
    return {"status": "valid"}

@router.get("/access")
def access():
    return tax_service.access_login_page(driver, wait, url_manager)

@router.get("/captcha")
def get_captcha():
    return tax_service.get_captcha(driver, wait)

@router.get("/refresh")
def refresh():
    return tax_service.refresh(driver, url_manager)

@router.get("/refresh-captcha")
def refresh_captcha():
    return tax_service.refresh_captcha(driver, wait)

@router.post("/api/tax/login")
def tax_login(username: str = Form(...), password: str = Form(...), captcha_code: str = Form(...)):
    return tax_service.login(driver, wait, username, password, captcha_code)

@router.post("/search")
def search(from_date: str = Form(...), to_date: str = Form(...), maTKhai: str = Form(...)):
    return tax_service.search(driver, wait, from_date, to_date, maTKhai)

@router.get("/display")
def display():
    return tax_service.display(driver, wait)

@router.get("/download")
def download(ma_giao_dich: str):
    return tax_service.download(driver, wait, ma_giao_dich)

@router.get("/displaylisttax")
def displaylisttax(fromdate: str = None, todate: str = None):
    return tax_service.displaylisttax(driver, wait, fromdate, todate)
