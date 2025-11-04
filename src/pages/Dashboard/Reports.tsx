import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdSearch, MdVisibility, MdCheckCircle, MdCancel, MdDelete } from "react-icons/md";
import { useUser } from "@/context";
import Table from "@/components/Table/Table";
import { AdminSidebar } from "@/components";
import "./Dashboard.css";
import { ReportRow, TableColumn } from "@/types";

// Mock report data
const mockReports: ReportRow[] = [
  {
      id: 1,
      reportType: "COPYRIGHT",
      reportDetails: "Copyrighted Material",
      reportedContent: "Copyrighted Material",
      contentOwner: "@copyright_violator",
      secretId: "secret_321",
      reporter: "@content_mod",
      reporterHandle: "@content_mod",
      status: "resolved",
      priority: "high",
      createdDate: "1/13/2024 4:45:00 PM",
      updatedDate: "1/14/2024 11:30:00 AM",
  },
  {
      id: 2,
      reportType: "ABUSE",
      reportDetails: "Abusive Content",
      reportedContent: "Offensive language",
      contentOwner: "@user123",
      secretId: "secret_456",
      reporter: "@moderator",
      reporterHandle: "@moderator",
      status: "pending",
      priority: "medium",
      createdDate: "1/12/2024 2:30:00 PM",
      updatedDate: "",
  },
  {
      id: 3,
      reportType: "SPAM",
      reportDetails: "Spam Content",
      reportedContent: "Repeated messages",
      contentOwner: "@spammer",
      secretId: "secret_789",
      reporter: "@user_reporter",
      reporterHandle: "@user_reporter",
      status: "pending",
      priority: "low",
      createdDate: "1/11/2024 10:15:00 AM",
      updatedDate: "",
  },
  {
      id: 4,
      reportType: "ILLEGAL",
      reportDetails: "Illegal Content",
      reportedContent: "Prohibited material",
      contentOwner: "@suspicious_user",
      secretId: "secret_101",
      reporter: "@security_team",
      reporterHandle: "@security_team",
      status: "pending",
      priority: "high",
      createdDate: "1/10/2024 8:45:00 PM",
      updatedDate: "",
  },
];

const Reports: React.FC = () => {
  const { userData, isBrowser } = useUser();
  const navigate = useNavigate();

  const [reports, setReports] = useState<ReportRow[]>(mockReports);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "resolved" | "pending">("all");
  const [filterPriority, setFilterPriority] = useState<"all" | "high" | "medium" | "low">("all");

  useEffect(() => {
    const isAllowed = userData?.role === "admin" && isBrowser;
    if (!isAllowed) {
      navigate("/");
    }

    const bottomNav = document.querySelector(".bottom-nav");
    if (bottomNav) bottomNav.setAttribute("style", "display: none;");
    return () => {
      const bn = document.querySelector(".BottomNav");
      if (bn) bn.setAttribute("style", "display: flex;");
    };
  }, [userData, isBrowser, navigate]);

  const stats = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter(r => r.status === "pending").length;
    const highPriority = reports.filter(r => r.priority === "high").length;
    const resolved = reports.filter(r => r.status === "resolved").length;
    return { total, pending, highPriority, resolved };
  }, [reports]);

  const filteredReports = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return reports.filter(r => {
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
      )
    },
    {
      header: "REPORTED CONTENT",
      key: "reportedContent",
      width: "20%",
      render: (_value, row) => (
        <div>
          <div>{row.reportedContent}</div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>{row.contentOwner}</div>
        </div>
      )
    },
    {
      header: "REPORTER",
      key: "reporter",
      width: "15%",
      render: (_value, row) => (
        <div>
          <div>{row.reporter}</div>
        </div>
      )
    },
    {
      header: "STATUS & PRIORITY",
      key: "status",
      width: "15%",
      render: (_value, row) => (
        <div>
          <div className={`status-badge status-${row.status}`}>{row.status}</div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>{row.priority}</div>
        </div>
      )
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
      )
    },
    {
      header: "ACTIONS",
      key: "id",
      width: "10%",
      render: (_value, _row) => (
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
      )
    }
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

        <div className="filter-container">
          <div className="filter-dropdown">
            <button className="filter-button">
              {filterStatus === "all" ? "All Status" : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
            </button>
          </div>
          <div className="filter-dropdown">
            <button className="filter-button">
              {filterPriority === "all" ? "All Priority" : filterPriority.charAt(0).toUpperCase() + filterPriority.slice(1)}
            </button>
          </div>
        </div>

        <div className="search-container">
          <MdSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search reports by content, reporter, or details..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <Table<ReportRow> columns={columns} data={filteredReports} />
      </div>
    </div>
  );
}

export default Reports;
