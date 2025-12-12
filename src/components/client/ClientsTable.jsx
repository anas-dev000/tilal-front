import { Edit, Trash2, Power, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const ClientStatusBadge = ({ status }) => {
  const colors = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    suspended: "bg-red-100 text-red-800"
  };
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const ClientsTable = ({
  clients,
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
            <th className="text-left py-4 px-6 font-medium text-gray-700">
              Property Type
            </th>
            <th className="text-left py-4 px-6 font-medium text-gray-700">
              Payment Type
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
          {clients.map((client) => (
            <tr
              key={client._id}
              className="border-b border-gray-100 hover:bg-gray-50 transition"
            >
              <td className="py-4 px-6">
                <div className="font-medium text-gray-900">{client.name}</div>
                {client.address?.city && (
                  <div className="text-sm text-gray-500">{client.address.city}</div>
                )}
              </td>
              <td className="py-4 px-6 text-gray-600">{client.email}</td>
              <td className="py-4 px-6 text-gray-600">{client.phone}</td>
              <td className="py-4 px-6">
                <span className="capitalize text-sm">
                  {client.propertyType === "residential" ? "🏠 House" : "🏢 Building"}
                </span>
              </td>
              <td className="py-4 px-6">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    (client.paymentType || "online") === "cash"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {(client.paymentType || "online") === "cash" ? "💵 Cash" : "💳 Online"}
                </span>
              </td>
              <td className="py-4 px-6">
                <div className="flex justify-center">
                  <ClientStatusBadge status={client.status} />
                </div>
              </td>
              <td className="py-4 px-6">
                <div className="flex items-center justify-center gap-3">
                  <Link
                    to={`/admin/clients/${client._id}`}
                    className="text-blue-600 hover:text-blue-800 transition"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => onEdit(client)}
                    className="text-indigo-600 hover:text-indigo-800 transition"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onToggleStatus(client)}
                    className={`transition ${
                      client.status === "active"
                        ? "text-red-600 hover:text-red-800"
                        : "text-green-600 hover:text-green-800"
                    }`}
                    title={client.status === "active" ? "Deactivate" : "Activate"}
                  >
                    <Power className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDelete(client)}
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

export default ClientsTable;