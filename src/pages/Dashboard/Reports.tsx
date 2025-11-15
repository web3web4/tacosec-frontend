import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdSearch, MdVisibility, MdCheckCircle, MdDelete } from "react-icons/md";
import { useUser } from "@/context";
import { AdminSidebar, Table } from "@/components";
import { ReportRow, TableColumn } from "@/types";
import { useReports } from "@/hooks";
import "./Dashboard.css";

const Reports: React.FC = () => {
  const { userData, isBrowser } = useUser();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const { reports, stats, totalPages, loading, error } = useReports(currentPage, 10);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "resolved" | "pending">("all");
  const [filterPriority, setFilterPriority] = useState<"all" | "high" | "medium" | "low">("all");

  useEffect(() => {
    const isAllowed = userData?.role === "admin" && isBrowser;
    if (!isAllowed) navigate("/");

    const bottomNav = document.querySelector(".bottom-nav");
    if (bottomNav) bottomNav.setAttribute("style", "display: none;");
    return () => {
      const bn = document.querySelector(".bottom-nav");
      if (bn) bn.setAttribute("style", "display: flex;");
    };
  }, [userData, isBrowser, navigate]);

  const filteredReports = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return reports.filter((r) => {
      const matchesTerm =
        r.reportType.toLowerCase().includes(term) ||
        r.reportDetails.toLowerCase().includes(term) ||
        r.reportedContent.toLowerCase().includes(term) ||
        r.contentOwner.toLowerCase().includes(term) ||
        r.reporter.toLowerCase().includes(term);

      const matchesStatus = filterStatus === "all" ? true : r.status === filterStatus;
      const matchesPriority = filterPriority === "all" ? true : r.priority === filterPriority;

      return matchesTerm && matchesStatus && matchesPriority;
    });
  }, [reports, searchTerm, filterStatus, filterPriority]);


  const columns: TableColumn<ReportRow>[] = [
    {
      header: "REPORT DETAILS",
      key: "reportType",
      width: "25%",
      render: (_value, row) => (
        <div className="user-info">
          <div className="user-avatar">#</div>
          <div className="user-details">
            <div className="user-name">{row.reportType}</div>
            <div className="user-handle">{row.reportDetails}</div>
            <div className="user-handle">Secret: {row.secretId}</div>
          </div>
        </div>
      ),
    },
    {
      header: "REPORTED CONTENT",
      key: "reportedContent",
      width: "20%",
      render: (_value, row) => (
        <div>
          <div>{row.reportedContent}</div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
            {row.contentOwner}
          </div>
        </div>
      ),
    },
    {
      header: "REPORTER",
      key: "reporter",
      width: "15%",
      render: (_value, row) => <div>{row.reporter}</div>,
    },
    {
      header: "STATUS & PRIORITY",
      key: "status",
      width: "15%",
      render: (_value, row) => (
        <div>
          <div className={`status-badge status-${row.status}`}>{row.status}</div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
            {row.priority}
          </div>
        </div>
      ),
    },
    {
      header: "DATES",
      key: "createdDate",
      width: "15%",
      render: (_value, row) => (
        <div>
          <div>{row.createdDate}</div>
          {row.updatedDate && (
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
              Updated: {row.updatedDate}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "ACTIONS",
      key: "id",
      width: "10%",
      render: () => (
        <div className="action-buttons">
          <div className="action-button action-edit" title="View">
            <MdVisibility />
          </div>
          <div className="action-button action-check" title="Resolve">
            <MdCheckCircle />
          </div>
          <div className="action-button action-delete" title="Delete">
            <MdDelete />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="container">
      <AdminSidebar />
      <div className="content">
        <div className="header">
          <h1 className="headerTitle">REPORTS MANAGEMENT</h1>
          <p className="headerText">Review and moderate user reports and content violations</p>
        </div>

        <div className="statsGrid">
          <div className="statCard">
            <div className="statNumber">{stats.total}</div>
            <div className="statLabel">TOTAL REPORTS</div>
          </div>
          <div className="statCard">
            <div className="statNumber">{stats.pending}</div>
            <div className="statLabel">PENDING</div>
          </div>
          <div className="statCard">
            <div className="statNumber">{stats.highPriority}</div>
            <div className="statLabel">HIGH PRIORITY</div>
          </div>
          <div className="statCard">
            <div className="statNumber">{stats.resolved}</div>
            <div className="statLabel">RESOLVED</div>
          </div>
        </div>

        {loading && <div className="loading">Loading Reports...</div>}
        {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <Table<ReportRow>
          columns={columns}
          data={filteredReports}
          pagination={true}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
        )}
      </div>
    </div>
  );
}

export default Reports;
