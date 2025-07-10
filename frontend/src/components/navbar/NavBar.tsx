import { useNavigate, useLocation } from "react-router";
import { useState } from "react";
import "./Navbar.css";
import Swal from "sweetalert2";
import healthImage from "../../assets/med5.png";
function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  const handleNavigate = (path: string) => {
    const basePath = location.pathname.split("/")[1];
    navigate(`/${basePath}/${path}`);
  };

  const handleEditProfile = () => {
    const basePath = location.pathname.split("/")[1];
    navigate(`/${basePath}/edit-profile`);
    setShowMenu(false);
  };

const out = () => {
  // เคลียร์ session ก่อน
  localStorage.clear();

  // แสดง Toast
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });

  Toast.fire({
    icon: "success",
    title: "Log out successfully",
  });

  // รอสักครู่ก่อนเปลี่ยนหน้า
  setTimeout(() => {
    navigate("/");
  }, 500);
};
  return (
    <section className="navbar">
     <a href="/patient">
  <img
    className="logo"
    src={healthImage} 
    alt="Health Logo"
  />
</a>
      <ul className="menu">
        <li>
          <a onClick={() => handleNavigate("diary")}>Diary</a>
        </li>
        <li>
          <a onClick={() => handleNavigate("thought")}>Thought Record</a>
        </li>
        <div style={{ position: "relative" }}>
          <img
            className="profile"
            src="https://cdn-icons-png.flaticon.com/128/1430/1430402.png"
            alt=""
            onClick={() => setShowMenu(!showMenu)}
          />
          {showMenu && (
            <div className="housemed-profile-menu">
              <button onClick={handleEditProfile}>Edit Profile</button>
              <button onClick={out}>Logout</button>
            </div>
          )}
        </div>
      </ul>
    </section>
  );
}

export default NavBar;
