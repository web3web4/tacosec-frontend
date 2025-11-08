import React, { useState, useEffect } from "react";
import { AdminSidebar, Table } from "@/components";
import { MdSearch, MdCheck, MdBlock, MdDelete } from "react-icons/md";
import { useUser } from "@/context";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { TableColumn, UserData } from "@/types";
import { useUsers } from "@/hooks";
import { MetroSwal } from "@/utils";

const Users: React.FC = () => {
  const { userData, isBrowser } = useUser();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const { users, stats, totalPages, loading, error, toggleActiveStatus } = useUsers(
    currentPage,
    10
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Status");

  useEffect(() => {
    const isAllowed = userData?.role === "admin" && isBrowser;
    if (!isAllowed) navigate("/");

    const bottomNav = document.querySelector(".bottom-nav");
    if (bottomNav) bottomNav.setAttribute("style", "display: none;");

    return () => {
      const bottomNav = document.querySelector(".BottomNav");
      if (bottomNav) bottomNav.setAttribute("style", "display: flex;");
    };
  }, [userData, navigate, isBrowser]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "All Status" ||
      (filterStatus === "Active" && user.isActive) ||
      (filterStatus === "Inactive" && !user.isActive);

    return matchesSearch && matchesStatus;
  });

const handleBanClick = async (userId: string, isActive: boolean) => {
  try {
    const res = await toggleActiveStatus(userId, isActive);
    console.log('Response:', res);
    if (res.success) {
      MetroSwal.fire({
        title: isActive ? "User unbanned successfully" : "User banned successfully",
        icon: "success",
      });
    }
  } catch (error) {
    MetroSwal.fire({
      title: "Error",
      text: "Failed to change user status",
      icon: "error",
    });
  }
};



  const columns: TableColumn<UserData>[] = [
    {
      header: "USER",
      key: "username",
      width: "25%",
      render: (_value, row) => (
        <div className="user-info">
          <div className="user-avatar">{row.username?.charAt(0) || "?"}</div>
          <div className="user-details">
            <div className="user-name">{row.Name}</div>
            <div className="user-handle">@{row.username || "N/A"}</div>
          </div>
        </div>
      ),
    },
    {
      header: "CONTACT",
      key: "phone",
      width: "20%",
      render: (_value, row) => (
        <div>
          {row.phone ? row.phone : "N/A"}
          {row.telegramId && (
            <span
              style={{
                marginLeft: "4px",
                color: "rgba(255,255,255,0.7)",
                fontSize: "12px",
              }}
            >
              : {row.telegramId}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "STATUS",
      key: "isActive",
      width: "10%",
      render: (value) => (
        <div className={`status-badge status-${value ? "active" : "inactive"}`}>
          {value ? "Active" : "Inactive"}
        </div>
      ),
    },
    {
      header: "ACTIVITY",
      key: "joinedDate",
      width: "20%",
      render: (_value, row) => (
        <div>
          <div>Joined: {row.joinedDate}</div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
            Last: {new Date(row.lastActive).toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      header: "STATISTICS",
      key: "statistics",
      width: "15%",
      render: (_value, row) => (
        <div>
          <div>{row.statistics?.secrets ?? 0} secrets</div>
          <div>{row.statistics?.views ?? 0} views</div>
          <div>{row.statistics?.reports ?? 0} reports</div>
        </div>
      ),
    },
    {
      header: "ACTIONS",
      key: "_id",
      width: "10%",
      render: (_value, row) => (
        <div className="action-buttons">
          <div className="action-button action-edit"
           title="Approve User"
           onClick={() => handleBanClick(row._id , true)}
           >
            <MdCheck />
          </div>
          <div className="action-button action-ban"
           title="Ban User"
           onClick={() => handleBanClick(row._id , false)}
          >
            <MdBlock />
          </div>
          <div className="action-button action-delete" title="Delete User">
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
          <h1 className="headerTitle">USER MANAGEMENT</h1>
          <p className="headerText">
            Manage and monitor all users in the system
          </p>
        </div>

        <div className="statsGrid">
          <div className="statCard">
            <div className="statNumber">{stats.totalUsers}</div>
            <div className="statLabel">TOTAL USERS</div>
          </div>
          <div className="statCard">
            <div className="statNumber">{stats.activeUsers}</div>
            <div className="statLabel">ACTIVE USERS</div>
          </div>
          <div className="statCard">
            <div className="statNumber">{stats.inactiveUsers}</div>
            <div className="statLabel">INACTIVE USERS</div>
          </div>
          <div className="statCard">
            <div className="statNumber">{stats.bannedUsers}</div>
            <div className="statLabel">BANNED USERS</div>
          </div>
        </div>

        <div className="search-container">
          <MdSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search users by username or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-dropdown" style={{ marginBottom: "20px" }}>
          <button className="filter-button">{filterStatus} ▼</button>
          <div className="filter-menu" style={{ display: "none" }}>
            <div
              className="filter-item"
              onClick={() => setFilterStatus("All Status")}
            >
              All Status
            </div>
            <div
              className="filter-item"
              onClick={() => setFilterStatus("Active")}
            >
              Active
            </div>
            <div
              className="filter-item"
              onClick={() => setFilterStatus("Inactive")}
            >
              Inactive
            </div>
            <div
              className="filter-item"
              onClick={() => setFilterStatus("Banned")}
            >
              Banned
            </div>
          </div>
        </div>

        {loading && <div className="loading">Loading users...</div>}
        {error && <div className="error">{error}</div>}
        
      {!loading && !error && (
        <Table<UserData>
          columns={columns}
          data={filteredUsers}
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

export default Users;
