// src/pages/admin/WorkerDetails.jsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Edit, Power } from "lucide-react";
import Loading from "../../components/common/Loading";
import WorkerStatsGrid from "../../components/workers/WorkerStatsGrid";
import WorkerTaskList from "../../components/workers/WorkerTaskList";
import { usersAPI, tasksAPI } from "../../services/api";

const WorkerDetails = () => {
  const { id } = useParams();
  const [worker, setWorker] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [workerRes, tasksRes] = await Promise.all([
          usersAPI.getUser(id),
          tasksAPI.getTasks({ worker: id }),
        ]);
        setWorker(workerRes.data.data);
        setTasks(tasksRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <Loading fullScreen />;
  if (!worker) return <div>Worker not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/workers" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold">{worker.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gray-200 border-2 border-dashed rounded-full w-24 h-24 sm:w-12 sm:h-12 flex items-center justify-center shrink-0">
                <span className="text-green-600 font-semibold text-base sm:text-lg">
                  {worker?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{worker.name}</h2>
                <p className="text-gray-600">{worker.email}</p>
                <p className="text-sm text-gray-500">{worker.phone}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span
                  className={`font-medium ${
                    worker.isActive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {worker.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Join Date</span>
                <span>{new Date(worker.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <WorkerStatsGrid worker={worker} totalTasks={tasks.length} />
          <WorkerTaskList tasks={tasks} />
        </div>
      </div>
    </div>
  );
};

export default WorkerDetails;
