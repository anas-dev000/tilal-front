import { CheckCircle, Clock, Star } from "lucide-react";

const WorkerStatsGrid = ({ worker, totalTasks }) => {
  const stats = [
    {
      label: "Total Tasks",
      value: totalTasks || 0,
      icon: CheckCircle,
      color: "text-blue-600",
    },
    {
      label: "Completed",
      value: worker.workerDetails?.completedTasks || 0,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      label: "Rating",
      value: worker.workerDetails?.rating?.toFixed(1) || "0.0",
      icon: Star,
      color: "text-yellow-600",
    },
    {
      label: "Join Date",
      value: new Date(worker.createdAt).toLocaleDateString(),
      icon: Clock,
      color: "text-gray-600",
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
            <stat.icon className={`w-8 h-8 ${stat.color}`} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkerStatsGrid;
