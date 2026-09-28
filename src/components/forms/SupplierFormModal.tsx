import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { Supplier } from '../../types';
import { Icon } from '../ui/Icon';

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierToEdit?: Supplier | null;
}

export const SupplierFormModal: React.FC<SupplierFormModalProps> = ({
  isOpen,
  onClose,
  supplierToEdit,
}) => {
  const { supplierGroups, createSupplier, updateSupplier } = useApp();

  const [code, setCode] = useState(supplierToEdit?.code || '');
  const [name, setName] = useState(supplierToEdit?.name || '');
  const [contactName, setContactName] = useState(supplierToEdit?.contact_name || '');
  const [phone, setPhone] = useState(supplierToEdit?.phone || '');
  const [email, setEmail] = useState(supplierToEdit?.email || '');
  const [address, setAddress] = useState(supplierToEdit?.address || '');
  const [taxCode, setTaxCode] = useState(supplierToEdit?.tax_code || '');
  const [groupId, setGroupId] = useState(supplierToEdit?.group_id || supplierGroups[0]?.id || '');
  const [bankName, setBankName] = useState(supplierToEdit?.bank_name || '');
  const [bankAccountNo, setBankAccountNo] = useState(supplierToEdit?.bank_account_no || '');
  const [note, setNote] = useState(supplierToEdit?.note || '');

  const handleSave = () => {
    if (!name.trim()) {
      alert('Vui lòng nhập tên nhà cung cấp');
      return;
    }

    if (supplierToEdit) {
      updateSupplier(supplierToEdit.id, {
        code: code || supplierToEdit.code,
        name,
        contact_name: contactName,
        phone,
        email,
        address,
        tax_code: taxCode,
        group_id: groupId,
        bank_name: bankName,
        bank_account_no: bankAccountNo,
        note,
      });
    } else {
      createSupplier({
        code: code || undefined,
        name,
        contact_name: contactName,
        phone,
        email,
        address,
        tax_code: taxCode,
        group_id: groupId,
        bank_name: bankName,
        bank_account_no: bankAccountNo,
        note,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={supplierToEdit ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}
      subtitle="Quản lý nhà phân phối, thông tin ngân hàng và nhóm nguyên vật liệu"
      icon="storefront"
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
            <span>{supplierToEdit ? 'Lưu thay đổi' : 'Thêm NCC'}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Name & Code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Tên nhà cung cấp *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ví dụ: a ngữ - khang hưng, Bao Bì Sài Gòn..."
              className="w-full h-10 px-3 border border-[#E5E7EB] rounded-[10px] text-[13.5px] focus:outline-none focus:border-[#6D3EEB]"
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Mã NCC
            </label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="VD: NCC01"
              className="w-full h-10 px-3 border border-[#E5E7EB] rounded-[10px] text-[13.5px] focus:outline-none focus:border-[#6D3EEB] font-mono"
            />
          </div>
        </div>

        {/* Contact & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Người liên hệ
            </label>
            <input
              type="text"
              value={contactName}
              onChange={e => setContactName(e.target.value)}
              placeholder="Anh Ngữ, Chị Mai..."
              className="w-full h-10 px-3 border border-[#E5E7EB] rounded-[10px] text-[13.5px] focus:outline-none focus:border-[#6D3EEB]"
            />
          </div>

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
        </div>

        {/* Group & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Nhóm nhà cung cấp
            </label>
            <select
              value={groupId}
              onChange={e => setGroupId(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-[#E5E7EB] rounded-[10px] text-[13.5px] focus:outline-none focus:border-[#6D3EEB]"
            >
              {supplierGroups.map(g => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ncc@domain.com"
              className="w-full h-10 px-3 border border-[#E5E7EB] rounded-[10px] text-[13.5px] focus:outline-none focus:border-[#6D3EEB]"
            />
          </div>
        </div>

        {/* Bank details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-[12px] border border-gray-200">
          <div>
            <label className="block text-[12px] font-medium text-[#4B5563] mb-1">
              Ngân hàng thụ hưởng
            </label>
            <input
              type="text"
              value={bankName}
              onChange={e => setBankName(e.target.value)}
              placeholder="Vietcombank, Techcombank..."
              className="w-full h-9 px-2.5 bg-white border border-[#E5E7EB] rounded-[8px] text-[13px]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#4B5563] mb-1">
              Số tài khoản ngân hàng
            </label>
            <input
              type="text"
              value={bankAccountNo}
              onChange={e => setBankAccountNo(e.target.value)}
              placeholder="0123456789"
              className="w-full h-9 px-2.5 bg-white border border-[#E5E7EB] rounded-[8px] text-[13px] font-mono"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
            Địa chỉ
          </label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Địa chỉ văn phòng / kho NCC..."
            className="w-full h-10 px-3 border border-[#E5E7EB] rounded-[10px] text-[13.5px] focus:outline-none focus:border-[#6D3EEB]"
          />
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
            placeholder="Chiết khấu thương mại, chính sách công nợ..."
            className="w-full h-10 px-3 border border-[#E5E7EB] rounded-[10px] text-[13px] focus:outline-none focus:border-[#6D3EEB]"
          />
        </div>
      </div>
    </Modal>
  );
};
