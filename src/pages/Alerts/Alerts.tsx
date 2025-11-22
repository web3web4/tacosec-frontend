import { DotsLoader } from "@/components";
import useAlerts from "@/hooks/useAlerts";
import "./Alerts.css";

export default function Alerts() {
  const { data, isLoading, getTabLabel, getDateText, handleClick } = useAlerts();

  if (isLoading) return <div className="alerts-loading"> <DotsLoader /> </div>;

  return (
    <div className="alerts-container">
      {data?.notifications.length === 0 && (
        <div className="alerts-empty">No notifications yet.</div>
      )}

      {data?.notifications.map((item) => (
        <div
          key={item._id}
          className="alert-item"
          onClick={() => handleClick(item)}
        >
          <div className="alert-avatar" aria-label={getTabLabel(item.tabName)}>
            <span>{getTabLabel(item.tabName)}</span>
          </div>
          <div className="alert-content">
            <div className="alert-message" title={item.message}>
              {item.message}
            </div>
            <div className="alert-meta">
              <span className="alert-date">{getDateText(item.createdAt)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
