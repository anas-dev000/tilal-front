import { useTranslation } from 'react-i18next';
import Badge from './Badge';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const PaymentBadge = ({ nextPaymentDate, className = '' }) => {
  const { t } = useTranslation();
  if (!nextPaymentDate) {
    return null;
  }

  const now = new Date();
  const paymentDate = new Date(nextPaymentDate);
  const daysUntilPayment = Math.ceil((paymentDate - now) / (1000 * 60 * 60 * 24));

  // Overdue
  if (daysUntilPayment < 0) {
    return (
      <Badge variant="danger" size="sm" className={className}>
        <AlertTriangle className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0" />
        {t("status.overdue")} ({Math.abs(daysUntilPayment)}d)
      </Badge>
    );
  }

  // Due within 7 days
  if (daysUntilPayment <= 7) {
    return (
      <Badge variant="warning" size="sm" className={className}>
        <Clock className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0" />
        {t("accountant.paymentAlerts.dueIn")} {daysUntilPayment}d
      </Badge>
    );
  }

  // Up to date
  return (
    <Badge variant="success" size="sm" className={className}>
      <CheckCircle className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0" />
      {t("accountant.paymentAlerts.upToDate")}
    </Badge>
  );
};

export default PaymentBadge;
