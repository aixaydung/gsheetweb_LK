import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { StocktakeItem } from '../../types';
import { formatCurrency, formatQuantity } from '../../lib/format';
import { Icon } from '../ui/Icon';

interface StocktakeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StocktakeFormModal: React.FC<StocktakeFormModalProps> = ({ isOpen, onClose }) => {
  const { products, warehouses, createStocktake } = useApp();

  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || 'wh-01');
  const [countedBy, setCountedBy] = useState('Nguyễn Văn Quản');
  const [note, setNote] = useState('Kiểm kê định kỳ tháng 9');

  // Initialize stocktake items from existing physical products
  const [items, setItems] = useState<StocktakeItem[]>(() => {
    return products
      .filter(p => !p.is_service)
      .slice(0, 8)
      .map(p => ({
        id: `stk-it-${p.id}`,
        product_id: p.id,
        sku: p.sku,
        product_name: p.name,
        unit: p.unit,
        system_qty: p.stock_quantity,
        actual_qty: p.stock_quantity,
        diff_qty: 0,
        unit_cost: p.cost_price,
        diff_value: 0,
        reason: '',
      }));
  });

  const handleActualQtyChange = (productId: string, actual: number) => {
    setItems(prev =>
      prev.map(it => {
        if (it.product_id !== productId) return it;
        const diffQty = actual - it.system_qty;
        const diffValue = diffQty * it.unit_cost;
        return {
          ...it,
          actual_qty: actual,
          diff_qty: diffQty,
          diff_value: diffValue,
        };
      })
    );
  };

  const handleReasonChange = (productId: string, reason: string) => {
    setItems(prev =>
      prev.map(it => (it.product_id === productId ? { ...it, reason } : it))
    );
  };

  const totalDiffValue = items.reduce((sum, it) => sum + it.diff_value, 0);
  const increaseCount = items.filter(it => it.diff_qty > 0).length;
  const decreaseCount = items.filter(it => it.diff_qty < 0).length;

  const handleSave = (status: 'draft' | 'completed') => {
    createStocktake({
      warehouse_id: warehouseId,
      counted_by: countedBy,
      note,
      status,
      items,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo phiếu kiểm kê kho"
      subtitle="Đối soát số lượng thực tế trong kho với hệ thống và cân bằng tồn kho"
      icon="fact_check"
      width="xl"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-[13px]">
            <div>
              <span className="text-[#6B7280]">Chênh lệch: </span>
              <span
                className={`font-bold tabular-nums ${
                  totalDiffValue > 0
                    ? 'text-emerald-600'
                    : totalDiffValue < 0
                    ? 'text-rose-600'
                    : 'text-gray-700'
                }`}
              >
                {totalDiffValue > 0 ? '+' : ''}
                {formatCurrency(totalDiffValue)}
              </span>
            </div>
            <div className="text-[#6B7280]">
              Tăng: <span className="font-semibold text-emerald-600">{increaseCount}</span> · Giảm:{' '}
              <span className="font-semibold text-rose-600">{decreaseCount}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#4B5563] hover:text-[#111827] text-[13.5px] font-medium"
            >
              ✕ Hủy
            </button>
            <button
              type="button"
              onClick={() => handleSave('draft')}
              className="px-4 py-2 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-[#1F2937] text-[13.5px] font-semibold rounded-[12px] shadow-xs"
            >
              Lưu nháp
            </button>
            <button
              type="button"
              onClick={() => handleSave('completed')}
              className="px-5 py-2 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[13.5px] font-semibold rounded-[12px] shadow-[0_8px_20px_-6px_rgba(109,62,235,0.55)] flex items-center gap-1.5 transition-all"
            >
              <Icon name="check_circle" size={18} />
              <span>Hoàn tất kiểm kê</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Header fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Kho kiểm kê
            </label>
            <select
              value={warehouseId}
              onChange={e => setWarehouseId(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-[#E5E7EB] rounded-[10px] text-[13.5px] focus:outline-none focus:border-[#6D3EEB]"
            >
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Người kiểm kê
            </label>
            <input
              type="text"
              value={countedBy}
              onChange={e => setCountedBy(e.target.value)}
              className="w-full h-10 px-3 border border-[#E5E7EB] rounded-[10px] text-[13.5px] focus:outline-none focus:border-[#6D3EEB]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Ghi chú kiểm kê
            </label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full h-10 px-3 border border-[#E5E7EB] rounded-[10px] text-[13.5px] focus:outline-none focus:border-[#6D3EEB]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="border border-[#F1F2F5] rounded-[14px] overflow-hidden">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#F1F2F5] text-[#6B7280] font-semibold text-[11.5px] uppercase tracking-wider">
                <th className="p-3">SẢN PHẨM</th>
                <th className="p-3 text-center">ĐVT</th>
                <th className="p-3 text-center">TỒN HỆ THỐNG</th>
                <th className="p-3 text-center w-28">THỰC TẾ</th>
                <th className="p-3 text-center">CHÊNH LỆCH</th>
                <th className="p-3 text-right">GIÁ TRỊ CL</th>
                <th className="p-3">LÝ DO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F2F5]">
              {items.map(it => (
                <tr key={it.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-semibold text-[#111827]">{it.product_name}</div>
                    <div className="text-[11.5px] text-[#6B7280] font-mono">{it.sku}</div>
                  </td>
                  <td className="p-3 text-center text-[#4B5563]">{it.unit}</td>
                  <td className="p-3 text-center font-semibold text-[#111827] tabular-nums">
                    {formatQuantity(it.system_qty)}
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      value={it.actual_qty}
                      onChange={e => handleActualQtyChange(it.product_id, Number(e.target.value))}
                      className="w-24 h-8 px-2 text-center font-bold text-[#111827] border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#6D3EEB] tabular-nums"
                    />
                  </td>
                  <td className="p-3 text-center tabular-nums font-bold">
                    <span
                      className={
                        it.diff_qty > 0
                          ? 'text-emerald-600'
                          : it.diff_qty < 0
                          ? 'text-rose-600'
                          : 'text-gray-400'
                      }
                    >
                      {it.diff_qty > 0 ? `+${it.diff_qty}` : it.diff_qty}
                    </span>
                  </td>
                  <td className="p-3 text-right tabular-nums font-bold">
                    <span
                      className={
                        it.diff_value > 0
                          ? 'text-emerald-600'
                          : it.diff_value < 0
                          ? 'text-rose-600'
                          : 'text-gray-400'
                      }
                    >
                      {it.diff_value > 0 ? '+' : ''}
                      {formatCurrency(it.diff_value)}
                    </span>
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      placeholder="Lý do chênh lệch..."
                      value={it.reason}
                      onChange={e => handleReasonChange(it.product_id, e.target.value)}
                      className="w-full h-8 px-2 text-[12px] border border-[#E5E7EB] rounded-[6px] focus:outline-none focus:border-[#6D3EEB]"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
};
