import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Icon } from '../../../components/ui/Icon';

export const BranchesWarehousesTab: React.FC = () => {
  const { warehouses, createWarehouse, updateWarehouse } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    createWarehouse({
      code: newCode.trim() || `KHO-${Date.now().toString().slice(-3)}`,
      name: newName.trim(),
      address: newAddress.trim() || 'Hà Nội',
      is_default: warehouses.length === 0,
      is_active: true,
    });

    setNewCode('');
    setNewName('');
    setNewAddress('');
    setIsAdding(false);
  };

  const handleSetDefault = (id: string) => {
    warehouses.forEach(w => {
      updateWarehouse(w.id, { is_default: w.id === id });
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1F2F5]">
        <div>
          <h3 className="text-[20px] font-bold text-[#111827]">Chi nhánh & Kho hàng</h3>
          <p className="text-[14.5px] text-[#4B5563] mt-0.5">
            Quản lý các địa điểm lưu kho thực tế và thiết lập kho xuất bán mặc định
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="w-full sm:w-auto h-10 px-5 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[14px] sm:text-[14.5px] font-semibold rounded-[12px] shadow-sm flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
        >
          <Icon name="add" size={18} />
          <span>Thêm kho mới</span>
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="bg-transparent border border-purple-300 dark:border-purple-800/60 rounded-[16px] p-5 space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-bold text-[#6D3EEB] flex items-center gap-2">
              <Icon name="add_circle" size={20} /> Khai báo kho hàng mới
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Icon name="close" size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[14px] font-medium text-[#374151] mb-1">Mã kho</label>
              <input
                type="text"
                placeholder="VD: KHO-HN"
                value={newCode}
                onChange={e => setNewCode(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-[10px] text-[14px] uppercase bg-white focus:outline-none focus:border-[#6D3EEB]"
              />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-[#374151] mb-1">Tên kho *</label>
              <input
                type="text"
                placeholder="Kho Cầu Giấy, Kho Tân Bình..."
                required
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-[10px] text-[14px] bg-white focus:outline-none focus:border-[#6D3EEB]"
              />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-[#374151] mb-1">Địa chỉ kho</label>
              <input
                type="text"
                placeholder="Số nhà, Đường, Quận/Huyện"
                value={newAddress}
                onChange={e => setNewAddress(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-[10px] text-[14px] bg-white focus:outline-none focus:border-[#6D3EEB]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 border border-gray-300 rounded-[10px] text-[14px] font-medium text-gray-700 bg-white"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#6D3EEB] text-white rounded-[10px] text-[14px] font-semibold"
            >
              Lưu kho
            </button>
          </div>
        </form>
      )}

      {/* Warehouses list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {warehouses.map(w => (
          <div
            key={w.id}
            className={`p-5 rounded-[16px] border transition-all ${
              w.is_default
                ? 'bg-transparent border-[#6D3EEB]/50 shadow-xs'
                : 'bg-transparent border-[#E5E7EB] dark:border-[#334155] hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0 ${
                    w.is_default ? 'bg-[#6D3EEB] text-white' : 'bg-transparent border border-gray-200 dark:border-[#334155] text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <Icon name="warehouse" size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[12px] font-bold px-2 py-0.5 rounded bg-transparent border border-gray-200 dark:border-[#334155] text-gray-700 dark:text-gray-300">
                      {w.code}
                    </span>
                    {w.is_default && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#6D3EEB] text-white">
                        Kho mặc định
                      </span>
                    )}
                  </div>
                  <h4 className="text-[16px] font-bold text-[#111827] dark:text-[#F8FAFC] mt-1">{w.name}</h4>
                </div>
              </div>

              {!w.is_default && (
                <button
                  type="button"
                  onClick={() => handleSetDefault(w.id)}
                  className="text-[13.5px] font-semibold text-[#6D3EEB] hover:underline"
                >
                  Đặt làm mặc định
                </button>
              )}
            </div>

            <p className="text-[14px] text-[#4B5563] mt-3 flex items-start gap-2">
              <Icon name="location_on" size={17} className="text-[#9CA3AF] shrink-0 mt-0.5" />
              <span>{w.address || 'Chưa cập nhật địa chỉ chi tiết'}</span>
            </p>

            <div className="pt-3 mt-3 border-t border-black/5 flex items-center justify-between text-[13.5px] text-[#4B5563]">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Đang hoạt động
              </span>
              <span>Trạng thái: Khả dụng</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
