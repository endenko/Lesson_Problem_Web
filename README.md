# Lesson_Problem_Web

> **Trang web tính điểm kiểu DOJ** – Chấm điểm bài tập lập trình theo kiểu Dynamic Online Judge

---

## 📌 Mục đích / What is this?

**Tiếng Việt:**  
`Lesson_Problem_Web` là một ứng dụng web giúp giáo viên và học sinh quản lý, nộp bài và **tính điểm bài tập lập trình theo kiểu DOJ (Dynamic Online Judge)**. Hệ thống cho phép:

- Đăng bài toán lập trình (problem set)
- Học sinh nộp code giải bài
- Hệ thống tự động chạy test case và chấm điểm
- Hiển thị bảng xếp hạng (leaderboard/scoreboard)

**English:**  
`Lesson_Problem_Web` is a web application that allows teachers and students to manage programming problems, submit solutions, and **automatically score them in DOJ (Dynamic Online Judge) style**. The system supports:

- Posting programming problems (problem sets)
- Students submitting code solutions
- Automatically running test cases and scoring submissions
- Displaying a leaderboard / scoreboard

---

## 🗂️ Cấu trúc dự án / Project Structure

```
Lesson_Problem_Web/
├── public/                  # Static assets (images, fonts, favicon, …)
├── src/                     # Source code chính / Main source code
│   ├── assets/              # Hình ảnh, CSS toàn cục / Global images & CSS
│   ├── components/          # Các component dùng lại / Reusable UI components
│   ├── pages/               # Các trang chính / Main pages
│   │   ├── Home.vue         # Trang chủ / Home page
│   │   ├── Problems.vue     # Danh sách bài tập / Problem list
│   │   ├── Submit.vue       # Trang nộp bài / Submission page
│   │   └── Scoreboard.vue   # Bảng điểm / Scoreboard
│   ├── router/              # Cấu hình điều hướng / Routing config
│   ├── store/               # Quản lý trạng thái / State management
│   └── main.js              # Entry point
├── .gitignore
├── index.html               # HTML gốc / Root HTML file
├── package.json             # Dependencies & scripts
├── vite.config.js           # Cấu hình build tool / Build config
└── README.md
```

> **Lưu ý:** Cấu trúc trên là dự kiến khi project được triển khai đầy đủ. Hiện tại repository đang trong giai đoạn khởi tạo.

---

## 🛠️ Công nghệ sử dụng / Technologies

| Công nghệ / Technology | Mục đích / Purpose |
|---|---|
| **HTML5 / CSS3** | Giao diện người dùng / UI layout & styling |
| **JavaScript (ES6+)** | Logic phía client / Client-side logic |
| **Vue.js** | Framework frontend chính / Main frontend framework |
| **Vite** | Build tool & dev server nhanh / Fast build & dev server |
| **Node.js + npm** | Quản lý dependencies / Dependency management |
| **REST API / WebSocket** | Giao tiếp với backend chấm bài / Judge backend communication |

---

## 🚀 Hướng dẫn cài đặt & chạy / Setup & Run Guide

### Yêu cầu / Prerequisites

- [Node.js](https://nodejs.org/) phiên bản **LTS** (khuyến nghị 20+ hoặc mới nhất)
- npm (đi kèm Node.js) hoặc [yarn](https://yarnpkg.com/)
- Git

### 1. Clone repository

```bash
git clone https://github.com/endenko/Lesson_Problem_Web.git
cd Lesson_Problem_Web
```

### 2. Cài đặt dependencies / Install dependencies

```bash
npm install
# hoặc / or
yarn install
```

### 3. Chạy môi trường phát triển / Run development server

```bash
npm run dev
# hoặc / or
yarn dev
```

Mở trình duyệt và truy cập: **http://localhost:5173**  
*(Cổng mặc định của Vite – có thể thay đổi trong `vite.config.js`)*

### 4. Build cho production / Build for production

```bash
npm run build
# hoặc / or
yarn build
```

Kết quả build sẽ nằm trong thư mục `dist/`.

### 5. Xem trước bản build / Preview production build

```bash
npm run preview
# hoặc / or
yarn preview
```

---

## 📖 Hướng dẫn sử dụng / Usage Guide

### Dành cho Giáo viên / For Teachers

1. Đăng nhập vào hệ thống với tài khoản giáo viên.
2. Tạo bài toán mới: nhập đề bài, test case đầu vào/ra, giới hạn thời gian & bộ nhớ.
3. Gán bài cho lớp học / kỳ thi cụ thể.
4. Xem kết quả nộp bài và bảng điểm của học sinh.

### Dành cho Học sinh / For Students

1. Đăng nhập vào hệ thống với tài khoản học sinh.
2. Vào trang **Bài tập** để xem danh sách bài toán.
3. Đọc đề bài, viết code giải và nộp qua trang **Nộp bài**.
4. Xem kết quả chấm (Accepted / Wrong Answer / Time Limit Exceeded, …).
5. Theo dõi thứ hạng trên **Bảng điểm**.

---

## 🤝 Đóng góp / Contributing

1. Fork repository này
2. Tạo branch mới: `git checkout -b feature/ten-tinh-nang`
3. Commit thay đổi: `git commit -m "feat: mô tả thay đổi"`
4. Push lên branch: `git push origin feature/ten-tinh-nang`
5. Mở Pull Request

---

## 📄 Giấy phép / License

Dự án này hiện chưa có giấy phép chính thức. Liên hệ tác giả để biết thêm thông tin.  
*This project does not yet have an official license. Contact the author for more information.*

---

## 👤 Tác giả / Author

**Dương Vũ Minh Việt** – [@endenko](https://github.com/endenko)

