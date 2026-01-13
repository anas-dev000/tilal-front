import { Link } from "react-router-dom";
import { MapPin, Layers } from "lucide-react";

const ClientSitesList = ({ sites }) => {
  if (!sites || sites.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No sites registered yet</p>
      </div>
    );
  }

  const getSiteTypeColor = (type) => {
    const colors = {
      residential: "bg-blue-100 text-blue-800",
      commercial: "bg-green-100 text-green-800",
      industrial: "bg-gray-100 text-gray-800",
      public: "bg-purple-100 text-purple-800",
      agricultural: "bg-yellow-100 text-yellow-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary-600" />
          Client Sites ({sites.length})
        </h3>
      </div>
      <div className="divide-y divide-gray-200">
        {sites.map((site) => (
          <div key={site._id} className="p-6 hover:bg-gray-50 transition">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                {site.coverImage?.url ? (
                  <img
                    src={site.coverImage.url}
                    alt={site.name}
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="w-8 h-8 text-primary-400" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900">{site.name}</h4>
                  {site.location?.address && (
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      📍 {site.location.address}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSiteTypeColor(site.siteType)}`}>
                      {site.siteType}
                    </span>
                    {site.totalArea > 0 && (
                      <span className="text-xs text-gray-500">
                        📏 {site.totalArea}m²
                      </span>
                    )}
                    {site.sections?.length > 0 && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        {site.sections.length} sections
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {site.totalTasks || 0}
                </div>
                <div className="text-sm text-gray-500">tasks</div>
                <Link
                  to={`/admin/sites/${site._id}/sections`}
                  className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                >
                  View Site →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientSitesList;