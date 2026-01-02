// frontend/src/pages/admin/SiteModal.jsx - REFACTORED WITH REACT QUERY (CORRECT IMPORTS)
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Upload,
  X,
  Plus,
  Image as ImageIcon,
  Layers,
  Trash2,
} from "lucide-react";

// React Query hooks
import {
  useCreateSite,
  useUpdateSite,
} from "../../hooks/queries/useSites";
import { useDeleteImage } from "../../hooks/queries/useDeleteImage";

import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import ImageUpload from "../../components/common/ImageUpload";
import ReactSelect from "react-select";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { toast } from "sonner";

const SiteModal = ({ isOpen, onClose, site, clients }) => {
  const { t } = useTranslation();

  const createSiteMutation = useCreateSite();
  const updateSiteMutation = useUpdateSite();
  const deleteImageMutation = useDeleteImage();

  const [deletingCover, setDeletingCover] = useState(false);
  const [showDeleteCoverConfirm, setShowDeleteCoverConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    client: "",
    siteType: "residential",
    totalArea: "",
    description: "",
    location: {
      address: "",
      city: "",
      googleMapsLink: "",
    },
    notes: "",
    paymentCycle: "monthly",
    lastPaymentDate: "",
    nextPaymentDate: "",
  });

  // Cover image states
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);

  // Reset form when modal opens/closes or site changes
  useEffect(() => {
    if (site) {
      setFormData({
        name: site.name || "",
        client: site.client?._id || "",
        siteType: site.siteType || "residential",
        totalArea: site.totalArea || "",
        description: site.description || "",
        location: {
          address: site.location?.address || "",
          city: site.location?.city || "",
          googleMapsLink: site.location?.googleMapsLink || "",
        },
        notes: site.notes || "",
        paymentCycle: site.paymentCycle || "monthly",
        lastPaymentDate: site.lastPaymentDate ? new Date(site.lastPaymentDate).toISOString().split('T')[0] : "",
        nextPaymentDate: site.nextPaymentDate ? new Date(site.nextPaymentDate).toISOString().split('T')[0] : "",
      });
      setCoverImagePreview(site.coverImage?.url || null);
    } else {
      setFormData({
        name: "",
        client: "",
        siteType: "residential",
        totalArea: "",
        description: "",
        location: { address: "", city: "", googleMapsLink: "" },
        notes: "",
        paymentCycle: "monthly",
        lastPaymentDate: "",
        nextPaymentDate: "",
      });
      setCoverImagePreview(null);
    }
    setCoverImage(null);
  }, [site]);

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCoverImage = () => {
    setCoverImage(null);
    setCoverImagePreview(null);
  };

  // DELETE COVER IMAGE
  const handleDeleteCoverImage = () => {
    if (!site?.coverImage?.cloudinaryId) return;
    setShowDeleteCoverConfirm(true);
  };

  const confirmDeleteCover = async () => {
    setShowDeleteCoverConfirm(false);
    setDeletingCover(true);
    try {
      await deleteImageMutation.mutateAsync({
        cloudinaryId: site.coverImage.cloudinaryId,
        resourceType: "image",
        entityType: "site",
        entityId: site._id,
        imageId: site.coverImage._id || "cover",
        imageType: "cover",
      });

      // Success toast handled in hook
      setCoverImagePreview(null);
    } catch (error) {
      // Error toast handled in hook
      console.error("Delete cover image error:", error);
    } finally {
      setDeletingCover(false);
    }
  };

  const cancelDeleteCover = () => {
    setShowDeleteCoverConfirm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client is REQUIRED
    if (!formData.client || formData.client === "") {
      toast.error(t("admin.sites.siteModal.pleaseSelectClient"));
      return;
    }

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("client", formData.client);
      formDataToSend.append("siteType", formData.siteType || "residential");
      formDataToSend.append("totalArea", formData.totalArea || "0");
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("notes", formData.notes || "");

      // Location fields
      formDataToSend.append(
        "location[address]",
        formData.location.address || ""
      );
      formDataToSend.append("location[city]", formData.location.city || "");
      formDataToSend.append(
        "location[googleMapsLink]",
        formData.location.googleMapsLink || ""
      );

      // Payment Cycle Information
      formDataToSend.append("paymentCycle", formData.paymentCycle || "monthly");
      if (formData.lastPaymentDate) {
        formDataToSend.append("lastPaymentDate", formData.lastPaymentDate);
      }
      if (formData.nextPaymentDate) {
        formDataToSend.append("nextPaymentDate", formData.nextPaymentDate);
      }

      // Cover Image
      if (coverImage) {
        formDataToSend.append("coverImage", coverImage);
      }

      if (site) {
        await updateSiteMutation.mutateAsync({
          id: site._id,
          formData: formDataToSend,
        });
      } else {
        await createSiteMutation.mutateAsync(formDataToSend);
      }

      // Success toast handled in mutation hooks
      onClose();
    } catch (err) {
      // Error toast handled in mutation hooks
      console.error("Error saving site:", err);
    }
  };

  const siteTypes = [
    { value: "residential", label: "Individual Client" },
    { value: "commercial", label: "Company / Organization" },
    { value: "industrial", label: "Industrial Site" },
    { value: "public", label: "Public Space" },
    { value: "agricultural", label: "Agricultural Site" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        site
          ? t("admin.sites.siteModal.editSite")
          : t("admin.sites.siteModal.addNewSite")
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("admin.sites.siteModal.coverImageOptional")}
          </label>

          {site?.coverImage?.url && !coverImage && coverImagePreview ? (
            // Show existing cover with delete button
            <div className="relative group mb-3">
              <img
                src={coverImagePreview}
                alt="Cover"
                className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
              />
              <button
                type="button"
                onClick={handleDeleteCoverImage}
                disabled={deletingCover}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-10"
                title="Delete cover image"
              >
                {deletingCover ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
              </button>
            </div>
          ) : (
            <ImageUpload
              onChange={handleCoverImageChange}
              preview={coverImagePreview}
              onRemove={handleRemoveCoverImage}
            />
          )}
        </div>

        {/* Name */}
        <Input
          label={`${t("admin.sites.siteModal.siteName")} *`}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Villa Garden"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("admin.sites.siteModal.client")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <ReactSelect
              placeholder={t("admin.sites.siteModal.selectClient")}
              value={
                clients.find((c) => c._id === formData.client)
                  ? {
                      value: formData.client,
                      label: clients.find((c) => c._id === formData.client)
                        .name,
                    }
                  : null
              }
              onChange={(option) =>
                setFormData({ ...formData, client: option ? option.value : "" })
              }
              options={clients.map((client) => ({
                value: client._id,
                label: client.name,
              }))}
              isClearable
              className="flex-1"
            />
          </div>
        </div>

        {/* Site Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("admin.sites.siteModal.siteType")}
          </label>
          <Select
            value={siteTypes.find((opt) => opt.value === formData.siteType)}
            onChange={(opt) =>
              setFormData({ ...formData, siteType: opt.value })
            }
            options={siteTypes}
          />
        </div>

        {/* Total Area */}
        <Input
          label={`${t("admin.sites.siteModal.totalArea")} (m²)`}
          type="number"
          value={formData.totalArea}
          onChange={(e) =>
            setFormData({ ...formData, totalArea: e.target.value })
          }
          placeholder="e.g., 500"
          min="0"
        />

        {/* Payment Cycle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Cycle
          </label>
          <Select
            value={[
              { value: "monthly", label: "Monthly" },
              { value: "quarterly", label: "Quarterly" },
              { value: "semi-annually", label: "Semi-Annually" },
              { value: "annually", label: "Annually" },
            ].find((opt) => opt.value === formData.paymentCycle)}
            onChange={(opt) =>
              setFormData({ ...formData, paymentCycle: opt.value })
            }
            options={[
              { value: "monthly", label: "Monthly" },
              { value: "quarterly", label: "Quarterly" },
              { value: "semi-annually", label: "Semi-Annually" },
              { value: "annually", label: "Annually" },
            ]}
          />
        </div>

        {/* Payment Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Last Payment Date"
            type="date"
            value={formData.lastPaymentDate}
            onChange={(e) =>
              setFormData({ ...formData, lastPaymentDate: e.target.value })
            }
          />
          <Input
            label="Next Payment Date"
            type="date"
            value={formData.nextPaymentDate}
            onChange={(e) =>
              setFormData({ ...formData, nextPaymentDate: e.target.value })
            }
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t("admin.sites.siteModal.location")}
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder={t("admin.sites.siteModal.address")}
              value={formData.location.address}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: { ...formData.location, address: e.target.value },
                })
              }
            />
            <Input
              placeholder={t("common.city")}
              value={formData.location.city}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: { ...formData.location, city: e.target.value },
                })
              }
            />
          </div>
          <Input
            placeholder={`${t(
              "admin.sites.siteModal.googleMapsLink"
            )} (optional)`}
            value={formData.location.googleMapsLink || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                location: {
                  ...formData.location,
                  googleMapsLink: e.target.value,
                },
              })
            }
          />
          <p className="text-xs text-gray-500">
            Paste a Google Maps link (e.g., https://maps.google.com/...)
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("common.description")}
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Brief description of the site..."
            maxLength={2000}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("common.notes", "Notes")}
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Additional notes..."
          />
        </div>

        {/* Info Message for new sites */}
        {!site && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
            <Layers className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">
                {t("admin.sites.siteModal.notes")} :
              </p>
              <p>{t("admin.sites.siteModal.afterCreateSiteInfo")}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={
              createSiteMutation.isPending || updateSiteMutation.isPending
            }
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={
              createSiteMutation.isPending || updateSiteMutation.isPending
            }
          >
            {createSiteMutation.isPending || updateSiteMutation.isPending
              ? site
                ? t("admin.sites.siteModal.updating")
                : t("admin.sites.siteModal.creating")
              : site
              ? t("common.update")
              : t("common.create")}
          </Button>
        </div>
      </form>

      <ConfirmationModal
        isOpen={showDeleteCoverConfirm}
        onClose={cancelDeleteCover}
        onConfirm={confirmDeleteCover}
        title={t("common.confirmDelete")}
        message={t("admin.sites.siteModal.deleteCoverConfirm")}
        confirmText={t("common.delete")}
      />
    </Modal>
  );
};

export default SiteModal;