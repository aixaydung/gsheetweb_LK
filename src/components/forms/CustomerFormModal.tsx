import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { Customer } from '../../types';
import { Icon } from '../ui/Icon';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerToEdit?: Customer | null;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  customerToEdit,
}) => {
  const { customerGroups, createCustomer, updateCustomer } = useApp();

  const [code, setCode] = useState(customerToEdit?.code || '');
  const [name, setName] = useState(customerToEdit?.name || '');
  const [phone, setPhone] = useState(customerToEdit?.phone || '');
  const [email, setEmail] = useState(customerToEdit?.email || '');
  const [address, setAddress] = useState(customerToEdit?.address || '');
  const [taxCode, setTaxCode] = useState(customerToEdit?.tax_code || '');
  const [groupId, setGroupId] = useState(customerToEdit?.group_id || customerGroups[0]?.id || '');
  const [paymentTermDays, setPaymentTermDays] = useState(customerToEdit?.payment_term_days || 15);
  const [note, setNote] = useState(customerToEdit?.note || '');

  React.useEffect(() => {
    if (isOpen) {
      setCode(customerToEdit?.code || '');
      setName(customerToEdit?.name || '');
      setPhone(customerToEdit?.phone || '');
      setEmail(customerToEdit?.email || '');
      setAddress(customerToEdit?.address || '');
      setTaxCode(customerToEdit?.tax_code || '');
      setGroupId(customerToEdit?.group_id || customerGroups[0]?.id || '');
      setPaymentTermDays(customerToEdit?.payment_term_days || 15);
      setNote(customerToEdit?.note || '');
    }
  }, [customerToEdit, isOpen, customerGroups]);

  const handleSave = () => {
    if (!name.trim()) {
      alert('Vui lòng nhập tên khách hàng');
      return;
    }

    if (customerToEdit) {
      updateCustomer(customerToEdit.id, {
        code: code || customerToEdit.code,
        name,
        phone,
        email,
        address,
        tax_code: taxCode,
        group_id: groupId,
        payment_term_days: paymentTermDays,
        note,
      });
    } else {
      createCustomer({
        code: code || undefined,
        name,
        phone,
        email,
        address,
        tax_code: taxCode,
        group_id: groupId,
        payment_term_days: paymentTermDays,
        note,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customerToEdit ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
      subtitle="Thiết lập thông tin khách hàng, số điện thoại và kỳ hạn nợ"
      icon="person"
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
            <span>{customerToEdit ? 'Lưu thay đổi' : 'Thêm khách hàng'}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Name & Code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Tên khách hàng *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ví dụ: Đại lý Hoàng Gia, Cty Minh An..."
              className="w-full h-10 px-3 border border-[#E5E7EB] rounded-[10px] text-[13.5px] focus:outline-none focus:border-[#6D3EEB]"
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Mã KH (tự sinh nếu trống)
            </label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="VD: KH001"
              className="w-full h-10 px-3 border border-[#E5E7EB] rounded-[10px] text-[13.5px] focus:outline-none focus:border-[#6D3EEB] font-mono"
            />
          </div>
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Số điện thoại
            </label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="09xx xxx xxx"
              className="w-full h-10 px-3 border border-[#E5E7EB] rounded-[10px] text-[13.5px] focus:outline-none focus:border-[#6D3EEB]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="khachhang@gmail.com"
              className="w-full h-10 px-3 border border-[#E5E7EB] rounded-[10px] text-[13.5px] focus:outline-none focus:border-[#6D3EEB]"
            />
          </div>
        </div>

        {/* Group & Term Days */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Nhóm khách hàng
            </label>
            <select
              value={groupId}
              onChange={e => setGroupId(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-[#E5E7EB] rounded-[10px] text-[13.5px] focus:outline-none focus:border-[#6D3EEB]"
            >
              {customerGroups.map(g => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Hạn nợ mặc định (ngày)
            </label>
            <input
              type="number"
              min={0}
              value={paymentTermDays}
              onChange={e => setPaymentTermDays(Number(e.target.value))}
              placeholder="15"
              className="w-full h-10 px-3 border border-[#E5E7EB] rounded-[10px] text-[13.5px] focus:outline-none focus:border-[#6D3EEB] tabular-nums"
            />
          </div>
        </div>

        {/* Address & Tax Code */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Địa chỉ
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Số nhà, đường, phường, quận..."
              className="w-full h-10 px-3 border border-[#E5E7EB] rounded-[10px] text-[13.5px] focus:outline-none focus:border-[#6D3EEB]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Mã số thuế
            </label>
            <input
              type="text"
              value={taxCode}
              onChange={e => setTaxCode(e.target.value)}
              placeholder="0300xxxxxx"
              className="w-full h-10 px-3 border border-[#E5E7EB] rounded-[10px] text-[13.5px] focus:outline-none focus:border-[#6D3EEB]"
            />
          </div>
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
            placeholder="Ghi chú về thói quen thanh toán, người liên hệ..."
            className="w-full h-10 px-3 border border-[#E5E7EB] rounded-[10px] text-[13px] focus:outline-none focus:border-[#6D3EEB]"
          />
        </div>
      </div>
    </Modal>
  );
};
