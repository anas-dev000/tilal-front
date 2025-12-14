import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Home,
  CreditCard,
  Edit,
} from "lucide-react";
import { format } from "date-fns";
import Loading from "../../components/common/Loading";
import { clientsAPI, sitesAPI, tasksAPI } from "../../services/api";
import ClientStatsGrid from "../../components/client/ClientStatsGrid";
import ClientSitesList from "../../components/client/ClientSitesList";

const ClientDetails = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [sites, setSites] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientRes, sitesRes, tasksRes] = await Promise.all([
          clientsAPI.getClient(id),
          sitesAPI.getAllSites({ client: id }),
          tasksAPI.getTasks({ client: id }),
        ]);

        setClient(clientRes.data.data);
        setSites(sitesRes.data.data || []);
        setTasks(tasksRes.data.data || []);
      } catch (err) {
        console.error("Error fetching client details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <Loading fullScreen />;
  if (!client) return <div className="text-center py-12">Client not found</div>;

  // Calculate tasks this month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const tasksThisMonth = tasks.filter((task) => {
    const taskDate = new Date(task.createdAt);
    return (
      taskDate.getMonth() === currentMonth &&
      taskDate.getFullYear() === currentYear
    );
  }).length;

  // Recent tasks (last 5)
  const recentTasks = tasks.slice(0, 5);

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      assigned: "bg-blue-100 text-blue-800",
      "in-progress": "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/clients"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
            <p className="text-gray-600 mt-1">Client Details</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              client.status === "active"
                ? "bg-green-100 text-green-800"
                : client.status === "inactive"
                ? "bg-gray-100 text-gray-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {client.status === "active" && " Active"}
            {client.status === "inactive" && "⏸ Inactive"}
            {client.status === "suspended" && " Suspended"}
          </span>
          {/* 
          <Link
            to={`/admin/clients?edit=${client._id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Client
          </Link> */}
        </div>
      </div>

      {/* Stats Grid */}
      <ClientStatsGrid
        client={client}
        totalTasks={tasks.length}
        totalSites={sites.length}
        tasksThisMonth={tasksThisMonth}
      />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <a
                    href={`mailto:${client.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {client.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <a href={`tel:${client.phone}`} className="text-gray-900">
                    {client.phone}
                  </a>
                </div>
              </div>

              {client.whatsapp && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">WhatsApp</p>
                    <a
                      href={`https://wa.me/${client.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline"
                    >
                      {client.whatsapp}
                    </a>
                  </div>
                </div>
              )}

              {client.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-gray-900">
                      {client.address.street}
                      {client.address.city && `, ${client.address.city}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Property Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Property Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Home className="w-4 h-4" />
                  <span className="text-sm">Property Type</span>
                </div>
                <span className="font-medium capitalize">
                  {client.propertyType === "residential"
                    ? " House"
                    : " Building"}
                </span>
              </div>

              {client.propertySize > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Property Size</span>
                  <span className="font-medium">{client.propertySize}m²</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-sm">Payment Type</span>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    (client.paymentType || "online") === "cash"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {(client.paymentType || "online") === "cash"
                    ? " Cash"
                    : " Online"}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="text-sm font-medium">
                  {format(new Date(client.createdAt), "dd MMM yyyy")}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {client.notes && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-3">Notes</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap">
                {client.notes}
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Sites & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sites List */}
          <ClientSitesList sites={sites} />

          {/* Recent Tasks */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Tasks</h3>
              {tasks.length > 5 && (
                <Link
                  to={`/admin/tasks?client=${client._id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View all {tasks.length} tasks →
                </Link>
              )}
            </div>

            {recentTasks.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No tasks assigned yet
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {recentTasks.map((task) => (
                  <Link
                    key={task._id}
                    to={`/admin/tasks/${task._id}`}
                    className="block p-6 hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {task.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          {task.site?.name && <span>📍 {task.site.name}</span>}
                          {task.worker?.name && (
                            <span>👷 {task.worker.name}</span>
                          )}
                          <span>
                            📅{" "}
                            {format(
                              new Date(task.scheduledDate),
                              "dd MMM yyyy"
                            )}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ml-4 shrink-0 ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;
