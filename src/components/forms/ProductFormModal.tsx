import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { Product } from '../../types';
import { Icon } from '../ui/Icon';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { productGroups, createProduct, updateProduct } = useApp();

  const [sku, setSku] = useState(productToEdit?.sku || '');
  const [name, setName] = useState(productToEdit?.name || '');
  const [groupId, setGroupId] = useState(productToEdit?.group_id || productGroups[0]?.id || '');
  const [unit, setUnit] = useState(productToEdit?.unit || 'cái');
  const [costPrice, setCostPrice] = useState(productToEdit?.cost_price || 0);
  const [salePrice, setSalePrice] = useState(productToEdit?.sale_price || 0);
  const [minStock, setMinStock] = useState(productToEdit?.min_stock ?? 10);
  const [maxStock, setMaxStock] = useState(productToEdit?.max_stock || 500);
  const [isService, setIsService] = useState(productToEdit?.is_service || false);
  const [stockQuantity, setStockQuantity] = useState(productToEdit?.stock_quantity || 0);
  const [note, setNote] = useState(productToEdit?.note || '');

  const handleSave = () => {
    if (!name.trim()) {
      alert('Vui lòng nhập tên sản phẩm');
      return;
    }

    if (productToEdit) {
      updateProduct(productToEdit.id, {
        sku: sku || productToEdit.sku,
        name,
        group_id: groupId,
        unit,
        cost_price: costPrice,
        sale_price: salePrice,
        min_stock: minStock,
        max_stock: maxStock,
        is_service: isService,
        stock_quantity: isService ? 0 : stockQuantity,
        note,
      });
    } else {
      createProduct({
        sku: sku || undefined,
        name,
        group_id: groupId,
        unit,
        cost_price: costPrice,
        sale_price: salePrice,
        min_stock: minStock,
        max_stock: maxStock,
        is_service: isService,
        stock_quantity: isService ? 0 : stockQuantity,
        note,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={productToEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
      subtitle="Thiết lập mã hàng, giá vốn, giá bán và định mức tồn kho an toàn"
      icon="inventory_2"
      width="md"
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[#4B5563] hover:text-[#111827] text-[13.5px] font-medium"
          >
            ✕ Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[13.5px] font-semibold rounded-[12px] shadow-[0_8px_20px_-6px_rgba(109,62,235,0.55)] flex items-center gap-1.5 transition-all"
          >
            <Icon name="save" size={18} />
            <span>{productToEdit ? 'Lưu thay đổi' : 'Thêm sản phẩm'}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Name & SKU */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Tên sản phẩm *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ví dụ: Cà phê Robusta rang mộc..."
              className="w-full h-10 px-3 border border-[#E5E7EB] rounded-[10px] text-[13.5px] focus:outline-none focus:border-[#6D3EEB]"
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Mã SKU (tự sinh nếu trống)
            </label>
            <input
              type="text"
              value={sku}
              onChange={e => setSku(e.target.value)}
              placeholder="VD: CP001"
              className="w-full h-10 px-3 border border-[#E5E7EB] rounded-[10px] text-[13.5px] focus:outline-none focus:border-[#6D3EEB] font-mono"
            />
          </div>
        </div>

        {/* Group & Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Nhóm hàng
            </label>
            <select
              value={groupId}
              onChange={e => setGroupId(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-[#E5E7EB] rounded-[10px] text-[13.5px] focus:outline-none focus:border-[#6D3EEB]"
            >
              {productGroups.map(g => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Đơn vị tính (ĐVT)
            </label>
            <input
              type="text"
              value={unit}
              onChange={e => setUnit(e.target.value)}
              placeholder="kg, hộp, chai, lốc, xấp..."
              className="w-full h-10 px-3 border border-[#E5E7EB] rounded-[10px] text-[13.5px] focus:outline-none focus:border-[#6D3EEB]"
            />
          </div>
        </div>

        {/* Prices */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Giá vốn ban đầu (đ)
            </label>
            <input
              type="number"
              min={0}
              step={1000}
              value={costPrice}
              onChange={e => setCostPrice(Number(e.target.value))}
              className="w-full h-10 px-3 border border-[#E5E7EB] rounded-[10px] text-[13.5px] focus:outline-none focus:border-[#6D3EEB] tabular-nums"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Giá bán mặc định (đ)
            </label>
            <input
              type="number"
              min={0}
              step={1000}
              value={salePrice}
              onChange={e => setSalePrice(Number(e.target.value))}
              className="w-full h-10 px-3 border border-[#E5E7EB] rounded-[10px] text-[13.5px] font-semibold text-[#D97706] focus:outline-none focus:border-[#6D3EEB] tabular-nums"
            />
          </div>
        </div>

        {/* Stock controls */}
        <div className="p-3.5 bg-gray-50 rounded-[14px] border border-gray-200 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer text-[13px] font-semibold text-[#111827]">
            <input
              type="checkbox"
              checked={isService}
              onChange={e => setIsService(e.target.checked)}
              className="rounded text-[#6D3EEB] focus:ring-[#6D3EEB]"
            />
            <span>Là dịch vụ (không theo dõi số lượng tồn kho)</span>
          </label>

          {!isService && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[12px] font-medium text-[#6B7280] mb-1">
                  Tồn kho hiện tại / Đầu kỳ
                </label>
                <input
                  type="number"
                  value={stockQuantity}
                  onChange={e => setStockQuantity(Number(e.target.value))}
                  className="w-full h-9 px-2.5 bg-white border border-[#E5E7EB] rounded-[8px] text-[13px] tabular-nums"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#6B7280] mb-1">
                  Tồn tối thiểu (báo sắp hết)
                </label>
                <input
                  type="number"
                  value={minStock}
                  onChange={e => setMinStock(Number(e.target.value))}
                  className="w-full h-9 px-2.5 bg-white border border-[#E5E7EB] rounded-[8px] text-[13px] tabular-nums"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#6B7280] mb-1">
                  Tồn tối đa (báo vượt tồn)
                </label>
                <input
                  type="number"
                  value={maxStock}
                  onChange={e => setMaxStock(Number(e.target.value))}
                  className="w-full h-9 px-2.5 bg-white border border-[#E5E7EB] rounded-[8px] text-[13px] tabular-nums"
                />
              </div>
            </div>
          )}
        </div>

        {/* Note */}
        <div>
          <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
            Ghi chú
          </label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Ghi chú nội bộ cho sản phẩm..."
            className="w-full h-10 px-3 border border-[#E5E7EB] rounded-[10px] text-[13px] focus:outline-none focus:border-[#6D3EEB]"
          />
        </div>
      </div>
    </Modal>
  );
};
