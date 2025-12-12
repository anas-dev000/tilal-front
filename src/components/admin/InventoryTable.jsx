import { Edit, Trash2, AlertTriangle, PackageX, PackageCheck } from "lucide-react";

const InventoryTable = ({ items, onEdit, onDelete, pagination, onPageChange }) => {
  const getStockStatus = (item) => {
    const current = item.quantity?.current || 0;
    const minimum = item.quantity?.minimum || 0;

    if (current === 0) {
      return {
        label: "Out of Stock",
        color: "bg-red-100 text-red-800 border-red-300",
        icon: PackageX,
        iconColor: "text-red-600"
      };
    }
    if (current <= minimum) {
      return {
        label: "Low Stock",
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: AlertTriangle,
        iconColor: "text-yellow-600"
      };
    }
    return {
      label: "In Stock",
      color: "bg-green-100 text-green-800 border-green-300",
      icon: PackageCheck,
      iconColor: "text-green-600"
    };
  };

  const getUnitLabel = (unit) => {
    const labels = {
      kg: "كيلو",
      piece: "قطعة",
      liter: "لتر"
    };
    return labels[unit] || unit;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-4 px-6 font-medium text-gray-700">Status</th>
            <th className="text-left py-4 px-6 font-medium text-gray-700">Item Name</th>
            <th className="text-left py-4 px-6 font-medium text-gray-700">Current Stock</th>
            <th className="text-left py-4 px-6 font-medium text-gray-700">Min Stock</th>
            <th className="text-left py-4 px-6 font-medium text-gray-700">Unit</th>
            <th className="text-center py-4 px-6 font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const status = getStockStatus(item);
            const StatusIcon = status.icon;
            
            return (
              <tr
                key={item._id}
                className="border-b border-gray-100 hover:bg-gray-50 transition"
              >
                {/* Status Column */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-5 h-5 ${status.iconColor}`} />
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                </td>

                {/* Item Name */}
                <td className="py-4 px-6">
                  <div className="font-medium text-gray-900">{item.name}</div>
                  {item.description && (
                    <div className="text-sm text-gray-500 truncate max-w-xs mt-1">
                      {item.description}
                    </div>
                  )}
                </td>

                {/* Current Stock */}
                <td className="py-4 px-6">
                  <span className={`font-bold text-lg ${
                    item.quantity.current === 0 ? 'text-red-600' :
                    item.quantity.current <= item.quantity.minimum ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {item.quantity.current}
                  </span>
                </td>

                {/* Min Stock */}
                <td className="py-4 px-6">
                  <span className="text-gray-600">{item.quantity.minimum}</span>
                </td>

                {/* Unit */}
                <td className="py-4 px-6">
                  <span className="text-gray-700 font-medium">
                    {getUnitLabel(item.unit)}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => onEdit(item)}
                      className="text-indigo-600 hover:text-indigo-800 transition"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDelete(item._id)}
                      className="text-red-600 hover:text-red-900 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 px-6">
          <p className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;