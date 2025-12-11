import { Edit, Trash2, Power, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import WorkerStatusBadge from "./WorkerStatusBadge";

const WorkersTable = ({
  workers,
  onEdit,
  onToggleStatus,
  onDelete,
  pagination,
  onPageChange,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-4 px-6 font-medium text-gray-700">
              Name
            </th>
            <th className="text-left py-4 px-6 font-medium text-gray-700">
              Email
            </th>
            <th className="text-left py-4 px-6 font-medium text-gray-700">
              Phone
            </th>
            <th className="text-center py-4 px-6 font-medium text-gray-700">
              Status
            </th>
            <th className="text-center py-4 px-6 font-medium text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {workers.map((worker) => (
            <tr
              key={worker._id}
              className="border-b border-gray-100 hover:bg-gray-50 transition"
            >
              <td className="py-4 px-6">
                <div className="font-medium text-gray-900">{worker.name}</div>
              </td>
              <td className="py-4 px-6 text-gray-600">{worker.email}</td>
              <td className="py-4 px-6 text-gray-600">{worker.phone || "-"}</td>
              <td className="py-4 px-6">
                <div className="flex justify-center">
                  <WorkerStatusBadge isActive={worker.isActive} />
                </div>
              </td>
              <td className="py-4 px-6">
                <div className="flex items-center justify-center gap-3">
                  <Link
                    to={`/admin/workers/${worker._id}`}
                    className="text-blue-600 hover:text-blue-800 transition"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => onEdit(worker)}
                    className="text-indigo-600 hover:text-indigo-800 transition"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onToggleStatus(worker)}
                    className={`transition ${
                      worker.isActive
                        ? "text-red-600 hover:text-red-800"
                        : "text-green-600 hover:text-green-800"
                    }`}
                    title={worker.isActive ? "Deactivate" : "Activate"}
                  >
                    <Power className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDelete(worker)}
                    className="text-red-600 hover:text-red-900 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
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

export default WorkersTable;
