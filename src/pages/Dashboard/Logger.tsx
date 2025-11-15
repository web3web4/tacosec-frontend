import React, { useState, useEffect } from "react";
import { AdminSidebar, Table } from "@/components";
import { MdSearch } from "react-icons/md";
import { useUser } from "@/context";
import { useNavigate } from "react-router-dom";
import "@/pages/Dashboard/Dashboard.css";
import { TableColumn, LoggerRow } from "@/types";
import useLogger from "@/hooks/useLogger";
import { MetroSwal } from "@/utils";

const Logger: React.FC = () => {
  const { userData, isBrowser } = useUser();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const { logs, stats, totalPages, loading, error } = useLogger(currentPage, 10);
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

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.telegramId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.logData?.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.logData?.level?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.logData?.type?.toLowerCase().includes(searchTerm.toLowerCase());

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

  const columns: TableColumn<LoggerRow>[] = [
    {
      header: "ID",
      key: "id",
      width: "8%",
      render: (value) => (
        <div
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.7)",
            cursor: "pointer",
            transition: "color 0.2s",
          }}
          onClick={() => copyToClipboard(String(value), "ID")}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#95ff5d")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "rgba(255,255,255,0.7)")
          }
          title="Click to copy full ID"
        >
          {String(value).substring(0, 8)}...
        </div>
      ),
    },
    {
      header: "USER ID",
      key: "userId",
      width: "8%",
      render: (value) => (
        <div
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.7)",
            cursor: "pointer",
            transition: "color 0.2s",
          }}
          onClick={() => copyToClipboard(String(value), "User ID")}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#95ff5d")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "rgba(255,255,255,0.7)")
          }
          title="Click to copy full User ID"
        >
          {String(value) !== "N/A"
            ? String(value).substring(0, 8) + "..."
            : "N/A"}
        </div>
      ),
    },
    {
      header: "TELEGRAM ID",
      key: "telegramId",
      width: "10%",
      render: (value) => (
        <div
          style={{
            fontSize: "12px",
            cursor: "pointer",
            transition: "color 0.2s",
          }}
          onClick={() =>
            String(value) !== "N/A" && copyToClipboard(String(value), "Telegram ID")
          }
          onMouseEnter={(e) =>
            String(value) !== "N/A" && (e.currentTarget.style.color = "#95ff5d")
          }
          onMouseLeave={(e) => (e.currentTarget.style.color = "#fff")}
          title={String(value) !== "N/A" ? "Click to copy" : ""}
        >
          {String(value)}
        </div>
      ),
    },
    {
      header: "USERNAME",
      key: "username",
      width: "10%",
      render: (value) => (
        <div
          style={{
            fontSize: "12px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "color 0.2s",
          }}
          onClick={() =>
            String(value) !== "N/A" && copyToClipboard(String(value), "Username")
          }
          onMouseEnter={(e) =>
            String(value) !== "N/A" && (e.currentTarget.style.color = "#95ff5d")
          }
          onMouseLeave={(e) => (e.currentTarget.style.color = "#fff")}
          title={String(value) !== "N/A" ? "Click to copy" : ""}
        >
          {String(value)}
        </div>
      ),
    },
    {
      header: "LOG DATA",
      key: "logData",
      width: "50%",
      render: (value, row) => {
        const logData = row.logData;
        const logDataStr = JSON.stringify(logData, null, 2);

        return (
          <div
            style={{
              fontSize: "11px",
              cursor: "pointer",
              transition: "color 0.2s",
            }}
            onClick={() => copyToClipboard(logDataStr, "Log Data")}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#95ff5d")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#fff")}
            title="Click to copy full log data"
          >
            <div style={{ marginBottom: "4px" }}>
              <span style={{ color: "#95ff5d", fontWeight: "600" }}>
                Level:
              </span>{" "}
              <span
                style={{
                  backgroundColor:
                    logData.level === "error"
                      ? "rgba(255, 93, 93, 0.2)"
                      : logData.level === "warn"
                      ? "rgba(255, 193, 7, 0.2)"
                      : "rgba(59, 130, 246, 0.2)",
                  color:
                    logData.level === "error"
                      ? "#ff5d5d"
                      : logData.level === "warn"
                      ? "#ffc107"
                      : "#60a5fa",
                  padding: "2px 6px",
                  borderRadius: "3px",
                  fontSize: "11px",
                }}
              >
                {logData.level}
              </span>
              {" | "}
              <span style={{ color: "#95ff5d", fontWeight: "600" }}>
                Type:
              </span>{" "}
              {logData.type}
            </div>
            <div style={{ marginBottom: "4px" }}>
              <span style={{ color: "#95ff5d", fontWeight: "600" }}>
                Message:
              </span>{" "}
              {logData.message.length > 50
                ? logData.message.substring(0, 50) + "..."
                : logData.message}
            </div>
            {logData.context && (
              <div style={{ marginBottom: "4px" }}>
                <span style={{ color: "#95ff5d", fontWeight: "600" }}>
                  Context:
                </span>{" "}
                {logData.context}
              </div>
            )}
            {logData.url && (
              <div style={{ marginBottom: "4px" }}>
                <span style={{ color: "#95ff5d", fontWeight: "600" }}>
                  URL:
                </span>{" "}
                {logData.url.length > 40
                  ? logData.url.substring(0, 40) + "..."
                  : logData.url}
              </div>
            )}
            {logData.userActions && logData.userActions.length > 0 && (
              <div style={{ marginBottom: "4px" }}>
                <span style={{ color: "#95ff5d", fontWeight: "600" }}>
                  Actions:
                </span>{" "}
                {logData.userActions.slice(0, 2).join(", ")}
                {logData.userActions.length > 2 &&
                  ` +${logData.userActions.length - 2} more`}
              </div>
            )}
            {logData.publicAddress && (
              <div style={{ marginBottom: "4px" }}>
                <span style={{ color: "#95ff5d", fontWeight: "600" }}>
                  Address:
                </span>{" "}
                {logData.publicAddress.substring(0, 10)}...
              </div>
            )}
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>
              {new Date(logData.timestamp).toLocaleString()}
            </div>
          </div>
        );
      },
    },
    {
      header: "CREATED AT",
      key: "createdAt",
      width: "12%",
      render: (value) => (
        <div
          style={{
            fontSize: "11px",
            cursor: "pointer",
            transition: "color 0.2s",
          }}
          onClick={() => copyToClipboard(String(value), "Created At")}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#95ff5d")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#fff")}
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
          <h1 className="headerTitle">LOGGER MANAGEMENT</h1>
          <p className="headerText">
            View and monitor all system logs and user activities
          </p>
        </div>

        <div className="statsGrid">
          <div className="statCard">
            <div className="statNumber">{stats.totalCount}</div>
            <div className="statLabel">TOTAL LOGS</div>
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
            placeholder="Search logs by user ID, username, message, level, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading && <div className="loading">Loading logs...</div>}
        {error && <div className="error">{error}</div>}

        {!loading && !error && (
          <Table<LoggerRow>
            columns={columns}
            data={filteredLogs}
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

export default Logger;

