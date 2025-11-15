import React, { useState, useEffect } from "react";
import { AdminSidebar, Table } from "@/components";
import { MdSearch } from "react-icons/md";
import { useUser } from "@/context";
import { useNavigate } from "react-router-dom";
import "@/pages/Dashboard/Dashboard.css";
import { TableColumn, NotificationRow } from "@/types";
import { useNotifications } from "@/hooks";
import { MetroSwal } from "@/utils";

const Notifications: React.FC = () => {
  const { userData, isBrowser } = useUser();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const { notifications, stats, totalPages, loading, error } = useNotifications(
    currentPage,
    10
  );
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const isAllowed = userData?.role === "admin" && isBrowser;
    if (!isAllowed) navigate("/");

    const bottomNav = document.querySelector(".bottom-nav");
    if (bottomNav) bottomNav.setAttribute("style", "display: none;");

    return () => {
      const bottomNav = document.querySelector(".bottom-nav");
      if (bottomNav) bottomNav.setAttribute("style", "display: flex;");
    };
  }, [userData, navigate, isBrowser]);

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.type?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      MetroSwal.fire({
        title: "Copied!",
        text: `${label} copied to clipboard`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      MetroSwal.fire({
        title: "Error",
        text: "Failed to copy to clipboard",
        icon: "error",
      });
    }
  };

  const columns: TableColumn<NotificationRow>[] = [
    {
      header: "ID",
      key: "id",
      width: "10%",
      render: (value) => (
        <div 
          style={{ 
            fontSize: "12px", 
            color: "rgba(255,255,255,0.7)", 
            cursor: "pointer",
            transition: "color 0.2s"
          }}
          onClick={() => copyToClipboard(String(value), "ID")}
          onMouseEnter={(e) => e.currentTarget.style.color = "#95ff5d"}
          onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
          title="Click to copy full ID"
        >
          {String(value).substring(0, 8)}...
        </div>
      ),
    },
    {
      header: "SUBJECT",
      key: "subject",
      width: "15%",
      render: (value) => (
        <div 
          style={{ 
            fontWeight: "500", 
            cursor: "pointer",
            transition: "color 0.2s"
          }}
          onClick={() => copyToClipboard(String(value), "Subject")}
          onMouseEnter={(e) => e.currentTarget.style.color = "#95ff5d"}
          onMouseLeave={(e) => e.currentTarget.style.color = "#fff"}
          title="Click to copy"
        >
          {String(value)}
        </div>
      ),
    },
    {
      header: "MESSAGE",
      key: "message",
      width: "25%",
      render: (value) => {
        const messageText = String(value).replace(/<[^>]*>/g, ''); // Strip HTML tags
        const truncated = messageText.length > 60 
          ? messageText.substring(0, 60) + "..." 
          : messageText;
        return (
          <div 
            style={{ 
              fontSize: "13px", 
              cursor: "pointer",
              transition: "color 0.2s"
            }} 
            title={`${messageText}\n\nClick to copy`}
            onClick={() => copyToClipboard(messageText, "Message")}
            onMouseEnter={(e) => e.currentTarget.style.color = "#95ff5d"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#fff"}
          >
            {truncated}
          </div>
        );
      },
    },
    {
      header: "TYPE",
      key: "type",
      width: "12%",
      render: (value) => (
        <div 
          className="status-badge" 
          style={{ 
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            color: "#60a5fa",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            display: "inline-block",
            cursor: "pointer",
            transition: "background-color 0.2s"
          }}
          onClick={() => copyToClipboard(String(value), "Type")}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.3)"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.2)"}
          title="Click to copy"
        >
          {String(value)}
        </div>
      ),
    },
    {
      header: "RECIPIENT",
      key: "recipientUserId",
      width: "10%",
      render: (value) => (
        <div 
          style={{ 
            fontSize: "12px", 
            color: "rgba(255,255,255,0.7)", 
            cursor: "pointer",
            transition: "color 0.2s"
          }}
          onClick={() => copyToClipboard(String(value), "Recipient ID")}
          onMouseEnter={(e) => e.currentTarget.style.color = "#95ff5d"}
          onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
          title="Click to copy full ID"
        >
          {String(value).substring(0, 8)}...
        </div>
      ),
    },
    {
      header: "SENDER",
      key: "senderUserId",
      width: "10%",
      render: (value) => (
        <div 
          style={{ 
            fontSize: "12px", 
            color: "rgba(255,255,255,0.7)", 
            cursor: "pointer",
            transition: "color 0.2s"
          }}
          onClick={() => copyToClipboard(String(value), "Sender ID")}
          onMouseEnter={(e) => e.currentTarget.style.color = "#95ff5d"}
          onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
          title="Click to copy full ID"
        >
          {String(value).substring(0, 8)}...
        </div>
      ),
    },
    {
      header: "METADATA",
      key: "metadata",
      width: "10%",
      render: (value, row) => {
        if (!row.metadata) {
          return <div style={{ color: "rgba(255,255,255,0.5)" }}>-</div>;
        }
        const metadataStr = JSON.stringify(row.metadata, null, 2);
        const truncated = metadataStr.length > 20 
          ? metadataStr.substring(0, 20) + "..." 
          : metadataStr;
        return (
          <div 
            style={{ 
              fontSize: "11px", 
              color: "rgba(255,255,255,0.6)", 
              cursor: "pointer",
              transition: "color 0.2s"
            }}
            title={`${metadataStr}\n\nClick to copy`}
            onClick={() => copyToClipboard(metadataStr, "Metadata")}
            onMouseEnter={(e) => e.currentTarget.style.color = "#95ff5d"}
            onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
          >
            {truncated}
          </div>
        );
      },
    },
    {
      header: "SENT AT",
      key: "sentAt",
      width: "13%",
      render: (value) => (
        <div 
          style={{ 
            fontSize: "12px", 
            cursor: "pointer",
            transition: "color 0.2s"
          }}
          onClick={() => copyToClipboard(String(value), "Sent At")}
          onMouseEnter={(e) => e.currentTarget.style.color = "#95ff5d"}
          onMouseLeave={(e) => e.currentTarget.style.color = "#fff"}
          title="Click to copy"
        >
          {String(value)}
        </div>
      ),
    },
  ];

  return (
    <div className="container">
      <AdminSidebar />

      <div className="content">
        <div className="header">
          <h1 className="headerTitle">NOTIFICATIONS MANAGEMENT</h1>
          <p className="headerText">
            View and monitor all system notifications
          </p>
        </div>

        <div className="statsGrid">
          <div className="statCard">
            <div className="statNumber">{stats.totalItems}</div>
            <div className="statLabel">TOTAL NOTIFICATIONS</div>
          </div>
          <div className="statCard">
            <div className="statNumber">{stats.currentPage}</div>
            <div className="statLabel">CURRENT PAGE</div>
          </div>
          <div className="statCard">
            <div className="statNumber">{totalPages}</div>
            <div className="statLabel">TOTAL PAGES</div>
          </div>
          <div className="statCard">
            <div className="statNumber">
              {stats.hasNextPage ? "Yes" : "No"}
            </div>
            <div className="statLabel">HAS NEXT PAGE</div>
          </div>
        </div>

        <div className="search-container">
          <MdSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search notifications by subject, message, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading && <div className="loading">Loading notifications...</div>}
        {error && <div className="error">{error}</div>}

        {!loading && !error && (
          <Table<NotificationRow>
            columns={columns}
            data={filteredNotifications}
            pagination={true}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default Notifications;

