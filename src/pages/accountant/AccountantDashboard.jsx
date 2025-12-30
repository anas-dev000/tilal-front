// src/pages/accountant/AccountantDashboard.jsx
import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import Loading from "../../components/common/Loading";
import InvoiceStats from "../../components/admin/InvoiceStats";
import PaymentAlerts from "../../components/admin/PaymentAlerts";
import { useInvoiceStats, usePaymentAlerts } from "../../hooks/queries/useInvoices";

const AccountantDashboard = () => {
  const { t } = useTranslation();

  const { data: invoiceStats, isLoading: invoiceStatsLoading } = useInvoiceStats();
  const { data: paymentAlerts, isLoading: alertsLoading } = usePaymentAlerts();

  const isLoading = invoiceStatsLoading || alertsLoading;

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">{t("accountant.dashboard")}</h1>

      {/* Invoice Statistics */}
      {invoiceStats && (
        <InvoiceStats 
          stats={invoiceStats} 
          monthlyBreakdown={invoiceStats.monthlyBreakdown}
        />
      )}

      {/* Payment Alerts */}
      {paymentAlerts && <PaymentAlerts alerts={paymentAlerts} />}
    </div>
  );
};

export default memo(AccountantDashboard);
