import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import { usersAPI } from "../../services/api";

const WorkerModal = ({ isOpen, onClose, worker, onSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch: WATCH,
    setValue: SET_VALUE,
    formState: { errors },
  } = useForm({
    defaultValues: worker || {},
  });

  useEffect(() => {
    if (worker) {
      reset({
        ...worker,
        isActive: worker.isActive ? "true" : "false", // Convert boolean to string for select
      });
    } else {
      reset({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "worker",
        isActive: "true",
      });
    }
  }, [worker, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError("");

      // Convert isActive back to boolean
      const submitData = {
        ...data,
        isActive: data.isActive === "true",
      };

      if (worker) {
        // Update existing worker
        await usersAPI.updateUser(worker._id, submitData);
      } else {
        // Create new worker
        await usersAPI.createUser(submitData);
      }

      onSuccess();
      onClose();
      reset();
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={worker ? t("common.edit") : t("admin.workers.addWorker")}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t("admin.workers.name")}
            {...register("name", { required: "Name is required" })}
            error={errors.name?.message}
            required
          />

          <Input
            label={t("admin.workers.email")}
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

          {!worker && (
            <Input
              label={t("auth.password")}
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              error={errors.password?.message}
              required
            />
          )}

          <Input
            label={t("admin.workers.phone")}
            {...register("phone", { required: "Phone is required" })}
            error={errors.phone?.message}
            required
          />
        </div>

        {/* ✅ Status Selector (Only in Edit Mode) */}
        {worker && (
          <Select
            label="Status"
            {...register("isActive")}
            options={[
              { value: "true", label: "Active (نشط)" },
              { value: "false", label: "🔴 Inactive (متوقف)" },
            ]}
          />
        )}
        {/* ✅ Notes Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("admin.workers.notes")}
          </label>
          <textarea
            {...register("notes")}
            rows={3}
            maxLength={1000}
            placeholder="Add notes about this worker (optional)..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Max 1000 characters • {WATCH("notes")?.length || 0}/1000
          </p>
        </div>
        {/* ❌ Specialization REMOVED */}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? t("common.loading") : t("common.save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default WorkerModal;
