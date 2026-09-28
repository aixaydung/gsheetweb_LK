import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';
import { formatCurrency, formatQuantity } from '../../lib/format';
import { StatusBadge } from './StatusBadge';

export interface ComboboxItem {
  id: string;
  code: string;
  name: string;
  subtext?: string;
  badge?: string;
  stock?: number;
  price?: number;
  debt?: number;
  isService?: boolean;
}

interface EntityComboboxProps {
  label?: string;
  placeholder?: string;
  items: ComboboxItem[];
  selectedId?: string;
  onSelect: (item: ComboboxItem | null) => void;
  onAddNew?: () => void;
  addNewText?: string;
  type?: 'customer' | 'supplier' | 'product';
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export const EntityCombobox: React.FC<EntityComboboxProps> = ({
  label,
  placeholder = 'Tìm kiếm hoặc chọn...',
  items,
  selectedId,
  onSelect,
  onAddNew,
  addNewText,
  type = 'customer',
  disabled = false,
  required = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedItem = items.find(i => i.id === selectedId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredItems = items.filter(
    i =>
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.subtext && i.subtext.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-[13.5px] font-medium text-[#374151] mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Selected Box or Search Input */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`min-h-[44px] px-3.5 bg-white border rounded-[12px] flex items-center justify-between cursor-pointer transition-all shadow-sm ${
          disabled
            ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
            : isOpen
            ? 'border-[#6D3EEB] ring-2 ring-[#F3EBFE]'
            : 'border-[#E5E7EB] hover:border-gray-400'
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1 py-1">
          <Icon
            name={type === 'product' ? 'inventory_2' : type === 'supplier' ? 'storefront' : 'person'}
            size={18}
            className="text-[#6B7280] shrink-0"
          />
          {selectedItem ? (
            <div className="truncate">
              <span className="font-semibold text-[#111827] text-[14px]">
                {selectedItem.name}
              </span>
              <span className="text-[12px] text-[#6B7280] ml-2">
                ({selectedItem.code})
              </span>
            </div>
          ) : (
            <span className="text-[13.5px] text-[#9CA3AF] truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          {selectedItem && !disabled && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onSelect(null);
                setSearchTerm('');
              }}
              className="p-1 text-[#9CA3AF] hover:text-[#111827] rounded-full hover:bg-gray-100"
            >
              <Icon name="close" size={16} />
            </button>
          )}
          <Icon name="expand_more" size={18} className="text-[#6B7280]" />
        </div>
      </div>

      {/* Dropdown list */}
      {isOpen && !disabled && (
        <div className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-[16px] shadow-[0_12px_32px_rgba(16,24,40,0.16)] border border-[#E5E7EB] z-50 overflow-hidden max-h-[380px] flex flex-col animate-in fade-in zoom-in-95 duration-100">
          {/* Internal Search Field */}
          <div className="p-2 border-b border-[#F1F2F5] bg-[#F9FAFB]">
            <div className="relative">
              <Icon
                name="search"
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Gõ tên, mã để lọc nhanh..."
                autoFocus
                className="w-full h-9 pl-9 pr-3 text-[13px] bg-white border border-[#E5E7EB] rounded-[10px] focus:outline-none focus:border-[#6D3EEB]"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-[#F1F2F5]">
            {/* Add New Option */}
            {onAddNew && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onAddNew();
                }}
                className="w-full text-left px-4 py-2.5 bg-[#F3EBFE] hover:bg-[#E9D5FF] text-[#6317D6] text-[13px] font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Icon name="add_circle" size={18} className="text-[#6D3EEB]" />
                <span>
                  {addNewText ||
                    (type === 'supplier'
                      ? 'Thêm NCC mới'
                      : type === 'product'
                      ? 'Thêm sản phẩm mới'
                      : 'Thêm khách hàng mới')}
                </span>
              </button>
            )}

            {filteredItems.length === 0 ? (
              <div className="py-6 text-center text-[#9CA3AF] text-[13px]">
                Không tìm thấy kết quả phù hợp
              </div>
            ) : (
              filteredItems.map(item => {
                const isSelected = item.id === selectedId;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelect(item);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-[#F9FAFB] transition-colors ${
                      isSelected ? 'bg-[#F9F5FF]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden pr-2">
                      <div className="w-9 h-9 rounded-[10px] bg-[#F9F5FF] text-[#6D3EEB] flex items-center justify-center shrink-0">
                        <Icon
                          name={
                            type === 'product'
                              ? 'inventory_2'
                              : type === 'supplier'
                              ? 'storefront'
                              : 'person'
                          }
                          size={20}
                        />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#111827] text-[13.5px] truncate">
                            {item.name}
                          </span>
                          {item.badge && <StatusBadge status={item.badge} />}
                        </div>
                        <div className="text-[12px] text-[#6B7280] truncate mt-0.5">
                          {item.code} {item.subtext && `· ${item.subtext}`}
                          {item.stock !== undefined && ` · Tồn: ${formatQuantity(item.stock)}`}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {item.price !== undefined && (
                        <span className="text-[13.5px] font-bold text-[#D97706] tabular-nums block">
                          {formatCurrency(item.price)}
                        </span>
                      )}
                      {item.debt !== undefined && item.debt > 0 && (
                        <div>
                          <span className="text-[10.5px] text-[#6B7280] block">Còn nợ</span>
                          <span className="text-[13px] font-bold text-[#E11D48] tabular-nums block">
                            {formatCurrency(item.debt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
