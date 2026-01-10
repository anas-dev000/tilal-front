// src/pages/admin/ClientModal.jsx
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// React Query hooks
import {
  useCreateClient,
  useUpdateClient,
} from "../../hooks/queries/useClients";

import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";

const ClientModal = ({ isOpen, onClose, client }) => {
  const { t } = useTranslation();

  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();

  const isEditMode = !!client;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (client) {
      reset({
        ...client,
        address: client.address || { street: "", city: "" },
      });
    } else {
      reset({
        name: "",
        email: "",
        phone: "",
        whatsapp: "",
        password: "",
        paymentType: "cash",
        address: {
          street: "",
          city: "",
        },
        propertyType: "residential",
        propertySize: "",
        notes: "",
      });
    }
  }, [client, reset]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      // Append basic fields
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      if (data.whatsapp) formData.append("whatsapp", data.whatsapp);
      if (data.password) formData.append("password", data.password);
      formData.append("paymentType", data.paymentType);
      formData.append("propertyType", data.propertyType);
      if (data.propertySize) formData.append("propertySize", data.propertySize);
      if (data.notes) formData.append("notes", data.notes);

      // Append Address fields separately
      formData.append("address[street]", data.address.street);
      formData.append("address[city]", data.address.city);

      // Append File
      if (data.contractPdf && data.contractPdf[0]) {
        formData.append("contractPdf", data.contractPdf[0]);
      }

      if (isEditMode) {
        await updateMutation.mutateAsync({
          id: client._id,
          data: formData, // Send FormData
        });
        toast.success("تم تحديث بيانات العميل بنجاح");
      } else {
        await createMutation.mutateAsync(formData); // Send FormData
        toast.success("تم إضافة العميل بنجاح");
      }

      onClose();
    } catch (err) {
      console.error(err);
      const message =
        err?.response?.data?.message || "حدث خطأ أثناء الحفظ";
      toast.error(message);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? t("common.edit") : t("admin.clients.addClient")}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Error Message */}
        {(createMutation.error || updateMutation.error) && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {createMutation.error?.response?.data?.message ||
              updateMutation.error?.response?.data?.message ||
              "An error occurred"}
          </div>
        )}

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t("admin.clients.name")}
            {...register("name", { required: "Name is required" })}
            error={errors.name?.message}
            required
          />

          <Input
            label={t("admin.clients.email")}
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            error={errors.email?.message}
            required
          />

          <Input
            label={t("admin.clients.phone")}
            {...register("phone", { required: "Phone is required" })}
            error={errors.phone?.message}
            required
          />

          <Input
            label={t("admin.clients.whatsapp")}
            {...register("whatsapp")}
            error={errors.whatsapp?.message}
          />
        </div>

        {/* Password (only on create) */}
        {!isEditMode && (
          <Input
            label="Password"
            type="text"
            {...register("password", { required: "Password is required" })}
            error={errors.password?.message}
            placeholder="Enter password"
            required
          />
        )}

        {/* Payment Type */}
        <Select
          label="Payment Type"
          {...register("paymentType")}
          options={[
            { value: "cash", label: "Cash" },
            { value: "online", label: "Online Payment" },
          ]}
          required
        />

        {/* Address */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t("admin.clients.address")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Street Address"
              {...register("address.street", {
                required: "Street is required",
              })}
              error={errors.address?.street?.message}
              required
            />
            <Input
              label="City"
              {...register("address.city", { required: "City is required" })}
              error={errors.address?.city?.message}
              required
            />
          </div>
        </div>

        {/* Property Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label={t("admin.clients.propertyType")}
            {...register("propertyType")}
            options={[
              { value: "residential", label: "Residential (سكني)" },
              { value: "commercial", label: "Commercial (تجاري)" },
            ]}
          />

          <Input
            label={t("admin.clients.propertySize")}
            type="number"
            placeholder="sq meters"
            {...register("propertySize")}
          />
        </div>

        {/* Contract PDF Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("admin.clients.contractPdf") || "Contract PDF"} (.pdf)
          </label>
          <input
            type="file"
            accept=".pdf"
            {...register("contractPdf")}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-green-50 file:text-green-700
              hover:file:bg-green-100"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("admin.clients.notes")}
          </label>
          <textarea
            {...register("notes")}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            maxLength={1000}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ClientModal;