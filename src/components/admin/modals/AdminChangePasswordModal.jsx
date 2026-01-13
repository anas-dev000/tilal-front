import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import Modal from "../../common/Modal";
import Input from "../../common/Input";
import Button from "../../common/Button";
import { usersAPI } from "../../../services/api";

const AdminChangePasswordModal = ({ isOpen, onClose, user }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error(
        t("auth.passwordsDoNotMatch", "Passwords do not match")
      );
    }

    if (formData.newPassword.length < 6) {
      return toast.error(
        t("auth.passwordTooShort", "Password must be at least 6 characters")
      );
    }

    setLoading(true);
    try {
      // NOTE: Using usersAPI.updateUser which should accept { password: ... } for admin overrides
      await usersAPI.updateUser(user._id, {
        password: formData.newPassword,
      });
      toast.success(t("auth.passwordUpdated", "Password updated successfully"));
      onClose();
      setFormData({ newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          t("auth.passwordUpdateFailed", "Failed to update password")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${t("auth.changePassword")} - ${user?.name || ""}`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800 mb-4">
           Changing password for <strong>{user?.name}</strong>. They will need to use this new password to login.
        </div>

        <Input
          label={t("auth.newPassword", "New Password")}
          name="newPassword"
          type="password"
          value={formData.newPassword}
          onChange={handleChange}
          required
          icon={Lock}
        />
        <Input
          label={t("auth.confirmPassword", "Confirm Password")}
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          icon={Lock}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} type="button">
            {t("common.cancel")}
          </Button>
          <Button variant="primary" type="submit" isLoading={loading}>
            {t("common.save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AdminChangePasswordModal;
