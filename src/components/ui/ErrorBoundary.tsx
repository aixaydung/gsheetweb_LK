import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Icon } from './Icon';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-[#1E293B] rounded-[16px] border border-[#F1F2F5] dark:border-[#334155] p-6 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
              <Icon name="warning" size={28} />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-[#111827] dark:text-[#F8FAFC]">
                {this.props.fallbackTitle || 'Đã xảy ra lỗi hiển thị'}
              </h3>
              <p className="text-[13px] text-[#6B7280] dark:text-[#94A3B8] mt-1.5">
                Hệ thống ghi nhận sự cố khi tải trang này. Bạn có thể bấm nút bên dưới để tải lại.
              </p>
              {this.state.error && (
                <div className="mt-3 p-2.5 bg-gray-50 dark:bg-[#0F172A] rounded-[8px] text-[11px] font-mono text-rose-600 text-left overflow-x-auto max-h-24">
                  {this.state.error.message}
                </div>
              )}
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 bg-[#6D3EEB] hover:bg-[#5B2BD6] text-white text-[13px] font-semibold rounded-[10px] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Icon name="refresh" size={16} />
                <span>Tải lại trang</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
