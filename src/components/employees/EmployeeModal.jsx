import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useCreateUser, useUpdateUser } from "../../hooks/queries/useUsers";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";

const EmployeeModal = ({ isOpen, onClose, employee }) => {
  const { t } = useTranslation();

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const isEditMode = !!employee;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: employee || {
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "worker", // default
      isActive: "true",
      notes: "",
    },
  });

  // Reset form when employee prop changes
  useEffect(() => {
    if (employee) {
      reset({
        ...employee,
        isActive: employee.isActive ? "true" : "false",
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
  }, [employee, reset]);

  const onSubmit = async (formData) => {
    try {
      // Prepare data
      const submitData = {
        ...formData,
        isActive: formData.isActive === "true",
      };

      // Remove password field if we're editing
      if (isEditMode) {
        delete submitData.password;
      }

      if (isEditMode) {
        await updateUserMutation.mutateAsync({
          id: employee._id,
          data: submitData,
        });
        toast.success(t("common.updatedSuccessfully") || "Employee updated successfully");
      } else {
        await createUserMutation.mutateAsync(submitData);
        toast.success(t("common.createdSuccessfully") || "Employee created successfully");
      }

      // Close modal on success
      onClose();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        (isEditMode
          ? "Failed to update employee"
          : "Failed to create employee");

      toast.error(errorMessage);
    }
  };

  const isLoading = isSubmitting || createUserMutation.isPending || updateUserMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? t("common.edit") : t("admin.employees.addEmployee")}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Global error */}
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
          
          <Select
            label={t("common.role")}
            {...register("role")}
            options={[
              { value: "worker", label: t("roles.worker") },
              { value: "accountant", label: t("roles.accountant") },
            ]}
          />

          {/* Status - only shown in edit mode */}
          {isEditMode && (
            <Select
              label={t("common.status")}
              {...register("isActive")}
              options={[
                { value: "true", label: t("common.active") },
                { value: "false", label: t("common.inactive") },
              ]}
            />
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("admin.workers.notes")}
          </label>
          <textarea
            {...register("notes")}
            rows={3}
            maxLength={1000}
            placeholder={t("admin.workers.notesPlaceholder") || "Add notes..."}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
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
            isLoading={isLoading}
          >
            {isLoading ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EmployeeModal;
