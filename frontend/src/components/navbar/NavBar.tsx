import { useNavigate, useLocation } from "react-router";
import "./Navbar.css";

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    // เช่น location.pathname = "/patient"
    // => navigate("/patient/diary")
    const basePath = location.pathname.split("/")[1]; // "patient", "psychologist", etc.
    navigate(`/${basePath}/${path}`);
  };

  return (
    <section className="navbar">
      <a href="/patient">
        <img
          className="logo"
          src="https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/97_Docker_logo_logos-512.png"
          alt=""
        />
      </a>
      <ul className="menu">
        <li>
          <a onClick={() => handleNavigate("diary")}>Diary</a>
        </li>
        <li>
          <a onClick={() => handleNavigate("thought")}>Thought Record</a>
        </li>
        <img
            className="profile"
            src="https://static.vecteezy.com/system/resources/previews/002/275/847/original/male-avatar-profile-icon-of-smiling-caucasian-man-vector.jpg"
            alt=""
        />
      </ul>
    </section>
  );
}

export default NavBar;
