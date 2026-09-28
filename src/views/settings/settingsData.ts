// NexUpOne Settings Data & Reference Tables

export interface SettingTabGroup {
  id: string;
  name: string;
  description: string;
  icon: string;
  tabs: {
    id: string;
    name: string;
    shortDesc: string;
    icon: string;
    badge?: string;
    badgeColor?: string;
  }[];
}

export const SETTING_GROUPS: SettingTabGroup[] = [
  {
    id: 'cau-hinh-chung',
    name: 'Cấu hình Chung',
    description: 'Thông tin tổ chức, chi nhánh, ngân hàng & in ấn',
    icon: 'business',
    tabs: [
      {
        id: 'thong-tin-doanh-nghiep',
        name: 'Thông tin Doanh nghiệp',
        shortDesc: 'Tên công ty, MST, địa chỉ, logo & thông tin liên hệ',
        icon: 'storefront',
      },
      {
        id: 'chi-nhanh-kho',
        name: 'Chi nhánh & Kho hàng',
        shortDesc: 'Danh sách chi nhánh, địa điểm kho hàng & thủ kho',
        icon: 'warehouse',
      },
      {
        id: 'vietqr-ngan-hang',
        name: 'VietQR & Ngân hàng',
        shortDesc: 'Cấu hình tài khoản ngân hàng thụ hưởng & mã VietQR Napas',
        icon: 'qr_code_2',
        badge: 'Tự động QR',
        badgeColor: 'emerald',
      },
      {
        id: 'mau-in-chung-tu',
        name: 'Mẫu in & Chứng từ',
        shortDesc: 'Thiết lập khổ in A4/A5/K80, logo & tiêu đề hóa đơn',
        icon: 'print',
      },
    ],
  },
  {
    id: 'nghiep-vu-quy-trinh',
    name: 'Nghiệp vụ & Quy trình',
    description: 'Quy tắc bán hàng, tồn kho an toàn & khóa sổ kế toán',
    icon: 'tune',
    tabs: [
      {
        id: 'nghiep-vu-ban-hang',
        name: 'Thiết lập Bán hàng',
        shortDesc: 'Chính sách chiết khấu, hạn nợ, cảnh báo nợ trần',
        icon: 'sell',
      },
      {
        id: 'nghiep-vu-mua-kho',
        name: 'Quản lý Kho & Tồn',
        shortDesc: 'Bán âm kho, tồn kho tối thiểu, chi phí vận chuyển vào giá vốn',
        icon: 'inventory_2',
      },
      {
        id: 'chinh-sach-cong-no',
        name: 'Công nợ & Khóa sổ',
        shortDesc: 'Chu kỳ công nợ, tính tuổi nợ quá hạn, khóa sổ kỳ kế toán',
        icon: 'lock_clock',
      },
      {
        id: 'nhac-no-email',
        name: 'Nhắc nợ & Email',
        shortDesc: 'Lịch gửi, dự báo dòng tiền',
        icon: 'notifications_active',
        badge: 'Tự động',
        badgeColor: 'purple',
      },
    ],
  },
  {
    id: 'thong-tin-tham-khao',
    name: 'Thông tin Tham khảo',
    description: 'Quy chuẩn biểu thuế, danh mục ngân hàng, mã vạch & luân chuyển chứng từ',
    icon: 'menu_book',
    tabs: [
      {
        id: 'bieu-thue-vat',
        name: 'Biểu thuế GTGT (VAT)',
        shortDesc: 'Quy định thuế suất 0%, 5%, 8% NĐ 72/2024, 10% & tiểu mục nộp thuế',
        icon: 'percent',
        badge: 'Chuẩn Thuế',
        badgeColor: 'blue',
      },
      {
        id: 'ma-ngan-hang-napas',
        name: 'Mã Định danh Ngân hàng',
        shortDesc: 'Bảng tra cứu 40+ mã BIN ngân hàng Việt Nam VietQR/Napas',
        icon: 'account_balance',
      },
      {
        id: 'quy-chuan-ma-barcode',
        name: 'Quy chuẩn Mã & Barcode',
        shortDesc: 'Quy tắc sinh mã chứng từ & chuẩn mã vạch EAN-13 quốc gia 893',
        icon: 'barcode',
      },
      {
        id: 'quy-trinh-chung-tu',
        name: 'Sơ đồ Luân chuyển ERP',
        shortDesc: 'Quy trình O2C (Bán), P2P (Mua) & Kiểm soát chuỗi cung ứng',
        icon: 'account_tree',
      },
      {
        id: 'he-thong-tai-khoan',
        name: 'Hệ thống Tài khoản TT200/133',
        shortDesc: 'Danh mục tài khoản kế toán thương mại và kho thường dùng',
        icon: 'receipt_long',
      },
    ],
  },
  {
    id: 'nguoi-dung-bao-mat',
    name: 'Người dùng & Bảo mật',
    description: 'Quản trị tài khoản nhân sự, phân quyền RBAC & nhật ký',
    icon: 'admin_panel_settings',
    tabs: [
      {
        id: 'tai-khoan-nhan-vien',
        name: 'Tài khoản & Phân quyền',
        shortDesc: 'Danh sách nhân viên, vai trò Quản trị, Kế toán, Thủ kho, Sale',
        icon: 'badge',
      },
      {
        id: 'nhat-ky-audit',
        name: 'Nhật ký Hệ thống (Audit Log)',
        shortDesc: 'Theo dõi lịch sử thêm, sửa, xóa chứng từ và tác vụ nhạy cảm',
        icon: 'history_toggle_off',
      },
    ],
  },
  {
    id: 'nang-cap-mo-rong',
    name: 'Nâng cấp & Mở rộng',
    description: 'Các module nâng cấp, tích hợp mở rộng theo lộ trình các đợt tiếp theo',
    icon: 'rocket_launch',
    tabs: [
      {
        id: 'roadmap-modules',
        name: 'Lộ trình Nâng cấp (Roadmap)',
        shortDesc: 'Danh mục module nâng cấp đợt tiếp theo: HĐĐT CQT, Đa sàn TMĐT, Sản xuất BOM...',
        icon: 'published_with_changes',
        badge: 'Đợt tiếp theo',
        badgeColor: 'purple',
      },
    ],
  },
];

// Reference Data: Danh mục mã ngân hàng Việt Nam (BIN Napas)
export interface BankReference {
  bin: string;
  shortName: string;
  name: string;
  code: string;
  swift?: string;
  supportQr: boolean;
}

export const VIETNAM_BANKS_REFERENCE: BankReference[] = [
  { bin: '970436', shortName: 'Vietcombank', name: 'Ngân hàng TMCP Ngoại Thương Việt Nam', code: 'VCB', swift: 'BFTVVNVX', supportQr: true },
  { bin: '970415', shortName: 'VietinBank', name: 'Ngân hàng TMCP Công Thương Việt Nam', code: 'CTG', swift: 'ICBVVNVX', supportQr: true },
  { bin: '970418', shortName: 'BIDV', name: 'Ngân hàng TMCP Đầu Tư & Phát Triển Việt Nam', code: 'BIDV', swift: 'BIDVVNVX', supportQr: true },
  { bin: '970405', shortName: 'Agribank', name: 'Ngân hàng Nông Nghiệp & PT Nông Thôn Việt Nam', code: 'VBA', swift: 'VBAAVNVX', supportQr: true },
  { bin: '970422', shortName: 'MBBank', name: 'Ngân hàng TMCP Quân Đội', code: 'MB', swift: 'MSCBVNVX', supportQr: true },
  { bin: '970407', shortName: 'Techcombank', name: 'Ngân hàng TMCP Kỹ Thương Việt Nam', code: 'TCB', swift: 'VTCBVNVX', supportQr: true },
  { bin: '970416', shortName: 'ACB', name: 'Ngân hàng TMCP Á Châu', code: 'ACB', swift: 'ASCBVNVX', supportQr: true },
  { bin: '970432', shortName: 'VPBank', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng', code: 'VPB', swift: 'VPBKVNVX', supportQr: true },
  { bin: '970423', shortName: 'TPBank', name: 'Ngân hàng TMCP Tiên Phong', code: 'TPB', swift: 'TPBVVNVX', supportQr: true },
  { bin: '970403', shortName: 'Sacombank', name: 'Ngân hàng TMCP Sài Gòn Thương Tín', code: 'STB', swift: 'SGSTVNVX', supportQr: true },
  { bin: '970437', shortName: 'HDBank', name: 'Ngân hàng TMCP Phát Triển TP.HCM', code: 'HDB', swift: 'HDBCVNVX', supportQr: true },
  { bin: '970441', shortName: 'VIB', name: 'Ngân hàng TMCP Quốc Tế Việt Nam', code: 'VIB', swift: 'VNIBVNVX', supportQr: true },
  { bin: '970443', shortName: 'SHB', name: 'Ngân hàng TMCP Sài Gòn - Hà Nội', code: 'SHB', swift: 'SHBAVNVX', supportQr: true },
  { bin: '970426', shortName: 'MSB', name: 'Ngân hàng TMCP Hàng Hải Việt Nam', code: 'MSB', swift: 'MCOPVNVX', supportQr: true },
  { bin: '970448', shortName: 'OCB', name: 'Ngân hàng TMCP Phương Đông', code: 'OCB', swift: 'OCBCVNVX', supportQr: true },
  { bin: '970449', shortName: 'LPBank', name: 'Ngân hàng TMCP Lộc Phát Việt Nam', code: 'LPB', swift: 'LPBKVNVX', supportQr: true },
  { bin: '970440', shortName: 'SeABank', name: 'Ngân hàng TMCP Đông Nam Á', code: 'SEAB', swift: 'SEABVNVX', supportQr: true },
  { bin: '970409', shortName: 'BacABank', name: 'Ngân hàng TMCP Bắc Á', code: 'BAB', swift: 'NASBVNVX', supportQr: true },
  { bin: '970454', shortName: 'VietCapitalBank', name: 'Ngân hàng Bản Việt (BVBank)', code: 'BVB', swift: 'GIABVNVX', supportQr: true },
  { bin: '970438', shortName: 'BaoVietBank', name: 'Ngân hàng TMCP Bảo Việt', code: 'BVB', swift: 'BVBKVNVX', supportQr: true },
  { bin: '970452', shortName: 'Kienlongbank', name: 'Ngân hàng TMCP Kiên Long', code: 'KLB', swift: 'KLBLVNVX', supportQr: true },
  { bin: '970428', shortName: 'NamABank', name: 'Ngân hàng TMCP Nam Á', code: 'NAB', swift: 'NAMAVNVX', supportQr: true },
  { bin: '970419', shortName: 'NCB', name: 'Ngân hàng TMCP Quốc Dân', code: 'NCB', swift: 'NVBAVNVX', supportQr: true },
  { bin: '970430', shortName: 'PGBank', name: 'Ngân hàng TMCP Thịnh vượng và Phát triển', code: 'PGB', swift: 'PGBLVNVX', supportQr: true },
];

// Reference Data: Biểu thuế GTGT và Thuế doanh nghiệp
export interface VatTaxReference {
  rate: string;
  name: string;
  scope: string;
  decree: string;
  taxItemCode: string;
  note: string;
}

export const VAT_TAX_REFERENCE: VatTaxReference[] = [
  {
    rate: '0%',
    name: 'Hàng hóa, dịch vụ xuất khẩu',
    scope: 'Hàng xuất khẩu ra nước ngoài, bán vào khu phi thuế quan, vận tải quốc tế',
    decree: 'Luật Thuế GTGT số 13/2008/QH12 & Thông tư 219/2013/TT-BTC',
    taxItemCode: 'Tiểu mục 1701',
    note: 'Yêu cầu có tờ khai hải quan thông quan, hợp đồng ngoại thương & chứng từ thanh toán ngân hàng.',
  },
  {
    rate: '5%',
    name: 'Hàng hóa thiết yếu & Nông nghiệp',
    scope: 'Nước sạch sinh hoạt, phân bón, thức ăn gia súc, quặng sản xuất phân bón, thuốc bảo vệ thực vật, thiết bị y tế',
    decree: 'Thông tư 219/2013/TT-BTC & Thông tư 26/2015/TT-BTC',
    taxItemCode: 'Tiểu mục 1701',
    note: 'Áp dụng cho các sản phẩm cơ bản phục vụ đời sống dân sinh và khuyến nông.',
  },
  {
    rate: '8%',
    name: 'Thuế suất ưu đãi giảm 2% (2024 - 2026)',
    scope: 'Áp dụng cho các nhóm hàng hóa, dịch vụ đang áp dụng mức 10% (trừ viễn thông, tài chính, ngân hàng, chứng khoán, bảo hiểm, BĐS, kim loại, khai khoáng, xăng dầu, CNTT)',
    decree: 'Nghị quyết 142/2024/QH15 & Nghị định 72/2024/NĐ-CP',
    taxItemCode: 'Tiểu mục 1701',
    note: 'Khi xuất hóa đơn bán lẻ hoặc hóa đơn điện tử chọn tỷ lệ 8%, tự động ghi chú áp dụng NĐ 72/2024/NĐ-CP.',
  },
  {
    rate: '10%',
    name: 'Thuế suất chuẩn thông thường',
    scope: 'Toàn bộ các mặt hàng thương mại, tiêu dùng, dịch vụ không thuộc diện miễn thuế, 0%, 5% hoặc giảm 8%',
    decree: 'Luật Thuế GTGT số 13/2008/QH12',
    taxItemCode: 'Tiểu mục 1701 / 1702',
    note: 'Mức thuế phổ thông nhất áp dụng trong hạch toán kế toán và hóa đơn bán hàng tiêu chuẩn.',
  },
  {
    rate: 'KCT',
    name: 'Không chịu thuế GTGT (26 nhóm)',
    scope: 'Sản phẩm trồng trọt, chăn nuôi chưa chế biến, dịch vụ y tế, giáo dục, bản quyền phần mềm...',
    decree: 'Điều 5 Luật Thuế GTGT & Thông tư 219/2013/TT-BTC',
    taxItemCode: 'Không phát sinh',
    note: 'Doanh nghiệp không được khấu trừ thuế GTGT đầu vào tương ứng với doanh thu không chịu thuế.',
  },
];

// Reference Data: Quy chuẩn mã chứng từ & Mã vạch EAN-13
export interface CodeStandard {
  prefix: string;
  name: string;
  rule: string;
  example: string;
  purpose: string;
}

export const CODE_STANDARDS: CodeStandard[] = [
  { prefix: 'HD', name: 'Hóa đơn bán hàng', rule: 'HD + [yyMMdd] + [001-999]', example: 'HD260927001', purpose: 'Định danh duy nhất mỗi chứng từ bán hàng ra ngoài' },
  { prefix: 'BG', name: 'Báo giá khách hàng', rule: 'BG + [yyMMdd] + [001-999]', example: 'BG260927002', purpose: 'Lưu trữ chào giá trước khi chốt đơn' },
  { prefix: 'TH', name: 'Trả hàng bán', rule: 'TH + [yyMMdd] + [001-999]', example: 'TH260927001', purpose: 'Khách trả hàng hoàn tiền hoặc bù trừ công nợ' },
  { prefix: 'PM', name: 'Phiếu mua hàng (PO)', rule: 'PM + [yyMMdd] + [001-999]', example: 'PM260927010', purpose: 'Đơn đặt hàng gửi tới nhà cung cấp' },
  { prefix: 'NK', name: 'Phiếu nhập kho', rule: 'NK + [yyMMdd] + [001-999]', example: 'NK260927004', purpose: 'Ghi nhận tăng tồn kho và giá trị nhập' },
  { prefix: 'XK', name: 'Phiếu xuất kho', rule: 'XK + [yyMMdd] + [001-999]', example: 'XK260927008', purpose: 'Ghi nhận giảm tồn kho theo nguyên tắc FIFO/Bình quân' },
  { prefix: 'KK', name: 'Phiếu kiểm kê', rule: 'KK + [yyMMdd] + [001-999]', example: 'KK260927001', purpose: 'Đối chiếu số liệu sổ sách với tồn kho thực tế' },
  { prefix: 'PT', name: 'Phiếu thu tiền', rule: 'PT + [yyMMdd] + [001-999]', example: 'PT260927005', purpose: 'Thu tiền mặt / Chuyển khoản khách thanh toán công nợ' },
  { prefix: 'PC', name: 'Phiếu chi tiền', rule: 'PC + [yyMMdd] + [001-999]', example: 'PC260927003', purpose: 'Chi trả tiền nhà cung cấp hoặc chi phí vận hành' },
  { prefix: 'SKU', name: 'Mã sản phẩm nội bộ', rule: '[Nhóm 2-3 ký tự] - [Số thứ tự 4 số]', example: 'PET-001, ZIP-002', purpose: 'Tra cứu nhanh và phân loại danh mục' },
  { prefix: 'EAN13', name: 'Mã vạch chuẩn quốc tế', rule: '893 (Việt Nam) + Mã DN (4-6 số) + Mã SP (3-5 số) + C (1 số check digit)', example: '8936012345678', purpose: 'Quét mã vạch tự động tại quầy thu ngân & kho' },
];

// Reference Data: Bảng tài khoản kế toán thường dùng (TT 200/133)
export interface AccountReference {
  code: string;
  name: string;
  category: string;
  nature: 'Dư Nợ' | 'Dư Có' | 'Lưỡng tính' | 'Không có số dư';
  description: string;
}

export const ACCOUNT_CHART_REFERENCE: AccountReference[] = [
  { code: '111', name: 'Tiền mặt tại quỹ', category: 'Tài sản ngắn hạn', nature: 'Dư Nợ', description: 'Tiền VND và ngoại tệ thực tế tại két sắt công ty' },
  { code: '112', name: 'Tiền gửi ngân hàng', category: 'Tài sản ngắn hạn', nature: 'Dư Nợ', description: 'Số dư tại các tài khoản thanh toán mở tại ngân hàng' },
  { code: '131', name: 'Phải thu của khách hàng', category: 'Tài sản ngắn hạn', nature: 'Lưỡng tính', description: 'Số tiền khách nợ chưa trả (Dư Nợ) hoặc khách trả trước (Dư Có)' },
  { code: '133', name: 'Thuế GTGT được khấu trừ', category: 'Tài sản ngắn hạn', nature: 'Dư Nợ', description: 'Thuế GTGT đầu vào của hàng mua vào được khấu trừ với thuế đầu ra' },
  { code: '156', name: 'Hàng hóa tồn kho', category: 'Hàng tồn kho', nature: 'Dư Nợ', description: 'Giá trị hàng hóa mua về để bán còn lưu giữ tại kho' },
  { code: '211', name: 'Tài sản cố định hữu hình', category: 'Tài sản dài hạn', nature: 'Dư Nợ', description: 'Máy móc, nhà xưởng, phương tiện vận tải có giá trị trên 30 triệu' },
  { code: '331', name: 'Phải trả cho người bán', category: 'Nợ phải trả', nature: 'Lưỡng tính', description: 'Số tiền nợ nhà cung cấp (Dư Có) hoặc đã trả trước cho NCC (Dư Nợ)' },
  { code: '3331', name: 'Thuế GTGT phải nộp (Đầu ra)', category: 'Nợ phải trả', nature: 'Dư Có', description: 'Thuế GTGT bán lẻ hoặc xuất hóa đơn phải nộp ngân sách nhà nước' },
  { code: '511', name: 'Doanh thu bán hàng và CCDV', category: 'Doanh thu', nature: 'Không có số dư', description: 'Tổng doanh thu thuần bán hàng trong kỳ' },
  { code: '521', name: 'Các khoản giảm trừ doanh thu', category: 'Giảm trừ', nature: 'Không có số dư', description: 'Chiết khấu thương mại, giảm giá hàng bán, hàng bán bị trả lại' },
  { code: '632', name: 'Giá vốn hàng bán (COGS)', category: 'Chi phí sản xuất KD', nature: 'Không có số dư', description: 'Trị giá vốn của hàng hóa đã xuất bán trong kỳ' },
  { code: '641 / 6421', name: 'Chi phí bán hàng', category: 'Chi phí thời kỳ', nature: 'Không có số dư', description: 'Chi phí bao bì, vận chuyển, hoa hồng nhân viên bán hàng' },
  { code: '642 / 6422', name: 'Chi phí quản lý doanh nghiệp', category: 'Chi phí thời kỳ', nature: 'Không có số dư', description: 'Lương nhân viên văn phòng, phần mềm, khấu hao, điện nước' },
  { code: '911', name: 'Xác định kết quả kinh doanh', category: 'Kết chuyển', nature: 'Không có số dư', description: 'Tập hợp toàn bộ doanh thu và chi phí để tính lãi lỗ' },
];

// Upgrade Roadmap Modules (Danh mục Module nâng cấp và làm những đợt tiếp theo)
export interface UpgradeModule {
  id: string;
  title: string;
  subtitle: string;
  phase: string;
  targetTimeline: string;
  badge: string;
  badgeBg: string;
  badgeText: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  features: string[];
  businessValue: string;
  readinessPercentage: number;
  highlightPoints: { label: string; value: string }[];
  tags: string[];
  status: 'planning' | 'in_development' | 'upcoming_wave_1' | 'upcoming_wave_2';
  isImplemented?: boolean; // True nếu phân hệ này đã có sẵn trong hệ thống LK ERM
}

export const UPGRADE_MODULES_ROADMAP: UpgradeModule[] = [
  {
    id: 'multi-branch',
    title: 'Hệ thống Đa Chi nhánh & Chuỗi Cửa hàng',
    subtitle: 'Quản trị chuỗi bán lẻ, điều chuyển kho nội bộ và hạch toán độc lập/phụ thuộc',
    phase: 'Đợt 2 - Q4/2026',
    targetTimeline: 'Tháng 11/2026',
    badge: 'Đã có trong hệ thống',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    icon: 'hub',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    isImplemented: true, // Đã có tại Cài đặt > Chi nhánh & Kho hàng
    features: [
      'Quản lý không giới hạn số lượng chi nhánh, cửa hàng và tổng kho vùng',
      'Điều chuyển hàng hóa liên chi nhánh với quy trình 2 bước: Xuất chuyển đi -> Kiểm nhận đến',
      'Thiết lập bảng giá bán riêng biệt theo từng khu vực địa lý / chi nhánh',
      'Phân quyền nhân viên chỉ được xem và thao tác trên chứng từ chi nhánh phụ trách',
      'Báo cáo doanh thu, lãi gộp và tồn kho so sánh tức thời giữa các điểm bán',
    ],
    businessValue: 'Giúp mở rộng quy mô kinh doanh chuỗi từ 1 lên 20+ điểm bán mà không bị phân mảnh dữ liệu.',
    readinessPercentage: 75,
    highlightPoints: [
      { label: 'Quy mô chi nhánh', value: 'Không giới hạn' },
      { label: 'Kiến trúc dữ liệu', value: 'Multi-Tenant Partitioned' },
      { label: 'Độ trễ đồng bộ tồn', value: '< 300ms' },
    ],
    tags: ['Chuỗi bán lẻ', 'Chuyển kho', 'Đa địa điểm'],
    status: 'in_development',
  },
  {
    id: 'e-invoice',
    title: 'Tích hợp Hóa đơn Điện tử CQT (E-Invoice)',
    subtitle: 'Kết nối API trực tiếp với VNPT, MISA meInvoice, Viettel S-Invoice có mã Cơ quan Thuế',
    phase: 'Đợt 2 - Q4/2026',
    targetTimeline: 'Tháng 12/2026',
    badge: 'Đợt 2 (Ưu tiên cao)',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
    icon: 'receipt',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    features: [
      'Phát hành hóa đơn điện tử ngay từ màn hình bán hàng với 1 cú click',
      'Hỗ trợ hóa đơn khởi tạo từ máy tính tiền theo Thông tư 78 & Nghị định 123',
      'Ký số tập trung qua HSM Cloud (không cần cắm USB Token vật lý trên máy tính)',
      'Tự động gửi email thông báo hóa đơn kèm file PDF & XML gốc cho khách hàng',
      'Xử lý điều chỉnh, thay thế và hủy hóa đơn có mã chuẩn xác theo quy định thuế',
    ],
    businessValue: 'Tiết kiệm 80% thời gian xuất hóa đơn, tuân thủ 100% chế tài pháp lý của Tổng cục Thuế.',
    readinessPercentage: 85,
    highlightPoints: [
      { label: 'Đơn vị kết nối', value: 'MISA, VNPT, Viettel' },
      { label: 'Chuẩn pháp lý', value: 'TT 78/2021/TT-BTC' },
      { label: 'Ký số HSM', value: 'Tốc độ 50 hđ/giây' },
    ],
    tags: ['HĐĐT', 'Tổng cục Thuế', 'Ký số HSM', 'TT 78'],
    status: 'in_development',
  },
  {
    id: 'omnichannel-ecommerce',
    title: 'Đồng bộ Đa sàn TMĐT (Shopee, TikTok Shop, Lazada)',
    subtitle: 'Tự động gom đơn hàng, đồng bộ tồn kho 2 chiều và in phiếu giao hàng loạt',
    phase: 'Đợt 3 - Q1/2027',
    targetTimeline: 'Tháng 02/2027',
    badge: 'Đợt 3 (Kế hoạch)',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    icon: 'shopping_bag',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    features: [
      'Kết nối trực tiếp Open API chính thức của Shopee, TikTok Shop, Lazada, WooCommerce',
      'Tự động trừ tồn kho trên sàn khi có đơn bán lẻ tại cửa hàng và ngược lại',
      'Xử lý hàng loạt hàng trăm đơn hàng TMĐT: In tem vận chuyển sàn, gom đơn đóng gói',
      'Quản lý trạng thái giao hàng: Đang giao, Đã giao thành công, Hoàn hàng trả về',
      'Đối soát tiền hàng COD và các loại phí sàn TMĐT tự động vào sổ quỹ',
    ],
    businessValue: 'Tránh tối đa rủi ro phạt vì hết hàng (cháy hàng ảo), giảm 90% nhân sự trực sàn nhập tay.',
    readinessPercentage: 45,
    highlightPoints: [
      { label: 'Sàn hỗ trợ', value: 'Shopee, TikTok, Lazada' },
      { label: 'Đồng bộ tồn kho', value: 'Real-time Webhook' },
      { label: 'In phiếu gửi', value: 'Batch 50 đơn/lần' },
    ],
    tags: ['E-commerce', 'Shopee API', 'TikTok Shop', 'Đối soát COD'],
    status: 'upcoming_wave_1',
  },
  {
    id: 'manufacturing-bom',
    title: 'Quản lý Sản xuất & Định mức NVL (BOM & MRP)',
    subtitle: 'Thiết lập công thức BOM nhiều tầng, lệnh sản xuất và tính giá thành sản phẩm',
    phase: 'Đợt 3 - Q1/2027',
    targetTimeline: 'Tháng 03/2027',
    badge: 'Đợt 3 (Kế hoạch)',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-700',
    icon: 'precision_manufacturing',
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    features: [
      'Khai báo định mức nguyên vật liệu (BOM) đa cấp cho từng sản phẩm thành phẩm',
      'Lập Lệnh sản xuất (Work Order) và dự trù số lượng vật tư cần nhập thêm (MRP)',
      'Tự động xuất kho NVL theo công thức kèm tỷ lệ hao hụt cho phép',
      'Tự động tập hợp chi phí nguyên vật liệu, chi phí nhân công và chi phí chung',
      'Tự động tính toán giá thành đơn vị khi nhập kho thành phẩm hoàn thành',
    ],
    businessValue: 'Kiểm soát chặt chẽ thất thoát nguyên vật liệu trong xưởng, xác định giá thành chính xác đến từng đồng.',
    readinessPercentage: 35,
    highlightPoints: [
      { label: 'Định mức BOM', value: 'Đa tầng (Multi-level)' },
      { label: 'Phương pháp giá thành', value: 'Định mức & Thực tế' },
      { label: 'Kiểm soát hao hụt', value: 'Cảnh báo sai lệch' },
    ],
    tags: ['Sản xuất xưởng', 'Định mức BOM', 'Giá thành', 'MRP'],
    status: 'upcoming_wave_1',
  },
  {
    id: 'general-ledger-accounting',
    title: 'Kế toán Kép Chuyên sâu chuẩn TT 200/133',
    subtitle: 'Tự động hạch toán Nợ/Có, sổ cái, bảng cân đối phát sinh và báo cáo tài chính',
    phase: 'Đợt 4 - Q2/2027',
    targetTimeline: 'Tháng 05/2027',
    badge: 'Đợt 4 (Nghiên cứu)',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
    icon: 'calculate',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    features: [
      'Hạch toán tự động song song khi lập hóa đơn, phiếu nhập/xuất/thu/chi',
      'Sổ Nhật ký chung, Sổ cái tài khoản, Sổ chi tiết công nợ 131 / 331',
      'Bảng Cân đối số phát sinh tài khoản định kỳ tháng/quý/năm',
      'Báo cáo kết quả hoạt động kinh doanh (P&L) và Bảng Cân đối Kế toán (Balance Sheet)',
      'Kết xuất dữ liệu tờ khai thuế GTGT và Báo cáo tài chính sang phần mềm HTKK của Tổng cục Thuế',
    ],
    businessValue: 'Chấm dứt việc phải nhập lại dữ liệu 2 lần giữa phần mềm bán hàng và phần mềm kế toán riêng biệt.',
    readinessPercentage: 20,
    highlightPoints: [
      { label: 'Chuẩn kế toán', value: 'TT 200/2014 & TT 133/2016' },
      { label: 'Tương thích', value: 'HTKK XML Export' },
      { label: 'Bút toán sinh', value: '100% Tự động' },
    ],
    tags: ['Kế toán kép', 'Báo cáo tài chính', 'TT 200', 'HTKK'],
    status: 'upcoming_wave_2',
  },
  {
    id: 'crm-zns-loyalty',
    title: 'CRM Nâng cao & Zalo ZNS / SMS Tự động',
    subtitle: 'Chăm sóc khách hàng tự động, tích điểm thẻ thành viên và gửi thông báo nợ qua Zalo',
    phase: 'Đợt 4 - Q2/2027',
    targetTimeline: 'Tháng 06/2027',
    badge: 'Đợt 4 (Nghiên cứu)',
    badgeBg: 'bg-teal-100',
    badgeText: 'text-teal-700',
    icon: 'mark_chat_read',
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    features: [
      'Tích hợp Zalo ZNS Template chính thức gửi tin nhắn thương hiệu tới số điện thoại khách',
      'Tự động gửi thông báo xác nhận đơn hàng, link tra cứu hóa đơn và mã QR thanh toán',
      'Cấu hình lịch tự động nhắc nợ lịch sự trước hạn 3 ngày và khi quá hạn',
      'Phân hạng thẻ thành viên tự động (Đồng, Bạc, Vàng, Kim Cương) theo tổng chi tiêu',
      'Cơ chế tích điểm đổi quà hoặc trừ tiền trực tiếp trên hóa đơn tiếp theo',
    ],
    businessValue: 'Tăng 35% tỷ lệ khách hàng quay lại mua tiếp, rút ngắn chu kỳ thu hồi công nợ từ 45 ngày xuống 22 ngày.',
    readinessPercentage: 25,
    highlightPoints: [
      { label: 'Kênh tin nhắn', value: 'Zalo ZNS Official & SMS' },
      { label: 'Phân hạng Loyalty', value: '4 Cấp bậc thành viên' },
      { label: 'Tỷ lệ đọc tin', value: '> 92%' },
    ],
    tags: ['CRM', 'Zalo ZNS', 'Loyalty Points', 'Nhắc nợ tự động'],
    status: 'upcoming_wave_2',
  },
  {
    id: 'mobile-app-dms',
    title: 'Ứng dụng Mobile App cho Nhân viên Thị trường (iOS/Android)',
    subtitle: 'Bán hàng lưu động, quét mã vạch camera, GPS check-in điểm bán và duyệt đơn từ xa',
    phase: 'Đợt 5 - Q3/2027',
    targetTimeline: 'Tháng 08/2027',
    badge: 'Đợt 5 (Dài hạn)',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-700',
    icon: 'phone_iphone',
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    features: [
      'Ứng dụng di động Native cài đặt trên App Store và Google Play',
      'Lên đơn bán buôn trực tiếp tại cửa hàng của khách hàng dù không có kết nối internet (Offline mode)',
      'Quét mã vạch sản phẩm cực nhanh bằng camera điện thoại thay máy quét chuyên dụng',
      'Check-in định vị GPS vị trí đại lý/cửa hàng xác nhận lịch trình viếng thăm của nhân viên thị trường',
      'Chủ doanh nghiệp xem báo cáo doanh thu và duyệt phiếu giảm giá/xuất kho nhanh ngay trên điện thoại',
    ],
    businessValue: 'Tăng năng suất đội ngũ bán hàng thị trường lên gấp đôi, cập nhật đơn hàng về trung tâm ngay tức khắc.',
    readinessPercentage: 15,
    highlightPoints: [
      { label: 'Hệ điều hành', value: 'iOS & Android (React Native)' },
      { label: 'Hỗ trợ ngoại tuyến', value: 'Offline-First Database' },
      { label: 'Quét Barcode', value: 'Camera AI Fast Scan' },
    ],
    tags: ['Mobile App', 'DMS', 'GPS Check-in', 'Offline Mode'],
    status: 'upcoming_wave_2',
  },
  {
    id: 'ai-demand-forecasting',
    title: 'AI Engine: Dự báo Tồn kho & Cảnh báo Dòng tiền',
    subtitle: 'Machine learning phân tích xu hướng bán hàng, đề xuất số lượng đặt hàng tối ưu (EOQ)',
    phase: 'Đợt 5 - Q3/2027',
    targetTimeline: 'Tháng 09/2027',
    badge: 'Đợt 5 (Dài hạn)',
    badgeBg: 'bg-cyan-100',
    badgeText: 'text-cyan-700',
    icon: 'auto_awesome',
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    features: [
      'Mô hình học máy phân tích chuỗi thời gian tiêu thụ sản phẩm theo mùa vụ và ngày lễ',
      'Cảnh báo sớm nguy cơ đứt gãy tồn kho trước 14 ngày dựa trên tốc độ bán thực tế',
      'Tự động tính toán lượng đặt hàng kinh tế (EOQ) để tối ưu chi phí lưu kho và vận chuyển',
      'Mô phỏng dự phóng dòng tiền thu chi trong 30-60-90 ngày tới',
      'Phát hiện các bất thường trong giá nhập NCC hoặc gian lận chiết khấu bán hàng',
    ],
    businessValue: 'Giảm 25% lượng vốn lưu động đọng trong hàng tồn chậm luân chuyển, không bao giờ mất khách do thiếu hàng.',
    readinessPercentage: 10,
    highlightPoints: [
      { label: 'Mô hình AI', value: 'Time-Series ARIMA & Prophet' },
      { label: 'Tối ưu tồn', value: 'Economic Order Quantity' },
      { label: 'Dự phóng dòng tiền', value: 'Độ chính xác > 88%' },
    ],
    tags: ['Trí tuệ nhân tạo', 'Dự báo tồn kho', 'Dòng tiền AI', 'EOQ'],
    status: 'upcoming_wave_2',
  },
];
