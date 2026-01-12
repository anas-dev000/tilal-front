// src/pages/admin/ClientDetails.jsx
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Mail,
  Phone,
  MapPin,
  Home,
  CreditCard,
  Edit,
  DollarSign,
  FileText, // Added FileText
} from "lucide-react";
import { format } from "date-fns";
import { useMemo, useCallback, memo } from "react";

// React Query hooks
import { useClient, useClientTasks } from "../../hooks/queries/useClients";
import { useSites } from "../../hooks/queries/useSites";

import Loading from "../../components/common/Loading";
import ClientStatsGrid from "../../components/client/ClientStatsGrid";
import Skeleton, { CardSkeleton, TableSkeleton } from "../../components/common/Skeleton";
import ClientSitesList from "../../components/client/ClientSitesList";
import Modal from "../../components/common/Modal";
import { useState } from "react";

const ClientDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  // Data fetching with React Query
  const { data: client, isLoading: clientLoading, error: clientError } = useClient(id);
  const { data: sitesData, isLoading: sitesLoading } = useSites({ client: id });
  const { data: tasksData, isLoading: tasksLoading } = useClientTasks(id);

  const [isContractOpen, setIsContractOpen] = useState(false);

  const sites = sitesData?.data || [];
  const tasks = tasksData?.data || [];

  const isLoading = clientLoading || sitesLoading || tasksLoading;

  // Calculate tasks this month
  const tasksThisMonth = useMemo(() => {
    if (!tasks.length) return 0;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return tasks.filter((task) => {
      const taskDate = new Date(task.createdAt);
      return (
        taskDate.getMonth() === currentMonth &&
        taskDate.getFullYear() === currentYear
      );
    }).length;
  }, [tasks]);

  // Recent tasks (last 5)
  const recentTasks = useMemo(() => tasks.slice(0, 5), [tasks]);

  const getStatusColor = useCallback((status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      assigned: "bg-blue-100 text-blue-800",
      "in-progress": "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  }, []);

  const getSafePdfUrl = useCallback((url) => {
    if (!url) return null;

    if (url.includes('cloudinary.com')) {
      if (url.includes('/image/upload/')) {
        if (!url.toLowerCase().endsWith('.pdf')) {
          url = `${url}.pdf`;
        }
        url = url.replace('/upload/', '/upload/f_auto,q_auto/');
      }
    }

    if (url.toLowerCase().endsWith('.pdf') && !url.includes('#view=')) {
      url = `${url}#view=FitH`;
    }
    
    return url;
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton variant="text" width="300px" height="48px" />
          <div className="flex gap-2">
            <Skeleton variant="rectangle" width="100px" height="40px" />
            <Skeleton variant="rectangle" width="100px" height="40px" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CardSkeleton className="lg:col-span-1" />
          <div className="lg:col-span-2 space-y-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (clientError || !client)
    return (
      <div className="text-center py-12">
        {t("admin.clientDetails.notFound")}
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
            <p className="text-gray-600 mt-1">
              {t("admin.clientDetails.title")}
            </p>
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
          <Link
            to={`/admin/clients/${client._id}/invoices`}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 shadow-sm"
          >
            <DollarSign className="w-4 h-4" />
            {t("accountant.invoices")}
          </Link>
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
            <h3 className="text-lg font-semibold mb-4">
              {t("admin.clientDetails.contactInformation")}
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">
                    {t("admin.clientDetails.email")}
                  </p>
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
                  <p className="text-sm text-gray-500">
                    {t("admin.clientDetails.phone")}
                  </p>
                  <a href={`tel:${client.phone}`} className="text-gray-900">
                    {client.phone}
                  </a>
                </div>
              </div>

              {client.whatsapp && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">
                      {t("admin.clientDetails.whatsapp")}
                    </p>
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
                    <p className="text-sm text-gray-500">
                      {t("admin.clientDetails.address")}
                    </p>
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
            <h3 className="text-lg font-semibold mb-4">
              {t("admin.clientDetails.propertyDetails")}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Home className="w-4 h-4" />
                  <span className="text-sm">
                    {t("admin.clientDetails.propertyType")}
                  </span>
                </div>
                <span className="font-medium capitalize">
                  {client.propertyType === "residential"
                    ? t("admin.clientDetails.house")
                    : t("admin.clientDetails.building")}
                </span>
              </div>

              {client.propertySize > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {t("admin.clientDetails.propertySize")}
                  </span>
                  <span className="font-medium">{client.propertySize}m²</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-sm">
                    {t("admin.clientDetails.paymentType")}
                  </span>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    (client.paymentType || "online") === "cash"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {(client.paymentType || "online") === "cash"
                    ? t("admin.clientDetails.cash")
                    : t("admin.clientDetails.online")}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-sm text-gray-600">
                  {t("admin.clientDetails.memberSince")}
                </span>
                <span className="text-sm font-medium">
                  {format(new Date(client.createdAt), "dd MMM yyyy")}
                </span>
              </div>

               {/* Contract PDF Link */}
               {client.contractPdf?.url && (
                <div className="pt-3 border-t">
                   <h4 className="text-sm font-medium text-gray-700 mb-2">{t("admin.clientDetails.documents") || "Documents"}</h4>
                   <button
                    onClick={() => setIsContractOpen(true)}
                    className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group w-full text-left"
                  >
                     <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-100 transition-colors">
                       <FileText className="w-5 h-5" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {t("admin.clientDetails.contract") || "Contract"}
                        </p>
                        <p className="text-xs text-gray-500">PDF / Document</p>
                     </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {client.notes && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-3">
                {t("admin.clientDetails.notes")}
              </h3>
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
              <h3 className="text-lg font-semibold">
                {t("admin.clientDetails.recentTasks")}
              </h3>
              {tasks.length > 5 && (
                <Link
                  to={`/admin/tasks?client=${client._id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {t("admin.clientDetails.viewAllTasks", {
                    count: tasks.length,
                  })}
                </Link>
              )}
            </div>

            {recentTasks.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {t("admin.clientDetails.noTasksAssigned")}
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
      
      {/* Contract Preview Modal */}
      {client.contractPdf?.url && (
        <Modal
          isOpen={isContractOpen}
          onClose={() => setIsContractOpen(false)}
          title={t("admin.clientDetails.contractPreview") || "Contract Preview"}
          size="lg"
        >
          <div className="h-[75vh] w-full bg-gray-100 rounded-lg overflow-hidden">
            <iframe
              src={getSafePdfUrl(client.contractPdf.url)}
              className="w-full h-full"
              title="Contract Preview"
            />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setIsContractOpen(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default memo(ClientDetails);