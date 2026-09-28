import React, { useState } from 'react';
import { Icon } from '../../../components/ui/Icon';

export const ReferenceWorkflowTab: React.FC = () => {
  const [activeWorkflow, setActiveWorkflow] = useState<'o2c' | 'p2p' | 'inventory'>('o2c');

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#F1F2F5] dark:border-[#334155]">
        <h3 className="text-[20px] font-bold text-[#111827] dark:text-[#F8FAFC]">
          Sơ đồ Quy trình Luân chuyển Chứng từ Chuẩn ERP
        </h3>
        <p className="text-[14.5px] text-[#4B5563] dark:text-[#94A3B8] mt-0.5">
          Quy chuẩn các bước phối hợp giữa bộ phận Kinh doanh, Mua hàng, Thủ kho và Kế toán tài chính
        </p>
      </div>

      {/* Workflow Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-[#334155]">
        {[
          { id: 'o2c', name: 'Chu trình Bán hàng (Order-to-Cash)', icon: 'sell' },
          { id: 'p2p', name: 'Chu trình Mua hàng (Procure-to-Pay)', icon: 'shopping_cart' },
          { id: 'inventory', name: 'Chu trình Quản lý Kho & Kiểm kê', icon: 'inventory' },
        ].map(wf => (
          <button
            key={wf.id}
            type="button"
            onClick={() => setActiveWorkflow(wf.id as any)}
            className={`pb-3 px-3.5 text-[14.5px] font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeWorkflow === wf.id
                ? 'border-[#6D3EEB] text-[#6317D6] dark:text-[#C084FC]'
                : 'border-transparent text-[#4B5563] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-[#F8FAFC]'
            }`}
          >
            <Icon name={wf.icon} size={20} />
            <span>{wf.name}</span>
          </button>
        ))}
      </div>

      {/* Workflow Content: O2C */}
      {activeWorkflow === 'o2c' && (
        <div className="bg-transparent rounded-[18px] p-6 border border-[#E5E7EB] dark:border-[#334155] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-[16px] font-bold text-[#111827] dark:text-[#F8FAFC]">
              Quy trình Bán hàng 5 bước: Từ Chào giá đến Thu hồi Công nợ
            </h4>
            <span className="text-[12px] font-bold text-[#6317D6] dark:text-[#C084FC] bg-transparent px-3 py-1 rounded-md border border-purple-300 dark:border-purple-800/60">
              O2C Workflow Standard
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 relative">
            {[
              {
                step: 'Bước 1',
                title: 'Báo giá (BG)',
                role: 'Nhân viên Sale',
                desc: 'Tạo bảng chào giá, áp dụng chính sách chiết khấu và gửi file PDF cho khách hàng.',
                icon: 'request_quote',
                color: 'border-blue-300 dark:border-blue-800/60 text-blue-700 dark:text-blue-300',
              },
              {
                step: 'Bước 2',
                title: 'Chốt đơn (SO/HD)',
                role: 'Kế toán bán hàng',
                desc: 'Khách xác nhận đơn, hệ thống kiểm tra hạn mức nợ và tự động chuyển thành Hóa đơn.',
                icon: 'shopping_bag',
                color: 'border-purple-300 dark:border-purple-800/60 text-[#6317D6] dark:text-[#C084FC]',
              },
              {
                step: 'Bước 3',
                title: 'Xuất kho (XK)',
                role: 'Thủ kho xuất',
                desc: 'In lệnh xuất kho, đóng gói, bàn giao hàng cho shipper và trừ số lượng tồn kho.',
                icon: 'outbox',
                color: 'border-amber-300 dark:border-amber-800/60 text-amber-700 dark:text-amber-400',
              },
              {
                step: 'Bước 4',
                title: 'Giao hàng & Ký',
                role: 'Vận chuyển',
                desc: 'Khách hàng nhận hàng, kiểm tra số lượng và ký xác nhận vào biên bản giao nhận.',
                icon: 'local_shipping',
                color: 'border-cyan-300 dark:border-cyan-800/60 text-cyan-700 dark:text-cyan-400',
              },
              {
                step: 'Bước 5',
                title: 'Thu tiền (PT)',
                role: 'Thủ quỹ / Kế toán',
                desc: 'Khách quét mã VietQR hoặc chuyển khoản, hệ thống tự động gạch nợ hóa đơn tương ứng.',
                icon: 'payments',
                color: 'border-emerald-300 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400',
              },
            ].map((st, i) => (
              <div key={i} className={`p-4.5 rounded-[14px] bg-transparent border ${st.color} space-y-2 flex flex-col justify-between`}>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider opacity-75">{st.step}</span>
                    <Icon name={st.icon} size={20} />
                  </div>
                  <h5 className="font-bold text-[15px] text-[#111827] dark:text-[#F8FAFC]">{st.title}</h5>
                  <span className="text-[12.5px] font-semibold block text-[#4B5563] dark:text-[#CBD5E1]">Phụ trách: {st.role}</span>
                  <p className="text-[13px] text-[#6B7280] dark:text-[#94A3B8] leading-relaxed pt-1">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-transparent rounded-[12px] border border-gray-200 dark:border-[#334155] text-[13.5px] text-[#374151] dark:text-[#CBD5E1] space-y-1.5">
            <strong className="block text-[#111827] dark:text-[#F8FAFC]">Quy tắc cấn trừ nợ khi khách trả lại hàng (TH):</strong>
            <p className="leading-relaxed">
              Nếu khách hàng trả lại một phần hoặc toàn bộ hàng, lập phiếu Trả hàng bán (TH). Hệ thống sẽ tự động nhập lại kho số hàng lỗi và giảm trừ trực tiếp số tiền phải thu trên Hóa đơn gốc mà không cần hoàn tiền mặt.
            </p>
          </div>
        </div>
      )}

      {/* Workflow Content: P2P */}
      {activeWorkflow === 'p2p' && (
        <div className="bg-transparent rounded-[18px] p-6 border border-[#E5E7EB] dark:border-[#334155] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-[16px] font-bold text-[#111827] dark:text-[#F8FAFC]">
              Quy trình Mua hàng 4 bước: Đặt hàng đến Thanh toán NCC
            </h4>
            <span className="text-[12px] font-bold text-emerald-700 dark:text-emerald-400 bg-transparent px-3 py-1 rounded-md border border-emerald-300 dark:border-emerald-800/60">
              P2P Procure-to-Pay
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                step: 'Bước 1',
                title: 'Đơn mua hàng (PM)',
                role: 'Bộ phận Mua sắm',
                desc: 'Lập PO gửi nhà cung cấp, thống nhất số lượng, đơn giá và thời hạn giao hàng dự kiến.',
                icon: 'add_shopping_cart',
              },
              {
                step: 'Bước 2',
                title: 'Nhập kho (NK)',
                role: 'Thủ kho nhận',
                desc: 'Kiểm đếm quy cách thực tế, nhập kho và tự động ghi tăng tồn kho theo mã SKU.',
                icon: 'move_to_inbox',
              },
              {
                step: 'Bước 3',
                title: 'Ghi nhận Nợ NCC',
                role: 'Kế toán mua hàng',
                desc: 'Đối chiếu hóa đơn GTGT của NCC với số thực nhập, ghi nhận số dư nợ phải trả 331.',
                icon: 'assignment_turned_in',
              },
              {
                step: 'Bước 4',
                title: 'Thanh toán (PC)',
                role: 'Thủ quỹ / Kế toán',
                desc: 'Lập lệnh chuyển khoản ngân hàng hoặc chi tiền mặt để tất toán công nợ theo đúng hạn.',
                icon: 'account_balance_wallet',
              },
            ].map((st, i) => (
              <div key={i} className="p-4 bg-transparent rounded-[14px] border border-gray-200 dark:border-[#334155] space-y-2">
                <span className="text-[11px] font-bold text-[#6B7280] dark:text-[#94A3B8] uppercase">{st.step}</span>
                <div className="flex items-center gap-2">
                  <Icon name={st.icon} size={22} className="text-[#6D3EEB] dark:text-[#C084FC]" />
                  <h5 className="font-bold text-[15px] text-[#111827] dark:text-[#F8FAFC]">{st.title}</h5>
                </div>
                <span className="text-[13px] font-semibold text-[#6317D6] dark:text-[#C084FC] block">{st.role}</span>
                <p className="text-[13px] text-[#4B5563] dark:text-[#94A3B8] leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workflow Content: Inventory */}
      {activeWorkflow === 'inventory' && (
        <div className="bg-transparent rounded-[18px] p-6 border border-[#E5E7EB] dark:border-[#334155] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-[16px] font-bold text-[#111827] dark:text-[#F8FAFC]">
              Quy trình Kiểm kê định kỳ & Cân đối kho
            </h4>
            <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400 bg-transparent px-3 py-1 rounded-md border border-amber-300 dark:border-amber-800/60">
              Stock Audit Cycle
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4.5 bg-transparent rounded-[14px] border border-gray-200 dark:border-[#334155] space-y-2">
              <span className="text-[11.5px] font-bold text-[#6B7280] dark:text-[#94A3B8] uppercase">1. Lập phiếu kiểm kê (KK)</span>
              <h5 className="font-bold text-[15px] text-[#111827] dark:text-[#F8FAFC]">Khóa số liệu sổ sách</h5>
              <p className="text-[13.5px] text-[#4B5563] dark:text-[#94A3B8] leading-relaxed">
                Hệ thống chốt số tồn lý thuyết tại thời điểm bắt đầu kiểm đếm, in bảng kê kiểm kho cho thủ kho.
              </p>
            </div>

            <div className="p-4.5 bg-transparent rounded-[14px] border border-gray-200 dark:border-[#334155] space-y-2">
              <span className="text-[11.5px] font-bold text-[#6B7280] dark:text-[#94A3B8] uppercase">2. Đếm thực tế & Nhập số</span>
              <h5 className="font-bold text-[15px] text-[#111827] dark:text-[#F8FAFC]">Ghi nhận số lượng thực</h5>
              <p className="text-[13.5px] text-[#4B5563] dark:text-[#94A3B8] leading-relaxed">
                Nhập số lượng đếm được thực tế tại kho, hệ thống tự động tính chênh lệch thừa/thiếu và thành tiền sai lệch.
              </p>
            </div>

            <div className="p-4.5 bg-transparent rounded-[14px] border border-gray-200 dark:border-[#334155] space-y-2">
              <span className="text-[11.5px] font-bold text-[#6B7280] dark:text-[#94A3B8] uppercase">3. Cân đối & Hoàn tất</span>
              <h5 className="font-bold text-[15px] text-[#111827] dark:text-[#F8FAFC]">Tự động cân bằng kho</h5>
              <p className="text-[13.5px] text-[#4B5563] dark:text-[#94A3B8] leading-relaxed">
                Khi ấn Hoàn tất, hệ thống tự động sinh phiếu điều chỉnh kho đưa số tồn sổ sách khớp 100% với số thực đếm.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
