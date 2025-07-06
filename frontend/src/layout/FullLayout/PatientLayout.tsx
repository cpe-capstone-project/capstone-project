import { Outlet } from "react-router";
import NavBar from "../../components/navbar/NavBar";
import "./PatientLayout.css"

function PatientLayout() {

  return (
    <div className="patient-home">
      <NavBar />
      {/* <button onClick={handleLogout}>log out</button> */}
      <section className="content">
        <Outlet />
      </section>
    </div>
  );
}

export default PatientLayout;
