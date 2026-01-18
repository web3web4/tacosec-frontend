import RenderContent from "@/components/RenderContent/RenderContent";
import { DotsLoader, SkeletonLoader } from "@/components";
import useAlerts from "@/hooks/useAlerts";
import { MdLock, MdSend } from 'react-icons/md';
import "./Alerts.css";

export default function Alerts() {
  const {
    data,
    isLoading,
    isNavigating,
    isRefreshing,
    isPulling,
    pullDistance,
    getTabLabel,
    getTabIcon,
    getDateText,
    getPlainTextMessage,
    isClickable,
    handleClick,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    observerTarget,
    isFetchingMore
  } = useAlerts();

  if (isLoading) {
    return (
      <div className="alerts-container">
        <div className="alerts-skeleton">
          <SkeletonLoader count={5} />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="alerts-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      {(isPulling || isRefreshing) && pullDistance > 20 && (
        <div 
          className="pull-to-refresh-indicator" 
          style={{
            opacity: Math.min(pullDistance / 80, 1),
            top: `${Math.min(pullDistance - 40, 40)}px`
          }}
        >
          {isRefreshing ? (
            <DotsLoader size="small" />
          ) : (
            <span className="refresh-icon">
              {pullDistance > 80 ? '↻' : '↓'}
            </span>
          )}
          <span className="refresh-text">
            {isRefreshing ? 'Refreshing...' : pullDistance > 80 ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      )}

      {/* Content wrapper for pull-to-refresh transform */}
      <div 
        className="alerts-content-wrapper"
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {/* Empty state with icon */}
        {data?.notifications.length === 0 && (
          <div className="alerts-empty">
            <div className="empty-icon">🔔</div>
            <div className="empty-title">No alerts yet</div>
            <div className="empty-description">
              You'll be notified when someone shares a secret with you
            </div>
          </div>
        )}

        {/* Alert items */}
        {data?.notifications.map((item) => (
          <div
            key={item._id}
            className={`alert-item ${!isClickable(item.type) ? 'alert-item-disabled' : ''} ${item.type === 'report_notification' ? 'alert-item-report' : 'alert-item-shared'}`}
            onClick={() => handleClick(item)}
            role={isClickable(item.type) ? "button" : "article"}
            tabIndex={isClickable(item.type) ? 0 : -1}
            aria-label={isClickable(item.type) ? `Alert: ${getPlainTextMessage(item.message)}. Click to view` : `Notification: ${getPlainTextMessage(item.message)}`}
          >
            <div className="alert-avatar" aria-label={getTabLabel(item.tabName)}>
              {item.tabName === "shared" ? <MdSend size={20} /> : <MdLock size={20} />}
            </div>
            <div className="alert-content">
              <div 
                className="alert-message" 
                title={getPlainTextMessage(item.message)}
              >
                <RenderContent htmlContent={item.message} />
              </div>
              <div className="alert-meta">
                <span className="alert-date">{getDateText(item.createdAt)}</span>
                {item.type === "report_notification" && (
                  <span className="alert-badge alert-badge-info">Info</span>
                )}
              </div>
            </div>
            {!isClickable(item.type) && (
              <div className="alert-disabled-indicator" aria-hidden="true">ℹ️</div>
            )}
          </div>
        ))}

        {/* Infinite scroll observer */}
        {data?.pagination.hasNextPage && (
          <div ref={observerTarget} className="alerts-observer">
            {isFetchingMore && (
              <div className="alerts-loading-more">
                <DotsLoader size="small" />
                <span className="loading-more-text">Loading more alerts...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation loading overlay */}
      {isNavigating && (
        <div className="alerts-navigation-overlay">
          <DotsLoader size="medium" />
          <span className="navigation-text">Opening secret...</span>
        </div>
      )}
    </div>
  );
}
