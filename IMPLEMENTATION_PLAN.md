# Kế hoạch triển khai Hệ thống ERP/CRM (Google Sheets + React/Vite/Express)

Dựa trên tài liệu đặc tả `NexUpOne_SPEC.md` và chuẩn `/gsheet_auth_crud`. Do dự án hiện tại đã khởi tạo bằng React + Vite + Express, chúng ta sẽ áp dụng kiến trúc này (thay vì Next.js) để xây dựng hạ tầng Google Sheets.

## Giai đoạn 0: Khởi tạo & Thiết lập hạ tầng cốt lõi (Current)
- [x] Tạo file kế hoạch `IMPLEMENTATION_PLAN.md`.
- [ ] Cài đặt các thư viện backend (`googleapis`, `google-auth-library`, `jsonwebtoken`, `bcryptjs`, `cookie-parser`).
- [x] Thiết lập file cấu hình Google Sheets Adapter (`src/server/google-sheets.ts` hoặc `server/google-sheets.ts`).
- [x] Thiết kế Schema Hợp đồng (Data Contract) với các Sheets: `USERS`, `CUSTOMERS`, `PRODUCTS`, `VENDORS`, `ORDERS`, v.v.
- [x] Xây dựng Auth API (Mật khẩu, Google Auth, JWT Session Cookie).
- [x] Tạo Middleware kiểm tra Session & Phân quyền.

## Giai đoạn 1: App Shell & UI Kit
- [x] Xây dựng bộ khung giao diện: Sidebar, Header, Tabs.
- [x] Xây dựng các component dùng chung (Zustand state caching): DataTable, DateRangePicker, KpiCard, EntityCombobox.
- [x] Tích hợp AuthContext, GoogleOAuthProvider và giao diện Login.

## Giai đoạn 2: Các Module Danh mục cơ bản
- [ ] Sản phẩm, Khách hàng, Nhà cung cấp (CRUD API với Google Sheets).
- [ ] Trang quản lý các danh mục.

## Giai đoạn 3: Nghiệp vụ cốt lõi - Bán hàng, Mua hàng & Kho
- [ ] Xử lý Nhập xuất kho (`INVENTORY_MOVEMENTS`) và tính Giá vốn.
- [ ] Xử lý luồng Đơn hàng (Master-Detail, batch update).
- [ ] Lập cơ chế xử lý lỗi/rollback thủ công khi gọi API Sheets.

## Giai đoạn 4: Công nợ & Báo cáo Dashboard
- [ ] Module Công nợ (Payments vs Orders/Purchases).
- [ ] Tổng hợp báo cáo (Summary caching cho Dashboard).

---
*Tiến độ cập nhật lần cuối: Đã khởi tạo file kế hoạch, đang cài đặt thư viện và đã tạo Google Sheets Adapter.*
