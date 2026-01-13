// src/pages/accountant/AccountantDashboard.jsx
import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import Skeleton, { CardSkeleton } from "../../components/common/Skeleton";
import InvoiceStats from "../../components/finance/InvoiceStats";
import PaymentAlerts from "../../components/finance/PaymentAlerts";
import { useInvoiceStats, usePaymentAlerts } from "../../hooks/queries/useInvoices";

const AccountantDashboard = () => {
  const { t } = useTranslation();

  const { data: invoiceStats, isLoading: invoiceStatsLoading } = useInvoiceStats();
  const { data: paymentAlerts, isLoading: alertsLoading } = usePaymentAlerts();

  const isLoading = invoiceStatsLoading || alertsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="text" width="200px" height="40px" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t("accountant.dashboard")}</h1>
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
    </div>
  );
};

export default memo(AccountantDashboard);
