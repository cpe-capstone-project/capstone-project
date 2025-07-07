import { Outlet } from "react-router-dom";
import NavBar from "../../components/navbar/psychonavbar";
import "./PsychoLayout.css";

function PsychoLayout() {
  return (
    <div className="psycho-layout">
      <NavBar />
      <section className="psycho-content">
        <Outlet /> {/* ✅ ตรงนี้จะแสดง child route */}
      </section>
    </div>
  );
}

export default PsychoLayout;
