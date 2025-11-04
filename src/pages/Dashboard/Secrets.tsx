import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdSearch, MdVisibility, MdLock, MdAssignment, MdDelete } from "react-icons/md";
import { useUser } from "@/context";
import Table from "@/components/Table/Table";
import { AdminSidebar } from "@/components";
import "./Dashboard.css";
import { SecretRow, TableColumn } from "@/types";



const mockSecrets: SecretRow[] = [
  {
    id: 1,
    title: "API Keys",
    ownerName: "John Doe",
    ownerHandle: "@crypto_master",
    contactEmail: "john.doe@example.com",
    createdDate: "2023-01-15",
    lastViewed: "2024-01-15 14:30",
    statistics: { views: 300, shares: 12, reports: 0 }
  },
  {
    id: 2,
    title: "Vault Passwords",
    ownerName: "Alice Smith",
    ownerHandle: "@secure_dev",
    contactEmail: "alice.smith@example.com",
    createdDate: "2023-02-20",
    lastViewed: "2024-01-15 12:15",
    statistics: { views: 300, shares: 8, reports: 1 }
  },
  {
    id: 3,
    title: "Private Notes",
    ownerName: "Bob Wilson",
    ownerHandle: "@privacy_pro",
    contactEmail: "bob.wilson@example.com",
    createdDate: "2023-01-28",
    lastViewed: "2024-01-14 18:45",
    statistics: { views: 300, shares: 5, reports: 0 }
  },
  {
    id: 4,
    title: "Server Credentials",
    ownerName: "Charlie Brown",
    ownerHandle: "@vault_keeper",
    contactEmail: "charlie.brown@example.com",
    createdDate: "2023-03-10",
    lastViewed: "2024-01-13 09:20",
    statistics: { views: 300, shares: 4, reports: 3 }
  }
];

const Secrets: React.FC = () => {
  const { userData, isBrowser } = useUser();
  const navigate = useNavigate();

  const [secrets, setSecrets] = useState<SecretRow[]>(mockSecrets);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "flagged">("all");

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
    const total = secrets.length;
    // Since status property was removed, we'll set these to 0
    const active = 0;
    const inactive = 0;
    const flagged = 0;
    return { total, active, inactive, flagged };
  }, [secrets]);

  const filteredSecrets = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return secrets.filter(s => {
      const matchesTerm =
        s.title.toLowerCase().includes(term) ||
        s.ownerName.toLowerCase().includes(term) ||
        s.ownerHandle.toLowerCase().includes(term) ||
        s.contactEmail.toLowerCase().includes(term);

      // Since status property was removed, we'll always return true for status matching
      return matchesTerm;
    });
  }, [secrets, searchTerm]);

  const columns: TableColumn<SecretRow>[] = [
    {
      header: "SECRET",
      key: "title",
      width: "28%",
      render: (_value, row) => (
        <div className="user-info">
          <div className="user-avatar"><MdLock /></div>
          <div className="user-details">
            <div className="user-name">{row.title}</div>
            <div className="user-handle">{row.ownerHandle} • {row.ownerName}</div>
          </div>
        </div>
      )
    },
    {
      header: "OWNER CONTACT",
      key: "contactEmail",
      width: "24%",
      render: (_value, row) => (
        <div>
          <div>{row.contactEmail}</div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>{row.ownerHandle}</div>
        </div>
      )
    },
    {
      header: "TIMING",
      key: "createdDate",
      width: "22%",
      render: (_value, row) => (
        <div>
          <div>Created: {row.createdDate}</div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>Last: {row.lastViewed}</div>
        </div>
      )
    },
    {
      header: "STATISTICS",
      key: "statistics",
      width: "16%",
      render: (_value, row) => (
        <div>
          <div>{row.statistics.views} views</div>
          <div>{row.statistics.shares} shares</div>
          <div>{row.statistics.reports} reports</div>
        </div>
      )
    },
    {
      header: "ACTIONS",
      key: "id",
      width: "10%",
      render: (_value, row) => (
        <div className="action-buttons">
          <div className="action-button action-ban" title="Flag">
            <MdAssignment />
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
          <h1 className="headerTitle">SECRETS MANAGEMENT</h1>
          <p className="headerText">Review and moderate secrets in the system</p>
        </div>

        <div className="statsGrid">
          <div className="statCard">
            <div className="statNumber">{stats.total}</div>
            <div className="statLabel">TOTAL SECRETS</div>
          </div>
          <div className="statCard">
            <div className="statNumber">{stats.active}</div>
            <div className="statLabel">ACTIVE</div>
          </div>
          <div className="statCard">
            <div className="statNumber">{stats.inactive}</div>
            <div className="statLabel">INACTIVE</div>
          </div>
          <div className="statCard">
            <div className="statNumber">{stats.flagged}</div>
            <div className="statLabel">FLAGGED</div>
          </div>
        </div>

        <div className="search-container">
          <MdSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, owner, or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <div className="filter-dropdown">
            <button className="filter-button" onClick={() => setFilterStatus("all")}>
              Status: {filterStatus.toUpperCase()}
            </button>
          </div>
        </div>

        <Table<SecretRow> columns={columns} data={filteredSecrets} />
      </div>
    </div>
  );
}

export default Secrets;