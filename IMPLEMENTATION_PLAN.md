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
7. **Phiếu kiểm kê kho:** `KK-YYYYMM-XXXX` (Cân bằng tồn kho tự động với mã `PKK-KK-YYYYMM-XXXX` vào `STOCK_MOVEMENTS`)
8. **Khách hàng:** `KH-XXXX` hoặc `KHxxx`
9. **Nhà cung cấp:** `NCC-XXXX` hoặc `NCCxx`
10. **Mặt hàng / SKU:** `SPxxx` hoặc mã theo ngành hàng

---

## 3. CẤU TRÚC 12 TAB DỮ LIỆU TRÊN GOOGLE SHEETS (DATA CONTRACT)

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
7. **`STOCK_MOVEMENTS` (Cột A:L)**: Lịch sử phiếu xuất / nhập / điều chuyển / kiểm kê kho.
   `id` | `code` | `type` | `reference_doc_type` | `reference_doc_code` | `warehouse_id` | `date` | `total_amount` | `note` | `status` | `created_by` | `created_at`
8. **`PAYMENTS` (Cột A:N)**: Sổ quỹ thu - chi - phân bổ công nợ.
   `id` | `code` | `payment_date` | `direction` | `partner_type` | `partner_id` | `partner_name` | `amount` | `method` | `bill_image_url` | `unallocated_amount` | `status` | `note` | `created_at`
9. **`PURCHASE_ORDERS` (Cột A:S)**: Đơn mua hàng từ Nhà cung cấp.
   `id` | `code` | `supplier_id` | `supplier_name` | `order_date` | `expected_delivery_date` | `warehouse_id` | `subtotal` | `discount_amount` | `vat_rate` | `vat_amount` | `shipping_fee` | `total` | `paid_amount` | `debt_amount` | `payment_status` | `status` | `note` | `created_at`
10. **`PURCHASE_ORDER_ITEMS` (Cột A:K)**: Dòng hàng của đơn mua hàng.
   `id` | `purchase_order_id` | `product_id` | `sku` | `product_name` | `unit` | `quantity` | `unit_price` | `discount_amount` | `line_total` | `note`
11. **`STOCKTAKES` (Cột A:N)**: Phiếu kiểm kê kho tổng hợp.
   `id` | `code` | `stocktake_date` | `warehouse_id` | `counted_by` | `item_count` | `total_system_qty` | `total_actual_qty` | `increase_count` | `decrease_count` | `diff_value` | `status` | `note` | `created_at`
12. **`STOCKTAKE_ITEMS` (Cột A:L)**: Chi tiết từng mặt hàng trong biên bản kiểm kê.
   `id` | `stocktake_id` | `product_id` | `sku` | `product_name` | `unit` | `system_qty` | `actual_qty` | `diff_qty` | `unit_cost` | `diff_value` | `reason`

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
- [x] Khởi tạo đầy đủ header tiêu đề cho 12 tab Google Sheets.

### Giai đoạn B: Nghiệp vụ Danh mục, Bán hàng, Mua hàng & Quỹ [HOÀN THÀNH 100%]
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

- [x] **Sổ quỹ & Thu chi (`PAYMENTS`)**:
  - [x] Tab `PAYMENTS` (14 cột) trên Google Sheets.
  - [x] Xây dựng `server/repositories/payments.ts` & `server/routes/payments.ts`.
  - [x] Tự động sinh mã phiếu thu `PT-YYYYMM-XXXX` và phiếu chi `PC-YYYYMM-XXXX`.
  - [x] Tự động gạch nợ hóa đơn bán hoặc đơn mua, cập nhật công nợ tức thì và đồng bộ ngầm lên Google Sheets.
  - [x] Xây dựng giao diện chuyên dụng `src/views/CashbookView.tsx` với 2 nút bấm nổi bật **Tạo phiếu thu** & **Tạo phiếu chi**, 4 thẻ KPI quỹ, bộ lọc phân loại Thu/Chi và bảng chi tiết phiếu.
  - [x] Bổ sung mục điều hướng **Sổ quỹ** trực tiếp trên Sidebar và menu Tạo nhanh Header.

### Giai đoạn C: Kiểm kê kho & In chứng từ [HOÀN THÀNH 100%]
- [x] **Kiểm kê kho (`STOCKTAKES` + `STOCKTAKE_ITEMS`)**:
  - [x] Tab `STOCKTAKES` (14 cột) và `STOCKTAKE_ITEMS` (12 cột) khởi tạo sẵn trên Google Sheets.
  - [x] Xây dựng `server/repositories/stocktakes.ts` & `server/routes/stocktakes.ts`.
  - [x] Tự động sinh mã `KK-YYYYMM-XXXX`, ghi nhận chênh lệch kiểm kê (tăng, giảm, giá trị chênh lệch).
  - [x] Khi kiểm kê hoàn tất (`completed`), tự động sinh phiếu điều chỉnh cân bằng tồn `PKK-KK-YYYYMM-XXXX` vào `STOCK_MOVEMENTS` và cập nhật lại số lượng tồn kho chuẩn xác trong `PRODUCTS`.
  - [x] Modal `StocktakeFormModal` kiểm kê tất cả mặt hàng với thanh tìm kiếm nhanh sản phẩm, giao diện bảng cuộn có sticky header và tự động tính chênh lệch.
  - [x] Tích hợp Optimistic UI vào `src/context/AppContext.tsx` và đồng bộ ngầm lên Google Sheets.
- [x] **In chứng từ đa năng (`PrintDialog`)**:
  - [x] Hỗ trợ in 6 loại chứng từ: Hóa đơn bán hàng (`BH`), Phiếu mua hàng (`MH`), Phiếu thu tiền (`PT`), Phiếu chi tiền (`PC`), Phiếu nhập/xuất kho (`PN`/`PX`), và Biên bản kiểm kê kho (`KK`).
  - [x] Nút "In" trực quan tại từng dòng ở Sổ quỹ (`CashbookView`), Mua hàng (`PurchaseView`), Bán hàng (`SalesView`), và Kho hàng (`WarehouseView`).
  - [x] Hỗ trợ tùy biến khổ in A4 / A5 / K80, ẩn/hiện logo công ty, chữ ký, QR code ngân hàng và xuất file PDF.

### Giai đoạn D: Dashboard Báo cáo, Thẻ kho, Google Sheets Sync, Xuất & Nhập Excel, Quản lý Công nợ chuyên sâu [ĐÃ HOÀN THÀNH GÓI 1, 2, 3, 4 & 5]
- [x] **Dashboard phân tích tài chính & vận hành thực tế (Gói 1)**:
  - [x] Động hóa 100% biểu đồ `ComposedChart` trên Dashboard: nhóm dữ liệu theo ngày / tuần / tháng dựa trên hóa đơn bán hàng và giá vốn thực tế thay vì mock data cứng.
  - [x] Bổ sung khối **Báo cáo Hiệu quả Kinh doanh (P&L) & Dòng tiền thực tế**:
    - Doanh thu thuần (100% doanh số từ các đơn bán hoàn tất).
    - Giá vốn hàng bán (COGS) & Tỷ trọng giá vốn.
    - Lợi nhuận gộp (Gross Profit) & Biên lãi gộp (%).
    - Chi phí vận hành (OpEx) tính từ các Phiếu chi `PC` thực tế trong kỳ từ Sổ quỹ.
    - Lợi nhuận ròng (Net Profit) & Biên lãi ròng sau khi trừ chi phí vận hành.
    - Thống kê Thực thu, Thực chi và Dòng tiền thuần kỳ kinh doanh.
  - [x] Đồng bộ bộ lọc nhanh (Hôm nay, 7 ngày, Tháng này, Quý này) tự động cập nhật biểu đồ và các thẻ KPI.
- [x] **Thẻ kho (Stock Card) chi tiết cho từng SKU (Gói 2)**:
  - [x] Thêm tab chuyên dụng **"Thẻ kho (Stock Card)"** (`/kho-hang?tab=the-kho`) trong module Kho hàng.
  - [x] Tích hợp nút bấm tắt **"Xem Thẻ kho"** (icon `history_edu`) trực tiếp tại từng dòng của Danh sách sản phẩm tồn kho.
  - [x] Thanh chọn sản phẩm thông minh (hiển thị SKU, Tên hàng, ĐVT, Tồn hiện tại) kèm bộ lọc ngày linh hoạt.
  - [x] 4 thẻ chỉ số lũy kế chuẩn mực: Tồn đầu kỳ, Tổng nhập trong kỳ, Tổng xuất trong kỳ, và Tồn cuối kỳ.
  - [x] Bảng dòng chảy lịch sử xuất - nhập - tồn lũy kế tự động gom từ Phiếu nhập mua (`PN`), Phiếu xuất bán (`PX`), Phiếu cân bằng kiểm kê (`PKK`) và Xuất trả NCC (`PR`).
  - [x] Nút **"Xuất Excel"** xuất dữ liệu Thẻ kho chuẩn CSV UTF-8 BOM mở trực tiếp bằng Microsoft Excel.
  - [x] Nút **"In Thẻ kho"** sinh mẫu biểu THẺ KHO (SỔ KHO) Mẫu số S12-DNN ban hành theo TT 133/2016/TT-BTC với đầy đủ tiêu đề công ty, thông tin mặt hàng, bảng chi tiết và 4 vị trí chữ ký phê duyệt.
- [x] **Trạng thái đồng bộ Google Sheets Real-time & Xuất Excel toàn diện (Gói 3)**:
  - [x] **Google Sheets Sync Indicator** trên thanh Header:
    - Hiển thị badge trạng thái động: 🟢 Đã đồng bộ (chấm xanh hiệu ứng radar ping, hiển thị giờ đồng bộ gần nhất), 🟡 Đang đồng bộ (icon spinner quay tròn), 🔴 Lỗi kết nối (nhấn để thử lại).
    - Hỗ trợ nhấn trực tiếp vào badge để kích hoạt đồng bộ thủ công (`triggerManualSync()`) với Google Sheets.
  - [x] **Tích hợp `syncStatus`, `lastSyncTime`, `syncWithApi` trong `AppContext.tsx`**:
    - Tự động bao bọc tất cả các thao tác CRUD (Tạo/Hủy Hóa đơn bán, Mua hàng, Kiểm kê kho, Thu/Chi sổ quỹ, Sản phẩm, Khách hàng, Nhà cung cấp).
    - Cập nhật thời gian đồng bộ `lastSyncTime` chính xác khi API backend trả về thành công.
  - [x] **Xuất Excel toàn diện cho Sổ quỹ (`CashbookView.tsx`)**:
    - Nút "Xuất Excel" xuất danh sách các phiếu thu/chi kèm đối tác, chứng từ tham chiếu, số tiền, hình thức thanh toán theo đúng bộ lọc đang chọn.
  - [x] **Xuất Excel đa tab cho Quản lý Công nợ (`DebtView.tsx`)**:
    - Nút "Xuất Excel" linh hoạt theo tab đang mở: Công nợ khách hàng, Công nợ nhà cung cấp, Chi tiết hóa đơn phải thu, Chi tiết đơn mua phải trả, Lịch sử thanh toán thu chi.
  - [x] **Xuất Excel cho Báo cáo Vận hành (`ReportView.tsx`)**:
    - Kết nối dữ liệu live với context Google Sheets (`contextProducts`, `contextCustomers`, `contextSuppliers`), hỗ trợ xuất Excel cho cả 6 tab báo cáo: Tổng hợp, Tồn kho, Công nợ, Top sản phẩm, Top khách hàng, Top nhà cung cấp.
  - [x] Đảm bảo 100% file xuất dùng chuẩn UTF-8 BOM (`\uFEFF`) để font tiếng Việt có dấu hiển thị sắc nét trong Excel mà không bị lỗi font/ký tự lạ.
- [x] **Nhập dữ liệu hàng loạt từ file Excel/CSV (Gói 4)**:
  - [x] Cài đặt thư viện chuẩn công nghiệp `xlsx` (SheetJS) hỗ trợ đọc & ghi file Excel `.xlsx`, `.xls`, `.csv`.
  - [x] Xây dựng Backend Batch Repository & Endpoints:
    - `POST /api/products/batch`: Thêm hàng loạt sản phẩm vào tab `PRODUCTS` trên Google Sheets chỉ trong 1 request.
    - `POST /api/customers/batch`: Thêm hàng loạt khách hàng vào tab `CUSTOMERS` trên Google Sheets chỉ trong 1 request.
    - `POST /api/vendors/batch`: Thêm hàng loạt nhà cung cấp vào tab `VENDORS` trên Google Sheets chỉ trong 1 request.
  - [x] Xây dựng Universal Import Modal `src/components/ui/ImportModal.tsx` đa năng cho Sản phẩm, Khách hàng, Nhà cung cấp:
    - Tải mẫu file Excel `.xlsx` tự động sinh kèm dòng mẫu và định dạng chuẩn (`Mau_nhap_san_pham_LKERP.xlsx`, `Mau_nhap_khach_hang_LKERP.xlsx`, `Mau_nhap_nha_cung_cap_LKERP.xlsx`).
    - Kéo thả / Chọn file `.xlsx`, `.xls`, `.csv` với parser thông minh (fuzzy matching tiêu đề cột, lọc số tiền/số lượng có dấu chấm/phẩy).
    - Bảng xem trước dữ liệu với phân tích hợp lệ / cảnh báo lỗi trực quan từng ô.
    - Tùy chọn bỏ qua dòng lỗi để import các dòng hợp lệ.
  - [x] Tích hợp Optimistic UI & Google Sheets Sync trong `src/context/AppContext.tsx`:
    - `importProductsBatch`, `importCustomersBatch`, `importSuppliersBatch` cập nhật giao diện người dùng lập tức và đồng bộ ngầm an toàn lên Google Sheets.
  - [x] Tích hợp nút bấm **"Nhập Excel"** trực quan vào thanh công cụ FilterToolbar:
    - Tab Khách hàng (`SalesView.tsx`).
    - Tab Nhà cung cấp (`PurchaseView.tsx`).
    - Tab Danh mục sản phẩm (`WarehouseView.tsx`).
- [x] **Quản lý Công nợ chuyên sâu, Tuổi nợ (Aging) & Biên bản đối chiếu công nợ (Gói 5)**:
  - [x] **Động hóa 100% Dòng tiền 30 ngày (`dong-tien`)**:
    - Tính toán dự kiến thu, dự kiến chi và dòng tiền ròng động 100% dựa trên ngày đến hạn thanh toán của các hóa đơn bán hàng và đơn mua hàng thực tế.
  - [x] **Báo cáo Phân loại Tuổi nợ (Aging Schedule - Tab `tuoi-no`)**:
    - Phân bổ số dư công nợ theo 5 kỳ hạn tài chính: *Trong hạn, Quá hạn 1-30 ngày, 31-60 ngày, 61-90 ngày, >90 ngày (Rủi ro cao)*.
    - Bộ chuyển đổi mượt mà giữa Khách hàng phải thu và Nhà cung cấp phải trả.
    - 4 thẻ KPI chỉ số: Tổng nợ, Tỷ lệ an toàn trong hạn (%), Quá hạn 1-60 ngày, Nợ xấu rủi ro cao (>60 ngày).
    - Biểu đồ phân bổ nhóm tuổi nợ `BarChart`.
    - Bảng ma trận đối tác chi tiết kèm đánh giá mức độ rủi ro (🟢 An toàn, 🟡 Cần đôn đốc, 🔴 Rủi ro cao).
    - Nút bấm nhanh "Đối chiếu công nợ" và "Thu nợ / Thanh toán" tại từng dòng.
    - Hỗ trợ Xuất Excel bảng phân tích tuổi nợ.
  - [x] **Danh sách cảnh báo nợ rủi ro cao & Quá hạn lâu ngày (Watchlist)**:
    - Bổ sung khối giám sát rủi ro công nợ trực tiếp trên màn hình Tổng quan công nợ (`tong-quan`) giúp phát hiện sớm các khoản nợ trễ hạn trên 30-90 ngày.
  - [x] **Biên bản đối chiếu công nợ Mẫu 01-ĐCCN (`DebtReconciliationModal.tsx`)**:
    - Chuẩn Chế độ Kế toán Doanh nghiệp (TT 200/2014 & TT 133/2016/TT-BTC).
    - Tự động tập hợp số dư đầu kỳ, các chứng từ phát sinh trong kỳ (mua/bán hàng, thanh toán sổ quỹ, phiếu trả hàng), tính số dư cuối kỳ trong khoảng thời gian tùy chọn.
    - Tích hợp 4 vị trí chữ ký phê duyệt: Người lập biểu, Kế toán trưởng, Đại diện Bên A, Đại diện Bên B.
    - Hỗ trợ In biên bản đối chiếu (`window.print()`) và Xuất file Excel chuẩn UTF-8 BOM.
    - Nút bấm "Đối chiếu công nợ" trên thanh công cụ Header và tại từng dòng đối tác.

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
