# YouTube Analysis By Keyword System

Hệ thống phân tích và giám sát xu hướng video YouTube với xử lý dữ liệu thời gian thực.

## Tính năng chính

- **Thu thập dữ liệu tự động**

  - Lấy video mới nhất theo từ khóa tìm kiếm
  - Thu thập bình luận và số liệu tương tác (view, like, comment)
  - Cập nhật dữ liệu định kỳ

- **Phân tích dữ liệu**

  - Phân tích cảm xúc bình luận (sentiment analysis)
  - Thống kê số liệu tương tác
  - Tổng hợp xu hướng theo thời gian

- **Giao diện người dùng**
  - Dashboard tổng quan với biểu đồ thống kê
  - Danh sách video với tìm kiếm và lọc
  - Xem chi tiết bình luận và phân tích sentiment
  - Xuất dữ liệu dạng CSV

## Công nghệ sử dụng

### Frontend

- React.js
- React Bootstrap
- Chart.js
- Axios

### Backend

- Python
- Flask
- YouTube Data API v3
- MongoDB

## Cấu trúc dự án

```
youtube/
├── frontend/           # React frontend
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── pages/     # Page components
│   │   ├── services/  # API services
│   │   └── utils/     # Utility functions
│   └── public/        # Static files
│
└── backend/           # Python backend
    ├── api/          # API endpoints
    ├── models/       # Data models
    ├── services/     # Business logic
    └── utils/        # Utility functions
```

## Các trang chính

1. **Dashboard**

   - Tổng quan số liệu
   - Biểu đồ thống kê
   - Top video nổi bật

2. **Videos**

   - Danh sách video
   - Tìm kiếm và lọc
   - Chi tiết video
   - Xuất CSV

3. **Comments**

   - Danh sách bình luận
   - Phân tích sentiment
   - Tìm kiếm và lọc
   - Xuất CSV

4. **Statistics**
   - Thống kê chi tiết
   - Biểu đồ phân tích
   - Sắp xếp và lọc
   - Xuất CSV

## Cài đặt và chạy

### Frontend

```bash
cd frontend
npm install
npm start
```

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

## Tính năng đã hoàn thành

- [x] Thu thập dữ liệu video và bình luận
- [x] Phân tích sentiment bình luận
- [x] Dashboard tổng quan
- [x] Quản lý danh sách video
- [x] Quản lý bình luận
- [x] Thống kê chi tiết
- [x] Xuất dữ liệu CSV
- [x] Tìm kiếm và lọc dữ liệu

## Tính năng đang phát triển

- [ ] Cảnh báo xu hướng
- [ ] Phân tích nâng cao
- [ ] Tùy chỉnh dashboard
- [ ] Báo cáo tự động
