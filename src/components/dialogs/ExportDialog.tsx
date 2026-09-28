import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Icon } from '../ui/Icon';
import { ExportColumn, exportToExcelFile } from '../../lib/excelExport';

interface ExportDialogProps<T> {
  isOpen: boolean;
  onClose: () => void;
  filePrefix: string;
  allData: T[];
  filteredData: T[];
  selectedData: T[];
  availableColumns: ExportColumn<T>[];
}

export function ExportDialog<T>({
  isOpen,
  onClose,
  filePrefix,
  allData,
  filteredData,
  selectedData,
  availableColumns,
}: ExportDialogProps<T>) {
  const [scope, setScope] = useState<'all' | 'filtered' | 'selected'>('filtered');
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>(
    availableColumns.map(c => String(c.key))
  );

  const handleToggleColumn = (key: string) => {
    if (selectedColumnKeys.includes(key)) {
      if (selectedColumnKeys.length > 1) {
        setSelectedColumnKeys(selectedColumnKeys.filter(k => k !== key));
      }
    } else {
      setSelectedColumnKeys([...selectedColumnKeys, key]);
    }
  };

  const handleToggleAllColumns = () => {
    if (selectedColumnKeys.length === availableColumns.length) {
      setSelectedColumnKeys([String(availableColumns[0].key)]);
    } else {
      setSelectedColumnKeys(availableColumns.map(c => String(c.key)));
    }
  };

  const handleDownload = () => {
    let targetData = filteredData;
    if (scope === 'all') targetData = allData;
    else if (scope === 'selected') targetData = selectedData;

    const columnsToExport = availableColumns.filter(c => selectedColumnKeys.includes(String(c.key)));
    exportToExcelFile(targetData, columnsToExport, filePrefix);
    onClose();
  };

  const scopeCards = [
    {
      id: 'all',
      title: 'Toàn bộ dữ liệu',
      count: allData.length,
      icon: 'database',
      disabled: allData.length === 0,
    },
    {
      id: 'filtered',
      title: 'Dữ liệu đang lọc',
      count: filteredData.length,
      icon: 'filter_alt',
      disabled: filteredData.length === 0,
    },
    {
      id: 'selected',
      title: 'Các dòng đang chọn',
      count: selectedData.length,
      icon: 'check_box',
      disabled: selectedData.length === 0,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xuất Excel"
      subtitle="Chọn phạm vi dữ liệu và các cột cần xuất"
      icon="download"
      width="md"
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[#4B5563] hover:text-[#111827] text-[13.5px] font-medium"
          >
            ✕ Huỷ
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={selectedColumnKeys.length === 0}
            className="px-5 py-2 bg-[#6D3EEB] hover:bg-[#5B2BD6] disabled:opacity-50 text-white text-[13.5px] font-semibold rounded-[12px] shadow-[0_8px_20px_-6px_rgba(109,62,235,0.55)] transition-all flex items-center gap-1.5"
          >
            <Icon name="download" size={18} />
            <span>⤓ Tải file .xlsx</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Scope Selection */}
        <div>
          <label className="block text-[13px] font-bold text-[#4B5563] uppercase tracking-wider mb-2.5">
            Phạm vi xuất
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {scopeCards.map(c => {
              const isSelected = scope === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={c.disabled}
                  onClick={() => setScope(c.id as any)}
                  className={`p-3.5 rounded-[14px] border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#6D3EEB] bg-[#F9F5FF] ring-2 ring-[#F3EBFE]'
                      : c.disabled
                      ? 'border-gray-200 bg-gray-50 opacity-40 cursor-not-allowed'
                      : 'border-[#E5E7EB] hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon
                      name={c.icon}
                      size={20}
                      className={isSelected ? 'text-[#6D3EEB]' : 'text-[#6B7280]'}
                    />
                    <span
                      className={`text-[11.5px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-[#F3EBFE] text-[#6317D6]' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {c.count} dòng
                    </span>
                  </div>
                  <span
                    className={`text-[13.5px] font-semibold ${
                      isSelected ? 'text-[#6317D6]' : 'text-[#1F2937]'
                    }`}
                  >
                    {c.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Columns Selection */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-[13px] font-bold text-[#4B5563] uppercase tracking-wider">
              Cột muốn xuất ({selectedColumnKeys.length}/{availableColumns.length})
            </label>
            <button
              type="button"
              onClick={handleToggleAllColumns}
              className="text-[12.5px] font-semibold text-[#6317D6] hover:underline"
            >
              {selectedColumnKeys.length === availableColumns.length
                ? 'Bỏ chọn tất cả'
                : 'Chọn tất cả'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#F9FAFB] p-3.5 rounded-[16px] border border-[#F1F2F5] max-h-56 overflow-y-auto">
            {availableColumns.map(col => {
              const checked = selectedColumnKeys.includes(String(col.key));
              return (
                <label
                  key={String(col.key)}
                  className="flex items-center gap-2.5 p-2 rounded-[8px] hover:bg-white transition-colors cursor-pointer text-[13px] text-[#1F2937]"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleColumn(String(col.key))}
                    className="w-4 h-4 rounded text-[#6D3EEB] focus:ring-[#6D3EEB] border-gray-300 cursor-pointer"
                  />
                  <span>{col.header}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
