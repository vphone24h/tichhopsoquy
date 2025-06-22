import React, { useEffect, useState } from "react";

function QuanLyUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approvingId, setApprovingId] = useState(null);

  const fetchPendingUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/pending-users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Lấy danh sách user thất bại");
      }
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message || "Lỗi khi lấy dữ liệu");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId) => {
    if (!window.confirm("Bạn có chắc muốn phê duyệt user này?")) return;
    setApprovingId(userId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/approve-user/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Phê duyệt user thất bại");
      }
      alert("✅ Đã phê duyệt user thành công");
      // Cập nhật lại danh sách user sau khi phê duyệt
      fetchPendingUsers();
    } catch (err) {
      alert(err.message || "Lỗi khi phê duyệt user");
    }
    setApprovingId(null);
  };

  if (loading) return <div>Đang tải danh sách user...</div>;
  if (error) return <div className="text-red-600">Lỗi: {error}</div>;

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Danh sách User chờ phê duyệt</h1>
      {users.length === 0 ? (
        <p>Không có user nào đang chờ phê duyệt.</p>
      ) : (
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border border-gray-300">Email</th>
              <th className="p-2 border border-gray-300">Ngày đăng ký</th>
              <th className="p-2 border border-gray-300">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td className="p-2 border border-gray-300">{user.email}</td>
                <td className="p-2 border border-gray-300">
                  {new Date(user.createdAt).toLocaleString()}
                </td>
                <td className="p-2 border border-gray-300 text-center">
                  <button
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    disabled={approvingId === user._id}
                    onClick={() => handleApprove(user._id)}
                  >
                    {approvingId === user._id ? "Đang phê duyệt..." : "Phê duyệt"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default QuanLyUser;
