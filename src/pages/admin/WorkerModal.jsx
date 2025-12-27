// src/pages/admin/WorkerModal.jsx
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// React Query hooks
import { useCreateUser, useUpdateUser } from "../../hooks/queries/useUsers";

import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";

const WorkerModal = ({ isOpen, onClose, worker }) => {
  const { t } = useTranslation();

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const isEditMode = !!worker;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: worker || {
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "worker",
      isActive: "true",
      notes: "",
    },
  });

  // Reset form when worker prop changes
  useEffect(() => {
    if (worker) {
      reset({
        ...worker,
        isActive: worker.isActive ? "true" : "false",
      });
    } else {
      reset({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "worker",
        isActive: "true",
        notes: "",
      });
    }
  }, [worker, reset]);

  const onSubmit = async (formData) => {
    try {
      // Prepare data - convert isActive string → boolean
      const submitData = {
        ...formData,
        isActive: formData.isActive === "true",
        role: "worker", // always enforce worker role
      };

      // Remove password field if we're editing (API usually doesn't accept it on update)
      if (isEditMode) {
        delete submitData.password;
      }

      if (isEditMode) {
        await updateUserMutation.mutateAsync({
          id: worker._id,
          data: submitData,
        });
        toast.success(t("common.updatedSuccessfully") || "Worker updated successfully");
      } else {
        await createUserMutation.mutateAsync(submitData);
        toast.success(t("common.createdSuccessfully") || "Worker created successfully");
      }

      // Close modal on success
      onClose();
      // Form will be reset automatically when modal re-opens
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        (isEditMode
          ? "Failed to update worker"
          : "Failed to create worker");

      toast.error(errorMessage);
      console.error("Worker save error:", error);
    }
  };

  const isLoading = isSubmitting || createUserMutation.isPending || updateUserMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? t("common.edit") : t("admin.workers.addWorker")}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Global error (rare with toast, but kept for consistency) */}
        {(createUserMutation.error || updateUserMutation.error) && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {createUserMutation.error?.response?.data?.message ||
              updateUserMutation.error?.response?.data?.message ||
              "An unexpected error occurred"}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t("admin.workers.name")}
            {...register("name", { required: t("validation.nameRequired") || "Name is required" })}
            error={errors.name?.message}
            required
          />

          <Input
            label={t("admin.workers.email")}
            type="email"
            {...register("email", {
              required: t("validation.emailRequired") || "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: t("validation.invalidEmail") || "Invalid email address",
              },
            })}
            error={errors.email?.message}
            required
          />

          {!isEditMode && (
            <Input
              label={t("auth.password")}
              type="password"
              {...register("password", {
                required: t("validation.passwordRequired") || "Password is required",
                minLength: {
                  value: 6,
                  message: t("validation.passwordMinLength") || "Password must be at least 6 characters",
                },
              })}
              error={errors.password?.message}
              required
            />
          )}

          <Input
            label={t("admin.workers.phone")}
            {...register("phone", {
              required: t("validation.phoneRequired") || "Phone is required",
            })}
            error={errors.phone?.message}
            required
          />
        </div>

        {/* Status - only shown in edit mode */}
        {isEditMode && (
          <Select
            label={t("common.status")}
            {...register("isActive")}
            options={[
              { value: "true", label: t("common.active") + " (نشط)" },
              { value: "false", label: "🔴 " + t("common.inactive") + " (متوقف)" },
            ]}
          />
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("admin.workers.notes")}
          </label>
          <textarea
            {...register("notes")}
            rows={3}
            maxLength={1000}
            placeholder={t("admin.workers.notesPlaceholder") || "Add notes about this worker (optional)..."}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            {t("common.maxCharacters", { count: 1000 })} • {watch("notes")?.length || 0}/1000
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {t("common.cancel")}
          </Button>

          <Button
            type="submit"
            disabled={isLoading}
            isLoading={isLoading} // assuming your Button supports isLoading prop
          >
            {isLoading ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default WorkerModal;