// src/pages/admin/Dashboard.jsx - ENHANCED WITH INVOICE STATS
import { useMemo, memo } from "react";
import { useTranslation } from "react-i18next";
import {
  Users,
  Briefcase,
  CheckSquare,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

// React Query hooks
import { useDashboardStats } from "../../hooks/queries/useReports";
import { useLowStockItems } from "../../hooks/queries/useInventory";
import { useInvoiceStats, usePaymentAlerts } from "../../hooks/queries/useInvoices";

import StatCard from "../../components/common/StatCard";
import Card from "../../components/common/Card";
import Loading from "../../components/common/Loading";
import InvoiceStats from "../../components/admin/InvoiceStats";
import PaymentAlerts from "../../components/admin/PaymentAlerts";

const Dashboard = () => {
  const { t } = useTranslation();

  // Data fetching with React Query
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: lowStockItems = [], isLoading: inventoryLoading } =
    useLowStockItems();
  const { data: invoiceStats, isLoading: invoiceStatsLoading } = useInvoiceStats();
  const { data: paymentAlerts, isLoading: alertsLoading } = usePaymentAlerts();

  const isLoading = statsLoading || inventoryLoading || invoiceStatsLoading || alertsLoading;

  // Memoized values
  const hasLowStock = useMemo(() => lowStockItems.length > 0, [lowStockItems]);

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">{t("admin.title")}</h1>

      {/* General Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t("admin.stats.totalClients")}
          value={stats?.clients?.total || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          title={t("admin.stats.totalWorkers")}
          value={stats?.workers?.total || 0}
          icon={Briefcase}
          color="green"
        />
        <StatCard
          title={t("admin.stats.activeTasks")}
          value={stats?.tasks?.inProgress || 0}
          icon={CheckSquare}
          color="yellow"
        />
        <StatCard
          title={t("admin.stats.completedTasks")}
          value={stats?.tasks?.completed || 0}
          icon={CheckCircle}
          color="primary"
        />
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

      {/* Low Stock Alert */}
      <Card title={t("admin.dashboard.lowStockAlerts")}>
        {!hasLowStock ? (
          <div className="text-center py-8">
            <p className="text-green-600 font-medium">
              {t("common.allItemsWellStocked")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {lowStockItems.map((item) => (
              <div
                key={item._id}
                className="flex justify-between items-center p-4 bg-red-50 border-l-4 border-red-500 rounded"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      {t("common.current")}:{" "}
                      <strong>
                        {item.quantity.current} {item.unit}
                      </strong>
                    </p>
                  </div>
                </div>
                <span className="text-red-600 font-bold text-lg">
                  {t("common.lowStock")}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Task Completion Overview */}
      {stats && (
        <Card title={t("admin.dashboard.taskCompletionOverview")}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                {t("admin.dashboard.pendingTasks")}
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.tasks?.pending || 0}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                {t("admin.dashboard.inProgress")}
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.tasks?.inProgress || 0}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                {t("admin.dashboard.completionRate")}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.tasks?.completionRate || 0}%
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default memo(Dashboard);