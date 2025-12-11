import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit, Trash2, Search, Power, Filter } from "lucide-react";
import { clientsAPI } from "../../services/api";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Select from "../../components/common/Select";
import ClientModal from "./ClientModal";
import Loading from "../../components/common/Loading";

const Clients = () => {
  const { t } = useTranslation();

  const [allClients, setAllClients] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("all");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    const fetchAllClients = async () => {
      try {
        setLoading(true);
        const response = await clientsAPI.getClients({}); // بدون أي params
        setAllClients(response.data.data || []);
      } catch (error) {
        console.error("Error fetching clients:", error);
        alert("Failed to load clients. Check console.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllClients();
  }, []); 

  useEffect(() => {
    let filtered = [...allClients];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((client) => {
        return (
          client.name?.name?.toLowerCase().includes(lowerSearch) ||
          client?.email?.toLowerCase().includes(lowerSearch) ||
          client?.phone?.includes(searchTerm)
        );
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((client) => client.status === statusFilter);
    }

    if (paymentTypeFilter !== "all") {
      filtered = filtered.filter((client) => {
        const clientPayment = client.paymentType || "online";
        return clientPayment === paymentTypeFilter;
      });
    }

    if (propertyTypeFilter !== "all") {
      filtered = filtered.filter(
        (client) => client.propertyType === propertyTypeFilter
      );
    }

    setClients(filtered);
  }, [
    allClients,
    searchTerm,
    statusFilter,
    paymentTypeFilter,
    propertyTypeFilter,
  ]);

  const refreshClients = async () => {
    try {
      setLoading(true);
      const response = await clientsAPI.getClients({});
      setAllClients(response.data.data || []);
    } catch (error) {
      console.error("Error refreshing clients:", error);
      alert("Failed to refresh clients.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const action = currentStatus === "active" ? "deactivate" : "activate";
    if (window.confirm(`Are you sure you want to ${action} this client?`)) {
      try {
        await clientsAPI.toggleClientStatus(id);
        await refreshClients(); // نجيب البيانات جديدة
      } catch (error) {
        console.error("Error toggling status:", error);
        alert(error.response?.data?.message || "Failed to toggle status");
      }
    }
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t("common.confirmDelete"))) {
      try {
        await clientsAPI.deleteClient(id);
        await refreshClients();
      } catch (error) {
        console.error("Error deleting client:", error);
        alert(error.response?.data?.message || "Failed to delete client");
      }
    }
  };

  const handleAddNew = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
  };

  const handleSuccess = () => {
    refreshClients();
  };

  const columns = [
    { header: t("admin.clients.name"), accessor: "name" },
    { header: t("admin.clients.email"), accessor: "email" },
    { header: t("admin.clients.phone"), accessor: "phone" },
    {
      header: "Property Type",
      render: (row) => {
        const typeKey = `ar_additions.propertyTypes.${row.propertyType}`;
        const translated = t(typeKey);
        const label = translated === typeKey ? row.propertyType : translated;
        return (
          <span className="capitalize">
            {row.propertyType === "residential" ? "House" : "Building"} {label}
          </span>
        );
      },
    },
    {
      header: "Payment Type",
      render: (row) => {
        const paymentType = row.paymentType || "online";
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              paymentType === "cash"
                ? "bg-green-100 text-green-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {paymentType === "cash" ? "Cash" : "Online"}
          </span>
        );
      },
    },
    {
      header: t("admin.clients.status"),
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            row.status === "active"
              ? "bg-green-100 text-green-800"
              : row.status === "inactive"
              ? "bg-gray-100 text-gray-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.status === "active" && "Active"}
          {row.status === "inactive" && "Inactive"}
          {row.status === "suspended" && "Suspended"}
        </span>
      ),
    },
    {
      header: t("common.actions"),
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-800 p-1"
            title={t("common.edit")}
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleToggleStatus(row._id, row.status)}
            className={`p-1 ${
              row.status === "active"
                ? "text-red-600 hover:text-red-800"
                : "text-green-600 hover:text-green-800"
            }`}
            title={row.status === "active" ? "Deactivate" : "Activate"}
          >
            <Power className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleDelete(row._id)}
            className="text-red-600 hover:text-red-800 p-1"
            title={t("common.delete")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {t("admin.clients.title")}
          </h1>
        </div>
        <Button onClick={handleAddNew} icon={Plus}>
          {t("admin.clients.addClient")}
        </Button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={statusFilter === "all" ? "primary" : "secondary"}
          onClick={() => setStatusFilter("all")}
          size="sm"
        >
          All ({clients.length})
        </Button>
        <Button
          variant={statusFilter === "active" ? "primary" : "secondary"}
          onClick={() => setStatusFilter("active")}
          size="sm"
        >
          Active
        </Button>
        <Button
          variant={statusFilter === "inactive" ? "primary" : "secondary"}
          onClick={() => setStatusFilter("inactive")}
          size="sm"
        >
          Inactive
        </Button>
      </div>

      {/* Search & Filters */}
      <Card>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t("common.search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              icon={Filter}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>

            {(paymentTypeFilter !== "all" || propertyTypeFilter !== "all") && (
              <button
                onClick={() => {
                  setPaymentTypeFilter("all");
                  setPropertyTypeFilter("all");
                }}
                className="text-sm text-red-600 hover:text-red-800 underline"
              >
                Clear Filters
              </button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <Select
                label="Payment Type"
                value={paymentTypeFilter}
                onChange={(e) => setPaymentTypeFilter(e.target.value)}
                options={[
                  { value: "all", label: "All Payment Types" },
                  { value: "cash", label: "Cash" },
                  { value: "online", label: "Online" },
                ]}
              />

              <Select
                label="Property Type"
                value={propertyTypeFilter}
                onChange={(e) => setPropertyTypeFilter(e.target.value)}
                options={[
                  { value: "all", label: "All Property Types" },
                  { value: "residential", label: "Residential" },
                  { value: "commercial", label: "Commercial" },
                ]}
              />

              <div className="flex items-end">
                <div className="text-sm text-gray-500">
                  Filtering is applied instantly
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card>
        {clients.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {statusFilter === "inactive"
                ? "No inactive clients found"
                : t("common.noData")}
            </p>
          </div>
        ) : (
          <Table columns={columns} data={clients} />
        )}
      </Card>

      {/* Modal */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        client={selectedClient}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default Clients;
