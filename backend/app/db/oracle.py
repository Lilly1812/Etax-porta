import cx_Oracle

# Nếu dùng Instant Client và chưa thêm vào PATH, cần khởi tạo client
cx_Oracle.init_oracle_client(lib_dir=r"C:\Users\hoang\Downloads\instantclient-basic-windows.x64-23.8.0.25.04\instantclient_23_8")

def get_connection():
    return cx_Oracle.connect(
        user="biznext_dev",
        password="biznext_dev",
        dsn="157.66.96.81:1521/portal"
    )

# test kết nối trực tiếp khi chạy file
if __name__ == "__main__":
    try:
        conn = get_connection()
        print("Kết nối database thành công!")
        conn.close()
    except Exception as e:
        print("Lỗi kết nối database:", e)