import React, { useState } from 'react';
import { Icon } from './Icon';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onSort?: (key: string) => void;
  currentSortKey?: string;
  sortDirection?: 'asc' | 'desc';
  emptyMessage?: string;
  emptyActionText?: string;
  onEmptyAction?: () => void;
  onDeleteSelected?: (selectedIds: string[]) => void;
  onExportSelected?: () => void;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  selectedIds = [],
  onSelectionChange,
  onSort,
  currentSortKey,
  sortDirection = 'desc',
  emptyMessage = 'Chưa có dữ liệu',
  emptyActionText,
  onEmptyAction,
  onDeleteSelected,
  onExportSelected,
  className = '',
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const total = data.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const pageData = data.slice(startIndex, startIndex + pageSize);

  const isAllSelected =
    pageData.length > 0 && pageData.every(row => selectedIds.includes(keyExtractor(row)));

  const handleToggleAll = () => {
    if (!onSelectionChange) return;
    if (isAllSelected) {
      const pageKeys = pageData.map(keyExtractor);
      onSelectionChange(selectedIds.filter(id => !pageKeys.includes(id)));
    } else {
      const pageKeys = pageData.map(keyExtractor);
      const combined = Array.from(new Set([...selectedIds, ...pageKeys]));
      onSelectionChange(combined);
    }
  };

  const handleToggleRow = (id: string) => {
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(i => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  return (
    <div
      className={`bg-white rounded-[16px] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_2px_8px_rgba(16,24,40,0.04)] border border-[#F1F2F5] overflow-hidden relative ${className}`}
    >
      {/* Floating Action Bar on Selection */}
      {selectedIds.length > 0 && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 bg-[#111827] text-white px-4 py-2 rounded-[14px] shadow-xl flex items-center gap-4 text-[13px]">
          <span className="font-semibold text-white">Đã chọn {selectedIds.length}</span>
          <div className="h-4 w-[1px] bg-gray-700" />
          {onExportSelected && (
            <button
              type="button"
              onClick={onExportSelected}
              className="hover:text-purple-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <Icon name="download" size={16} />
              <span>Xuất Excel</span>
            </button>
          )}
          {onDeleteSelected && (
            <button
              type="button"
              onClick={() => onDeleteSelected(selectedIds)}
              className="hover:text-rose-400 font-medium flex items-center gap-1 cursor-pointer text-rose-300"
            >
              <Icon name="delete" size={16} />
              <span>Xoá</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onSelectionChange && onSelectionChange([])}
            className="text-gray-400 hover:text-white"
          >
            Huỷ chọn
          </button>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#F1F2F5] bg-white">
              {onSelectionChange && (
                <th className="w-10 px-4 py-3.5 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleToggleAll}
                    className="w-4 h-4 rounded text-[#6D3EEB] focus:ring-[#6D3EEB] border-gray-300 cursor-pointer"
                  />
                </th>
              )}
              {columns.map(col => {
                const isSorted = currentSortKey === col.key;
                return (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    className={`px-4 py-3.5 text-[11.5px] font-semibold text-[#6B7280] uppercase tracking-[0.04em] select-none ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    } ${col.sortable && onSort ? 'cursor-pointer hover:text-[#111827]' : ''}`}
                    onClick={() => col.sortable && onSort && onSort(col.key)}
                  >
                    <div
                      className={`inline-flex items-center gap-1 ${
                        col.align === 'right'
                          ? 'justify-end w-full'
                          : col.align === 'center'
                          ? 'justify-center w-full'
                          : 'justify-start'
                      }`}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <Icon
                          name={
                            isSorted
                              ? sortDirection === 'asc'
                                ? 'arrow_upward'
                                : 'arrow_downward'
                              : 'unfold_more'
                          }
                          size={14}
                          className={isSorted ? 'text-[#6D3EEB]' : 'text-[#9CA3AF]'}
                        />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#F1F2F5]">
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (onSelectionChange ? 1 : 0)}>
                  <EmptyState
                    message={emptyMessage}
                    actionText={emptyActionText}
                    onAction={onEmptyAction}
                  />
                </td>
              </tr>
            ) : (
              pageData.map((row, idx) => {
                const rowId = keyExtractor(row);
                const isSelected = selectedIds.includes(rowId);

                return (
                  <tr
                    key={rowId}
                    className={`hover:bg-[#F9FAFB] transition-colors ${
                      isSelected ? 'bg-[#F9F5FF]' : ''
                    }`}
                  >
                    {onSelectionChange && (
                      <td className="w-10 px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRow(rowId)}
                          className="w-4 h-4 rounded text-[#6D3EEB] focus:ring-[#6D3EEB] border-gray-300 cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map(col => (
                      <td
                        key={col.key}
                        className={`px-4 py-3.5 text-[14px] text-[#1F2937] ${
                          col.align === 'right'
                            ? 'text-right tabular-nums'
                            : col.align === 'center'
                            ? 'text-center'
                            : 'text-left'
                        }`}
                      >
                        {col.render ? col.render(row, startIndex + idx) : (row as any)[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-[#F1F2F5] px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[12.5px] text-[#6B7280]">
        <div>
          <span>
            {total === 0
              ? '0 kết quả'
              : `Hiển thị ${startIndex + 1}–${Math.min(startIndex + pageSize, total)} / ${total} kết quả`}
          </span>
        </div>

        {total > 15 && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span>Số dòng:</span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-transparent border border-[#E5E7EB] rounded-[8px] px-2 py-1 text-[12px] text-[#1F2937] outline-none"
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1 rounded-[6px] border border-[#E5E7EB] disabled:opacity-40 hover:bg-gray-50 text-[#4B5563]"
              >
                <Icon name="chevron_left" size={16} />
              </button>
              <span className="px-2 font-medium">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1 rounded-[6px] border border-[#E5E7EB] disabled:opacity-40 hover:bg-gray-50 text-[#4B5563]"
              >
                <Icon name="chevron_right" size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
