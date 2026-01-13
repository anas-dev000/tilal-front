import { CheckCircle, MapPin, Calendar, DollarSign } from "lucide-react";

const ClientStatsGrid = ({ client, totalTasks, totalSites, tasksThisMonth = 0 }) => {
  const stats = [
    {
      label: "Total Tasks",
      value: totalTasks || client.totalTasks || 0,
      icon: CheckCircle,
      color: "text-blue-600",
      bg: "bg-blue-100"
    },
    {
      label: "Completed",
      value: client.completedTasks || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-100"
    },
    {
      label: "Sites",
      value: totalSites || client.sites?.length || 0,
      icon: MapPin,
      color: "text-purple-600",
      bg: "bg-purple-100"
    },
    {
      label: "This Month",
      value: tasksThisMonth,
      icon: Calendar,
      color: "text-orange-600",
      bg: "bg-orange-100"
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stat.value}
              </p>
            </div>
            <div className={`p-3 rounded-full ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClientStatsGrid;