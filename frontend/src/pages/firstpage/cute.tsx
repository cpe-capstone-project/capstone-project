
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./Cute.css";
import healthImage from "../../assets/health.png";
import doctorImage from "../../assets/doctor.png";
import patientImage from "../../assets/patient.png";
import psychologyImage from "../../assets/psychology.png";

    function App() {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    Swal.fire({
      title: "Choose Your Role?",
      html: `
        <div style="display: flex; justify-content: center; gap: 30px; margin-top: 20px;">
          <div id="patient-role" style="text-align: center; cursor: pointer;">
            <img 
              src="${patientImage}" 
              alt="Patient" 
              style="width: 200px; height: 200px; border-radius: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" 
            />
            <p style="margin-top: 10px; font-weight: bold;">Patient</p>
          </div>
          <div id="psychology-role" style="text-align: center; cursor: pointer;">
            <img 
              src="${psychologyImage}" 
              alt="Psychology" 
              style="width: 200px; height: 200px; border-radius: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" 
            />
            <p style="margin-top: 10px; font-weight: bold;">Psychology</p>
          </div>
        </div>
      `,
      showCancelButton: true,
      showConfirmButton: false,
      showDenyButton: false,
      customClass: {
        popup: "swal2-border-radius",
      },
     didOpen: () => {
  const patientDiv = Swal.getPopup()?.querySelector("#patient-role");
  const psychologyDiv = Swal.getPopup()?.querySelector("#psychology-role");

  patientDiv?.addEventListener("click", () => {
    Swal.close();
    navigate("/register"); // ไปหน้า Patient ทันที
  });

  psychologyDiv?.addEventListener("click", () => {
    Swal.close();
    navigate("/rolehealth"); // ไปหน้า Psychology ทันที
  });
}

    });
  };


  return (
    <div className="health-reset">
      <div className="medic-stars">
    <img src="https://cdn-icons-png.flaticon.com/128/179/179571.png" className="medic-star medic-star1" />
    <img src="https://cdn-icons-png.flaticon.com/128/179/179571.png" className="medic-star medic-star2" />
    <img src="https://cdn-icons-png.flaticon.com/128/179/179571.png" className="medic-star medic-star3" />
    <img src="https://cdn-icons-png.flaticon.com/128/179/179571.png" className="medic-star medic-star4" />
    <img src="https://cdn-icons-png.flaticon.com/128/179/179571.png" className="medic-star medic-star5" />
  </div>
      <div className="health-app">
        <div className="health-info-section">
          <header className="health-header">
            <img src={healthImage} alt="Logo" className="health-logo" />
            <h1 className="health-brand">Depression Rec, Inc.</h1>
          </header>

          <div className="health-text">
            <h2>Your health,<br />our mission</h2>
            <p className="health-subtext">Addressing every need</p>

            <div className="health-buttons">
              <button className="health-btn" onClick={handleRegisterClick}>
                ลงทะเบียน
              </button>
    <button className="health-btn" onClick={() => navigate("/login")}>
        ล็อกอิน
      </button>

            </div>

            <a href="https://www.healthmate.com" className="health-link">
              www.healthmate.com
            </a>
          </div>
        </div>
        <div className="health-image-section">
          <div className="health-image-wrapper">
            <img
              src={doctorImage}
              alt="Doctor and patient illustration"
              className="health-illustration"
            />
          </div>
        </div>
      </div>
      </div>
  );
}

export default App;
