import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  Mail,
  Lock,
  LogIn,
  Eye,
  EyeOff,
  Sun,
  Moon,
  ShieldCheck,
  TrendingUp,
  Database,
  Layers,
  AlertCircle,
  HelpCircle,
  X,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Inline email format validation on blur
  const validateEmail = (val: string) => {
    if (!val) {
      setEmailError('Vui lòng nhập địa chỉ email');
      return false;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(val)) {
      setEmailError('Định dạng email không hợp lệ');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) return;
    if (!password) {
      setError('Vui lòng nhập mật khẩu');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Email hoặc mật khẩu không chính xác');
      }
      login(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Đăng nhập bằng Google thất bại');
      }
      login(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F9FAFB] dark:bg-[#0F172A] transition-colors duration-200">
      {/* ========================================================
          LEFT / BRAND PANEL: 2/3 Width (Desktop ≥ lg only)
          Theo chuẩn /crm-erp-design-system:
          Bố cục 2/3 thương hiệu, chứa visual, dashboard preview, KPI
          ======================================================== */}
      <div className="hidden lg:flex lg:w-7/12 xl:w-2/3 relative overflow-hidden flex-col justify-between p-10 xl:p-14 text-white bg-gradient-to-br from-[#1E1145] via-[#2A1362] to-[#0E0724] border-r border-[#2C1866]/40 select-none">
        {/* Subtle Background Geometric Grid & Glow */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#C084FC_1px,transparent_1px)] [background-size:24px_24px]" />
        
        {/* Ambient Glow Lights */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#8B5CF6]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#6D3EEB]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header: Brand Identity */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[14px] bg-gradient-to-tr from-[#6D3EEB] to-[#A855F7] flex items-center justify-center text-white shadow-[0_8px_20px_-6px_rgba(109,62,235,0.7)] ring-1 ring-white/20">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[20px] font-black tracking-wider text-white flex items-center gap-2">
                LK ERP <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-purple-200 border border-white/10">v2.0</span>
              </span>
              <p className="text-[12px] text-purple-200/70 font-medium">Hệ thống Điều hành Doanh nghiệp Toàn diện</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[12px] text-purple-100 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>Google Sheets Cloud Database</span>
          </div>
        </div>

        {/* Middle Hero: Value Proposition & Stats Cards */}
        <div className="relative z-10 my-auto py-8 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/15 border border-purple-400/25 text-purple-200 text-[13px] font-semibold mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Vận hành nội bộ thông minh & Thời gian thực
          </div>

          <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight mb-4">
            Quản trị Bán hàng, Tồn kho & Dòng tiền Công nợ Chính xác
          </h1>

          <p className="text-purple-200/80 text-[15px] xl:text-[16px] leading-relaxed mb-8">
            Nền tảng tích hợp tự động hóa quy trình nghiệp vụ từ Đơn hàng, Mua hàng, Nhập xuất kho đến Đối soát công nợ ngân hàng VietQR.
          </p>

          {/* 3 Glassmorphism Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Feature 1 */}
            <div className="p-4 rounded-[16px] bg-white/[0.07] backdrop-blur-md border border-white/10 hover:bg-white/[0.1] transition-all">
              <div className="w-9 h-9 rounded-[10px] bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-white text-[14px] font-bold mb-1">Bán hàng & Doanh thu</h3>
              <p className="text-purple-200/70 text-[12px]">Hóa đơn, báo giá, tích hợp VietQR đối soát tức thì</p>
            </div>

            {/* Feature 2 */}
            <div className="p-4 rounded-[16px] bg-white/[0.07] backdrop-blur-md border border-white/10 hover:bg-white/[0.1] transition-all">
              <div className="w-9 h-9 rounded-[10px] bg-blue-500/20 text-blue-300 flex items-center justify-center mb-3">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-white text-[14px] font-bold mb-1">Kho & Giá vốn FIFO</h3>
              <p className="text-purple-200/70 text-[12px]">Kiểm soát xuất nhập tồn đa kho, cảnh báo mức an toàn</p>
            </div>

            {/* Feature 3 */}
            <div className="p-4 rounded-[16px] bg-white/[0.07] backdrop-blur-md border border-white/10 hover:bg-white/[0.1] transition-all">
              <div className="w-9 h-9 rounded-[10px] bg-purple-500/20 text-purple-300 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-white text-[14px] font-bold mb-1">Bảo mật Đa lớp</h3>
              <p className="text-purple-200/70 text-[12px]">Google OAuth 2.0 SSO, JWT HttpOnly Session phân quyền</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="relative z-10 flex items-center justify-between pt-6 border-t border-white/10 text-[12.5px] text-purple-200/60">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Bản quyền hệ thống nội bộ
            </span>
            <span>•</span>
            <span>Mã hóa TLS 1.3 End-to-End</span>
          </div>
          <div>© 2026 LK ERP Solution</div>
        </div>
      </div>

      {/* ========================================================
          RIGHT / FORM PANEL: 1/3 Width (Desktop) or Full (Mobile)
          Theo chuẩn /crm-erp-design-system:
          Form card sạch sẽ, inline validate, toggle pass, SSO
          ======================================================== */}
      <div className="w-full lg:w-5/12 xl:w-1/3 flex flex-col justify-between p-6 sm:p-10 lg:p-8 xl:p-12 relative min-h-screen">
        {/* Top Header in Form: Theme Toggle */}
        <div className="w-full flex items-center justify-between mb-4">
          {/* Logo visible only on Mobile/Tablet (< lg) */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-tr from-[#6D3EEB] to-[#A855F7] flex items-center justify-center text-white shadow-xs">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <span className="text-[17px] font-black text-[#6D3EEB] dark:text-[#C084FC] tracking-wider">
              LK ERP
            </span>
          </div>

          <div className="hidden lg:block" />

          {/* Theme switcher button */}
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
            className="w-10 h-10 rounded-[12px] bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] text-[#4B5563] dark:text-[#CBD5E1] hover:text-[#111827] dark:hover:text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-[#6B7280]" />
            )}
          </button>
        </div>

        {/* Center: Main Login Form */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-4">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] dark:text-[#F8FAFC]">
              Đăng nhập
            </h2>
            <p className="mt-2 text-[14px] text-[#6B7280] dark:text-[#94A3B8]">
              Nhập tài khoản được cấp hoặc đăng nhập nhanh bằng Google SSO.
            </p>
          </div>

          {/* Error Banner (Chuẩn design system: background soft, border trái đậm, không tiết lộ email tồn tại) */}
          {error && (
            <div className="mb-6 bg-rose-50 dark:bg-rose-950/40 border-l-4 border-rose-500 rounded-r-[10px] p-3.5 text-[13px] text-rose-700 dark:text-rose-300 flex items-start gap-2.5 animate-in fade-in duration-200 shadow-xs">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
              <button
                type="button"
                onClick={() => setError('')}
                className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Google SSO Login Button (Ưu tiên theo chuẩn SSO) */}
          <div className="mb-6">
            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Đăng nhập Google không thành công')}
                theme={theme === 'dark' ? 'filled_black' : 'outline'}
                shape="rectangular"
                size="large"
                text="signin_with"
                width="100%"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E7EB] dark:border-[#334155]" />
            </div>
            <div className="relative flex justify-center text-[12.5px] uppercase font-semibold">
              <span className="px-3 bg-[#F9FAFB] dark:bg-[#0F172A] text-[#9CA3AF] dark:text-[#64748B]">
                Hoặc tài khoản nội bộ
              </span>
            </div>
          </div>

          {/* Standard Email & Password Form */}
          <form className="space-y-4" onSubmit={handlePasswordLogin} noValidate>
            {/* Email Field */}
            <div>
              <label className="block text-[13px] font-semibold text-[#374151] dark:text-[#CBD5E1] mb-1.5">
                Email hoặc Tên đăng nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (emailError) validateEmail(e.target.value);
                  }}
                  onBlur={() => validateEmail(email)}
                  disabled={isLoading}
                  className={`w-full h-11 pl-10.5 pr-3.5 bg-white dark:bg-[#1E293B] border ${
                    emailError
                      ? 'border-rose-500 focus:ring-rose-500'
                      : 'border-[#E5E7EB] dark:border-[#334155] focus:border-[#6D3EEB] focus:ring-[#6D3EEB]/20'
                  } rounded-[12px] text-[14px] text-[#111827] dark:text-[#F8FAFC] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-3 transition-all shadow-xs`}
                  placeholder="admin@lkerp.vn"
                  autoComplete="username"
                />
              </div>
              {emailError && (
                <p className="mt-1 text-[12px] text-rose-500 font-medium">{emailError}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[13px] font-semibold text-[#374151] dark:text-[#CBD5E1]">
                  Mật khẩu
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[12.5px] font-semibold text-[#6D3EEB] dark:text-[#C084FC] hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full h-11 pl-10.5 pr-11 bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-[12px] text-[14px] text-[#111827] dark:text-[#F8FAFC] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#6D3EEB] focus:ring-3 focus:ring-[#6D3EEB]/20 transition-all shadow-xs"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                {/* Password Visibility Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#9CA3AF] hover:text-[#4B5563] dark:hover:text-[#CBD5E1] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-[4px] text-[#6D3EEB] border-gray-300 dark:border-gray-600 focus:ring-[#6D3EEB] cursor-pointer"
                />
                <span className="text-[13px] text-[#4B5563] dark:text-[#CBD5E1]">
                  Ghi nhớ phiên đăng nhập (7 ngày)
                </span>
              </label>
            </div>

            {/* Submit Button (Disable khi loading chống double-submit) */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[#6D3EEB] hover:bg-[#5B2BD6] active:scale-[0.99] text-white text-[14px] font-semibold rounded-[12px] shadow-[0_8px_20px_-6px_rgba(109,62,235,0.55)] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập hệ thống</span>
                  <LogIn className="w-4.5 h-4.5" />
                </>
              )}
            </button>
          </form>

          {/* Account Creation Note */}
          <div className="mt-8 pt-6 border-t border-[#F1F2F5] dark:border-[#334155] text-center">
            <p className="text-[12.5px] text-[#6B7280] dark:text-[#94A3B8]">
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="font-semibold text-[#6D3EEB] dark:text-[#C084FC] hover:underline"
              >
                Liên hệ Quản trị viên (Admin)
              </button>
            </p>
          </div>
        </div>

        {/* Form Footer */}
        <div className="w-full text-center py-2 text-[11.5px] text-[#9CA3AF] dark:text-[#64748B]">
          Được bảo vệ bởi giao thức bảo mật Google Identity Services & JWT Session
        </div>
      </div>

      {/* ========================================================
          MODAL: QUÊN MẬT KHẨU / HỖ TRỢ TRUY CẬP NỘI BỘ
          Theo chuẩn /crm-erp-design-system:
          Hướng dẫn quy trình cấp lại quyền và liên hệ IT Admin
          ======================================================== */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E293B] rounded-[20px] max-w-md w-full p-6 shadow-2xl border border-[#E5E7EB] dark:border-[#334155]">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F2F5] dark:border-[#334155] mb-4">
              <div className="flex items-center gap-2.5 text-[#6D3EEB] dark:text-[#C084FC]">
                <HelpCircle className="w-5 h-5" />
                <h3 className="text-[16px] font-bold text-[#111827] dark:text-[#F8FAFC]">
                  Hỗ trợ tài khoản & Quên mật khẩu
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center justify-center text-[#6B7280]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-[13.5px] text-[#4B5563] dark:text-[#CBD5E1] leading-relaxed">
              <p>
                Hệ thống <strong>LK ERP</strong> là ứng dụng nghiệp vụ nội bộ doanh nghiệp. Mọi tài khoản và phân quyền đều được quản lý bởi Bộ phận Quản trị Hệ thống.
              </p>
              
              <div className="p-3.5 rounded-[12px] bg-[#F9FAFB] dark:bg-slate-800 border border-[#E5E7EB] dark:border-[#334155] space-y-2">
                <div className="font-semibold text-[#111827] dark:text-[#F8FAFC] text-[13px]">
                  📌 Phương thức khôi phục & cấp quyền:
                </div>
                <ul className="list-disc pl-4 space-y-1 text-[12.5px] text-[#6B7280] dark:text-[#94A3B8]">
                  <li>
                    <strong>Đăng nhập Google:</strong> Nếu email của bạn đã được Admin thêm vào Sheet <code>USERS</code>, bạn chỉ cần bấm nút <em>"Đăng nhập với Google"</em> để vào ngay.
                  </li>
                  <li>
                    <strong>Đặt lại mật khẩu trực tiếp:</strong> Vui lòng liên hệ Admin qua email quản trị hoặc kênh nội bộ để cấp lại mật khẩu.
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="h-9.5 px-4 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white rounded-[10px] text-[13px] font-semibold transition-colors cursor-pointer"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default LoginView;
