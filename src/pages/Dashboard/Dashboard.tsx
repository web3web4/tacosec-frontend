import React, { useEffect, useState } from "react";
import { useUser } from "@/context";
import { Navigate, useNavigate } from "react-router-dom";
import { MdPerson, MdLock, MdVisibility, MdAssignment } from "react-icons/md";
import "./Dashboard.css";
import {AdminSidebar} from "@/components";


const Dashboard: React.FC = () => {
  const { userData, isBrowser } = useUser();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 1247,
    activeUsers: 680,
    totalSecrets: 3456,
    newToday: 23,
    totalViews: 15678,
    viewsToday: 156,
    pendingReports: 45
  });
  
  const [recentActivity, setRecentActivity] = useState([
    { type: 'registration', user: '@john_doe', time: '5 minutes ago' },
    { type: 'api_key', user: '@alice_smith', time: '9 minutes ago' },
    { type: 'shared_secret', user: '@bob_wilson', time: '3 users' },
    { type: 'report', user: '@hacker_screen12', time: '10 minutes ago' },
    { type: 'viewed_secret', user: '@diana_prince15', time: '15 minutes ago' }
  ]);

  useEffect(() => {

    // Redirect non-admin users
  if (!userData) return ;

  const isAllowed = userData?.role === "admin" && isBrowser;
  if (!isAllowed) {
    navigate("/");
  }
    // Hide bottom navigation when on dashboard
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) {
      bottomNav.setAttribute('style', 'display: none;');
    }
    
    return () => {
      // Show bottom navigation when leaving dashboard
      const bottomNav = document.querySelector('.BottomNav');
      if (bottomNav) {
        bottomNav.setAttribute('style', 'display: flex;');
      }
    };
    
  }, [userData, navigate, isBrowser]);


  return (

    <div className="container">
         <AdminSidebar />      
      <div className="content">
        <div className="header">
          <h1 className="headerTitle">DASHBOARD OVERVIEW</h1>
          <p className="headerText">Welcome to the TACO Admin Panel. Here's your system overview.</p>
        </div>
        
        <div className="statsGrid">
          <div className="statCard">
            <div className="statIcon">
              <MdPerson />
            </div>
            <div className="statNumber">{stats.totalUsers.toLocaleString()}</div>
            <div className="statLabel">TOTAL USERS</div>
            <div className="statDetail">+{stats.activeUsers} Active</div>
          </div>
          
          <div className="statCard">
            <div className="statIcon">
              <MdLock />
            </div>
            <div className="statNumber">{stats.totalSecrets.toLocaleString()}</div>
            <div className="statLabel">TOTAL SECRETS</div>
            <div className="statDetail">+{stats.newToday} today</div>
          </div>
          
          <div className="statCard">
            <div className="statIcon">
              <MdVisibility />
            </div>
            <div className="statNumber">{stats.totalViews.toLocaleString()}</div>
            <div className="statLabel">TOTAL VIEWS</div>
            <div className="statDetail">+{stats.viewsToday} today</div>
          </div>
          
          <div className="statCard">
            <div className="statIcon">
              <MdAssignment />
            </div>
            <div className="statNumber">{stats.pendingReports}</div>
            <div className="statLabel">PENDING REPORTS</div>
            <div className="statDetail">{stats.pendingReports} Received</div>
          </div>
        </div>
        
        <div className="activitySection">
          <h2 className="sectionTitle">RECENT ACTIVITY</h2>
          <div className="activityList">
            {recentActivity.map((activity, index) => (
              <div className="activityItem" key={index}>
                {activity.type === 'registration' && (
                  <div className="activityContent">
                    <div className="activityIcon"><MdPerson /></div>
                    <div>New user registration</div>
                    <div>{activity.user}</div>
                    <div>{activity.time}</div>
                  </div>
                )}
                
                {activity.type === 'api_key' && (
                  <div className="activityContent">
                    <div className="activityIcon"><MdLock /></div>
                    <div>Created new secret "API Keys"</div>
                    <div>{activity.user}</div>
                    <div>{activity.time}</div>
                  </div>
                )}
                
                {activity.type === 'shared_secret' && (
                  <div className="activityContent">
                    <div className="activityIcon"><MdPerson /></div>
                    <div>Shared secret with {activity.time}</div>
                    <div>{activity.user}</div>
                    <div>{activity.time}</div>
                  </div>
                )}
                
                {activity.type === 'report' && (
                  <div className="activityContent">
                    <div className="activityIcon"><MdAssignment /></div>
                    <div>Reported inappropriate content</div>
                    <div>{activity.user}</div>
                    <div>{activity.time}</div>
                  </div>
                )}
                
                {activity.type === 'viewed_secret' && (
                  <div className="activityContent">
                    <div className="activityIcon"><MdVisibility /></div>
                    <div>Viewed shared secret</div>
                    <div>{activity.user}</div>
                    <div>{activity.time}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="topUsers">
          <h2 className="sectionTitle">TOP USERS</h2>
          {/* Top users content would go here */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;