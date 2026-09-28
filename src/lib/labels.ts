// Exact Vietnamese labels and status color badge mappings from Section 3.4.7

export interface StatusStyle {
  label: string;
  bg: string;
  text: string;
  border?: string;
  tone: 'success' | 'warning' | 'danger' | 'primary' | 'info' | 'neutral';
}

export const STATUS_STYLES: Record<string, StatusStyle> = {
  // Success
  paid: { label: 'Đã thanh toán', bg: '#ECFDF5', text: '#059669', tone: 'success' },
  completed: { label: 'Hoàn tất', bg: '#ECFDF5', text: '#059669', tone: 'success' },
  active: { label: 'Đang giao dịch', bg: '#ECFDF5', text: '#059669', tone: 'success' },
  new: { label: 'Mới', bg: '#ECFDF5', text: '#059669', tone: 'success' },
  ok: { label: 'Còn hàng', bg: '#ECFDF5', text: '#059669', tone: 'success' },
  in_term: { label: 'Trong hạn', bg: '#ECFDF5', text: '#059669', tone: 'success' },
  received: { label: 'Đã nhận', bg: '#ECFDF5', text: '#059669', tone: 'success' },
  delivered: { label: 'Đã giao', bg: '#ECFDF5', text: '#059669', tone: 'success' },
  refunded: { label: 'Đã hoàn tiền', bg: '#ECFDF5', text: '#059669', tone: 'success' },
  in: { label: 'Thu', bg: '#ECFDF5', text: '#059669', tone: 'success' },
  manual_in: { label: 'Nhập thủ công', bg: '#ECFDF5', text: '#059669', tone: 'success' },
  opening: { label: 'Tồn đầu kỳ', bg: '#ECFDF5', text: '#059669', tone: 'success' },
  purchase: { label: 'Nhập mua', bg: '#ECFDF5', text: '#059669', tone: 'success' },
  sales_return: { label: 'Trả hàng nhập', bg: '#ECFDF5', text: '#059669', tone: 'success' },

  // Warning
  unpaid: { label: 'Chưa thanh toán', bg: '#FFFBEB', text: '#B45309', tone: 'warning' },
  partial: { label: 'Thanh toán một phần', bg: '#FFFBEB', text: '#B45309', tone: 'warning' },
  processing: { label: 'Đang xử lý', bg: '#FFFBEB', text: '#B45309', tone: 'warning' },
  low: { label: 'Sắp hết', bg: '#FFFBEB', text: '#B45309', tone: 'warning' },
  packing: { label: 'Đóng gói', bg: '#FFFBEB', text: '#B45309', tone: 'warning' },
  ready: { label: 'Sẵn sàng giao hàng', bg: '#FFFBEB', text: '#B45309', tone: 'warning' },
  shipping: { label: 'Đang vận chuyển', bg: '#FFFBEB', text: '#B45309', tone: 'warning' },
  ordered: { label: 'Đã đặt hàng', bg: '#FFFBEB', text: '#B45309', tone: 'warning' },
  pending_refund: { label: 'Chờ hoàn tiền', bg: '#FFFBEB', text: '#B45309', tone: 'warning' },
  sent: { label: 'Đã gửi KH', bg: '#FFFBEB', text: '#B45309', tone: 'warning' },

  // Danger
  overdue: { label: 'Quá hạn', bg: '#FFF1F2', text: '#E11D48', tone: 'danger' },
  out: { label: 'Hết hàng', bg: '#FFF1F2', text: '#E11D48', tone: 'danger' },
  cancelled: { label: 'Đã hủy', bg: '#FFF1F2', text: '#E11D48', tone: 'danger' },
  sale: { label: 'Xuất bán', bg: '#FFF1F2', text: '#E11D48', tone: 'danger' },
  manual_out: { label: 'Xuất thủ công', bg: '#FFF1F2', text: '#E11D48', tone: 'danger' },
  purchase_return: { label: 'Trả hàng NCC', bg: '#FFF1F2', text: '#E11D48', tone: 'danger' },
  out_dir: { label: 'Chi', bg: '#FFF1F2', text: '#E11D48', tone: 'danger' },
  returned_to_supplier: { label: 'Trả lại NCC', bg: '#FFF1F2', text: '#E11D48', tone: 'danger' },

  // Primary
  converted: { label: 'Đã chuyển HĐ', bg: '#F5F0FF', text: '#6317D6', tone: 'primary' },
  partially_returned: { label: 'Trả một phần', bg: '#F5F0FF', text: '#6317D6', tone: 'primary' },
  overpaid: { label: 'Thanh toán thừa', bg: '#F5F0FF', text: '#6317D6', tone: 'primary' },
  over: { label: 'Vượt tồn', bg: '#F5F0FF', text: '#6317D6', tone: 'primary' },
  received_po: { label: 'Đã nhập kho', bg: '#F5F0FF', text: '#6317D6', tone: 'primary' },

  // Info
  service: { label: 'Dịch vụ', bg: '#ECFEFF', text: '#0E7490', tone: 'info' },
  returned: { label: 'Trả lại vào kho', bg: '#ECFEFF', text: '#0E7490', tone: 'info' },

  // Neutral
  inactive: { label: 'Ngừng giao dịch', bg: '#F3F4F6', text: '#4B5563', tone: 'neutral' },
  locked: { label: 'Đã khóa', bg: '#F3F4F6', text: '#4B5563', tone: 'neutral' },
  receivable: { label: 'Phải thu', bg: '#F3F4F6', text: '#4B5563', tone: 'neutral' },
  payable: { label: 'Phải trả', bg: '#F3F4F6', text: '#4B5563', tone: 'neutral' },
  cost_adjust: { label: 'Điều chỉnh giá vốn', bg: '#F3F4F6', text: '#4B5563', tone: 'neutral' },
  stocktake: { label: 'Kiểm kê', bg: '#F3F4F6', text: '#4B5563', tone: 'neutral' },
  draft: { label: 'Nháp', bg: '#F3F4F6', text: '#4B5563', tone: 'neutral' },
};

export function getStatusStyle(statusKey: string): StatusStyle {
  if (STATUS_STYLES[statusKey]) {
    return STATUS_STYLES[statusKey];
  }
  return {
    label: statusKey,
    bg: '#F3F4F6',
    text: '#4B5563',
    tone: 'neutral',
  };
}

export const PAYMENT_METHODS: Record<string, string> = {
  cash: 'Tiền mặt',
  transfer: 'Chuyển khoản',
  offset: 'Đối trừ công nợ',
};

export const RETURN_HANDLING: Record<string, string> = {
  debt_offset: 'Trừ công nợ',
  refund: 'Hoàn tiền',
};
