import React, { useState, useEffect } from 'react';
import { AdminSidebar , Table } from '@/components';
import { MdSearch, MdCheck, MdBlock, MdDelete } from 'react-icons/md';
import { useUser } from '@/context';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { TableColumn, UserData } from '@/types';

// Mock user data
const mockUsers: UserData[] = [
  {
    id: 1,
    username: '@crypto_master',
    name: 'John Doe',
    phone: 'TG: 123456789',
    status: 'active',
    joinedDate: '2023-01-15',
    lastActive: '2024-01-15 14:30',
    statistics: { secrets: 45, views: 1234, reports: 0 },
  },
  {
    id: 2,
    username: '@secure_dev',
    name: 'Alice Smith',
    phone: 'TG: 987654321',
    status: 'active',
    joinedDate: '2023-02-20',
    lastActive: '2024-01-15 12:15',
    statistics: { secrets: 38, views: 987, reports: 1 },
  },
  {
    id: 3,
    username: '@privacy_pro',
    name: 'Bob Wilson',
    phone: 'TG: 456789123',
    status: 'inactive',
    joinedDate: '2023-01-28',
    lastActive: '2024-01-14 18:45',
    statistics: { secrets: 32, views: 876, reports: 0 },
  },
  {
    id: 4,
    username: '@vault_keeper',
    name: 'Charlie Brown',
    phone: 'TG: 789123456',
    status: 'banned',
    joinedDate: '2023-03-10',
    lastActive: '2024-01-13 09:20',
    statistics: { secrets: 29, views: 765, reports: 3 },
  },
];

const Users: React.FC = () => {
  const { userData, isBrowser } = useUser();
  const navigate = useNavigate();

  const [users, setUsers] = useState<UserData[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [stats, setStats] = useState({
    totalUsers: 6,
    activeUsers: 4,
    inactiveUsers: 1,
    bannedUsers: 1,
  });

  useEffect(() => {
    const isAllowed = userData && (userData?.role === 'admin' || isBrowser === true);
    if (!isAllowed) navigate('/');

    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) bottomNav.setAttribute('style', 'display: none;');

    return () => {
      const bottomNav = document.querySelector('.BottomNav');
      if (bottomNav) bottomNav.setAttribute('style', 'display: flex;');
    };
  }, [userData, navigate, isBrowser]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) 
    const matchesStatus =
      filterStatus === 'All Status' || user.status === filterStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const columns: TableColumn<UserData>[] = [
    {
      header: 'USER',
      key: 'username',
      width: '25%',
      render: (_value, row) => (
        <div className="user-info">
          <div className="user-avatar">{row.name.charAt(0)}</div>
          <div className="user-details">
            <div className="user-name">{row.name}</div>
            <div className="user-handle">{row.username}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'CONTACT',
      key: 'phone',
      width: '20%',
      render: (_value, row) => (
        <div>
          <div>{row.phone}</div>
        </div>
      ),
    },
    {
      header: 'STATUS',
      key: 'status',
      width: '10%',
      render: (value) => <div className={`status-badge status-${value as string}`}>{value as string}</div>,
    },
    {
      header: 'ACTIVITY',
      key: 'joinedDate',
      width: '20%',
      render: (_value, row) => (
        <div>
          <div>Joined: {row.joinedDate}</div>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
            Last: {row.lastActive}
          </div>
        </div>
      ),
    },
    {
      header: 'STATISTICS',
      key: 'statistics',
      width: '15%',
      render: (_value, row) => (
        <div>
          <div>{row.statistics.secrets} secrets</div>
          <div>{row.statistics.views} views</div>
          <div>{row.statistics.reports} reports</div>
        </div>
      ),
    },
    {
      header: 'ACTIONS',
      key: 'id',
      width: '10%',
      render: () => (
        <div className="action-buttons">
          <div className="action-button action-edit" title="Edit User">
            <MdCheck />
          </div>
          <div className="action-button action-ban" title="Ban User">
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
          <p className="headerText">Manage and monitor all users in the system</p>
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
            placeholder="Search users by username, name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div className="filter-dropdown">
            <button className="filter-button">{filterStatus} ▼</button>
            <div className="filter-menu" style={{ display: 'none' }}>
              <div className="filter-item" onClick={() => setFilterStatus('All Status')}>
                All Status
              </div>
              <div className="filter-item" onClick={() => setFilterStatus('Active')}>
                Active
              </div>
              <div className="filter-item" onClick={() => setFilterStatus('Inactive')}>
                Inactive
              </div>
              <div className="filter-item" onClick={() => setFilterStatus('Banned')}>
                Banned
              </div>
            </div>
          </div>
        </div>

        <Table<UserData> columns={columns} data={filteredUsers} />
      </div>
    </div>
  );
};

export default Users;
