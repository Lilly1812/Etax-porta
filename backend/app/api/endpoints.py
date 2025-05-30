from fastapi import APIRouter, HTTPException, Form , Request
from app.utils.selenium_utils import create_driver
from app.services import tax_service
from app.utils.url_manager import URLStateManager
from app.db.oracle import get_connection
from fastapi import Body
from passlib.hash import bcrypt

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
        # Lấy hash mật khẩu từ DB
        cur.execute("SELECT password FROM E_TAX.users WHERE username=:1", (username,))
        row = cur.fetchone()
        if row and bcrypt.verify(password, row[0]):
            return {"success": True, "user": username}
        else:
            raise HTTPException(status_code=401, detail="Tên đăng nhập hoặc mật khẩu không đúng.")
    finally:
        cur.close()
        conn.close()

@router.post("/api/register")
def register_user(user: dict = Body(...)):
    conn = get_connection()
    cur = conn.cursor()
    try:
        # print("User data:", user) # In ra dữ liệu nhận được
        # Kiểm tra username hoặc email đã tồn tại chưa
        cur.execute(
            "SELECT COUNT(*) FROM E_TAX.users WHERE username=:1 OR email=:2",
            (user["username"], user["email"])
        )
        exists = cur.fetchone()[0]
        if exists:
            raise HTTPException(status_code=400, detail="Tên đăng nhập hoặc email đã tồn tại.")

        # Mã hóa mật khẩu trước khi lưu
        hashed_password = bcrypt.hash(user["password"])

        # Thêm user mới
        cur.execute(
            """
            INSERT INTO E_TAX.users (full_name ,username, email, phone, password, role, status)
            VALUES (:1, :2, :3, :4, :5, :6, :7)
            """,
            (
                user["full_name"],
                user["username"],
                user["email"],
                user["phone"],
                hashed_password,
                user.get("role", "TAXPAYER"),
                user.get("status", "ACTIVE"),
            )
        )
        conn.commit()
        return {"success": True}
    except Exception as e:
        # print("Register error:", e)
        raise HTTPException(status_code=500, detail=str(e))
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
                TAX_CODE, COMPANY_NAME, ADDRESS, PHONE, WEBSITE, ESTABLISHED_DATE, COMPANY_ID
            FROM 
                E_TAX.companies
        """)
        rows = cur.fetchall()
        companies = []
        for row in rows:
            company_id = row[6]
            # Lấy các kỳ kê khai cho công ty này
            cur.execute("""
                SELECT START_DATE, END_DATE, PERIOD_TYPE
                FROM E_TAX.TAX_FILING_PERIODS
                WHERE COMPANY_ID = :1
            """, (company_id,))
            periods = [
                {
                    "startYear": str(period[0])[:4] if period[0] else "",
                    "endYear": str(period[1])[:4] if period[1] else "",
                    "type": (
                        "theo_nam" if period[2] == "YEAR"
                        else "theo_quy" if period[2] == "QUARTER"
                        else "theo_thang"
                    )
                }
                for period in cur.fetchall()
            ]
            companies.append({
                "taxId": row[0],
                "name": row[1],
                "address": row[2],
                "phone": row[3],
                "website": row[4],
                "companystartdate": row[5],
                "periods": periods
            })
        return companies
    finally:
        cur.close()
        conn.close()

@router.post("/api/companies")
def add_company(company: dict = Body(...)):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO E_TAX.companies (TAX_CODE, COMPANY_NAME, ESTABLISHED_DATE, ADDRESS, PHONE, WEBSITE)
            VALUES (:1, :2, TO_DATE(:3, 'YYYY-MM-DD'), :4, :5, :6)
        """, (
            company["taxId"],
            company["name"],
            company["companystartdate"],
            company["address"],
            company["phone"],
            company["website"]
        ))
        # Lấy COMPANY_ID vừa thêm
        cur.execute("SELECT COMPANY_ID FROM E_TAX.companies WHERE TAX_CODE=:1", (company["taxId"],))
        company_id = cur.fetchone()[0]
        # Thêm các kỳ kê khai nếu có
        for period in company.get("periods", []):
            start_year = str(period.get("startYear", ""))
            end_year = str(period.get("endYear", ""))
            period_type = period.get("type", "")
            if not (start_year and end_year and period_type):
                print("Thiếu dữ liệu kỳ kê khai:", period)
                continue
            cur.execute("""
                INSERT INTO E_TAX.TAX_FILING_PERIODS 
                (PERIOD_ID, COMPANY_ID, START_DATE, END_DATE, PERIOD_TYPE)
                VALUES (E_TAX.TAX_FILING_PERIODS_SEQ.NEXTVAL, :1, TO_DATE(:2, 'YYYY'), TO_DATE(:3, 'YYYY'), :4)
            """, (
                company_id,
                start_year,
                end_year,
                "YEAR" if period_type == "theo_nam" else "QUARTER" if period_type == "theo_quy" else "MONTH"
            ))
        conn.commit()
        return {"success": True}
    except Exception as e:
        print("Add company error:", e)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@router.put("/api/companies/{tax_id}")
def update_company(tax_id: str, company: dict = Body(...)):
    conn = get_connection()
    cur = conn.cursor()
    try:
        # Cập nhật thông tin công ty
        cur.execute("""
            UPDATE E_TAX.companies
            SET COMPANY_NAME=:1, ESTABLISHED_DATE=TO_DATE(:2, 'YYYY-MM-DD'), ADDRESS=:3, PHONE=:4, WEBSITE=:5
            WHERE TAX_CODE=:6
        """, (
            company["name"],
            company["companystartdate"],
            company["address"],
            company["phone"],
            company["website"],
            tax_id
        ))

        # Lấy COMPANY_ID theo TAX_CODE
        cur.execute("SELECT COMPANY_ID FROM E_TAX.companies WHERE TAX_CODE=:1", (tax_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Không tìm thấy công ty")
        company_id = row[0]

        # Xóa các kỳ kê khai cũ
        cur.execute("DELETE FROM E_TAX.TAX_FILING_PERIODS WHERE COMPANY_ID=:1", (company_id,))
        # Thêm lại các kỳ kê khai mới
        inserted_periods = set()
        # Thêm lại các kỳ kê khai mới
        for period in company.get("periods", []):
            start_year = str(period.get("startYear", ""))
            end_year = str(period.get("endYear", ""))
            period_type = period.get("type", "")
            if not (start_year and end_year and period_type):
                continue
            if int(start_year) > int(end_year):
                print(f"startYear {start_year} > endYear {end_year}, bỏ qua")
                continue
            db_period_type = "YEAR" if period_type == "theo_nam" else "QUARTER" if period_type == "theo_quy" else "MONTH"
            key = (start_year, end_year, db_period_type)
            if key in inserted_periods:
                print(f"Trùng kỳ kê khai: {key}, bỏ qua")
                continue
            inserted_periods.add(key)
            cur.execute("""
                INSERT INTO E_TAX.TAX_FILING_PERIODS 
                (PERIOD_ID, COMPANY_ID, START_DATE, END_DATE, PERIOD_TYPE)
                VALUES (E_TAX.TAX_FILING_PERIODS_SEQ.NEXTVAL, :1, TO_DATE(:2, 'YYYY'), TO_DATE(:3, 'YYYY'), :4)
            """, (
                company_id,
                start_year,
                end_year,
                "YEAR" if period_type == "theo_nam" else "QUARTER" if period_type == "theo_quy" else "MONTH"
            ))

        conn.commit()
        return {"success": True}
    except Exception as e:
        print("Update company error:", e)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()
        
@router.delete("/api/companies/{tax_id}")
def delete_company(tax_id: str):
    conn = get_connection()
    cur = conn.cursor()
    try:
        # Lấy COMPANY_ID theo TAX_CODE
        cur.execute("SELECT COMPANY_ID FROM E_TAX.companies WHERE TAX_CODE=:1", (tax_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Không tìm thấy công ty")
        company_id = row[0]
        # Xoá các kỳ kê khai trước
        cur.execute("DELETE FROM E_TAX.TAX_FILING_PERIODS WHERE COMPANY_ID=:1", (company_id,))
        # Xoá công ty
        cur.execute("DELETE FROM E_TAX.companies WHERE TAX_CODE=:1", (tax_id,))
        conn.commit()
        return {"success": True}
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
