import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Calendar, TrendingUp, Users, DollarSign, Package, CheckCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { reportsAPI } from '../../services/api';

const Reports = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [workerPerformance, setWorkerPerformance] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [statsRes, weeklyRes, monthlyRes, workersRes] = await Promise.all([
        reportsAPI.getDashboardStats(),
        reportsAPI.getWeeklyReport(),
        reportsAPI.getMonthlyReport(),
        reportsAPI.getWorkerPerformance()
      ]);

      setDashboardStats(statsRes.data.data);
      setWeeklyReport(weeklyRes.data.data);
      setMonthlyReport(monthlyRes.data.data);
      setWorkerPerformance(workersRes.data.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  // Chart Colors
  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Task Status Data
  const taskStatusData = dashboardStats ? [
    { name: t('status.completed'), value: dashboardStats.tasks.completed },
    { name: t('status.inProgress'), value: dashboardStats.tasks.inProgress },
    { name: t('status.pending'), value: dashboardStats.tasks.pending }
  ] : [];

  // Monthly Revenue Data
  const revenueData = monthlyReport?.revenueByCategory || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {t('admin.reports.title')}
          </h1>
          <p className="text-gray-600 mt-1">Comprehensive business analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={Calendar}>
            This Week
          </Button>
          <Button variant="outline" icon={Calendar}>
            This Month
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title={t('admin.stats.totalClients')}
          value={dashboardStats?.clients.total || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          title={t('admin.stats.totalWorkers')}
          value={dashboardStats?.workers.total || 0}
          icon={Users}
          color="green"
        />
        <StatCard
          title={t('admin.stats.activeTasks')}
          value={dashboardStats?.tasks.inProgress || 0}
          icon={CheckCircle}
          color="yellow"
        />
        <StatCard
          title={t('admin.stats.completedTasks')}
          value={dashboardStats?.tasks.completed || 0}
          icon={CheckCircle}
          color="primary"
        />
        <StatCard
          title={t('admin.stats.totalRevenue')}
          value={`$${(dashboardStats?.revenue.total || 0).toLocaleString()}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Pending Invoices"
          value={dashboardStats?.invoices.pending || 0}
          icon={Package}
          color="red"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Completion Rate */}
        <Card title={t('admin.reports.taskCompletion')}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={taskStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {taskStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Completion Rate: <span className="font-bold text-green-600">
                {dashboardStats?.tasks.completionRate || 0}%
              </span>
            </p>
          </div>
        </Card>

        {/* Revenue by Category */}
        <Card title={t('admin.reports.revenueAnalysis')}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalRevenue" fill="#22c55e" name="Revenue ($)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Worker Performance */}
      <Card title={t('admin.reports.workerPerformance')}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Worker Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tasks Completed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Rating
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workerPerformance.map((worker, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {worker.workerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {worker.tasksCompleted}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${(worker.totalRevenue || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {worker.avgRating ? (
                      <span className="flex items-center">
                        <span className="text-yellow-500 mr-1">★</span>
                        {worker.avgRating.toFixed(1)}
                      </span>
                    ) : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Weekly Summary */}
      {weeklyReport && (
        <Card title="Weekly Summary">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Tasks Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {weeklyReport.completedTasks?.count || 0}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Inventory Withdrawals</p>
              <p className="text-2xl font-bold text-blue-600">
                {weeklyReport.inventoryWithdrawals?.count || 0}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Active Workers</p>
              <p className="text-2xl font-bold text-purple-600">
                {weeklyReport.workerPerformance?.length || 0}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Reports;