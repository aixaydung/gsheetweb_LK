import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Icon } from '../ui/Icon';
import { useApp } from '../../context/AppContext';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: string;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({
  isOpen,
  onClose,
  defaultType = 'products',
}) => {
  const { createProduct, createCustomer, createSupplier } = useApp();
  const [dataType, setDataType] = useState<string>(defaultType);
  const [hasFile, setHasFile] = useState<boolean>(false);
  const [previewRows, setPreviewRows] = useState<any[]>([]);

  const handleSimulateFileUpload = () => {
    setHasFile(true);
    if (dataType === 'products') {
      setPreviewRows([
        { sku: 'CP901', name: 'Cà phê Culi Đắk Lắk 500g', unit: 'gói', cost_price: 65000, sale_price: 95000, stock: 40 },
        { sku: 'TD009', name: 'Trà sen cao cấp túi thiếc', unit: 'hộp', cost_price: 48000, sale_price: 72000, stock: 25 },
        { sku: 'BB025', name: 'Hộp carton nắp gài sóng E', unit: 'cái', cost_price: 4500, sale_price: 7000, stock: 500 },
      ]);
    } else if (dataType === 'customers') {
      setPreviewRows([
        { code: 'KH099', name: 'Cà Phê Sân Vườn Xanh', phone: '0908112233', group: 'Đại lý', debt: 0 },
        { code: 'KH100', name: 'Công Ty CP Xuất Nhập Khẩu Nam Á', phone: '0912445566', group: 'Doanh nghiệp', debt: 1500000 },
      ]);
    } else {
      setPreviewRows([
        { code: 'NCC088', name: 'Công Ty TNHH Bao Bì Đại Tín', phone: '0933778899', group: 'Bao bì' },
      ]);
    }
  };

  const handleCommit = () => {
    if (dataType === 'products') {
      previewRows.forEach(row => {
        createProduct({
          sku: row.sku,
          name: row.name,
          unit: row.unit,
          cost_price: row.cost_price,
          sale_price: row.sale_price,
          stock_quantity: row.stock,
        });
      });
      alert(`Đã nhập thành công ${previewRows.length} sản phẩm vào hệ thống!`);
    } else if (dataType === 'customers') {
      previewRows.forEach(row => {
        createCustomer({
          code: row.code,
          name: row.name,
          phone: row.phone,
        });
      });
      alert(`Đã nhập thành công ${previewRows.length} khách hàng!`);
    } else {
      previewRows.forEach(row => {
        createSupplier({
          code: row.code,
          name: row.name,
          phone: row.phone,
        });
      });
      alert(`Đã nhập thành công ${previewRows.length} nhà cung cấp!`);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nhập dữ liệu từ Excel / CSV"
      subtitle="Kéo thả hoặc chọn file .xlsx / .csv để đồng bộ danh mục"
      icon="upload_file"
      width="lg"
      footer={
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => alert('Đang tải file mẫu .xlsx...')}
            className="text-[13px] text-[#6317D6] hover:underline font-semibold flex items-center gap-1"
          >
            <Icon name="download" size={16} />
            <span>⤓ Tải file mẫu</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#4B5563] hover:text-[#111827] text-[13.5px] font-medium"
            >
              ✕ Đóng
            </button>
            {hasFile && (
              <button
                type="button"
                onClick={handleCommit}
                className="px-5 py-2 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[13.5px] font-semibold rounded-[12px] shadow-[0_8px_20px_-6px_rgba(109,62,235,0.55)] flex items-center gap-1.5 transition-all"
              >
                <Icon name="check" size={18} />
                <span>Nhập {previewRows.length} dòng hợp lệ</span>
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Data Type Selector */}
        <div>
          <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
            Loại dữ liệu cần nhập
          </label>
          <select
            value={dataType}
            onChange={e => {
              setDataType(e.target.value);
              setHasFile(false);
            }}
            className="w-full sm:w-72 h-10 px-3 bg-white border border-[#E5E7EB] rounded-[10px] text-[13.5px] focus:outline-none focus:border-[#6D3EEB]"
          >
            <option value="products">Sản phẩm & Tồn kho</option>
            <option value="customers">Khách hàng</option>
            <option value="suppliers">Nhà cung cấp</option>
            <option value="invoices">Hóa đơn bán hàng</option>
            <option value="stock">Phiếu nhập kho</option>
            <option value="debts">Công nợ đầu kỳ</option>
          </select>
        </div>

        {/* Drop zone */}
        {!hasFile ? (
          <div
            onClick={handleSimulateFileUpload}
            className="border-2 border-dashed border-[#6D3EEB]/40 hover:border-[#6D3EEB] bg-[#F9F5FF]/50 hover:bg-[#F9F5FF] p-8 rounded-[20px] text-center cursor-pointer transition-all"
          >
            <div className="w-14 h-14 rounded-full bg-white shadow-sm border border-[#E9D5FF] flex items-center justify-center text-[#6D3EEB] mx-auto mb-3">
              <Icon name="cloud_upload" size={28} />
            </div>
            <div className="text-[15px] font-semibold text-[#111827]">
              Kéo thả file vào đây
            </div>
            <div className="text-[13px] text-[#6B7280] mt-1">
              hoặc bấm để chọn tệp — nhận .xlsx, .xls, .csv
            </div>
            <div className="text-[11.5px] text-[#6D3EEB] font-medium mt-3">
              Sau khi chọn, hệ thống tự động nhận diện cột và mở bảng xem trước để bạn đối soát trước khi nhập.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-[12px] text-emerald-800 text-[13px]">
              <span className="font-semibold flex items-center gap-1.5">
                <Icon name="check_circle" size={18} className="text-emerald-600" />
                Đã đọc file thành công: {previewRows.length} dòng hợp lệ
              </span>
              <button
                type="button"
                onClick={() => setHasFile(false)}
                className="text-emerald-700 hover:underline text-[12px]"
              >
                Chọn file khác
              </button>
            </div>

            {/* Preview Table */}
            <div className="border border-[#F1F2F5] rounded-[14px] overflow-hidden max-h-60 overflow-y-auto">
              <table className="w-full text-left text-[12.5px]">
                <thead className="bg-[#F9FAFB] text-[#6B7280] font-semibold uppercase text-[11px] border-b border-[#F1F2F5]">
                  <tr>
                    {Object.keys(previewRows[0] || {}).map(col => (
                      <th key={col} className="p-2.5">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F2F5]">
                  {previewRows.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      {Object.values(r).map((val: any, vi) => (
                        <td key={vi} className="p-2.5">
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="p-3 bg-[#F9FAFB] rounded-[12px] text-[12px] text-[#6B7280]">
          ⓘ Dữ liệu tồn đầu kỳ sẽ tự động được ghi thành phiếu &ldquo;Tồn đầu kỳ&rdquo; trong Lịch sử kho để đảm bảo tính toàn vẹn sổ cái.
        </div>
      </div>
    </Modal>
  );
};
