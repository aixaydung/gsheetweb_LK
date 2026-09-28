# KẾ HOẠCH TRIỂN KHAI VÀ BÀN GIAO TIẾN ĐỘ HỆ THỐNG LK ERP
*(Google Sheets Database + React/Vite Frontend + Express Serverless Backend trên Vercel)*

> **Tài liệu tham chiếu & kim chỉ nam:**
> Toàn bộ AI tiếp quản hệ thống ở các phiên làm việc tiếp theo **BẮT BUỘC ĐỌC KỸ** tài liệu này trước khi tiếp tục lập trình, để nắm rõ kiến trúc, dữ liệu thực tế đã hoàn thành, chuẩn mã hóa và các bước tiếp theo cần làm.

---

## 1. THÔNG TIN HỆ THỐNG VÀ HẠ TẦNG ĐANG HOẠT ĐỘNG

| Thông số | Giá trị thực tế |
| :--- | :--- |
| **Tên hệ thống** | **LK ERP** (Chuẩn hóa thương hiệu, không dùng NextUp / LK ERM) |
| **Trang Production** | [https://lkerp.sheetapp.store](https://lkerp.sheetapp.store) *(Đang hoạt động - Live & Xanh)* |
| **Git Repository** | `https://github.com/aixaydung/gsheetweb_LK.git` *(Branch: `main`)* |
| **Môi trường Cloud** | **Vercel Serverless Function** (`api/index.ts` tích hợp `server/app.ts`) |
| **Cơ sở dữ liệu** | **Google Sheets API v4** qua Service Account (`google-auth-library`, `googleapis`) |
| **Spreadsheet ID** | `1wniDalcsynG8-H1sWokE47Woi0o9mrViDwW27di7oNY` |
| **Cơ chế đồng bộ** | **Lựa chọn A (Optimistic UI)**: UI cập nhật ngay tức thì (độ trễ 0s), đồng bộ ngầm lên Google Sheets. |

---

## 2. QUY ƯỚC MÃ VÀ CHUẨN ĐẶT TÊN CHỨNG TỪ (DATA CONVENTIONS)

Tất cả các module phải tuân thủ nghiêm ngặt định dạng mã chứng từ tự động tăng theo tháng:

1. **Hóa đơn bán hàng:** `BH-YYYYMM-XXXX` (VD: `BH-202609-0001`)
2. **Phiếu xuất kho bán hàng:** `PX-YYYYMM-XXXX` (Tương ứng với mã hóa đơn bán, VD: `PX-202609-0001`)
3. **Đơn mua hàng / Nhập hàng:** `MH-YYYYMM-XXXX` (VD: `MH-202609-0001`)
4. **Phiếu nhập kho mua hàng:** `PN-YYYYMM-XXXX` (Tương ứng với đơn mua hàng, VD: `PN-202609-0001`)
5. **Phiếu thu tiền:** `PT-YYYYMM-XXXX`
6. **Phiếu chi tiền:** `PC-YYYYMM-XXXX`
7. **Khách hàng:** `KH-XXXX` hoặc `KHxxx`
8. **Nhà cung cấp:** `NCC-XXXX` hoặc `NCCxx`
9. **Mặt hàng / SKU:** `SPxxx` hoặc mã theo ngành hàng

---

## 3. CẤU TRÚC 8 TAB DỮ LIỆU TRÊN GOOGLE SHEETS (DATA CONTRACT)

Spreadsheet ID: `1wniDalcsynG8-H1sWokE47Woi0o9mrViDwW27di7oNY` đã khởi tạo sẵn tiêu đề cột ở dòng 1:

1. **`USERS` (Cột A:K)**: Quản lý đăng nhập & phân quyền.
   `id` | `google_sub` | `email` | `name` | `picture` | `role` | `status` | `permissions` | `last_login` | `created_at` | `updated_at`
2. **`CUSTOMERS` (Cột A:M)**: Danh mục khách hàng & công nợ.
   `id` | `code` | `name` | `phone` | `email` | `address` | `tax_code` | `group_id` | `group_name` | `status` | `note` | `created_at` | `updated_at`
3. **`PRODUCTS` (Cột A:N)**: Danh mục sản phẩm & tồn kho.
   `id` | `sku` | `name` | `group_id` | `group_name` | `unit` | `cost_price` | `sale_price` | `stock_quantity` | `min_stock` | `max_stock` | `is_service` | `is_active` | `updated_at`
4. **`VENDORS` (Cột A:L)**: Danh mục nhà cung cấp & công nợ NCC.
   `id` | `code` | `name` | `phone` | `email` | `address` | `tax_code` | `debt_amount` | `note` | `status` | `created_at` | `updated_at`
5. **`ORDERS` (Cột A:R)**: Hóa đơn bán hàng tổng hợp.
   `id` | `code` | `customer_id` | `customer_name` | `order_date` | `subtotal` | `discount_amount` | `vat_rate` | `vat_amount` | `shipping_fee` | `total` | `paid_amount` | `debt_amount` | `payment_status` | `status` | `note` | `created_by` | `created_at`
6. **`ORDER_ITEMS` (Cột A:K)**: Chi tiết từng dòng sản phẩm của hóa đơn bán.
   `id` | `order_id` | `product_id` | `sku` | `product_name` | `unit` | `quantity` | `unit_price` | `discount_amount` | `line_total` | `note`
7. **`STOCK_MOVEMENTS` (Cột A:L)**: Lịch sử phiếu xuất / nhập / điều chuyển kho.
   `id` | `code` | `type` | `reference_doc_type` | `reference_doc_code` | `warehouse_id` | `date` | `total_amount` | `note` | `status` | `created_by` | `created_at`
8. **`PAYMENTS` (Cột A:M)**: Sổ quỹ thu - chi - phân bổ công nợ.
   `id` | `code` | `payment_date` | `direction` | `partner_type` | `partner_id` | `partner_name` | `amount` | `method` | `bill_image_url` | `unallocated_amount` | `status` | `note` | `created_at`

---

## 4. CHI TIẾT TIẾN ĐỘ THỰC HIỆN

### Giai đoạn A: Hạ tầng, Bảo mật & Giao diện cốt lõi [HOÀN THÀNH 100%]
- [x] Chuyển đổi backend Express sang Vercel Serverless Function (`api/index.ts` + `server/app.ts`).
- [x] Đăng nhập Google SSO qua Google Identity Services, cấp session cookie JWT HttpOnly.
- [x] Cơ chế kiểm soát tài khoản nghiêm ngặt: Tài khoản mới vào trạng thái `pending`, hiển thị màn hình `PendingApprovalView` chờ Admin duyệt.
- [x] Quản trị người dùng & phân quyền (`UsersPermissionsTab`) cho phép Admin duyệt, chọn vai trò (*Admin, Kế toán, Thủ kho, Nhân viên Sale*) đồng bộ 2 chiều với tab `USERS`.
- [x] Nút Đăng xuất đầy đủ tại Sidebar, Header Avatar dropdown và ProfileView.
- [x] Chuẩn hóa toàn bộ tên ứng dụng sang **LK ERP**.
- [x] Mở rộng không gian làm việc Full-width workspace cho màn hình Cài đặt (Settings).
- [x] Khởi tạo đầy đủ header tiêu đề cho 8 tab Google Sheets.

### Giai đoạn B: Nghiệp vụ Danh mục & Bán hàng [HOÀN THÀNH 100%]
- [x] **Khách hàng (`CUSTOMERS`)**: Đọc dữ liệu, Thêm mới, Sửa, Xóa (*Người dùng đã kiểm tra thực tế và xác nhận thành công*).
- [x] **Sản phẩm (`PRODUCTS`)**: Đọc dữ liệu, Thêm mới, Cập nhật giá bán/tồn kho, Xóa sản phẩm.
- [x] **Nhà cung cấp (`VENDORS`)**: Đọc dữ liệu, Thêm mới, Cập nhật thông tin/công nợ NCC.
- [x] **Hóa đơn bán hàng (`ORDERS` + `ORDER_ITEMS` + `STOCK_MOVEMENTS`)**:
  - [x] Tự động sinh mã `BH-YYYYMM-XXXX`.
  - [x] Lưu song song Master vào `ORDERS`, chi tiết vào `ORDER_ITEMS`, tự động xuất kho `PX-YYYYMM-XXXX` vào `STOCK_MOVEMENTS`.
  - [x] Cập nhật trạng thái / hủy đơn hàng đồng bộ tab `ORDERS`.

- [x] **Đơn mua hàng / Nhập hàng (`PURCHASE_ORDERS` + `PURCHASE_ORDER_ITEMS` + `STOCK_MOVEMENTS`)**:
  - [x] Đã khởi tạo 2 sheet `PURCHASE_ORDERS` (19 cột) và `PURCHASE_ORDER_ITEMS` (11 cột) trên Google Sheets.
  - [x] Xây dựng `server/repositories/purchases.ts` & `server/routes/purchases.ts`.
  - [x] Tự động sinh mã `MH-YYYYMM-XXXX` và phiếu nhập `PN-YYYYMM-XXXX` vào `STOCK_MOVEMENTS`.
  - [x] Tự động cộng tồn kho và tính lại giá vốn bình quân gia quyền trong tab `PRODUCTS`.
  - [x] Cập nhật `src/context/AppContext.tsx` với Optimistic UI và đồng bộ ngầm lên Google Sheets.

### Giai đoạn C: Đang thực hiện & Cần kiểm thử thực tế [IN PROGRESS]
- [ ] Người dùng kiểm tra tạo thử đơn hàng bán trên [https://lkerp.sheetapp.store/ban-hang](https://lkerp.sheetapp.store/ban-hang) và đơn mua hàng trên [https://lkerp.sheetapp.store/mua-hang](https://lkerp.sheetapp.store/mua-hang).
- [ ] Chuẩn bị triển khai Phân hệ Sổ quỹ Thu/Chi (`PAYMENTS`) & Gạch công nợ.

### Giai đoạn D: Sổ quỹ, Kho nâng cao & Báo cáo [ROADMAP TIẾP THEO]
- [ ] **Sổ quỹ & Thu chi (`PAYMENTS`)**:
  - [ ] Tạo phiếu thu tiền bán hàng (`PT-YYYYMM-XXXX`) theo hóa đơn hoặc thu trước.
  - [ ] Tạo phiếu chi tiền mua hàng NCC (`PC-YYYYMM-XXXX`).
  - [ ] Tự động giảm trừ công nợ khách hàng / nhà cung cấp và ghi chép dòng tiền vào tab `PAYMENTS`.
- [ ] **Kho nâng cao & Kiểm kê (`STOCKTAKES`)**:
  - [ ] Phiếu xuất / nhập điều chỉnh kho thủ công.
  - [ ] Phiếu kiểm kê thực tế và cân chỉnh số lượng tồn kho tự động.
- [ ] **Báo cáo & Dashboard phân tích**:
  - [ ] Tổng hợp doanh thu, lãi gộp, công nợ quá hạn và cảnh báo tồn kho dựa trên dữ liệu Google Sheets trực tiếp.

---

## 5. HƯỚNG DẪN DÀNH CHO AI TRONG CÁC LƯỢT TIẾP THEO

1. **Tuân thủ Optimistic UI (Lựa chọn A):**
   * Trong `src/context/AppContext.tsx`, luôn cập nhật React state trước để giao diện mượt mà và tức thì.
   * Gọi `fetch('/api/...')` trong background ngầm.
2. **Không làm hỏng Schema Google Sheets:**
   * Thứ tự các cột trong 8 tab nêu trên đã được chốt và đồng bộ với Google Sheets API. Không tự ý đổi thứ tự cột trong các hàm append/update ở thư mục `server/repositories/*.ts`.
3. **Quy trình Kiểm thử & Triển khai bắt buộc:**
   * Trước khi commit bất kỳ thay đổi nào, luôn chạy:
     1. `npx tsc --noEmit` *(Đảm bảo 0 lỗi TypeScript)*
     2. `npm run build` *(Đảm bảo đóng gói Vite thành công)*
     3. `git add .` -> `git commit -m "..."` -> `git push origin main`
   * Vercel sẽ tự động build và deploy lên `https://lkerp.sheetapp.store`.
4. **Bảo mật tuyệt đối:**
   * Không bao giờ commit file `.env` hoặc để lộ Private Key Google Service Account lên Git repository công khai.
