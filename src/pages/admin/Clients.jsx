/* eslint-disable no-unused-vars */
// src/pages/admin/Clients.jsx
import { useState, useMemo, useCallback, memo } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Users, UserCheck, UserX } from "lucide-react";
import { useNavigate } from "react-router-dom";

// React Query hooks (using the existing ones from useClients.js)
import {
  useClients,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
  useToggleClientStatus,
} from "../../hooks/queries/useClients";

// Components
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import ClientModal from "./ClientModal";
import ConfirmationModal from "../../components/workers/ConfirmationModal";
import ClientsTable from "../../components/client/ClientsTable";

const PAGE_SIZE = 10;

const Clients = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // all | active | inactive
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    client: null,
    action: "",
  });

  // ==================== Data Fetching with React Query ====================
  const { data: allClients = [], isLoading, error } = useClients();

  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();
  const deleteClientMutation = useDeleteClient();
  const toggleStatusMutation = useToggleClientStatus();

  // ==================== Memoized Values ====================
  const filteredClients = useMemo(() => {
    let filtered = allClients;

    // Filter by status tab
    if (activeTab === "active") {
      filtered = filtered.filter((c) => c.status === "active");
    } else if (activeTab === "inactive") {
      filtered = filtered.filter((c) => c.status !== "active");
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name?.toLowerCase().includes(term) ||
          c.email?.toLowerCase().includes(term) ||
          (c.phone && c.phone.includes(term))
      );
    }

    return filtered;
  }, [allClients, activeTab, searchTerm]);

  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredClients.slice(start, start + PAGE_SIZE);
  }, [filteredClients, currentPage]);

  const stats = useMemo(
    () => ({
      total: allClients.length,
      active: allClients.filter((c) => c.status === "active").length,
      inactive: allClients.filter((c) => c.status !== "active").length,
    }),
    [allClients]
  );

  const totalPages = Math.ceil(filteredClients.length / PAGE_SIZE);

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, []);

  // ==================== Handlers ====================
  const handleRowClick = useCallback((client) => {
    navigate(`/admin/clients/${client._id}`);
  }, [navigate]);

  const handleEdit = useCallback((client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedClient(null);
  }, []);

  const handleToggleStatus = useCallback((client) => {
    setConfirmModal({
      isOpen: true,
      client,
      action: client.status === "active" ? "deactivate" : "activate",
    });
  }, []);

  const handleDelete = useCallback((client) => {
    setConfirmModal({
      isOpen: true,
      client,
      action: "delete",
    });
  }, []);

  const confirmToggle = useCallback(() => {
    if (!confirmModal.client) return;

    toggleStatusMutation.mutate(confirmModal.client._id, {
      onSuccess: () => {
        setConfirmModal({ isOpen: false, client: null, action: "" });
      },
    });
  }, [confirmModal.client, toggleStatusMutation]);

  const confirmDelete = useCallback(() => {
    if (!confirmModal.client) return;

    deleteClientMutation.mutate(confirmModal.client._id, {
      onSuccess: () => {
        setConfirmModal({ isOpen: false, client: null, action: "" });
      },
    });
  }, [confirmModal.client, deleteClientMutation]);

  const handleConfirmModalClose = useCallback(() => {
    setConfirmModal({ isOpen: false, client: null, action: "" });
  }, []);

  // ==================== Render ====================
  if (isLoading) {
    return <div className="py-12 text-center"><div className="animate-spin h-8 w-8 mx-auto border-4 border-primary-500 border-t-transparent rounded-full"></div></div>;
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        {t("common.errorLoadingData") || "Failed to load clients"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {t("admin.clients.title") || "Clients Management"}
        </h1>
        <Button
          onClick={() => {
            setSelectedClient(null);
            setIsModalOpen(true);
          }}
          icon={Plus}
        >
          {t("admin.clients.addClient") || "Add Client"}
        </Button>
      </div>

      <Card className="overflow-hidden">
        {/* Filters & Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
              placeholder={t("common.searchByNameEmailPhone")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex border-b border-gray-200">
              <TabButton
                active={activeTab === "all"}
                onClick={() => setActiveTab("all")}
                icon={Users}
                label={`${t("common.all")} (${stats.total})`}
                color="blue"
              />
              <TabButton
                active={activeTab === "active"}
                onClick={() => setActiveTab("active")}
                icon={UserCheck}
                label={`${t("admin.clients.active")} (${stats.active})`}
                color="green"
              />
              <TabButton
                active={activeTab === "inactive"}
                onClick={() => setActiveTab("inactive")}
                icon={UserX}
                label={`${t("admin.clients.inactive")} (${stats.inactive})`}
                color="red"
              />
            </div>
          </div>
        </div>

        {/* Table / Empty State */}
        {filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">{t("common.noData")}</p>
          </div>
        ) : (
          <ClientsTable
            clients={paginatedClients}
            onEdit={handleEdit}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
            onRowClick={handleRowClick}
            pagination={{
              page: currentPage,
              totalPages,
              total: filteredClients.length,
              limit: PAGE_SIZE,
            }}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>

      {/* ==================== Modals ==================== */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        client={selectedClient}
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={handleConfirmModalClose}
        onConfirm={confirmModal.action === "delete" ? confirmDelete : confirmToggle}
        title={
          confirmModal.action === "delete"
            ? t("common.confirmDelete")
            : confirmModal.action === "deactivate"
            ? t("admin.clients.deactivateClient")
            : t("admin.clients.activateClient")
        }
        message={
          confirmModal.action === "delete"
            ? t("common.actionIrreversible")
            : `${t("common.areYouSure")} ${
                confirmModal.action === "deactivate"
                  ? t("common.deactivate")
                  : t("common.activate")
              } ${t("common.thisClient")}?`
        }
        confirmText={
          confirmModal.action === "delete"
            ? t("common.delete")
            : confirmModal.action === "deactivate"
            ? t("common.deactivate")
            : t("common.activate")
        }
        confirmVariant={
          confirmModal.action === "delete"
            ? "danger"
            : confirmModal.action === "deactivate"
            ? "warning"
            : "success"
        }
      />
    </div>
  );
};

// ==================== Memoized Tab Button ====================
const TabButton = memo(({ active, onClick, icon: Icon, label, color }) => {
  const colorClasses = {
    blue: active ? "border-blue-600 text-blue-600" : "",
    green: active ? "border-green-600 text-green-600" : "",
    red: active ? "border-red-600 text-red-600" : "",
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${
        active
          ? colorClasses[color]
          : "border-transparent text-gray-600 hover:text-gray-900"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
});

TabButton.displayName = "TabButton";

export default Clients;