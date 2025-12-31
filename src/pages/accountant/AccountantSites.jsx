// src/pages/accountant/AccountantSites.jsx
import { useState, useMemo, memo } from "react";
import { useTranslation } from "react-i18next";
import { Search, MapPin, Layers, Phone } from "lucide-react";
import Select from "react-select";
import Pagination from "../../components/common/Pagination";

const PAGE_SIZE = 9; // 3x3 grid

// React Query hooks
import { useAccountantSites, useAccountantClients } from "../../hooks/queries/useInvoices";

import Loading from "../../components/common/Loading";
import PaymentBadge from "../../components/common/PaymentBadge";

const AccountantSites = () => {
  const { t } = useTranslation();

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [clientFilter, setClientFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // React Query data
  const { data: sitesData, isLoading: sitesLoading } = useAccountantSites({
    page: currentPage,
    limit: PAGE_SIZE,
    search: searchTerm,
    client: clientFilter === "all" ? undefined : clientFilter
  });

  const { data: clientsData, isLoading: clientsLoading } = useAccountantClients();
  const allClients = clientsData?.data || [];

  const allSites = sitesData?.data || [];
  const totalCount = sitesData?.total || 0;
  const totalPages = sitesData?.totalPages || 0;

  const isLoading = sitesLoading || clientsLoading;

  const handleClientFilterChange = (selected) => {
    setClientFilter(selected.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Memoized client options for react-select
  const clientOptions = useMemo(
    () => [
      {
        value: "all",
        label: `${t("accountant.allClients")} (${allClients.length})`,
      },
      ...allClients.map((client) => ({
        value: client._id,
        label: client.name,
      })),
    ],
    [allClients, t]
  );

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="space-y-6 text-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("accountant.sitesTitle")}</h1>
          <p className="text-gray-500 mt-1">
            {totalCount} {t("accountant.sitesSubtitle")}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-stretch md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 rtl:left-4 rtl:right-auto" />
          <input
            type="text"
            placeholder={t("accountant.searchSites")}
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50/50 transition-all placeholder:text-gray-400"
          />
        </div>
        <div className="w-full md:w-72">
          <Select
            options={clientOptions}
            value={clientOptions.find((c) => c.value === clientFilter)}
            onChange={handleClientFilterChange}
            placeholder={t("accountant.filterByClient")}
            isSearchable
            className="react-select-container"
            classNamePrefix="react-select"
            styles={{
              control: (base) => ({
                ...base,
                borderRadius: '0.75rem',
                padding: '0.25rem',
                borderColor: '#e5e7eb',
                backgroundColor: '#f9fafb99'
              })
            }}
          />
        </div>
      </div>

      {/* Sites Grid */}
      {allSites.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
          {t("accountant.noSitesFound")}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allSites.map((site) => (
              <div
                key={site._id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group overflow-hidden"
              >
                {/* Cover Image Placeholder or Real */}
                <div className="h-44 bg-gray-50 flex items-center justify-center relative overflow-hidden">
                  {site.coverImage?.url ? (
                    <img src={site.coverImage.url} alt={site.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="bg-green-50 w-full h-full flex items-center justify-center">
                      <MapPin className="w-12 h-12 text-green-200" />
                    </div>
                  )}
                  
                  {/* Payment Badge */}
                  <div className="absolute top-3 right-3 z-10">
                     <PaymentBadge nextPaymentDate={site.nextPaymentDate} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-xl text-gray-900 truncate leading-tight">{site.name}</h3>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-500 shrink-0" />
                      <span className="truncate">{site.location?.city} - {site.location?.address}</span>
                    </p>

                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>{site.client?.phone || t("common.notFound")}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm bg-gray-50/50 p-3 rounded-xl border border-gray-100 mb-4">
                    <div>
                      <p className="text-gray-400 mb-0.5">{t("accountant.modal.client")}</p>
                      <p className="font-bold text-gray-700 truncate">{site.client?.name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-0.5">{t("accountant.cycle")}</p>
                      <p className="font-bold text-gray-700 capitalize">
                        {site.paymentCycle ? t(`status.${site.paymentCycle.toLowerCase()}`) : t("status.monthly")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <Layers className="w-4 h-4" />
                      {site.sections?.length || 0} {t("accountant.sections")}
                    </div>
                    <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase">
                      {t("accountant.nextPayment")}: {site.nextPaymentDate ? new Date(site.nextPaymentDate).toLocaleDateString() : t("accountant.notSet")}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            totalCount={totalCount}
            limit={PAGE_SIZE}
          />
        </div>
      )}
    </div>
  );
};

export default memo(AccountantSites);
