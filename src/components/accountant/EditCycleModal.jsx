import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import Modal from "../common/Modal";
import Input from "../common/Input";
import Button from "../common/Button";
import { useAccountantUpdateSite } from "../../hooks/queries/useInvoices";

const EditCycleModal = ({ isOpen, onClose, site }) => {
  const { t } = useTranslation();
  const [selectedCycle, setSelectedCycle] = useState(1);
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



  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("accountant.editCycle")}
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Input
            label={t("accountant.selectCycle")}
            type="number"
            min="1"
            value={selectedCycle}
            onChange={(e) => setSelectedCycle(e.target.value)}
            placeholder="e.g., 1 for Monthly"
            required
            className="w-full"
          />
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
