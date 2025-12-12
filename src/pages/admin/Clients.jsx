import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Users, UserCheck, UserX } from "lucide-react";
import { clientsAPI } from "../../services/api";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Loading from "../../components/common/Loading";
import ClientModal from "./ClientModal";
import ConfirmationModal from "../../components/workers/ConfirmationModal";
import ClientsTable from "../../components/client/ClientsTable";

const PAGE_SIZE = 10;

const Clients = () => {
  const { t } = useTranslation();

  // Data
  const [allClients, setAllClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // all, active, inactive
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    client: null,
    action: "",
  });

  // Fetch all clients once
  useEffect(() => {
    fetchAllClients();
  }, []);

  const fetchAllClients = async () => {
    try {
      setLoading(true);
      const response = await clientsAPI.getClients({});
      setAllClients(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching clients:", err);
      setError("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering
  const filteredClients = useMemo(() => {
    let filtered = allClients;

    // Filter by tab
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
          c.name.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          (c.phone && c.phone.includes(term))
      );
    }

    return filtered;
  }, [allClients, activeTab, searchTerm]);

  // Pagination
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredClients.slice(start, end);
  }, [filteredClients, currentPage]);

  const totalPages = Math.ceil(filteredClients.length / PAGE_SIZE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  // Handlers
  const handleToggleStatus = (client) => {
    setConfirmModal({
      isOpen: true,
      client,
      action: client.status === "active" ? "deactivate" : "activate",
    });
  };

  const confirmToggle = async () => {
    try {
      await clientsAPI.toggleClientStatus(confirmModal.client._id);
      await fetchAllClients();
      setConfirmModal({ isOpen: false, client: null, action: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleDelete = (client) => {
    setConfirmModal({
      isOpen: true,
      client,
      action: "delete",
    });
  };

  const confirmDelete = async () => {
    try {
      await clientsAPI.deleteClient(confirmModal.client._id);
      await fetchAllClients();
      setConfirmModal({ isOpen: false, client: null, action: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete client");
    }
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    fetchAllClients();
  };

  // Stats
  const activeCount = allClients.filter((c) => c.status === "active").length;
  const inactiveCount = allClients.filter((c) => c.status !== "active").length;

  if (loading) return <Loading fullScreen />;
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("admin.clients.title")}
          </h1>
          <p className="text-gray-600 mt-1">
            {filteredClients.length} {t("admin.clients.displayed")} • {activeCount}{" "}
            {t("admin.clients.active")} {t("common.of")} {allClients.length}{" "}
            {t("admin.clients.total")}
          </p>
        </div>
        <Button onClick={handleAddNew} icon={Plus}>
          {t("admin.clients.addClient")}
        </Button>
      </div>

      {/* Search & Tabs */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder={t("common.searchByNameEmailPhone")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
              className="w-full"
            />
          </div>

          <div className="flex gap-2 border-b sm:border-b-0 border-gray-200">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === "all"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Users className="w-4 h-4" />
              {t("common.all")} ({allClients.length})
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === "active"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              {t("admin.clients.active")} ({activeCount})
            </button>
            <button
              onClick={() => setActiveTab("inactive")}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === "inactive"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <UserX className="w-4 h-4" />
              {t("admin.clients.inactive")} ({inactiveCount})
            </button>
          </div>
        </div>

        {/* Table */}
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

      {/* Modals */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
        onSuccess={handleSuccess}
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false })}
        onConfirm={
          confirmModal.action === "delete" ? confirmDelete : confirmToggle
        }
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

export default Clients;