import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Users,
  Briefcase,
  CheckSquare,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import StatCard from "../../components/common/StatCard";
import Card from "../../components/common/Card";
import { reportsAPI, inventoryAPI } from "../../services/api";
import Loading from "../../components/common/Loading";

const Dashboard = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // ✅ جلب الإحصائيات من Backend
      const statsResponse = await reportsAPI.getDashboardStats();
      setStats(statsResponse.data);

      // ✅ جلب المنتجات منخفضة المخزون (أقل من 5)
      const inventoryResponse = await inventoryAPI.getInventory();
      const items = inventoryResponse.data?.data;
      const allItems = Array.isArray(items) ? items : [];
      // فلترة المنتجات اللي الكمية فيها أقل من 5
      const lowStock = allItems.filter(
        (item) => item.quantity?.current < item.quantity?.minimum
      );
      setLowStockItems(lowStock);
      console.log("Inventory Response:", inventoryResponse);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">{t("admin.title")}</h1>

      {/* ✅ Stats Grid - Real Data */}
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

      {/* ✅ Low Stock Alert - NEW */}
      <Card title="Low Stock Alerts">
        {lowStockItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-green-600 font-medium">
              ✅ All items are well stocked!
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
                      Current:{" "}
                      <strong>
                        {item.quantity.current} {item.unit}
                      </strong>
                    </p>
                  </div>
                </div>
                <span className="text-red-600 font-bold text-lg">
                  Low Stock!
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ✅ Task Completion Overview */}
      {stats && (
        <Card title="📊 Task Completion Overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Pending Tasks</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.tasks?.pending || 0}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.tasks?.inProgress || 0}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Completion Rate</p>
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

export default Dashboard;
