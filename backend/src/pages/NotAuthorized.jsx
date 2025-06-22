function NotAuthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded shadow text-center">
        <h1 className="text-3xl font-bold mb-4 text-red-600">403 - Không đủ quyền truy cập</h1>
        <p className="mb-6">Bạn không có quyền truy cập vào trang này.</p>
        <a href="/" className="text-blue-600 hover:underline">Quay lại trang chủ</a>
      </div>
    </div>
  );
}

export default NotAuthorized;
