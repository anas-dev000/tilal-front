import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
  Package,
  AlertTriangle,
  PackageCheck,
  PackageX,
} from "lucide-react";
import { inventoryAPI } from "../../services/api";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Loading from "../../components/common/Loading";
import InventoryModal from "./InventoryModal";
import InventoryTable from "../../components/admin/InventoryTable";
import { toast } from "sonner";

const PAGE_SIZE = 10;

const Inventory = () => {
  const { t } = useTranslation();

  // Data
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // all, low-stock, out-of-stock, in-stock
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await inventoryAPI.getInventory();
      setAllItems(response.data.data || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      setError("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering
  const filteredItems = useMemo(() => {
    let filtered = allItems;

    // Filter by tab
    if (activeTab === "low-stock") {
      filtered = filtered.filter((item) => {
        const current = item.quantity?.current || 0;
        const minimum = item.quantity?.minimum || 0;
        return current > 0 && current <= minimum;
      });
    } else if (activeTab === "out-of-stock") {
      filtered = filtered.filter((item) => (item.quantity?.current || 0) === 0);
    } else if (activeTab === "in-stock") {
      filtered = filtered.filter((item) => {
        const current = item.quantity?.current || 0;
        const minimum = item.quantity?.minimum || 0;
        return current > minimum;
      });
    }

    // Filter by search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          (item.description && item.description.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [allItems, activeTab, searchTerm]);

  // Pagination
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredItems.slice(start, end);
  }, [filteredItems, currentPage]);

  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  const handleDelete = async (id) => {
    if (window.confirm(t("common.confirmDelete"))) {
      try {
        await inventoryAPI.deleteInventoryItem(id);
        fetchInventory();
      } catch (error) {
        console.error("Error deleting item:", error);
        toast.error(error.response?.data?.message || "Failed to delete item", {
          duration: 5000,
        });
      }
    }
  };

  const handleAddNew = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    fetchInventory();
  };

  // Calculate stats
  const stats = {
    total: allItems.length,
    lowStock: allItems.filter((item) => {
      const current = item.quantity?.current || 0;
      const minimum = item.quantity?.minimum || 0;
      return current > 0 && current <= minimum;
    }).length,
    outOfStock: allItems.filter((item) => (item.quantity?.current || 0) === 0)
      .length,
    inStock: allItems.filter((item) => {
      const current = item.quantity?.current || 0;
      const minimum = item.quantity?.minimum || 0;
      return current > minimum;
    }).length,
  };

  if (loading) return <Loading fullScreen />;
  if (error)
    return <div className="text-center py-12 text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("admin.inventory.title")}
          </h1>
          <p className="text-gray-600 mt-1">
            {filteredItems.length} {t("admin.inventory.lowStockAlerts")} •{" "}
            {stats.lowStock} low stock • {stats.outOfStock} out of stock
          </p>
        </div>
        <Button onClick={handleAddNew} icon={Plus}>
          {t("common.add")}
        </Button>
      </div>

      {/*  IMPROVED Alert Banner */}
      {(stats.lowStock > 0 || stats.outOfStock > 0) && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-xl p-5 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-red-900 text-lg mb-2 flex items-center gap-2">
                <span>{t("admin.inventory.inventoryAlert")}</span>
                <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full">
                  {stats.lowStock + stats.outOfStock}{" "}
                  {t("admin.inventory.itemsNeedAttention")}
                </span>
              </h3>
              <div className="space-y-1 text-sm">
                {stats.outOfStock > 0 && (
                  <p className="text-red-800 font-semibold flex items-center gap-2">
                    <PackageX className="w-4 h-4" />
                    {stats.outOfStock}{" "}
                    {stats.outOfStock === 1 ? "item is" : "items are"}{" "}
                    {t("admin.inventory.outOfStock")}
                  </p>
                )}
                {stats.lowStock > 0 && (
                  <p className="text-orange-800 font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {stats.lowStock}{" "}
                    {stats.lowStock === 1 ? "item has" : "items have"} low stock
                    levels
                  </p>
                )}
              </div>
              <p className="text-red-700 text-xs mt-2 font-medium">
                📢 {t("admin.inventory.pleaseRestock")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search & Tabs */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder={t("common.search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
              className="w-full"
            />
          </div>

          <div className="flex gap-2 border-b sm:border-b-0 border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "all"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Package className="w-4 h-4" />
              {t("admin.inventory.allTabLabel")} ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab("in-stock")}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "in-stock"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <PackageCheck className="w-4 h-4" />
              {t("admin.inventory.inStockTabLabel")} ({stats.inStock})
            </button>
            <button
              onClick={() => setActiveTab("low-stock")}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "low-stock"
                  ? "border-yellow-600 text-yellow-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              {t("admin.inventory.lowStockTabLabel")} ({stats.lowStock})
            </button>
            <button
              onClick={() => setActiveTab("out-of-stock")}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "out-of-stock"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <PackageX className="w-4 h-4" />
              {t("admin.inventory.outOfStockTabLabel")} ({stats.outOfStock})
            </button>
          </div>
        </div>

        {/*  NEW TABLE */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">{t("common.noData")}</p>
          </div>
        ) : (
          <InventoryTable
            items={paginatedItems}
            onEdit={handleEdit}
            onDelete={handleDelete}
            pagination={{
              page: currentPage,
              totalPages,
              total: filteredItems.length,
              limit: PAGE_SIZE,
            }}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>

      {/* Modal */}
      <InventoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default Inventory;
