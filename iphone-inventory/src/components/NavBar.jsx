import { useNavigate } from "react-router-dom";

function NavBar() {
  const navigate = useNavigate();

  const btnClass =
    "px-3 py-1 rounded text-white font-medium hover:opacity-90";

  return (
    <div className="flex justify-center gap-2 mb-6">
      <button
        onClick={() => navigate("/nhap-hang")}
        className={`${btnClass} bg-blue-600`}
      >
        📥 Nhập hàng
      </button>
      <button
        onClick={() => navigate("/xuat-hang")}
        className={`${btnClass} bg-green-600`}
      >
        📤 Xuất hàng
      </button>
      <button
        onClick={() => navigate("/ton-kho-so-luong")}
        className={`${btnClass} bg-yellow-600`}
      >
        📦 Tồn kho
      </button>
      <button
        onClick={() => navigate("/bao-cao")}
        className={`${btnClass} bg-purple-600`}
      >
        📊 Doanh thu
      </button>
    </div>
  );
}

export default NavBar;
