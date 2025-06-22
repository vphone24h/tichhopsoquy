// src/components/LogoutButton.jsx
import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded text-sm"
    >
      Đăng xuất
    </button>
  );
}

export default LogoutButton;
