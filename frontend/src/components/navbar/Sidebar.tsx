import { useNavigate, useLocation } from "react-router";
import { useState } from "react";
import Swal from "sweetalert2";
import "./Sidebar.css";
import healthImage from "../../assets/med5.png";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleNavigate = (path: string) => {
    const basePath = location.pathname.split("/")[1];
    navigate(`/${basePath}/${path}`);
  };

  const out = () => {
    localStorage.clear();
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Log out successfully",
      showConfirmButton: false,
      timer: 3000,
    });
    setTimeout(() => navigate("/"), 500);
  };

  return (
  <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
  <img src={healthImage} className="sidebar-logo" alt="logo" />

  <div
    className="sidebar-toggle sidebar-button"
    onClick={() => setIsCollapsed(!isCollapsed)}
  >
    <img
      src="https://cdn-icons-png.flaticon.com/128/1549/1549454.png"
      alt="toggle"
      className={`toggle-icon ${isCollapsed ? "rotate" : ""}`}
    />
  </div>

  <div className="sidebar-menu">
    <div
      className={`sidebar-item ${location.pathname.includes("homedoc") ? "active" : ""}`}
      onClick={() => handleNavigate("homedoc")}
    >
      <img src="https://cdn-icons-png.flaticon.com/128/1946/1946488.png" alt="dashboard" />
      {!isCollapsed && <span>Dashboard</span>}
    </div>

    <div
      className={`sidebar-item ${location.pathname.includes("diary") ? "active" : ""}`}
      onClick={() => handleNavigate("diary")}
    >
      <img src=" https://cdn-icons-png.flaticon.com/128/2696/2696455.png" alt="Therapy Case" />
      {!isCollapsed && <span>Therapy Case</span>}
    </div>

    <div
      className={`sidebar-item ${location.pathname.includes("notification") ? "active" : ""}`}
    >
      <img src="https://cdn-icons-png.flaticon.com/128/5001/5001572.png" alt="Notification" />
      {!isCollapsed && <span>Notification</span>}
    </div>

    <div
      className={`sidebar-item ${location.pathname.includes("edit-profile") ? "active" : ""}`}
      onClick={() => setShowMenu(!showMenu)}
    >
      <img src="https://cdn-icons-png.flaticon.com/128/9187/9187475.png" alt="Profile" />
      {!isCollapsed && <span>Profile</span>}
    </div>

    {showMenu && !isCollapsed && (
      <div className="sidebar-profile-menu">
        <button onClick={() => handleNavigate("edit-profile")}>Edit Profile</button>
        <button onClick={out}>Logout</button>
      </div>
    )}
  </div>
<div className="sidebar-divider" />

<div className="sidebar-item" onClick={out}>
  <img src="https://cdn-icons-png.flaticon.com/128/2529/2529508.png" alt="logout" />
  {!isCollapsed && <span>Log out</span>}
</div>
</div>


  );
}

export default Sidebar;
