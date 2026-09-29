import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Icon } from './Icon';
import { Product, Customer, Supplier } from '../../types';

export type ImportType = 'products' | 'customers' | 'suppliers';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ImportType;
  onImportProducts?: (items: Partial<Product>[]) => Promise<{ successCount: number; errorCount: number }>;
  onImportCustomers?: (items: Partial<Customer>[]) => Promise<{ successCount: number; errorCount: number }>;
  onImportSuppliers?: (items: Partial<Supplier>[]) => Promise<{ successCount: number; errorCount: number }>;
}

interface ParsedRow {
  index: number;
  data: any;
  isValid: boolean;
  errors: string[];
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  type,
  onImportProducts,
  onImportCustomers,
  onImportSuppliers,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skipErrors, setSkipErrors] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const typeConfig = {
    products: {
      title: 'Nhập danh sách sản phẩm từ Excel',
      subtitle: 'Tải lên bảng tính (.xlsx, .xls, .csv) để nhập danh mục mặt hàng và tồn kho ban đầu',
      templateFilename: 'Mau_nhap_san_pham_LKERP.xlsx',
      columns: ['Mã SKU', 'Tên sản phẩm (*)', 'ĐVT', 'Nhóm hàng', 'Giá vốn', 'Giá bán', 'Tồn kho', 'Tồn tối thiểu'],
      downloadTemplate: () => {
        const headers = [
          'Mã SKU (để trống tự sinh)',
          'Tên sản phẩm (*)',
          'Đơn vị tính',
          'Nhóm hàng',
          'Giá vốn (VNĐ)',
          'Giá bán (VNĐ)',
          'Tồn kho ban đầu',
          'Tồn tối thiểu cảnh báo',
          'Ghi chú / Mô tả',
        ];
        const sampleData = [
          ['SP001', 'Cà phê Robusta Đắk Lắk', 'Kg', 'Nguyên liệu', 120000, 180000, 50, 10, 'Cà phê rang mộc chuẩn xuất khẩu'],
          ['SP002', 'Hạt điều rang muối vỏ lụa', 'Hộp', 'Bánh kẹo & Hạt', 150000, 220000, 30, 5, 'Hộp 500g loại 1'],
          ['', 'Ly giấy 500ml kèm nắp', 'Cái', 'Bao bì', 1500, 2500, 1000, 100, 'Ly giấy sinh học thân thiện môi trường'],
        ];
        const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
        // Set column widths
        ws['!cols'] = [
          { wch: 25 }, { wch: 32 }, { wch: 12 }, { wch: 18 },
          { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 22 }, { wch: 35 }
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'DANH_MUC_SAN_PHAM');
        XLSX.writeFile(wb, 'Mau_nhap_san_pham_LKERP.xlsx');
      },
    },
    customers: {
      title: 'Nhập danh sách khách hàng từ Excel',
      subtitle: 'Tải lên bảng tính (.xlsx, .xls, .csv) để nạp dữ liệu khách hàng vào hệ thống',
      templateFilename: 'Mau_nhap_khach_hang_LKERP.xlsx',
      columns: ['Mã KH', 'Tên khách hàng (*)', 'Số điện thoại', 'Email', 'Địa chỉ', 'Mã số thuế', 'Nhóm khách'],
      downloadTemplate: () => {
        const headers = [
          'Mã khách hàng (để trống tự sinh)',
          'Tên khách hàng (*)',
          'Số điện thoại',
          'Email',
          'Địa chỉ',
          'Mã số thuế',
          'Nhóm khách hàng',
          'Ghi chú',
        ];
        const sampleData = [
          ['KH001', 'Công ty TNHH Minh An', '0901234567', 'contact@minhan.vn', '123 Nguyễn Huệ, Q.1, TP.HCM', '0312345678', 'Doanh nghiệp', 'Khách VIP'],
          ['KH002', 'Shop Mộc Nhiên', '0912345678', 'mocnhien@gmail.com', '45 Trần Phú, Đà Nẵng', '', 'Đại lý', 'Thanh toán chuyển khoản'],
          ['', 'Anh Hoàng Tuấn Anh', '0988776655', 'tuananh@gmail.com', 'Hà Nội', '', 'Khách lẻ', ''],
        ];
        const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
        ws['!cols'] = [
          { wch: 26 }, { wch: 30 }, { wch: 16 }, { wch: 24 },
          { wch: 35 }, { wch: 16 }, { wch: 18 }, { wch: 25 }
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'DANH_MUC_KHACH_HANG');
        XLSX.writeFile(wb, 'Mau_nhap_khach_hang_LKERP.xlsx');
      },
    },
    suppliers: {
      title: 'Nhập danh sách nhà cung cấp từ Excel',
      subtitle: 'Tải lên bảng tính (.xlsx, .xls, .csv) để nạp danh mục đối tác cung ứng',
      templateFilename: 'Mau_nhap_nha_cung_cap_LKERP.xlsx',
      columns: ['Mã NCC', 'Tên NCC (*)', 'Người liên hệ', 'Số điện thoại', 'Email', 'Địa chỉ', 'Mã số thuế'],
      downloadTemplate: () => {
        const headers = [
          'Mã nhà cung cấp (để trống tự sinh)',
          'Tên nhà cung cấp (*)',
          'Người liên hệ',
          'Số điện thoại',
          'Email',
          'Địa chỉ',
          'Mã số thuế',
          'Nhóm NCC',
          'Ghi chú',
        ];
        const sampleData = [
          ['NCC01', 'Công ty Nông Sản Tây Nguyên', 'Anh Hùng', '0903334455', 'hung@nongsantn.vn', 'Buôn Ma Thuột, Đắk Lắk', '6001234567', 'Nguyên liệu', 'Nhà cung ứng hạt cà phê'],
          ['NCC02', 'Bao Bì Xanh Việt Nam', 'Chị Lan', '0918889900', 'kinhdoanh@baobixanh.vn', 'Bình Dương', '3701234567', 'Bao bì', 'Cung cấp ly cốc giấy'],
        ];
        const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
        ws['!cols'] = [
          { wch: 28 }, { wch: 32 }, { wch: 18 }, { wch: 16 },
          { wch: 24 }, { wch: 35 }, { wch: 16 }, { wch: 18 }, { wch: 25 }
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'DANH_MUC_NHA_CUNG_CAP');
        XLSX.writeFile(wb, 'Mau_nhap_nha_cung_cap_LKERP.xlsx');
      },
    },
  }[type];

  const parseNumber = (val: any): number => {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (!val) return 0;
    const cleanStr = String(val).replace(/[,.\sđ₫]/g, '');
    const num = Number(cleanStr);
    return isNaN(num) ? 0 : num;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    processUploadedFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processUploadedFile(droppedFile);
    }
  };

  const processUploadedFile = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setIsProcessing(true);
    try {
      const buffer = await uploadedFile.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = wb.SheetNames[0];
      const ws = wb.Sheets[firstSheetName];
      const rawAoa: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

      if (rawAoa.length < 2) {
        alert('File Excel không có dữ liệu (cần ít nhất 1 dòng tiêu đề và 1 dòng dữ liệu).');
        setIsProcessing(false);
        return;
      }

      // Find header row and column mapping
      const headerRow = rawAoa[0].map(h => String(h).trim().toLowerCase());
      const findColIdx = (keywords: string[]): number => {
        return headerRow.findIndex(h => keywords.some(k => h.includes(k.toLowerCase())));
      };

      const rows: ParsedRow[] = [];

      if (type === 'products') {
        const skuIdx = findColIdx(['sku', 'mã sku', 'mã sp', 'mã hàng']);
        const nameIdx = findColIdx(['tên', 'tên sản phẩm', 'tên hàng', 'sản phẩm']);
        const unitIdx = findColIdx(['đvt', 'đơn vị tính', 'đơn vị']);
        const groupIdx = findColIdx(['nhóm', 'nhóm hàng', 'danh mục']);
        const costIdx = findColIdx(['giá vốn', 'giá mua', 'giá nhập']);
        const priceIdx = findColIdx(['giá bán', 'đơn giá', 'giá']);
        const stockIdx = findColIdx(['tồn kho', 'tồn', 'số lượng']);
        const minStockIdx = findColIdx(['tồn tối thiểu', 'tối thiểu', 'cảnh báo']);
        const descIdx = findColIdx(['mô tả', 'ghi chú']);

        for (let i = 1; i < rawAoa.length; i++) {
          const row = rawAoa[i];
          if (!row || row.every(cell => String(cell).trim() === '')) continue;

          const name = nameIdx !== -1 ? String(row[nameIdx] || '').trim() : '';
          const sku = skuIdx !== -1 ? String(row[skuIdx] || '').trim() : '';
          const unit = unitIdx !== -1 ? String(row[unitIdx] || '').trim() || 'Cái' : 'Cái';
          const group_name = groupIdx !== -1 ? String(row[groupIdx] || '').trim() || 'Khác' : 'Khác';
          const cost_price = costIdx !== -1 ? parseNumber(row[costIdx]) : 0;
          const sale_price = priceIdx !== -1 ? parseNumber(row[priceIdx]) : 0;
          const stock_quantity = stockIdx !== -1 ? parseNumber(row[stockIdx]) : 0;
          const min_stock = minStockIdx !== -1 ? parseNumber(row[minStockIdx]) : 5;
          const description = descIdx !== -1 ? String(row[descIdx] || '').trim() : '';

          const errors: string[] = [];
          if (!name) errors.push('Thiếu tên sản phẩm');
          if (cost_price < 0) errors.push('Giá vốn không thể âm');
          if (sale_price < 0) errors.push('Giá bán không thể âm');
          if (stock_quantity < 0) errors.push('Tồn kho không thể âm');

          rows.push({
            index: i + 1,
            data: {
              sku,
              name,
              unit,
              group_name,
              cost_price,
              sale_price,
              stock_quantity,
              min_stock,
              description,
            },
            isValid: errors.length === 0,
            errors,
          });
        }
      } else if (type === 'customers') {
        const codeIdx = findColIdx(['mã kh', 'mã khách', 'mã']);
        const nameIdx = findColIdx(['tên kh', 'tên khách', 'tên', 'khách hàng']);
        const phoneIdx = findColIdx(['điện thoại', 'sđt', 'phone', 'số đt']);
        const emailIdx = findColIdx(['email', 'thư điện tử']);
        const addressIdx = findColIdx(['địa chỉ', 'nơi ở']);
        const taxIdx = findColIdx(['mst', 'mã số thuế', 'tax']);
        const groupIdx = findColIdx(['nhóm', 'nhóm khách']);
        const noteIdx = findColIdx(['ghi chú', 'note']);

        for (let i = 1; i < rawAoa.length; i++) {
          const row = rawAoa[i];
          if (!row || row.every(cell => String(cell).trim() === '')) continue;

          const name = nameIdx !== -1 ? String(row[nameIdx] || '').trim() : '';
          const code = codeIdx !== -1 ? String(row[codeIdx] || '').trim() : '';
          const phone = phoneIdx !== -1 ? String(row[phoneIdx] || '').trim() : '';
          const email = emailIdx !== -1 ? String(row[emailIdx] || '').trim() : '';
          const address = addressIdx !== -1 ? String(row[addressIdx] || '').trim() : '';
          const tax_code = taxIdx !== -1 ? String(row[taxIdx] || '').trim() : '';
          const group_name = groupIdx !== -1 ? String(row[groupIdx] || '').trim() || 'Khách lẻ' : 'Khách lẻ';
          const note = noteIdx !== -1 ? String(row[noteIdx] || '').trim() : '';

          const errors: string[] = [];
          if (!name) errors.push('Thiếu tên khách hàng');

          rows.push({
            index: i + 1,
            data: { code, name, phone, email, address, tax_code, group_name, note },
            isValid: errors.length === 0,
            errors,
          });
        }
      } else {
        // Suppliers
        const codeIdx = findColIdx(['mã ncc', 'mã nhà cung cấp', 'mã']);
        const nameIdx = findColIdx(['tên ncc', 'tên nhà cung cấp', 'tên', 'nhà cung cấp']);
        const contactIdx = findColIdx(['liên hệ', 'người liên hệ']);
        const phoneIdx = findColIdx(['điện thoại', 'sđt', 'phone', 'số đt']);
        const emailIdx = findColIdx(['email', 'thư điện tử']);
        const addressIdx = findColIdx(['địa chỉ']);
        const taxIdx = findColIdx(['mst', 'mã số thuế', 'tax']);
        const groupIdx = findColIdx(['nhóm', 'nhóm ncc']);
        const noteIdx = findColIdx(['ghi chú', 'note']);

        for (let i = 1; i < rawAoa.length; i++) {
          const row = rawAoa[i];
          if (!row || row.every(cell => String(cell).trim() === '')) continue;

          const name = nameIdx !== -1 ? String(row[nameIdx] || '').trim() : '';
          const code = codeIdx !== -1 ? String(row[codeIdx] || '').trim() : '';
          const contact_name = contactIdx !== -1 ? String(row[contactIdx] || '').trim() : '';
          const phone = phoneIdx !== -1 ? String(row[phoneIdx] || '').trim() : '';
          const email = emailIdx !== -1 ? String(row[emailIdx] || '').trim() : '';
          const address = addressIdx !== -1 ? String(row[addressIdx] || '').trim() : '';
          const tax_code = taxIdx !== -1 ? String(row[taxIdx] || '').trim() : '';
          const group_name = groupIdx !== -1 ? String(row[groupIdx] || '').trim() || 'Nguyên liệu' : 'Nguyên liệu';
          const note = noteIdx !== -1 ? String(row[noteIdx] || '').trim() : '';

          const errors: string[] = [];
          if (!name) errors.push('Thiếu tên nhà cung cấp');

          rows.push({
            index: i + 1,
            data: { code, name, contact_name, phone, email, address, tax_code, group_name, note },
            isValid: errors.length === 0,
            errors,
          });
        }
      }

      setParsedRows(rows);
    } catch (err: any) {
      console.error('Error reading Excel file:', err);
      alert('Không thể đọc file Excel. Vui lòng kiểm tra định dạng tệp (.xlsx, .xls, .csv).');
    } finally {
      setIsProcessing(false);
    }
  };

  const validRows = parsedRows.filter(r => r.isValid);
  const errorRows = parsedRows.filter(r => !r.isValid);
  const rowsToSubmit = skipErrors ? validRows : parsedRows;

  const handleSubmit = async () => {
    if (rowsToSubmit.length === 0) {
      alert('Không có dòng hợp lệ nào để nhập!');
      return;
    }

    setIsSubmitting(true);
    try {
      const items = rowsToSubmit.map(r => r.data);
      if (type === 'products' && onImportProducts) {
        await onImportProducts(items);
      } else if (type === 'customers' && onImportCustomers) {
        await onImportCustomers(items);
      } else if (type === 'suppliers' && onImportSuppliers) {
        await onImportSuppliers(items);
      }

      alert(`Đã nhập thành công ${rowsToSubmit.length} dòng vào hệ thống LK ERP và đồng bộ lên Google Sheets!`);
      handleReset();
      onClose();
    } catch (err: any) {
      console.error('Import error:', err);
      alert(`Lỗi khi nhập dữ liệu: ${err.message || 'Lỗi không xác định'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedRows([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#1E293B] w-full max-w-4xl max-h-[92vh] rounded-[20px] shadow-2xl flex flex-col overflow-hidden border border-[#E5E7EB] dark:border-[#334155]">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[#F1F2F5] dark:border-[#334155] flex items-center justify-between bg-white dark:bg-[#1E293B] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-purple-50 dark:bg-purple-950/40 text-[#6D3EEB] dark:text-[#C084FC] flex items-center justify-center shrink-0">
              <Icon name="upload_file" size={22} />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[#111827] dark:text-[#F8FAFC]">
                {typeConfig.title}
              </h2>
              <p className="text-[12.5px] text-[#6B7280] dark:text-[#94A3B8]">
                {typeConfig.subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-[10px] text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F8FAFC] hover:bg-[#F3F4F6] dark:hover:bg-[#334155] flex items-center justify-center transition-colors"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Action Row: Template Download & Info */}
          <div className="p-4 rounded-[14px] bg-[#F9FAFB] dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-[13px] text-[#374151] dark:text-[#CBD5E1]">
              <Icon name="description" size={20} className="text-[#6D3EEB] dark:text-[#C084FC]" />
              <span>Chưa có file mẫu? Tải bảng tính mẫu chuẩn hoá của LK ERP để nhập dữ liệu nhanh nhất:</span>
            </div>
            <button
              type="button"
              onClick={typeConfig.downloadTemplate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border dark:border-emerald-800 text-[12.5px] font-semibold transition-colors shadow-2xs cursor-pointer"
            >
              <Icon name="download" size={16} />
              <span>Tải file Excel mẫu (.xlsx)</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          {!file ? (
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#D1D5DB] dark:border-[#475569] hover:border-[#6D3EEB] dark:hover:border-[#C084FC] rounded-[16px] p-8 text-center cursor-pointer transition-colors bg-[#FAFAFA] dark:bg-[#0F172A]/50 hover:bg-purple-50/40 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-purple-50 dark:bg-purple-950/50 text-[#6D3EEB] dark:text-[#C084FC] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Icon name="cloud_upload" size={28} />
              </div>
              <div className="text-[14.5px] font-semibold text-[#111827] dark:text-[#F8FAFC]">
                Kéo thả file Excel vào đây hoặc <span className="text-[#6D3EEB] dark:text-[#C084FC] underline">duyệt chọn từ máy tính</span>
              </div>
              <p className="text-[12.5px] text-[#6B7280] dark:text-[#94A3B8] mt-1">
                Hỗ trợ định dạng: .xlsx, .xls, .csv (Dung lượng tối đa 15MB)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Info Card */}
              <div className="p-3.5 rounded-[12px] bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-[#6D3EEB] text-white flex items-center justify-center">
                    <Icon name="table_chart" size={20} />
                  </div>
                  <div>
                    <div className="text-[13.5px] font-semibold text-[#111827] dark:text-[#F8FAFC]">
                      {file.name}
                    </div>
                    <div className="text-[11.5px] text-[#6B7280] dark:text-[#94A3B8]">
                      {(file.size / 1024).toFixed(1)} KB · Đã phân tích xong
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 text-[12px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-[8px] font-medium border border-rose-200 transition-colors"
                >
                  Chọn file khác
                </button>
              </div>

              {/* Statistics & Options */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-[12px] font-semibold">
                    Tổng: {parsedRows.length} dòng
                  </span>
                  <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full text-[12px] font-semibold">
                    ✓ Hợp lệ: {validRows.length}
                  </span>
                  {errorRows.length > 0 && (
                    <span className="px-3 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-full text-[12px] font-semibold">
                      ✕ Lỗi: {errorRows.length}
                    </span>
                  )}
                </div>

                {errorRows.length > 0 && (
                  <label className="flex items-center gap-2 text-[12.5px] text-[#374151] dark:text-[#CBD5E1] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={skipErrors}
                      onChange={e => setSkipErrors(e.target.checked)}
                      className="rounded text-[#6D3EEB] focus:ring-[#6D3EEB]"
                    />
                    <span>Bỏ qua các dòng lỗi và chỉ nhập dòng hợp lệ</span>
                  </label>
                )}
              </div>

              {/* Preview Table */}
              <div className="border border-[#E5E7EB] dark:border-[#334155] rounded-[14px] overflow-hidden max-h-[340px] overflow-y-auto">
                <table className="w-full text-left text-[12.5px]">
                  <thead className="bg-[#F9FAFB] dark:bg-[#0F172A] border-b border-[#E5E7EB] dark:border-[#334155] sticky top-0 z-10 text-[#4B5563] dark:text-[#94A3B8] font-semibold">
                    <tr>
                      <th className="px-3 py-2.5 w-12 text-center">STT</th>
                      <th className="px-3 py-2.5 w-24">Trạng thái</th>
                      {typeConfig.columns.map((col, idx) => (
                        <th key={idx} className="px-3 py-2.5">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F2F5] dark:divide-[#334155]">
                    {parsedRows.map(row => (
                      <tr
                        key={row.index}
                        className={`hover:bg-[#F9FAFB] dark:hover:bg-[#0F172A]/40 transition-colors ${
                          !row.isValid ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''
                        }`}
                      >
                        <td className="px-3 py-2 text-center text-[#9CA3AF] font-mono">
                          {row.index}
                        </td>
                        <td className="px-3 py-2">
                          {row.isValid ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Hợp lệ
                            </span>
                          ) : (
                            <span
                              title={row.errors.join(', ')}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 cursor-help"
                            >
                              Lỗi ({row.errors[0]})
                            </span>
                          )}
                        </td>
                        {type === 'products' && (
                          <>
                            <td className="px-3 py-2 font-mono text-[#374151] dark:text-[#CBD5E1]">
                              {row.data.sku || <span className="text-[#9CA3AF] italic">Tự sinh</span>}
                            </td>
                            <td className="px-3 py-2 font-medium text-[#111827] dark:text-[#F8FAFC]">
                              {row.data.name}
                            </td>
                            <td className="px-3 py-2 text-[#6B7280]">{row.data.unit}</td>
                            <td className="px-3 py-2 text-[#6B7280]">{row.data.group_name}</td>
                            <td className="px-3 py-2 font-mono tabular-nums text-right">
                              {row.data.cost_price.toLocaleString('vi-VN')}
                            </td>
                            <td className="px-3 py-2 font-mono tabular-nums text-right font-medium text-[#111827] dark:text-[#F8FAFC]">
                              {row.data.sale_price.toLocaleString('vi-VN')}
                            </td>
                            <td className="px-3 py-2 font-mono tabular-nums text-right font-bold text-purple-600">
                              {row.data.stock_quantity.toLocaleString('vi-VN')}
                            </td>
                            <td className="px-3 py-2 font-mono tabular-nums text-right text-[#6B7280]">
                              {row.data.min_stock}
                            </td>
                          </>
                        )}
                        {type === 'customers' && (
                          <>
                            <td className="px-3 py-2 font-mono text-[#374151] dark:text-[#CBD5E1]">
                              {row.data.code || <span className="text-[#9CA3AF] italic">Tự sinh</span>}
                            </td>
                            <td className="px-3 py-2 font-medium text-[#111827] dark:text-[#F8FAFC]">
                              {row.data.name}
                            </td>
                            <td className="px-3 py-2 font-mono text-[#4B5563]">{row.data.phone || '—'}</td>
                            <td className="px-3 py-2 text-[#6B7280]">{row.data.email || '—'}</td>
                            <td className="px-3 py-2 text-[#6B7280] max-w-[150px] truncate">{row.data.address || '—'}</td>
                            <td className="px-3 py-2 font-mono text-[#6B7280]">{row.data.tax_code || '—'}</td>
                            <td className="px-3 py-2 text-[#6B7280]">{row.data.group_name}</td>
                          </>
                        )}
                        {type === 'suppliers' && (
                          <>
                            <td className="px-3 py-2 font-mono text-[#374151] dark:text-[#CBD5E1]">
                              {row.data.code || <span className="text-[#9CA3AF] italic">Tự sinh</span>}
                            </td>
                            <td className="px-3 py-2 font-medium text-[#111827] dark:text-[#F8FAFC]">
                              {row.data.name}
                            </td>
                            <td className="px-3 py-2 text-[#6B7280]">{row.data.contact_name || '—'}</td>
                            <td className="px-3 py-2 font-mono text-[#4B5563]">{row.data.phone || '—'}</td>
                            <td className="px-3 py-2 text-[#6B7280]">{row.data.email || '—'}</td>
                            <td className="px-3 py-2 text-[#6B7280] max-w-[150px] truncate">{row.data.address || '—'}</td>
                            <td className="px-3 py-2 font-mono text-[#6B7280]">{row.data.tax_code || '—'}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#F1F2F5] dark:border-[#334155] bg-white dark:bg-[#1E293B] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-[13.5px] font-semibold text-[#4B5563] hover:text-[#111827] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] rounded-[10px] hover:bg-[#F3F4F6] dark:hover:bg-[#334155] transition-colors"
          >
            Hủy bỏ
          </button>
          <div className="flex items-center gap-3">
            {file && (
              <span className="text-[12.5px] text-[#6B7280] dark:text-[#94A3B8]">
                Sẵn sàng nhập <strong>{rowsToSubmit.length}</strong> dòng
              </span>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!file || rowsToSubmit.length === 0 || isSubmitting}
              className={`px-5 py-2.5 rounded-[12px] text-white text-[13.5px] font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-98 ${
                !file || rowsToSubmit.length === 0 || isSubmitting
                  ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-70'
                  : 'bg-[#6D3EEB] hover:bg-[#5B2BD6] cursor-pointer'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Icon name="sync" size={17} className="animate-spin" />
                  <span>Đang nhập & đồng bộ...</span>
                </>
              ) : (
                <>
                  <Icon name="check" size={18} />
                  <span>Xác nhận nhập dữ liệu</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
