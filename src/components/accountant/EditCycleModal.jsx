import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { useAccountantUpdateSite } from "../../hooks/queries/useInvoices";

const EditCycleModal = ({ isOpen, onClose, site }) => {
  const { t } = useTranslation();
  const [selectedCycle, setSelectedCycle] = useState("");
  const updateSiteMutation = useAccountantUpdateSite();

  useEffect(() => {
    if (site?.paymentCycle) {
      setSelectedCycle(site.paymentCycle);
    }
  }, [site]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!site) return;

    try {
      await updateSiteMutation.mutateAsync({
        id: site._id,
        data: { paymentCycle: selectedCycle }
      });
      onClose();
    } catch (error) {
      console.error("Failed to update cycle", error);
    }
  };

  const cycles = ["monthly", "quarterly", "semi_annual", "annual"];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("accountant.editCycle")}
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("accountant.selectCycle")}
          </label>
          <div className="grid grid-cols-1 gap-3">
            {cycles.map((cycle) => (
              <label
                key={cycle}
                className={`
                  relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all
                  ${selectedCycle === cycle 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-green-200 hover:bg-gray-50'
                  }
                `}
              >
                <input
                  type="radio"
                  name="paymentCycle"
                  value={cycle}
                  checked={selectedCycle === cycle}
                  onChange={(e) => setSelectedCycle(e.target.value)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <span className={`block font-medium ${selectedCycle === cycle ? 'text-green-900' : 'text-gray-900'}`}>
                    {t(`status.${cycle}`)}
                  </span>
                </div>
                {selectedCycle === cycle && (
                  <div className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="h-2 w-2 bg-white rounded-full" />
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={updateSiteMutation.isPending}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={updateSiteMutation.isPending || selectedCycle === site?.paymentCycle}
            isLoading={updateSiteMutation.isPending}
          >
            {t("common.save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditCycleModal;
