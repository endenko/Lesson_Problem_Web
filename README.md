# 💻 LESSON PROBLEM WEB 
**Nền tảng Giáo dục, Luyện tập và Thi đấu Lập trình Toàn diện**

![React](https://img.shields.io/badge/Frontend-React_18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green?logo=nodedotjs)
![Supabase](https://img.shields.io/badge/Database-Supabase-success?logo=supabase)
![Vite](https://img.shields.io/badge/Bundler-Vite-purple?logo=vite)

---

## 📑 MỤC LỤC CHI TIẾT

1. [Tổng quan Dự án](#1-tổng-quan-dự-án)
2. [Ngăn xếp Công nghệ (Tech Stack)](#2-ngăn-xếp-công-nghệ)
3. [Phân quyền & Tính năng chi tiết](#3-phân-quyền--tính-năng-chi-tiết)
4. [Kiến trúc Hệ thống & Luồng dữ liệu](#4-kiến-trúc-hệ-thống--luồng-dữ-liệu)
5. [Sơ đồ Cấu trúc Thư mục (Deep Tree)](#5-sơ-đồ-cấu-trúc-thư-mục)
6. [Hướng dẫn Triển khai (Local Development)](#6-hướng-dẫn-triển-khai)
7. [Thiết lập Cơ sở dữ liệu (Supabase)](#7-thiết-lập-cơ-sở-dữ-liệu)
8. [Tài liệu API & Kết nối](#8-tài-liệu-api--kết-nối)
9. [Xử lý Sự cố & Gỡ lỗi](#9-xử-lý-sự-cố--gỡ-lỗi)

---

## 1. TỔNG QUAN DỰ ÁN

**Lesson Problem Web** là một hệ sinh thái học tập trực tuyến (E-Learning & Competitive Programming) được thiết kế dành riêng cho khối ngành Công nghệ Thông tin. Dự án giải quyết trọn vẹn bài toán từ khâu truyền đạt kiến thức (Bài giảng) đến khâu thực hành (Giải bài tập thuật toán) và kiểm tra đánh giá (Tổ chức kỳ thi). 

Hệ thống cung cấp trải nghiệm tương tác thời gian thực cao độ, bảo mật chặt chẽ thông qua kiến trúc Client-Server hiện đại, đáp ứng tốt cho các Câu lạc bộ học thuật hoặc quy mô lớp học đại học.

## ✨ Tính năng chính

| Phân hệ | Tính năng nổi bật |
|-----------|-------|
| 🎓 **Học tập & Bài giảng** | Danh sách bài giảng, xem chi tiết lý thuyết và tài liệu đính kèm. |
| 💻 **Luyện tập Thuật toán** | Đọc đề bài, viết code, nộp bài và xem lịch sử trạng thái (Pending, Accepted, WA). |
| 🏆 **Đấu trường (Contest)** | Tham gia kỳ thi ảo có tính giờ, cập nhật thứ hạng theo thời gian thực. |
| 👥 **Hồ sơ & Tương tác** | Khung chat trực tuyến, lịch sử hoạt động, bảng thành tựu cá nhân. |
| ⚙️ **Quản trị (Admin)** | Toàn quyền thêm/sửa/xóa User, Problem, Lecture và Contest. |
| 🔐 **Bảo mật (Supabase)** | Xác thực an toàn, phân quyền rõ ràng giữa User và Admin (Row Level Security). |

---

## 2. NGĂN XẾP CÔNG NGHỆ

Dự án được xây dựng trên bộ khung công nghệ hiệu suất cao:

* **Frontend:**
  * **Core:** ReactJS + TypeScript (Đảm bảo Type-safety và dễ bảo trì).
  * **Build Tool:** Vite (Thay thế Webpack, tăng tốc độ HMR và Build).
  * **Routing & State:** React Router DOM, Context API.
* **Backend:**
  * **Runtime:** Node.js (Xử lý các tác vụ độc lập, chấm điểm tự động hoặc proxy API).
* **Database & Authentication (BaaS):**
  * **Core:** Supabase (Cung cấp PostgreSQL, Row Level Security).
  * **Auth:** Supabase Auth (Đăng nhập, phân quyền Admin/User).

---

## 3. PHÂN QUYỀN & TÍNH NĂNG CHI TIẾT

### 👨‍🎓 Phân hệ Học viên (Users)
* **Xác thực (`AuthModal`):** Đăng nhập/Đăng ký an toàn.
* **Khu vực Học tập (`LectureList`, `LectureDetail`):** Xem danh sách bài giảng, đọc tài liệu lý thuyết do Admin biên soạn.
* **Đấu trường Thuật toán (`ProblemList`, `ProblemDetail`):** Đọc đề bài, giới hạn thời gian/bộ nhớ.
* **Khu vực Nộp bài (`SubmissionArea`, `SubmissionList`):** Gửi mã nguồn (source code), theo dõi trạng thái chấm bài (Pending, Accepted, Wrong Answer).
* **Kỳ thi (`ContestList`, `ContestDetail`):** Đăng ký tham gia kỳ thi ảo, đồng hồ đếm ngược, bảng xếp hạng (Leaderboard) theo thời gian thực.
* **Tương tác (`ChatWidget`):** Kênh trao đổi trực tiếp giữa các học viên.
* **Hồ sơ Cá nhân (`Achievements`, `ActivityHistory`):** Ghi nhận chuỗi ngày học tập, huy hiệu thành tích và lịch sử nộp bài.

### 👑 Phân hệ Quản trị viên (Admin Dashboard)
* **`ManageUsers`:** Quản lý danh sách, cấp quyền, khóa tài khoản sinh viên vi phạm.
* **`ManageProblems`:** Thêm/Sửa/Xóa đề bài tập, bộ testcase (đầu vào/đầu ra).
* **`ManageLectures`:** Soạn thảo nội dung bài giảng mới.
* **`ManageContests`:** Lên lịch kỳ thi, ghép bài tập vào kỳ thi, kiểm soát thời gian đóng/mở.

---

## 4. KIẾN TRÚC HỆ THỐNG & LUỒNG DỮ LIỆU

Hệ thống giao tiếp qua 2 luồng chính:
1. **Frontend <-> Supabase:** Hầu hết các thao tác đọc/ghi dữ liệu thông thường (lấy danh sách bài tập, lịch sử học tập) và xác thực người dùng được Frontend gọi trực tiếp đến Supabase thông qua `supabaseClient.ts`. Điều này giảm tải cho backend tự xây.
2. **Frontend <-> Node.js Backend:** Các tác vụ đòi hỏi bảo mật cao hoặc tốn tài nguyên (như gửi code đi chấm tự động qua một compiler thứ 3, xử lý logic nghiệp vụ phức tạp) sẽ được đẩy về `backend/index.js` xử lý.
## 🏗️ Kiến trúc hệ thống

```text
┌─────────────────────────────────────────────────────┐
│                 FRONTEND LAYER (Client)             │
│  Giao diện ReactJS + TypeScript (Chạy trên Vite)    │
└────────────────────┬────────────────────────────────┘
                     │ HTTP / REST / WebSocket
┌────────────────────▼────────────────────────────────┐
│                 BACKEND LAYER (Server)              │
│  Node.js xử lý logic nghiệp vụ, proxy API, và       │
│  điều phối hệ thống chấm code (Judge)               │
└──────┬──────────────────────────────────┬────────────┘
       │ Trực tiếp lấy dữ liệu (Supabase) │ Truy vấn bảo mật
┌──────▼──────┐                 ┌─────────▼──────────┐
│   BaaS API  │                 │ Database & Storage │
│ (Supabase   │                 │   (PostgreSQL)     │
│ Client TS)  │                 │ - Lưu trữ dữ liệu  │
│ - Xác thực  │                 │ - Row Level Sec.   │
└─────────────┘                 └────────────────────┘
```

---
## 📦 Yêu cầu cài đặt

### Phần mềm bắt buộc

| Phần mềm | Phiên bản | Link |
|----------|-----------|------|
| Node.js | ≥ 18.x (LTS) | [nodejs.org](https://nodejs.org/) |
| Git | Mới nhất | [git-scm.com](https://git-scm.com/) |

### Nền tảng Đám mây
* Một dự án **Supabase** đang hoạt động (Project URL & Anon Key).

---

## 🚀 Hướng dẫn cài đặt

### Bước 1: Lấy mã nguồn

```bash
git clone https://github.com/endenko/Lesson_Problem_Web.git
cd Lesson_Problem_Web
```

### Bước 2: Thiết lập Backend

```bash
cd backend
npm install
```

### Bước 3: Thiết lập Frontend

Mở một Terminal khác:
```bash
cd frontend
npm install
```

### Bước 4: Khởi tạo Cơ sở dữ liệu

1. Truy cập trang quản trị dự án Supabase của bạn.
2. Mở mục **SQL Editor**.
3. Sao chép toàn bộ mã lệnh trong tệp `frontend/database.sql` và chạy (Run) để tự động tạo các bảng và thiết lập quyền.

---

## ⚙️ Cấu hình hệ thống

Bạn cần thiết lập biến môi trường để kết nối các phân hệ:

### 1. Cấu hình Frontend
Tạo tệp `.env.local` trong thư mục `frontend`:
```env
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### 2. Cấu hình Backend
Tạo tệp `.env` trong thư mục `backend`:
```env
PORT=5000
# Thêm các biến bảo mật khác của Node.js tại đây
```

---

## 📖 Cách sử dụng

### 1. Bắt đầu Máy chủ Backend
```bash
cd backend
npm start
```
> Máy chủ sẽ lắng nghe các yêu cầu tại cổng 5000.

### 2. Bắt đầu Giao diện Frontend
```bash
cd frontend
npm run dev
```
> Hệ thống Vite sẽ khởi chạy ứng dụng (thường ở địa chỉ `http://localhost:5173`).

### 3. Phân quyền Quản trị
Để truy cập vào các giao diện Admin (`ManageUsers`, `ManageProblems`...), bạn cần đăng nhập bằng một tài khoản đã được thiết lập quyền `admin` bên trong cơ sở dữ liệu Supabase.

---

## 🔌 API Reference

### Module: `supabaseClient.ts`
Chịu trách nhiệm khởi tạo kết nối từ Frontend đến CSDL.

| Tính năng | Phương thức / Logic |
|-----------|---------------------|
| `Authentication` | Sử dụng `supabase.auth.signUp()` và `signInWithPassword()`. |
| `Data Fetching` | Gọi trực tiếp qua Client: `supabase.from('problems').select('*')`. |

### Module: Backend Node.js
Chịu trách nhiệm cho các tác vụ không thể xử lý ở Frontend. Tùy thuộc vào thiết lập trong `index.js`, máy chủ này sẽ xử lý các REST API liên quan đến hệ thống chấm bài hoặc xác thực cấp cao.

---

## 5. SƠ ĐỒ CẤU TRÚC THƯ MỤC

Phân tích kiến trúc mã nguồn chi tiết:

```text
Lesson_Problem_Web/
├── backend/                        # ⚙️ MÁY CHỦ XỬ LÝ LÕI
│   ├── node_modules/
│   ├── .env                        # Khai báo PORT, Secrets
│   ├── index.js                    # Router & Controller chính của Node.js
│   ├── package.json                # Quản lý thư viện backend
│   └── package-lock.json
│
├── frontend/                       # 🎨 GIAO DIỆN NGƯỜI DÙNG (SPA)
│   ├── .env.local                  # Lưu VITE_SUPABASE_URL & KEY
│   ├── database.sql                # File thiết kế Database chuẩn PostgreSQL
│   ├── index.html                  # Khung HTML gốc
│   ├── admin.html                  # Khung HTML dành riêng cho Admin
│   ├── package.json
│   ├── tsconfig.json               # Cấu hình trình biên dịch TypeScript
│   ├── vite.config.ts              # Cấu hình môi trường Vite
│   │
│   └── src/                        # 🧠 MÃ NGUỒN CHÍNH
│       ├── App.tsx                 # Điều hướng ứng dụng (Routing)
│       ├── index.tsx               # Điểm neo React DOM
│       ├── constants.ts            # Khai báo các hằng số dùng chung
│       ├── types.ts                # Khai báo Interfaces cho TypeScript
│       ├── supabaseClient.ts       # Service kết nối tới CSDL Supabase
│       │
│       ├── context/                # Quản lý State toàn cục (VD: AuthContext)
│       └── components/             # TẬP HỢP CÁC MODULE GIAO DIỆN
│           ├── admin/              # -> Không gian quản trị
│           │   ├── AdminDashboard.tsx
│           │   ├── AdminLayout.tsx
│           │   ├── ManageContests.tsx
│           │   ├── ManageLectures.tsx
│           │   ├── ManageProblems.tsx
│           │   └── ManageUsers.tsx
│           │
│           ├── AuthModal.tsx       # -> Popup Đăng nhập/Đăng ký
│           ├── Navbar.tsx          # -> Thanh điều hướng trên
│           ├── Sidebar.tsx         # -> Thanh menu dọc
│           ├── ChatWidget.tsx      # -> Cửa sổ trò chuyện nổi
│           │
│           ├── Problem/            # -> Xử lý Bài tập
│           │   ├── ProblemList.tsx
│           │   ├── ProblemDetail.tsx
│           │   ├── SubmissionArea.tsx
│           │   └── SubmissionList.tsx
│           │
│           ├── Contest/            # -> Xử lý Kỳ thi
│           │   ├── ContestList.tsx
│           │   └── ContestDetail.tsx
│           │
│           ├── User/               # -> Hồ sơ cá nhân
│           │   ├── Achievements.tsx
│           │   ├── ActivityHistory.tsx
│           │   └── Settings.tsx
│           └── ...
```

---

## 6. HƯỚNG DẪN TRIỂN KHAI

Yêu cầu hệ thống: Máy tính cài đặt sẵn **Node.js (>= 18.x)** và **Git**.

### BƯỚC 1: Lấy mã nguồn
```bash
git clone https://github.com/endenko/Lesson_Problem_Web.git
cd Lesson_Problem_Web
```

### BƯỚC 2: Khởi động Backend
```bash
cd backend
npm install       # Cài đặt thư viện
# Tạo file .env và nhập: PORT=5000
npm start         # Hoặc: node index.js
```

### BƯỚC 3: Khởi động Frontend
Mở một cửa sổ Terminal mới:
```bash
cd frontend
npm install       # Cài đặt toàn bộ thư viện React
# Tạo file .env.local và nạp key Supabase (Xem mục 7)
npm run dev       # Khởi chạy Vite Server (thường ở port 5173)
```

---

## 7. THIẾT LẬP CƠ SỞ DỮ LIỆU

Dự án này sử dụng **Supabase**. Để hệ thống hoạt động, bạn phải đồng bộ thiết kế DB:

1. Đăng nhập vào [Supabase.com](https://supabase.com) và tạo một Project mới.
2. Mở file `frontend/database.sql` bằng một trình soạn thảo văn bản.
3. Sao chép toàn bộ mã SQL trong file đó.
4. Chuyển đến mục **SQL Editor** trên giao diện quản trị Supabase.
5. Dán mã SQL và nhấn **Run** để hệ thống tự động tạo các bảng `users`, `problems`, `submissions`, `contests`...
6. Lấy thông tin API: Vào `Project Settings` -> `API`. Sao chép `Project URL` và `anon/public key`.
7. Dán vào file `frontend/.env.local`:
```env
VITE_SUPABASE_URL="Dán Project URL vào đây"
VITE_SUPABASE_ANON_KEY="Dán anon key vào đây"
```

---

## 8. TÀI LIỆU API & KẾT NỐI

* **Supabase Client (`supabaseClient.ts`):** Được khởi tạo bằng hàm `createClient(URL, KEY)`. Mọi component cần đọc/ghi DB đều import client này. Ví dụ: `supabase.from('problems').select('*')`.
* **TypeScript Types (`types.ts`):** Toàn bộ dữ liệu trả về từ API đều được kiểm duyệt chặt chẽ bởi các `Interface` quy định sẵn trong file này, đảm bảo không có lỗi undefined/null khi render giao diện.

---

## 9. XỬ LÝ SỰ CỐ & GỠ LỖI

| Biểu hiện lỗi | Phân tích & Khắc phục |
|---------------|------------------------|
| **Lỗi `npm install` ở Frontend** | Do xung đột version giữa thư viện React cũ và mới. Hãy thử chạy `npm install --legacy-peer-deps`. |
| **Giao diện trắng bóc, báo lỗi CORS** | Xảy ra khi Frontend (port 5173) gọi Backend (port 5000) nhưng backend chưa cấu hình `app.use(cors())`. Hãy kiểm tra file `index.js`. |
| **Supabase trả về mã lỗi 401 Unauthorized** | Do `VITE_SUPABASE_ANON_KEY` bị sai, hoặc bạn đang cố ghi dữ liệu vào bảng có bật RLS (Row Level Security) mà chưa đăng nhập. |
| **Không thể truy cập phân hệ Admin** | Cần can thiệp vào Database, chuyển cột `role` của tài khoản đăng nhập từ `user` sang `admin` để đi qua lớp bảo vệ của `AdminRoute.tsx`. |

---
