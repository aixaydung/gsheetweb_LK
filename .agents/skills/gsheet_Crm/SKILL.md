---
name: gsheet_Crm
description: Chuẩn thiết kế UI/UX, bảng biểu kế toán, bộ lọc đa năng, trung tâm cài đặt hệ thống và đồng bộ Google Sheets 2 chiều theo phong cách LK ERP chuyên nghiệp. Kích hoạt khi cần xây dựng, làm mới hoặc nhân bản web app quản trị/CRM/ERP sử dụng Google Sheets làm database với giao diện hiện đại, tinh tế.
---

# gsheet_Crm — Hệ Thống Thiết Kế & Kiến Trúc Web App Quản Trị Google Sheets

Skill này đúc kết toàn bộ ngôn ngữ thiết kế, kiến trúc giao diện, chuẩn bảng biểu, bộ lọc và luồng đồng bộ dữ liệu của **LK ERP** (Hệ thống ERP/CRM quản trị doanh nghiệp chạy trên nền tảng Google Sheets).

Sử dụng skill này bất cứ khi nào bạn bắt đầu xây dựng dự án mới, tái cấu trúc giao diện hoặc thêm module cho các ứng dụng CRM / Bán hàng / Kho vận / Kế toán sử dụng Google Sheets làm cơ sở dữ liệu.

---

## 1. Bản Sắc Thiết Kế & Bộ Token Màu Sắc (Visual Identity)

### 1.1 Triết Lý Thiết Kế
- **Phong cách**: Hiện đại, tối giản, thanh lịch chuẩn Enterprise SaaS (Lấy cảm hứng từ Linear, Stripe và các phần mềm ERP thế hệ mới).
- **Màu chủ đạo (Primary Accent)**: Tím công nghệ `#6D3EEB` (Hover: `#5B2BD6`, Active: `#4C1D95`). Mang lại cảm giác cao cấp, đáng tin cậy và khác biệt so với màu xanh dương/xanh lá truyền thống.
- **Font chữ chuẩn**:
  - Giao diện & Bản in: **`Be Vietnam Pro`** (Weights: 400, 500, 600, 700) kết hợp `Inter` hoặc `system-ui`.
  - Mã chứng từ, Mã hàng, MST, Số tài khoản: **`font-mono`** (Consolas, Monaco, monospace).
  - Số tiền, Số lượng: **`fontVariantNumeric: 'tabular-nums'`** (để các chữ số thẳng hàng tuyệt đối).

### 1.2 Bảng Mã Màu (Design Tokens)

| Token | Light Mode | Dark Mode | Mục đích sử dụng |
| :--- | :--- | :--- | :--- |
| **Primary** | `#6D3EEB` | `#8B5CF6` / `#C084FC` | Nút bấm chính, Icon active, Ring focus, Link |
| **Primary Hover** | `#5B2BD6` | `#7C3AED` | Trạng thái hover của nút bấm chính |
| **Bg Main** | `#F8FAFC` | `#0B0F17` | Nền toàn bộ trang web |
| **Bg Surface (Card)** | `#FFFFFF` | `#111827` / `#1E293B` | Nền card, bảng biểu, panel cài đặt |
| **Bg Muted (Panel)** | `#F9FAFB` | `#0F172A` | Nền khung lọc, input, preview box |
| **Border Soft** | `#F1F2F5` | `#334155` | Đường viền ngăn cách card, thanh điều hướng |
| **Border Input** | `#E5E7EB` | `#475569` | Đường viền input, dropdown, nút thứ cấp |
| **Text Heading** | `#111827` | `#F8FAFC` | Tiêu đề lớn, tên đối tác, số tiền tổng |
| **Text Body** | `#374151` | `#CBD5E1` | Nội dung văn bản, tên sản phẩm |
| **Text Secondary** | `#6B7280` | `#94A3B8` | Nhãn phụ, thời gian, mô tả nhỏ |

### 1.3 Hệ Thống Badge / Trạng Thái (Status Tags)
Bo góc `rounded-full`, độ mờ vừa phải, chữ đậm rõ nét:
- **Thành công / Hoàn thành / Live**: Nền `bg-emerald-50 dark:bg-emerald-950/40`, viền `border-emerald-200 dark:border-emerald-800`, chữ `text-emerald-700 dark:text-emerald-400`.
- **Cảnh báo / Chờ duyệt / Tạm tính**: Nền `bg-amber-50 dark:bg-amber-950/40`, viền `border-amber-200 dark:border-amber-800`, chữ `text-amber-700 dark:text-amber-400`.
- **Nguy hiểm / Nợ xấu / Hủy**: Nền `bg-rose-50 dark:bg-rose-950/40`, viền `border-rose-200 dark:border-rose-800`, chữ `text-rose-700 dark:text-rose-400`.
- **Thông tin / Đơn nháp**: Nền `bg-blue-50 dark:bg-blue-950/40`, viền `border-blue-200 dark:border-blue-800`, chữ `text-blue-700 dark:text-blue-400`.
- **Tính năng tự động / Tự động QR**: Nền `bg-purple-50 dark:bg-purple-950/40`, viền `border-purple-200 dark:border-purple-800`, chữ `text-purple-700 dark:text-purple-400`.

---

## 2. Bố Cục Tổng Thể & Điều Hướng (Shell & Navigation)

### 2.1 Sidebar Điều Hướng (240px Desktop / 280px Mobile Drawer)
- **Top Brand**:
  - Logo hình khối Gradient tím bo góc `rounded-[10px] bg-gradient-to-tr from-[#6D3EEB] via-[#7C3AED] to-[#9333EA]` chứa Icon.
  - Tên ứng dụng `text-[19px] font-black text-[#6D3EEB] tracking-wider`.
  - Phụ đề `text-[11px] text-[#6B7280]`.
- **Menu Items**:
  - Khoảng cách `p-3 space-y-1`.
  - Item Active: `bg-purple-50 dark:bg-purple-950/30 text-[#6D3EEB] dark:text-[#C084FC] font-semibold`.
  - Item Inactive: `text-[#4B5563] dark:text-[#94A3B8] hover:bg-gray-50 dark:hover:bg-gray-800/60`.
  - Icon kích thước 20px, bo góc item `rounded-[10px]`.
- **User Profile Footer**:
  - Thẻ người dùng gọn gàng phía đáy sidebar, có avatar 2 chữ cái viết hoa và nút đăng xuất nhanh.

### 2.2 Header Thanh Tác Vụ
- **Nút Menu Mobile**: Chỉ hiện trên màn hình `< lg`.
- **Thanh Tìm Kiếm Nhanh**: Khung input tìm kiếm toàn hệ thống có phím tắt `Ctrl + K`.
- **Hộp Trạng Thái Đồng Bộ Google Sheets (Live Sync Indicator)**:
  - Hiển thị badge: `synced` (xanh ngọc), `syncing` (icon xoay `animate-spin`), `error` (đỏ).
  - Ghi nhận `lastSyncTime`: "Đồng bộ lúc 10:45".
  - Cho phép click để mở popup cấu hình chu kỳ Polling hoặc bấm nút "Đồng bộ toàn bộ ngay".
- **Cụm Nút Tác Vụ Nhanh**: Chuông thông báo (kèm badge đỏ số lượng), chuyển đổi Dark/Light mode, nút `+ Tạo nhanh`.

---

## 3. Chuẩn Thiết Kế Bảng Biểu Kế Toán (Minimalist Accounting Tables)

Không dùng các đường kẻ dọc thô cứng gây rối mắt. Áp dụng chuẩn bảng biểu tài chính sắc nét:

### 3.1 Quy Tắc Cấu Trúc Bảng
1. **Header (`<thead>`)**:
   - Viền trên: `2px solid #000000` (hoặc border đậm của theme).
   - Viền dưới: `2px solid #000000`.
   - Chiều cao hàng: 36px - 40px, `padding: 8px 8px`.
   - Chữ: In hoa hoặc in đậm, `font-weight: 700`, `font-size: 11px - 12.5px`.
2. **Rows (`<tbody> tr`)**:
   - Viền dưới: `1px solid #E5E7EB` (hoặc `#999999` trên bản in).
   - Không có viền dọc giữa các cột.
   - Hiệu ứng Hover: `hover:bg-purple-50/40 dark:hover:bg-purple-950/20` mượt mà.
   - Padding ô dữ liệu: `py-3 px-3`.
3. **Quy Chuẩn Căn Lề Cột**:
   - `STT`: Căn giữa, width cố định 36px - 44px.
   - `Mã chứng từ / Mã hàng`: Căn trái, font-mono, màu tím hoặc xám đậm, width 80px - 110px.
   - `Tên hàng / Dịch vụ / Khách hàng`: Căn trái, font chữ 500 - 600, co giãn tự do (`flex: 1`).
   - `Đơn vị tính (ĐVT)`: Căn giữa, width 50px - 60px.
   - `Số lượng`: Căn giữa hoặc căn phải, in đậm, width 50px - 70px.
   - `Đơn giá / Thành tiền / Công nợ`: BẮT BUỘC căn phải, áp dụng `fontVariantNumeric: 'tabular-nums'`.
   - `Trạng thái`: Căn giữa, chứa Badge pill.
   - `Thao tác`: Căn phải, các nút Xem / In / Xóa icon 16px - 18px.

### 3.2 Hàng Tổng Kết Đáy Bảng (Summary Row)
- Đóng đáy bảng bằng đường kẻ đôi hoặc đường kẻ 2px đậm.
- Hàng tổng hiển thị: Tổng số lượng, Tổng tạm tính, Chiết khấu, VAT, và **Tổng thanh toán** (in hoa, cỡ chữ lớn hơn 1 cấp).

---

## 4. Bộ Lọc Đa Năng & Thanh Công Cụ (Filter Bar Pattern)

Thanh công cụ đầu mỗi danh mục bao gồm 2 tầng:

### 4.1 Tầng 1: Tìm Kiếm, Chọn Kỳ & Nút Hành Động
- **Ô tìm kiếm tức thì**: Icon kính lúp bên trái, có nút xóa `x` khi đã nhập, debounce 250ms - 300ms.
- **Bộ lọc ngày linh hoạt**:
  - Dropdown chọn sẵn: Hôm nay, 7 ngày qua, Tháng này, Tháng trước, Quý này, Cả năm, Tùy chọn khoảng ngày.
- **Cụm nút bên phải**:
  - Nút thứ cấp: `Xuất Excel` (icon `download`), `In danh sách` (icon `print`).
  - Nút chính: `+ Tạo phiếu mới` (Nền tím `#6D3EEB`, chữ trắng, bo góc `rounded-[12px]`, shadow nổi bật).

### 4.2 Tầng 2: Segmented Filter Chips (Thanh Phân Loại Nhanh)
- Dạng slider/tab nằm ngang: `Tất cả (120)`, `Chờ xử lý (15)`, `Đã thanh toán (98)`, `Quá hạn nợ (7)`.
- Khi chọn chip, bảng tự lọc ngay lập tức mà không phải tải lại trang.

---

## 5. Kiến Trúc Trung Tâm Cài Đặt Hệ Thống (Settings Architecture)

Khu vực Cài đặt hệ thống được tổ chức chuyên nghiệp theo mô hình **Two-Pane Layout**:

### 5.1 Cấu Trúc 5 Nhóm Danh Mục Chuẩn
1. **Cấu hình Chung (`cau-hinh-chung`)**:
   - `thong-tin-doanh-nghiep`: Tên công ty, MST, địa chỉ, hotline, email, website, Logo công ty.
   - `chi-nhanh-kho`: Danh sách chi nhánh, kho hàng & thủ kho.
   - `vietqr-ngan-hang`: Danh sách tài khoản ngân hàng thụ hưởng VietQR Napas (cho phép chọn tài khoản mặc định).
   - `mau-in-chung-tu`: Thiết lập khổ in (A4/A5/K80), tiêu đề phiếu bán, tiêu đề phiếu xuất, lời cảm ơn.
   - `dong-bo-sheets`: Quản lý kết nối Spreadsheet ID, chu kỳ Polling tự động, danh mục 15+ sheet.
2. **Nghiệp vụ & Quy trình (`nghiep-vu-quy-trinh`)**:
   - Thiết lập bán hàng (hạn nợ, chiết khấu).
   - Quản lý kho & tồn (bán âm kho, tồn tối thiểu, phân bổ ship vào giá vốn).
   - Công nợ & Khóa sổ (chu kỳ nợ, ngày khóa sổ kế toán).
   - Nhắc nợ & Email (lịch gửi tự động, giờ gửi, người nhận).
3. **Thông tin Tham khảo (`thong-tin-tham-khao`)**:
   - Biểu thuế GTGT (0%, 5%, 8%, 10%).
   - Mã định danh ngân hàng (40+ ngân hàng Việt Nam).
   - Quy chuẩn mã & Barcode EAN-13.
   - Sơ đồ luân chuyển chứng từ ERP (O2C, P2P).
   - Hệ thống tài khoản kế toán TT200/TT133.
4. **Người dùng & Bảo mật (`nguoi-dung-bao-mat`)**:
   - Tài khoản nhân viên & Phân quyền RBAC.
   - Nhật ký hệ thống (Audit Log).
5. **Nâng cấp & Mở rộng (`nang-cap-mo-rong`)**:
   - Lộ trình nâng cấp module.

### 5.2 Cơ Chế Lưu Trữ 3 Lớp Bền Vững (Triple-Layer Persistence)
Mọi cài đặt trong hệ thống BẮT BUỘC tuân thủ cơ chế lưu 3 lớp:
1. **Lớp 1 - React Context (In-Memory)**: Cập nhật state tức thì (0ms) để giao diện phản hồi mượt mà.
2. **Lớp 2 - Browser LocalStorage**: Lưu đệm tức thì qua các key chuẩn (`lkerp_company_settings`, `lkerp_bank_accounts`, `lkerp_print_config`). Đảm bảo F5 tải lại trang không bao giờ bị mất dữ liệu.
3. **Lớp 3 - Google Sheets Cloud (`SYSTEM_SETTINGS`)**:
   - Tự động gọi `PUT /api/settings` lưu lên tab `SYSTEM_SETTINGS` của Google Sheets.
   - Đảm bảo khi mở app ở máy tính khác, trình duyệt khác hay nhân viên khác đăng nhập, dữ liệu cài đặt luôn đồng bộ 100%.

---

## 6. Mẫu In Chứng Từ Chuẩn Hiện Đại (Editorial Print Standard)

Thiết kế mẫu in chứng từ theo phong cách tạp chí kế toán hiện đại (`mau-in-hoa-don-ban-hang.html`):

### 6.1 Cơ Chế In Độc Lập Qua Thẻ Iframe Ẩn
- KHÔNG in trực tiếp bằng `window.print()` trên trang chính (vì sẽ dính header, sidebar và modal).
- Render nội dung `#printable-paper` vào một `<iframe>` ẩn có nhúng font Google `Be Vietnam Pro`, CSS riêng biệt và gọi `iframe.contentWindow.print()`.

### 6.2 Bố Cục Mẫu In
1. **Header (`.head`)**:
   - Cột trái: Logo công ty (`max-height: 48px`, `max-width: 140px`, không đóng khung thô) + Tên công ty in hoa, địa chỉ, hotline, MST.
   - Cột phải: Tiêu đề chứng từ (HÓA ĐƠN BÁN HÀNG / PHIẾU XUẤT KHO) in to nổi bật + Số chứng từ + Ngày lập.
   - Đường kẻ phân cách: `2px solid #000000`.
2. **Khung Thông Tin 2 Hộp (`.info`)**:
   - Hộp 1: Khách hàng / Nhà cung cấp (Gạch chân tiêu đề, Tên in đậm, Địa chỉ, Số điện thoại, MST dạng monospace).
   - Hộp 2: Thông tin chứng từ (Ngày lập, Ngày giờ in, Tiền tệ VND).
3. **Khối Thanh Toán VietQR Napas 247 (`.pay`)**:
   - Khung bo góc viền mảnh chứa mã QR kích thước chuẩn (104x104px cho A4/A5, 92x92px cho K80).
   - Thông tin bên cạnh: Ngân hàng, Số tài khoản (font-mono, in đậm), Chủ tài khoản (chữ hoa), Số tiền cần thanh toán và Cú pháp chuyển khoản.
4. **Bảng Hàng Hóa**:
   - Bảng tối giản, `border-top: 2px solid #000`, `border-bottom: 2px solid #000`, hàng ngăn cách bởi `1px solid #999`.
5. **Đọc Tiền Thành Chữ (`.words`)**:
   - Tự động dịch số tiền thành chữ bằng tiếng Việt ngữ pháp chuẩn (Ví dụ: *Bốn mươi tám triệu một trăm bảy mươi tám nghìn đồng.*) qua hàm `numberToVietnameseWords`.
6. **Chữ Ký Đôi (`.sign`)**:
   - 2 cột đối xứng: Người mua hàng & Người bán hàng, có khoảng trống 70px để ký và đóng dấu.
7. **Chân Trang (`.foot`)**:
   - Tên công ty • Mã chứng từ và số trang `Trang 1/1`.

---

## 7. Động Cơ Đồng Bộ Dữ Liệu Google Sheets 2 Chiều (Sync Engine)

### 7.1 Chuẩn Đặt Tên Bảng (Sheet Tabs)
- Bảng nghiệp vụ: `PRODUCTS`, `CUSTOMERS`, `VENDORS`, `ORDERS`, `ORDER_ITEMS`, `PURCHASE_ORDERS`, `PURCHASE_ORDER_ITEMS`, `PAYMENTS`, `STOCKTAKES`, `STOCKTAKE_ITEMS`, `STOCK_MOVEMENTS`, `QUOTATIONS`, `QUOTATION_ITEMS`, `RETURNS`, `RETURN_ITEMS`, `USERS`.
- Bảng cài đặt hệ thống: **`SYSTEM_SETTINGS`** (Key-Value: `key`, `value_json`, `updated_at`, `updated_by`, `description`).

### 7.2 Cơ Chế Zero-Config Sheet Generation
Mọi repository đều sử dụng `ensureSheetExists(spreadsheetId, sheetTitle, headers)` để tự động tạo tab mới và đóng băng hàng tiêu đề (frozen row) nếu Google Sheets của khách hàng chưa có sẵn bảng đó.

### 7.3 Background Polling & Visibility Focus
- Polling định kỳ: Mặc định mỗi 30 giây (có thể điều chỉnh trong cài đặt từ 15s - 300s).
- Smart Wakeup: Tự động kích hoạt đồng bộ khi người dùng chuyển lại tab trình duyệt (`document.visibilityState === 'visible'`) sau hơn 30 giây vắng mặt.

---

## 8. Checklist Kiểm Tra Khi Triển Khai Module Mới (DoD)

Khi lập trình bất kỳ module hoặc giao diện mới nào, hãy kiểm tra các tiêu chí sau:

- [ ] Font chữ đã sử dụng `Be Vietnam Pro` hoặc token chuẩn hệ thống.
- [ ] Số tiền và số lượng đã bật `tabular-nums` và căn lề phải.
- [ ] Bảng dữ liệu không có viền dọc kẻ caro, có viền trên dưới 2px tinh tế.
- [ ] Có bộ lọc đa năng: Ô tìm kiếm nhanh, lọc theo trạng thái và lọc theo ngày.
- [ ] Thao tác lưu dữ liệu tuân thủ cơ chế 2 lớp hoặc 3 lớp (Context + LocalStorage + Google Sheets).
- [ ] Mẫu in chứng từ hiển thị rõ Logo công ty, mã VietQR Napas và dịch số tiền thành chữ.
- [ ] Responsive hoàn hảo trên cả PC, Tablet và Mobile.
- [ ] Đầy đủ Dark Mode và Light Mode đồng bộ.
