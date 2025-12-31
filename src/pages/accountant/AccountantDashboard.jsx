// src/pages/accountant/AccountantDashboard.jsx
import React, { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Lock } from "lucide-react";
import Loading from "../../components/common/Loading";
import InvoiceStats from "../../components/admin/InvoiceStats";
import PaymentAlerts from "../../components/admin/PaymentAlerts";
import ChangePasswordModal from "../../components/common/ChangePasswordModal";
import Button from "../../components/common/Button";
import { useInvoiceStats, usePaymentAlerts } from "../../hooks/queries/useInvoices";

const AccountantDashboard = () => {
  const { t } = useTranslation();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const { data: invoiceStats, isLoading: invoiceStatsLoading } = useInvoiceStats();
  const { data: paymentAlerts, isLoading: alertsLoading } = usePaymentAlerts();

  const isLoading = invoiceStatsLoading || alertsLoading;

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t("accountant.dashboard")}</h1>
        <Button 
          variant="outline" 
          icon={Lock} 
          onClick={() => setIsPasswordModalOpen(true)}
        >
          {t("auth.changePassword", "Change Password")}
        </Button>
      </div>

      {/* Invoice Statistics */}
      {invoiceStats && (
        <InvoiceStats 
          stats={invoiceStats} 
          monthlyBreakdown={invoiceStats.monthlyBreakdown}
        />
      )}

      {/* Payment Alerts */}
      {paymentAlerts && <PaymentAlerts alerts={paymentAlerts} />}

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </div>
  );
};

export default memo(AccountantDashboard);
