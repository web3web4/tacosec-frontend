import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdSearch, MdVisibility, MdLock, MdAssignment, MdDelete } from "react-icons/md";
import { useUser } from "@/context";
import Table from "@/components/Table/Table";
import { AdminSidebar } from "@/components";
import "./Dashboard.css";
import { SecretRow, TableColumn } from "@/types";
import { useSecrets } from "@/hooks";


const Secrets: React.FC = () => {
  const { userData, isBrowser } = useUser();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "flagged">("all");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { secrets, stats, totalPages, loading, error } = useSecrets(currentPage, 10);

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

        {loading && <div className="loading">Loading secrets...</div>}
        {error && <div className="error">{error}</div>}

        {!loading && !error && (
          <Table<SecretRow>
            columns={columns}
            data={filteredSecrets}
            pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}

export default Secrets;