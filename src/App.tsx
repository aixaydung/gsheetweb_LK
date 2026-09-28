import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/shell/Sidebar';
import { Header } from './components/shell/Header';
import { MobileBottomNav } from './components/shell/MobileBottomNav';
import { QuickCreateModal } from './components/dialogs/QuickCreateModal';
import { GlobalSearchModal } from './components/dialogs/GlobalSearchModal';
import { AlertsPopover } from './components/dialogs/AlertsPopover';
import { NotificationsModal } from './components/dialogs/NotificationsModal';
import { ImportDialog } from './components/dialogs/ImportDialog';
import { PrintDialog } from './components/dialogs/PrintDialog';

import { InvoiceFormModal } from './components/forms/InvoiceFormModal';
import { PurchaseOrderFormModal } from './components/forms/PurchaseOrderFormModal';
import { QuotationFormModal } from './components/forms/QuotationFormModal';
import { SalesReturnFormModal } from './components/forms/SalesReturnFormModal';
import { PurchaseReturnFormModal } from './components/forms/PurchaseReturnFormModal';
import { PaymentAllocationModal } from './components/forms/PaymentAllocationModal';
import { ProductFormModal } from './components/forms/ProductFormModal';
import { CustomerFormModal } from './components/forms/CustomerFormModal';
import { SupplierFormModal } from './components/forms/SupplierFormModal';
import { StocktakeFormModal } from './components/forms/StocktakeFormModal';

import { DashboardView } from './views/DashboardView';
import { SalesView } from './views/SalesView';
import { PurchaseView } from './views/PurchaseView';
import { WarehouseView } from './views/WarehouseView';
import { DebtView } from './views/DebtView';
import { ReportView } from './views/ReportView';
import { SettingsView } from './views/SettingsView';
import { ProfileView } from './views/ProfileView';
import { CashbookView } from './views/CashbookView';

import { Product } from './types';

function AppContent() {
  const { recentTabs, addRecentTab, alerts, notifications } = useApp();

  // Route & Tab management
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [currentTab, setCurrentTab] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'tong-quan';
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Dialog States
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Form Modal States
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [isCreatePOOpen, setIsCreatePOOpen] = useState(false);
  const [isCreateQuoteOpen, setIsCreateQuoteOpen] = useState(false);
  const [isCreateSalesReturnOpen, setIsCreateSalesReturnOpen] = useState(false);
  const [isCreatePurchaseReturnOpen, setIsCreatePurchaseReturnOpen] = useState(false);
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isCreateCustomerOpen, setIsCreateCustomerOpen] = useState(false);
  const [isCreateSupplierOpen, setIsCreateSupplierOpen] = useState(false);
  const [isStocktakeOpen, setIsStocktakeOpen] = useState(false);

  // Payment allocation modal
  const [paymentModalState, setPaymentModalState] = useState<{
    isOpen: boolean;
    partnerId?: string;
    docId?: string;
    direction: 'in' | 'out';
  }>({
    isOpen: false,
    direction: 'in',
  });

  // Print Dialog State
  const [printDocState, setPrintDocState] = useState<{
    isOpen: boolean;
    type: string;
    code: string;
    doc: any;
  }>({
    isOpen: false,
    type: 'HÓA ĐƠN BÁN HÀNG',
    code: '',
    doc: null,
  });

  // Handle URL change
  const navigateTo = (pathWithQuery: string) => {
    const [path, queryString] = pathWithQuery.split('?');
    const params = new URLSearchParams(queryString || '');
    const tab = params.get('tab') || 'tong-quan';

    setCurrentPath(path);
    setCurrentTab(tab);

    const newUrl = `${path}${queryString ? `?${queryString}` : ''}`;
    window.history.pushState({}, '', newUrl);

    // Track in Recent Tabs (MỞ GẦN ĐÂY)
    const moduleNames: Record<string, string> = {
      '/': 'Tổng quan',
      '/ban-hang': 'Bán hàng',
      '/mua-hang': 'Mua hàng',
      '/kho-hang': 'Kho hàng',
      '/so-quy': 'Sổ quỹ',
      '/cong-no': 'Công nợ',
      '/bao-cao': 'Báo cáo',
      '/cai-dat': 'Cài đặt',
      '/ho-so': 'Hồ sơ',
    };

    const tabNames: Record<string, string> = {
      'tong-quan': 'Tổng quan',
      'khach-hang': 'Khách hàng',
      'bao-gia': 'Báo giá',
      'tra-hang': 'Trả hàng',
      'cong-no': 'Công nợ KH',
      'don-dat-hang': 'Đơn đặt hàng',
      'nha-cung-cap': 'Nhà cung cấp',
      'tra-hang-ncc': 'Trả hàng NCC',
      'cong-no-ncc': 'Công nợ NCC',
      'nhap-kho': 'Nhập kho',
      'xuat-kho': 'Xuất kho',
      'kiem-ke': 'Kiểm kê',
      'lich-su': 'Lịch sử kho',
      'khach-hang-no': 'Khách hàng nợ',
      'no-ncc': 'Nợ NCC',
      'phai-thu': 'Chi tiết phải thu',
      'phai-tra': 'Chi tiết phải trả',
      'dong-tien': 'Dòng tiền 30 ngày',
      'lich-su-thanh-toan': 'Lịch sử thanh toán',
      'qua-han': 'Quá hạn',
      'tong-hop': 'Tổng hợp',
      'ton-kho': 'Tồn kho',
      'top-san-pham': 'Top sản phẩm',
      'top-khach-hang': 'Top khách hàng',
      'top-ncc': 'Top NCC',
      'thong-tin-doanh-nghiep': 'Thông tin DN',
      'chi-nhanh-kho': 'Chi nhánh & Kho',
      'vietqr-ngan-hang': 'VietQR & Ngân hàng',
      'mau-in-chung-tu': 'Mẫu in & Chứng từ',
      'nghiep-vu-ban-hang': 'Thiết lập Bán hàng',
      'nghiep-vu-mua-kho': 'Quản lý Kho & Tồn',
      'chinh-sach-cong-no': 'Chính sách Công nợ',
      'bieu-thue-vat': 'Biểu thuế GTGT',
      'ma-ngan-hang-napas': 'Mã định danh NH',
      'quy-chuan-ma-barcode': 'Quy chuẩn Mã & Barcode',
      'quy-trinh-chung-tu': 'Sơ đồ luân chuyển ERP',
      'he-thong-tai-khoan': 'Hệ thống tài khoản TT200',
      'tai-khoan-nhan-vien': 'Tài khoản & Phân quyền',
      'nhat-ky-audit': 'Nhật ký hệ thống',
      'roadmap-modules': 'Lộ trình Nâng cấp',
    };

    if (path !== '/') {
      const mod = moduleNames[path] || 'Module';
      const tb = tabNames[tab] || tab;
      addRecentTab({
        module: mod,
        tab,
        label: `${mod} › ${tb}`,
        url: newUrl,
      });
    }
  };

  const handleTabChange = (newTab: string) => {
    navigateTo(`${currentPath}?tab=${newTab}`);
  };

  // Keyboard shortcut listener for Ctrl+K and Quick Create
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputFocused =
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT';

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      } else if (!isInputFocused && e.key.toLowerCase() === 'n' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsQuickCreateOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Quick create handler
  const handleQuickCreateAction = (actionKey: string) => {
    switch (actionKey) {
      case 'invoice':
        setIsCreateInvoiceOpen(true);
        break;
      case 'purchase_order':
        setIsCreatePOOpen(true);
        break;
      case 'sales_return':
        setIsCreateSalesReturnOpen(true);
        break;
      case 'payment':
        setPaymentModalState({ isOpen: true, direction: 'in' });
        break;
      case 'payment_out':
        setPaymentModalState({ isOpen: true, direction: 'out' });
        break;
      case 'product':
        setProductToEdit(null);
        setIsCreateProductOpen(true);
        break;
      case 'customer':
        setIsCreateCustomerOpen(true);
        break;
      case 'supplier':
        setIsCreateSupplierOpen(true);
        break;
      case 'quotation':
        setIsCreateQuoteOpen(true);
        break;
    }
  };

  const handlePrintDocument = (type: string, code: string, doc: any) => {
    setPrintDocState({
      isOpen: true,
      type,
      code,
      doc,
    });
  };

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* Sidebar (240px) */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={navigateTo}
        recentTabs={recentTabs}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 lg:pl-[240px] flex flex-col min-w-0">
        {/* Header */}
        <Header
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenQuickCreate={() => setIsQuickCreateOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAlerts={() => setIsAlertsOpen(prev => !prev)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          unreadCount={unreadNotifsCount}
          alertCount={alerts.totalBadgeCount}
          onNavigate={navigateTo}
        />

        {/* Content Container (Full width, minimized horizontal padding for larger workspace) */}
        <main className="flex-1 w-full max-w-full mx-auto p-2 sm:px-4 sm:py-4 lg:px-6 lg:py-6 pb-24 lg:pb-6">
          {currentPath === '/' && (
            <DashboardView
              onNavigate={navigateTo}
              onOpenQuickCreate={() => setIsQuickCreateOpen(true)}
            />
          )}

          {currentPath === '/ban-hang' && (
            <SalesView
              currentTab={currentTab}
              onTabChange={handleTabChange}
              onOpenCreateInvoice={() => setIsCreateInvoiceOpen(true)}
              onOpenCreateQuotation={() => setIsCreateQuoteOpen(true)}
              onOpenCreateReturn={() => setIsCreateSalesReturnOpen(true)}
              onOpenCreateCustomer={() => setIsCreateCustomerOpen(true)}
              onOpenPaymentAllocation={(cust, inv) =>
                setPaymentModalState({ isOpen: true, partnerId: cust, docId: inv, direction: 'in' })
              }
              onPrintDocument={handlePrintDocument}
            />
          )}

          {currentPath === '/mua-hang' && (
            <PurchaseView
              currentTab={currentTab}
              onTabChange={handleTabChange}
              onOpenCreatePO={() => setIsCreatePOOpen(true)}
              onOpenCreateReturn={() => setIsCreatePurchaseReturnOpen(true)}
              onOpenCreateSupplier={() => setIsCreateSupplierOpen(true)}
              onOpenPaymentAllocation={(sup, po) =>
                setPaymentModalState({ isOpen: true, partnerId: sup, docId: po, direction: 'out' })
              }
              onPrintDocument={handlePrintDocument}
            />
          )}

          {currentPath === '/kho-hang' && (
            <WarehouseView
              currentTab={currentTab}
              onTabChange={handleTabChange}
              onOpenCreateProduct={() => {
                setProductToEdit(null);
                setIsCreateProductOpen(true);
              }}
              onOpenEditProduct={prod => {
                setProductToEdit(prod);
                setIsCreateProductOpen(true);
              }}
              onOpenImportDialog={() => setIsImportOpen(true)}
              onOpenStocktakeModal={() => setIsStocktakeOpen(true)}
              onOpenStockVoucherModal={dir => {
                if (dir === 'in') setIsCreatePOOpen(true);
                else setIsCreateInvoiceOpen(true);
              }}
            />
          )}

          {currentPath === '/so-quy' && (
            <CashbookView
              onOpenCreateReceipt={() =>
                setPaymentModalState({ isOpen: true, direction: 'in' })
              }
              onOpenCreatePayment={() =>
                setPaymentModalState({ isOpen: true, direction: 'out' })
              }
            />
          )}

          {currentPath === '/cong-no' && (
            <DebtView
              currentTab={currentTab}
              onTabChange={handleTabChange}
              onOpenPaymentAllocation={(pId, dId, dir) =>
                setPaymentModalState({
                  isOpen: true,
                  partnerId: pId,
                  docId: dId,
                  direction: dir || 'in',
                })
              }
            />
          )}

          {currentPath === '/bao-cao' && (
            <ReportView currentTab={currentTab} onTabChange={handleTabChange} />
          )}

          {currentPath === '/cai-dat' && (
            <SettingsView currentTab={currentTab} onTabChange={handleTabChange} />
          )}

          {currentPath === '/ho-so' && <ProfileView />}
        </main>

        {/* Professional Mobile Bottom Navigation Bar */}
        <MobileBottomNav
          currentPath={currentPath}
          onNavigate={navigateTo}
          onOpenQuickCreate={() => setIsQuickCreateOpen(true)}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        />
      </div>

      {/* Global Dialogs & Modals */}
      <QuickCreateModal
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
        onSelectAction={handleQuickCreateAction}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={navigateTo}
      />

      <AlertsPopover
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        onNavigate={navigateTo}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigate={navigateTo}
      />

      <ImportDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />

      {/* Form Modals */}
      <InvoiceFormModal
        isOpen={isCreateInvoiceOpen}
        onClose={() => setIsCreateInvoiceOpen(false)}
        onSaveAndPrint={code => alert(`Đã tạo và sẵn sàng in hóa đơn ${code}!`)}
      />

      <PurchaseOrderFormModal
        isOpen={isCreatePOOpen}
        onClose={() => setIsCreatePOOpen(false)}
        onSaveAndPrint={code => alert(`Đã tạo và sẵn sàng in phiếu mua ${code}!`)}
      />

      <QuotationFormModal
        isOpen={isCreateQuoteOpen}
        onClose={() => setIsCreateQuoteOpen(false)}
        onSaveAndPrint={code => alert(`Đã tạo và sẵn sàng in báo giá ${code}!`)}
      />

      <SalesReturnFormModal
        isOpen={isCreateSalesReturnOpen}
        onClose={() => setIsCreateSalesReturnOpen(false)}
      />

      <PurchaseReturnFormModal
        isOpen={isCreatePurchaseReturnOpen}
        onClose={() => setIsCreatePurchaseReturnOpen(false)}
      />

      <PaymentAllocationModal
        isOpen={paymentModalState.isOpen}
        direction={paymentModalState.direction}
        initialPartnerId={paymentModalState.partnerId}
        initialDocId={paymentModalState.docId}
        onClose={() => setPaymentModalState({ isOpen: false, direction: 'in' })}
      />

      <ProductFormModal
        isOpen={isCreateProductOpen}
        productToEdit={productToEdit}
        onClose={() => {
          setIsCreateProductOpen(false);
          setProductToEdit(null);
        }}
      />

      <CustomerFormModal
        isOpen={isCreateCustomerOpen}
        onClose={() => setIsCreateCustomerOpen(false)}
      />

      <SupplierFormModal
        isOpen={isCreateSupplierOpen}
        onClose={() => setIsCreateSupplierOpen(false)}
      />

      <StocktakeFormModal
        isOpen={isStocktakeOpen}
        onClose={() => setIsStocktakeOpen(false)}
      />

      {/* Print / Preview Dialog */}
      {printDocState.isOpen && (
        <PrintDialog
          isOpen={printDocState.isOpen}
          onClose={() => setPrintDocState(prev => ({ ...prev, isOpen: false }))}
          documentType={printDocState.type}
          code={printDocState.code}
          date={printDocState.doc?.invoice_date || printDocState.doc?.order_date || new Date().toISOString()}
          partnerName={printDocState.doc?.customer_name || printDocState.doc?.supplier_name}
          partnerPhone={printDocState.doc?.customer_phone || printDocState.doc?.phone}
          items={
            printDocState.doc?.items || [
              {
                sku: 'CP001',
                product_name: 'Cà phê rang xay Robusta thượng hạng',
                unit: 'kg',
                quantity: 1,
                unit_price: 120000,
                line_total: 120000,
              },
            ]
          }
          subtotal={printDocState.doc?.subtotal || 120000}
          discountAmount={printDocState.doc?.discount_amount || 0}
          vatAmount={printDocState.doc?.vat_amount || 0}
          shippingFee={printDocState.doc?.shipping_fee || 0}
          total={printDocState.doc?.total || 120000}
          paidAmount={printDocState.doc?.paid_amount || 0}
          debtAmount={printDocState.doc?.debt_amount || 0}
          note={printDocState.doc?.note}
        />
      )}
    </div>
  );
}

import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './views/LoginView';
import { PendingApprovalView } from './views/PendingApprovalView';
import { BlockedUserView } from './views/BlockedUserView';
import { GoogleOAuthProvider } from '@react-oauth/google';

function AppContentWrapper() {
  const { user, isAuthenticated, isLoading, logout, checkSession } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }
  
  if (!isAuthenticated || !user) {
    return <LoginView />;
  }

  if (user.status === 'pending') {
    return <PendingApprovalView user={user} onRefresh={checkSession} onLogout={logout} />;
  }

  if (user.status === 'blocked') {
    return <BlockedUserView user={user} onLogout={logout} />;
  }
  
  return <AppContent />;
}

export default function App() {
  // Use Vite env variable
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id';
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <AppProvider>
          <AppContentWrapper />
        </AppProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
