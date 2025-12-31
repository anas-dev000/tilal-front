import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import { authAPI } from "../../services/api";

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error(t("auth.passwordsDoNotMatch", "Passwords do not match"));
    }

    if (formData.newPassword.length < 6) {
      return toast.error(t("auth.passwordTooShort", "Password must be at least 6 characters"));
    }

    setLoading(true);
    try {
      await authAPI.updatePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      toast.success(t("auth.passwordUpdated", "Password updated successfully"));
      onClose();
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || t("auth.passwordUpdateFailed", "Failed to update password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("auth.changePassword", "Change Password")}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t("auth.currentPassword", "Current Password")}
          name="currentPassword"
          type="password"
          value={formData.currentPassword}
          onChange={handleChange}
          required
          icon={Lock}
        />
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

export default ChangePasswordModal;
