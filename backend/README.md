# Etax Portal Backend

## Mô tả
Dự án backend cho hệ thống Etax Portal, xây dựng với Python (FastAPI).

## Cấu trúc thư mục
- `app/`: Mã nguồn chính của ứng dụng (API, services, models, utils, config).
- `cert/`: Chứa các file chứng chỉ.
- `esigner/`: Chứa các module liên quan đến ký số.
- `tests/`: Chứa các unit test.
- `requirements.txt`: Danh sách thư viện phụ thuộc.

## Hướng dẫn cài đặt

```bash
# Cài đặt các thư viện phụ thuộc
pip install -r requirements.txt

# Chạy ứng dụng
uvicorn app.main:app --reload
```

## Đóng góp
Vui lòng tạo pull request hoặc liên hệ quản trị viên dự án.

## Thông tin liên hệ
