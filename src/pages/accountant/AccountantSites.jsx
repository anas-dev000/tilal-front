// src/pages/accountant/AccountantSites.jsx
import { useState, useMemo, memo } from "react";
import { useTranslation } from "react-i18next";
import { Search, MapPin, Layers, Phone, Calendar, Edit2, ChevronRight } from "lucide-react";
import Select from "react-select";
import Pagination from "../../components/common/Pagination";
import { useNavigate } from "react-router-dom";
import useDebounce from "../../hooks/useDebounce"; // Import debounce hook

const PAGE_SIZE = 9; // 3x3 grid

// React Query hooks
import { 
  useAccountantSites, 
  useAccountantClients,
  useAccountantUpdateSite 
} from "../../hooks/queries/useInvoices";

import Loading from "../../components/common/Loading";
import PaymentBadge from "../../components/common/PaymentBadge";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import { toast } from "sonner";
import EditCycleModal from "../../components/accountant/EditCycleModal";

const AccountantSites = () => {
  const { t } = useTranslation();

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [clientFilter, setClientFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSiteForEdit, setSelectedSiteForEdit] = useState(null);
  
  const navigate = useNavigate();
  
  // Debounced Search
  const debouncedSearch = useDebounce(searchTerm, 500);

  // React Query data
  const { data: sitesData, isLoading: sitesLoading } = useAccountantSites({
    page: currentPage,
    limit: PAGE_SIZE,
    search: debouncedSearch, // Use debounced value
    client: clientFilter === "all" ? undefined : clientFilter
  });

  const { data: clientsData, isLoading: clientsLoading } = useAccountantClients();
  const allClients = clientsData?.data || [];

  const allSites = sitesData?.data || [];
  const totalCount = sitesData?.total || 0;
  const totalPages = sitesData?.totalPages || 0;



  const handleClientFilterChange = (selected) => {
    setClientFilter(selected.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const clientOptions = useMemo(() => [
    { value: "all", label: t("accountant.filterByClient") }, // Using existing key for 'All' or generic
    ...allClients.map(c => ({ value: c._id, label: c.name }))
  ], [allClients, t]);

  // Only show full screen loading on initial load of sites or clients
  if ((sitesLoading && !sitesData) || clientsLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto min-h-screen bg-gray-50/50">
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center">
        <div className="w-full md:w-96 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm"
            placeholder={t("common.search")}
            value={searchTerm}
            onChange={handleSearchChange}
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
              }),
              menuPortal: (base) => ({ ...base, zIndex: 9999 })
            }}
            menuPortalTarget={document.body}
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

                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/accountant/sites/${site._id}`)}
                      className="flex-1 text-xs py-2 h-auto"
                    >
                      {t("common.viewDetails")}
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => setSelectedSiteForEdit(site)}
                      className="text-xs py-2 h-auto px-2"
                      title={t("accountant.editCycle")}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
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

      {selectedSiteForEdit && (
        <EditCycleModal
          isOpen={!!selectedSiteForEdit}
          onClose={() => setSelectedSiteForEdit(null)}
          site={selectedSiteForEdit}
        />
      )}
    </div>
  );
};

export default memo(AccountantSites);
