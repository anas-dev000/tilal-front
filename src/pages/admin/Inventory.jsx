// src/pages/admin/Inventory.jsx - REFACTORED WITH REACT QUERY
import { useState, useMemo, useCallback, memo } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
  Package,
  AlertTriangle,
  PackageCheck,
  PackageX,
} from "lucide-react";

// React Query hooks
import {
  useInventory,
  useDeleteInventoryItem,
} from "../../hooks/queries/useInventory";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Skeleton, { TableSkeleton } from "../../components/common/Skeleton";
import Input from "../../components/common/Input";
import Loading from "../../components/common/Loading";
import InventoryModal from "./InventoryModal";
import InventoryTable from "../../components/admin/InventoryTable";
import { toast } from "sonner";

const PAGE_SIZE = 10;

const Inventory = () => {
  const { t } = useTranslation();

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // all, low-stock, out-of-stock, in-stock
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // React Query data
  const { data: inventoryData, isLoading } = useInventory({
    page: currentPage,
    limit: PAGE_SIZE,
    search: searchTerm,
    status: activeTab === "all" ? "" : activeTab
  });

  const allItems = inventoryData?.data || [];
  const totalCount = inventoryData?.total || 0;
  const totalPages = inventoryData?.totalPages || 0;

  const deleteItemMutation = useDeleteInventoryItem();

  // Reset page when filters change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Stats calculation (memoized) - this might still need to fetch all or we can use the response if available
  // For now, let's keep it as is or simplify it
  const stats = useMemo(() => {
    return {
      total: totalCount,
      lowStock: allItems.filter((item) => {
        const current = item.quantity?.current || 0;
        const minimum = item.quantity?.minimum || 0;
        return current > 0 && current <= minimum;
      }).length,
      outOfStock: allItems.filter(
        (item) => (item.quantity?.current || 0) === 0
      ).length,
      inStock: allItems.filter((item) => {
        const current = item.quantity?.current || 0;
        const minimum = item.quantity?.minimum || 0;
        return current > minimum;
      }).length,
    };
  }, [allItems, totalCount]);

  // Handlers
  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm(t("common.confirmDelete"))) return;

      try {
        await deleteItemMutation.mutateAsync(id);
      } catch (error) {
        toast.error(
          error.response?.data?.message || t("common.errorOccurred"),
          { duration: 5000 }
        );
      }
    },
    [deleteItemMutation, t]
  );

  const handleAddNew = useCallback(() => {
    setSelectedItem(null);
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback((item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedItem(null);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton variant="text" width="200px" height="40px" />
            <Skeleton variant="text" width="250px" />
          </div>
          <Skeleton variant="rectangle" width="100px" height="40px" />
        </div>
        <Skeleton variant="rectangle" height="120px" />
        <Card>
          <div className="flex justify-between gap-4 p-6 border-b">
            <Skeleton variant="rectangle" width="300px" height="40px" />
            <div className="flex gap-4">
              <Skeleton variant="rectangle" width="80px" height="40px" />
              <Skeleton variant="rectangle" width="80px" height="40px" />
              <Skeleton variant="rectangle" width="80px" height="40px" />
            </div>
          </div>
          <TableSkeleton rows={10} />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("admin.inventory.title")}
          </h1>
          <p className="text-gray-600 mt-1">
            {totalCount} {t("admin.inventory.items")} •{" "}
            {stats.lowStock} low stock • {stats.outOfStock} out of stock
          </p>
        </div>
        <Button onClick={handleAddNew} icon={Plus}>
          {t("common.add")}
        </Button>
      </div>

      {/* Alert Banner */}
      {(stats.lowStock > 0 || stats.outOfStock > 0) && (
        <div className="bg-linear-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-xl p-5 shadow-lg">
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
              onChange={handleSearchChange}
              icon={Search}
              className="w-full"
            />
          </div>

          <div className="flex gap-2 border-b sm:border-b-0 border-gray-200 overflow-x-auto">
            <button
              onClick={() => handleTabChange("all")}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "all"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Package className="w-4 h-4" />
              {t("admin.inventory.allTabLabel")} ({totalCount})
            </button>
            <button
              onClick={() => handleTabChange("in-stock")}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "in-stock"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <PackageCheck className="w-4 h-4" />
              {t("admin.inventory.inStockTabLabel")}
            </button>
            <button
              onClick={() => handleTabChange("low-stock")}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "low-stock"
                  ? "border-yellow-600 text-yellow-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              {t("admin.inventory.lowStockTabLabel")}
            </button>
            <button
              onClick={() => handleTabChange("out-of-stock")}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "out-of-stock"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <PackageX className="w-4 h-4" />
              {t("admin.inventory.outOfStockTabLabel")}
            </button>
          </div>
        </div>

        {/* Table */}
        {allItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">{t("common.noData")}</p>
          </div>
        ) : (
          <InventoryTable
            items={allItems}
            onEdit={handleEdit}
            onDelete={handleDelete}
            pagination={{
              page: currentPage,
              totalPages,
              total: totalCount,
              limit: PAGE_SIZE,
            }}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>

      {/* Modal - onSuccess handled inside create/update mutations */}
      <InventoryModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        item={selectedItem}
        // onSuccess no longer needed → invalidation is in hooks
      />
    </div>
  );
};

// Memoize component (same as Workers)
export default memo(Inventory);