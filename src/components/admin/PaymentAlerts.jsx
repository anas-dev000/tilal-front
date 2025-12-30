// src/components/admin/PaymentAlerts.jsx
import React from 'react';
import { AlertTriangle, Clock, CheckCircle, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Card from '../common/Card';
import Badge from '../common/Badge';

const PaymentAlerts = ({ alerts }) => {
  const { t } = useTranslation();

  if (!alerts) return null;

  const { overdue = [], upcoming = [] } = alerts;
  const hasAlerts = overdue.length > 0 || upcoming.length > 0;


  return (
    <Card title={t("accountant.paymentAlerts.title")}>
      {!hasAlerts ? (
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-green-600 font-medium">{t("accountant.paymentAlerts.upToDate")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Overdue Payments */}
            {overdue.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {t("accountant.paymentAlerts.overdue")} ({overdue.length})
              </h3>
              <div className="space-y-2">
                {overdue.map((site) => (
                  <div
                    key={site._id}
                    className="p-4 bg-white border border-red-100 border-l-4 border-l-red-500 rounded-xl shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate group-hover:text-red-700 transition-colors uppercase tracking-tight">{site.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span className="truncate">{site.client?.name || t("common.notFound")}</span>
                        </p>
                        <p className="text-[10px] text-gray-400 mt-2 font-black uppercase">
                          {t("accountant.paymentAlerts.cycle")}: {site.paymentCycle ? t(`status.${site.paymentCycle.toLowerCase()}`) : t("status.monthly")}
                        </p>
                      </div>
                      <Badge variant="danger" className="shrink-0 p-2 sm:px-3 text-[10px] sm:text-xs">
                        {site.daysOverdue}d {t("accountant.paymentAlerts.daysOverdue")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Payments */}
          {upcoming.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {t("accountant.paymentAlerts.dueSoon")} ({upcoming.length})
              </h3>
              <div className="space-y-2">
                {upcoming.map((site) => (
                  <div
                    key={site._id}
                    className="p-4 bg-white border border-yellow-100 border-l-4 border-l-yellow-500 rounded-xl shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate group-hover:text-yellow-700 transition-colors uppercase tracking-tight">{site.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                          <span className="truncate">{site.client?.name || t("common.notFound")}</span>
                        </p>
                        <p className="text-[10px] text-gray-400 mt-2 font-black uppercase">
                          {t("accountant.paymentAlerts.cycle")}: {site.paymentCycle}
                        </p>
                      </div>
                      <Badge variant="warning" className="shrink-0 p-2 sm:px-3 text-[10px] sm:text-xs">
                        {t("accountant.paymentAlerts.dueIn")} {site.daysUntilDue}d
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default PaymentAlerts;
