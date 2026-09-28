import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';

interface NoteCellProps {
  note?: string;
  onSave: (newNote: string) => void;
  title?: string;
}

export const NoteCell: React.FC<NoteCellProps> = ({ note = '', onSave, title = 'Ghi chú' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempNote, setTempNote] = useState(note);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempNote(note);
  }, [note]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSave(tempNote);
      setIsOpen(false);
    }
  };

  const handleSave = () => {
    onSave(tempNote);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {note ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          title={note}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[#F9F5FF] border border-[#E9D5FF] text-[#6317D6] text-[12.5px] font-medium max-w-[170px] hover:bg-[#F3EBFE] transition-colors text-left"
        >
          <Icon name="sticky_note_2" size={15} className="shrink-0 text-[#6D3EEB]" />
          <span className="truncate">{note}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          title="Thêm ghi chú"
          className="w-8 h-8 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#9CA3AF] hover:text-[#6D3EEB] hover:border-[#6D3EEB] hover:bg-[#F9F5FF] transition-all"
        >
          <Icon name="sticky_note_2" size={16} />
        </button>
      )}

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-72 p-3 bg-white rounded-[16px] shadow-[0_12px_32px_rgba(16,24,40,0.14)] border border-[#E5E7EB] z-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-semibold text-[#111827] flex items-center gap-1.5">
              <Icon name="sticky_note_2" size={16} className="text-[#6D3EEB]" />
              {title}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[#9CA3AF] hover:text-[#111827]"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
          <textarea
            value={tempNote}
            onChange={e => setTempNote(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập ghi chú... (Enter để lưu)"
            rows={3}
            autoFocus
            className="w-full text-[13px] p-2.5 rounded-[10px] border border-[#E5E7EB] focus:outline-none focus:border-[#6D3EEB] focus:ring-1 focus:ring-[#6D3EEB] resize-none"
          />
          <div className="flex items-center justify-between mt-2 pt-1 text-[11px] text-[#9CA3AF]">
            <span>Enter để lưu, Shift+Enter xuống dòng</span>
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-1 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[12px] font-semibold rounded-[8px] transition-colors"
            >
              Lưu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
