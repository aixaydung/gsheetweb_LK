import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Icon } from '../components/ui/Icon';

export const ProfileView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Hồ sơ cá nhân"
        subtitle="Quản lý tài khoản quản trị viên và phiên làm việc"
      />

      <div className="bg-white rounded-[20px] p-6 border border-[#F1F2F5] shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#6D3EEB] to-[#A855F7] flex items-center justify-center text-white text-2xl font-bold shadow-md">
            LK
          </div>
          <div>
            <h3 className="text-[18px] font-bold text-[#111827]">Quản trị viên LK ERP</h3>
            <p className="text-[13px] text-[#6B7280]">admin@lkerp.vn</p>
            <span className="inline-block mt-1 text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669]">
              Vai trò: Quản trị cấp cao (Admin)
            </span>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-[#F1F2F5] text-[13.5px]">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-[#6B7280]">Hệ thống:</span>
            <span className="font-semibold text-[#111827]">LK ERP v2.0 Enterprise</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-[#6B7280]">Ngôn ngữ:</span>
            <span className="font-medium text-[#111827]">Tiếng Việt (100%)</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-[#6B7280]">Tiền tệ mặc định:</span>
            <span className="font-medium text-[#111827]">Việt Nam Đồng (VND - đ)</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-[#6B7280]">Múi giờ:</span>
            <span className="font-medium text-[#111827]">Asia/Ho_Chi_Minh (GMT+7)</span>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => alert('Mật khẩu của bạn an toàn.')}
            className="px-4 py-2 border border-[#E5E7EB] hover:border-[#6D3EEB] text-[#1F2937] hover:bg-[#F9F5FF] text-[13.5px] font-semibold rounded-[12px] flex items-center gap-2 transition-colors"
          >
            <Icon name="lock" size={18} />
            <span>Đổi mật khẩu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
