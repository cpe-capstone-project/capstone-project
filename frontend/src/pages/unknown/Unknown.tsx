import { useNavigate } from "react-router";

function Unknown() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };
  return (
    <div className="p-6 text-center">
      <h2 className="text-xl font-semibold mb-4">Awaiting Approval</h2>
      <p className="text-gray-600">
        Your account is pending approval by an administrator. You will be
        notified once your role has been assigned.
      </p>
      <button onClick={handleLogout} className="mt-6 bg-gray-800 text-white px-4 py-2 rounded">
        Logout
      </button>
    </div>
  );
}

export default Unknown;
