import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import { inventoryAPI } from "../../services/api";

const InventoryModal = ({ isOpen, onClose, item, onSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: item || {},
  });

  useEffect(() => {
    if (item) {
      reset({
        ...item,
        //  Keep branch if editing
        branch: item.branch?._id || item.branch,
      });
    } else {
      reset({
        name: "",
        unit: "kg",
        branch: "6910b1c1a3e82a5b6b079a63", //  Default Main Branch ID
        description: "",
        quantity: {
          current: 0,
          minimum: 10,
        },
      });
    }
  }, [item, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError("");

      //  Ensure branch is always set
      if (!data.branch) {
        data.branch = "6910b1c1a3e82a5b6b079a63";
      }

      if (item) {
        await inventoryAPI.updateInventoryItem(item._id, data);
      } else {
        await inventoryAPI.createInventoryItem(data);
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
      title={item ? t("common.edit") : t("common.add")}
      size="md"
    >
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Item Name */}
        <Input
          label={t("admin.inventory.itemName")}
          {...register("name", { required: "Name is required" })}
          error={errors.name?.message}
          placeholder="مثال: سماد عضوي، مبيد حشري..."
          required
        />

        {/* Unit */}
        <Select
          label={t("admin.inventory.unit")}
          {...register("unit")}
          options={[
            { value: "kg", label: "كيلو (kg)" },
            { value: "piece", label: "قطعة (piece)" },
            { value: "liter", label: "لتر (liter)" },
          ]}
          required
        />

        {/*  HIDDEN Branch Field - Auto-set to Main Branch */}
        <input type="hidden" {...register("branch")} />

        {/* Quantity Section */}
        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900">📦 Quantity</h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Current Quantity */}
            <Input
              label={t("admin.inventory.quantity")}
              type="number"
              {...register("quantity.current", {
                required: "Quantity is required",
                min: { value: 0, message: "Cannot be negative" },
              })}
              error={errors.quantity?.current?.message}
              min="0"
              placeholder="مثال: 50"
              required
            />

            {/* Minimum Stock */}
            <Input
              label={t("admin.inventory.minStock")}
              type="number"
              {...register("quantity.minimum", {
                required: "Minimum stock is required",
                min: { value: 0, message: "Cannot be negative" },
              })}
              error={errors.quantity?.minimum?.message}
              min="0"
              placeholder="مثال: 10"
              required
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-2">
            <p className="text-xs text-blue-800">
              💡 <strong>تنبيه:</strong> سيتم إرسال تنبيه عندما تقل الكمية عن
              الحد الأدنى
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            {...register("description")}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            maxLength={500}
            placeholder="وصف المادة (اختياري)..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={loading}
            onClick={handleSubmit(onSubmit)}
          >
            {loading ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default InventoryModal;
