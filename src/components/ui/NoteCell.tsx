import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';

interface NoteCellProps {
  note?: string;
  onSave: (newNote: string) => void;
  title?: string;
}

export const NoteCell: React.FC<NoteCellProps> = ({ note = '', onSave, title = 'Ghi chú' }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tempNote, setTempNote] = useState(note);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<any>(null);

  useEffect(() => {
    setTempNote(note);
  }, [note]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsEditOpen(false);
      }
    }
    if (isEditOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditOpen]);

  const handleMouseEnter = () => {
    if (isEditOpen) return;
    clearTimeout(hoverTimeoutRef.current);
    if (note && note.trim().length > 0) {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHovered(true);
      }, 150);
    }
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditOpen(false);
    }
  };

  const handleSave = () => {
    onSave(tempNote.trim());
    setIsEditOpen(false);
    setIsHovered(false);
  };

  const openEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHovered(false);
    setTempNote(note);
    setIsEditOpen(true);
  };

  return (
    <div
      className="relative inline-block"
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Pill / Button */}
      {note && note.trim().length > 0 ? (
        <button
          type="button"
          onClick={openEdit}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[#F9F5FF] border border-[#E9D5FF] text-[#6317D6] text-[12.5px] font-medium max-w-[170px] hover:bg-[#F3EBFE] hover:border-[#D8B4FE] transition-all text-left shadow-xs cursor-pointer group"
        >
          <Icon
            name="sticky_note_2"
            size={15}
            className="shrink-0 text-[#6D3EEB] group-hover:scale-105 transition-transform"
          />
          <span className="truncate">{note}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={openEdit}
          title="Thêm ghi chú"
          className="w-8 h-8 rounded-full border border-[#E5E7EB] dark:border-gray-700 flex items-center justify-center text-[#9CA3AF] hover:text-[#6D3EEB] hover:border-[#6D3EEB] hover:bg-[#F9F5FF] dark:hover:bg-purple-950/30 transition-all cursor-pointer shadow-2xs"
        >
          <Icon name="sticky_note_2" size={16} />
        </button>
      )}

      {/* 1. HOVER PREVIEW POPOVER (Matching Image 1) */}
      {isHovered && !isEditOpen && note && (
        <div
          className="absolute left-0 top-full mt-2 w-72 p-3.5 bg-white dark:bg-[#1E232E] rounded-[14px] shadow-[0_12px_32px_rgba(16,24,40,0.18)] border border-[#E5E7EB] dark:border-gray-700 z-50 animate-in fade-in zoom-in-95 duration-150 cursor-pointer"
          onClick={openEdit}
        >
          {/* Arrow */}
          <div className="absolute -top-1.5 left-4 w-3 h-3 bg-white dark:bg-[#1E232E] border-t border-l border-[#E5E7EB] dark:border-gray-700 rotate-45" />

          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-bold text-[#111827] dark:text-white flex items-center gap-1.5">
              <Icon name="sticky_note_2" size={16} className="text-[#6D3EEB]" />
              {title}
            </span>
            <span className="text-[11px] text-[#9CA3AF] hover:text-[#6D3EEB]">
              Nhấp để sửa
            </span>
          </div>
          <p className="text-[13px] text-[#374151] dark:text-gray-200 leading-relaxed whitespace-pre-wrap break-words">
            {note}
          </p>
        </div>
      )}

      {/* 2. EDIT POPOVER (Matching Image 2 - Dark sleek card with arrow & Enter to save) */}
      {isEditOpen && (
        <div className="absolute left-0 top-full mt-3 w-80 p-4 bg-[#111827] dark:bg-[#0B0F19] rounded-[16px] shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-[#1F2937] dark:border-[#2D3748] z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Top Arrow pointing up to the button */}
          <div className="absolute -top-2 left-6 w-4 h-4 bg-[#111827] dark:bg-[#0B0F19] border-t border-l border-[#1F2937] dark:border-[#2D3748] rotate-45" />

          {/* Header */}
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-[14px] font-bold text-white tracking-tight">
              {title}
            </span>
            <span className="text-[12px] font-normal text-[#9CA3AF]">
              Enter để lưu
            </span>
          </div>

          {/* Textarea */}
          <div className="relative z-10">
            <textarea
              value={tempNote}
              onChange={e => setTempNote(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập ghi chú..."
              rows={3}
              autoFocus
              className="w-full text-[13px] p-3 rounded-[10px] bg-[#0A0D14] dark:bg-[#06080D] border border-[#232D3F] text-white placeholder-[#6B7280] focus:outline-none focus:border-[#6D3EEB] focus:ring-1 focus:ring-[#6D3EEB] resize-none leading-relaxed transition-colors"
            />
          </div>

          {/* Footer Save Button */}
          <div className="flex items-center justify-end mt-3 relative z-10">
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 bg-white hover:bg-gray-100 text-[#111827] text-[13px] font-bold rounded-[8px] transition-colors shadow-sm cursor-pointer active:scale-95"
            >
              Lưu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

