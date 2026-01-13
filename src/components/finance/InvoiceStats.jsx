// src/components/admin/InvoiceStats.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Card from '../common/Card';
import StatCard from '../common/StatCard';

const InvoiceStats = ({ stats, monthlyBreakdown }) => {
  const { t } = useTranslation();
  if (!stats) return null;

  const { monthly, yearly } = stats;

  // Format monthly breakdown data for chart
  const chartData = monthlyBreakdown?.map(item => ({
    name: `${item._id.month}/${item._id.year}`,
    count: item.count,
    total: item.total
  })) || [];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Monthly Stats */}
        <StatCard
          title={t("accountant.invoiceStats.monthlyPaid")}
          value={`SAR ${(monthly?.paidAmount || 0).toLocaleString()}`}
          icon={DollarSign}
          color="green"
          subtitle={`${monthly?.paidCount || 0} ${t("status.paid")}`}
        />
        <StatCard
          title={t("accountant.invoiceStats.monthlyUnpaid")}
          value={`SAR ${((monthly?.totalAmount || 0) - (monthly?.paidAmount || 0)).toLocaleString()}`}
          icon={DollarSign}
          color="red"
          subtitle={`${(monthly?.totalCount || 0) - (monthly?.paidCount || 0)} ${t("status.unpaid")}`}
        />
        <StatCard
          title={t("accountant.invoiceStats.thisMonth")}
          value={monthly?.totalCount || 0}
          icon={Calendar}
          color="blue"
          subtitle={t("accountant.invoiceStats.count")}
        />

        {/* Yearly Stats */}
        <StatCard
          title={t("accountant.invoiceStats.yearlyPaid")}
          value={`SAR ${(yearly?.paidAmount || 0).toLocaleString()}`}
          icon={DollarSign}
          color="green"
          subtitle={`${yearly?.paidCount || 0} ${t("status.paid")}`}
        />
        <StatCard
          title={t("accountant.invoiceStats.yearlyUnpaid")}
          value={`SAR ${((yearly?.totalAmount || 0) - (yearly?.paidAmount || 0)).toLocaleString()}`}
          icon={DollarSign}
          color="red"
          subtitle={`${(yearly?.totalCount || 0) - (yearly?.paidCount || 0)} ${t("status.unpaid")}`}
        />
        <StatCard
          title={t("accountant.invoiceStats.thisYear")}
          value={yearly?.totalCount || 0}
          icon={TrendingUp}
          color="primary"
          subtitle={t("accountant.invoiceStats.count")}
        />
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card title={t("accountant.invoiceStats.trend")}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="count" fill="#3b82f6" name={t("accountant.invoiceStats.count")} />
              <Bar yAxisId="right" dataKey="total" fill="#22c55e" name={t("accountant.invoiceStats.totalAmount")} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
};

export default InvoiceStats;
