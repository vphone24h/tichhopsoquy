import { useState, useEffect } from "react";
import LogoutButton from "../components/LogoutButton";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function NhapHang() {
  // State quản lý branch/category
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [branchInput, setBranchInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [editBranchId, setEditBranchId] = useState(null);
  const [editCategoryId, setEditCategoryId] = useState(null);

  // === Lấy mặc định branch/category từ localStorage
  const getLocalBranch = () => localStorage.getItem('lastBranch') || "";
  const getLocalCategory = () => localStorage.getItem('lastCategory') || "";

  const [formData, setFormData] = useState({
    imei: "",
    product_name: "",
    sku: "",
    price_import: "",
    import_date: "",
    supplier: "",
    branch: getLocalBranch(),
    note: "",
    tenSanPham: "",
    quantity: "",
    category: getLocalCategory()
  });

  const [message, setMessage] = useState("");
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const [editingItemId, setEditingItemId] = useState(null);

  const inputClass = "w-full border p-2 rounded h-10";

  const fetchItems = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ton-kho`);
      const data = await res.json();
      setItems(data.items);
    } catch (err) {
      console.error("❌ Lỗi khi tải dữ liệu nhập hàng:", err);
    }
  };

  // Bổ sung fetch branch/category
  const fetchBranches = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/branches`)
      .then(res => res.json())
      .then(data => setBranches(data));
  };
  const fetchCategories = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/categories`)
      .then(res => res.json())
      .then(data => setCategories(data));
  };

  useEffect(() => {
    fetchItems();
    fetchBranches();
    fetchCategories();
  }, []);

  // Khi chọn branch/category thì lưu vào localStorage
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "branch") {
      localStorage.setItem('lastBranch', value);
    }
    if (name === "category") {
      localStorage.setItem('lastCategory', value);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingItemId ? "PUT" : "POST";
      const url = editingItemId
        ? `${import.meta.env.VITE_API_URL}/api/nhap-hang/${editingItemId}`
        : `${import.meta.env.VITE_API_URL}/api/nhap-hang`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, tenSanPham: formData.product_name || formData.tenSanPham })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ ${data.message}`);
        setFormData({
          imei: "",
          product_name: "",
          sku: "",
          price_import: "",
          import_date: "",
          supplier: "",
          branch: formData.branch,
          note: "",
          tenSanPham: "",
          quantity: "",
          category: formData.category
        });
        setEditingItemId(null);
        fetchItems();
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      setMessage("❌ Lỗi kết nối tới server");
    }
  };

  const handleEdit = (item) => {
    setFormData({
      imei: item.imei,
      product_name: item.product_name || item.tenSanPham,
      sku: item.sku,
      price_import: item.price_import,
      import_date: item.import_date?.slice(0, 10) || "",
      supplier: item.supplier,
      branch: item.branch,
      note: item.note,
      tenSanPham: item.tenSanPham,
      quantity: item.quantity || "",
      category: item.category || ""
    });
    setEditingItemId(item._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá mục này không?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/nhap-hang/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setMessage(`🗑️ ${data.message}`);
        fetchItems();
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      setMessage("❌ Lỗi khi xoá mục");
    }
  };

  const exportToExcel = () => {
    const dataToExport = items.map((item) => ({
      IMEI: item.imei,
      Tên_sản_phẩm: item.product_name || item.tenSanPham,
      SKU: item.sku,
      Giá_nhập: item.price_import,
      Ngày_nhập: item.import_date?.slice(0, 10),
      Số_lượng: item.quantity,
      Thư_mục: item.category,
      Nhà_cung_cấp: item.supplier,
      Chi_nhánh: item.branch,
      Ghi_chú: item.note
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "NhapHang");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(file, "danh_sach_nhap_hang.xlsx");
  };

  const importFromExcel = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const wb = XLSX.read(evt.target.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);
      for (const row of data) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/nhap-hang`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imei: row.IMEI,
            product_name: row.Tên_sản_phẩm,
            sku: row.SKU,
            price_import: row.Giá_nhập,
            import_date: row.Ngày_nhập,
            supplier: row.Nhà_cung_cấp,
            branch: row.Chi_nhánh,
            note: row.Ghi_chú,
            quantity: row.Số_lượng,
            category: row.Thư_mục,
            tenSanPham: row.Tên_sản_phẩm
          })
        });
      }
      fetchItems();
      alert("✅ Đã nhập từ Excel thành công!");
    };
    reader.readAsBinaryString(file);
  };

  const filteredItems = items.filter((item) => {
    const matchSearch =
      item.imei?.toLowerCase().includes(search.toLowerCase()) ||
      (item.product_name || item.tenSanPham)?.toLowerCase().includes(search.toLowerCase()) ||
      item.sku?.toLowerCase().includes(search.toLowerCase());
    const matchDate = filterDate ? item.import_date?.slice(0, 10) === filterDate : true;
    const matchBranch = filterBranch ? item.branch === filterBranch : true;
    const matchCategory = filterCategory ? item.category === filterCategory : true;
    return matchSearch && matchDate && matchBranch && matchCategory;
  });

  const paginatedItems = filteredItems.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // ----------- Quản lý branch
  const handleAddBranch = async () => {
    if (!branchInput.trim()) return;
    await fetch(`${import.meta.env.VITE_API_URL}/api/branches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: branchInput.trim() })
    });
    setBranchInput('');
    setShowBranchModal(false);
    setEditBranchId(null);
    fetchBranches();
  };
  const handleEditBranch = async () => {
    if (!branchInput.trim() || !editBranchId) return;
    await fetch(`${import.meta.env.VITE_API_URL}/api/branches/${editBranchId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: branchInput.trim() })
    });
    setBranchInput('');
    setEditBranchId(null);
    setShowBranchModal(false);
    fetchBranches();
  };
  const handleDeleteBranch = async (id) => {
    if (!window.confirm('Xoá chi nhánh này?')) return;
    await fetch(`${import.meta.env.VITE_API_URL}/api/branches/${id}`, { method: "DELETE" });
    fetchBranches();
  };

  // ----------- Quản lý category
  const handleAddCategory = async () => {
    if (!categoryInput.trim()) return;
    await fetch(`${import.meta.env.VITE_API_URL}/api/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: categoryInput.trim() })
    });
    setCategoryInput('');
    setShowCategoryModal(false);
    setEditCategoryId(null);
    fetchCategories();
  };
  const handleEditCategory = async () => {
    if (!categoryInput.trim() || !editCategoryId) return;
    await fetch(`${import.meta.env.VITE_API_URL}/api/categories/${editCategoryId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: categoryInput.trim() })
    });
    setCategoryInput('');
    setEditCategoryId(null);
    setShowCategoryModal(false);
    fetchCategories();
  };
  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Xoá thư mục này?')) return;
    await fetch(`${import.meta.env.VITE_API_URL}/api/categories/${id}`, { method: "DELETE" });
    fetchCategories();
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow mt-10 relative">
      {/* Modal branch */}
      {showBranchModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-20 z-50">
          <div className="bg-white p-6 rounded shadow-md min-w-[300px]">
            <h3 className="mb-2 font-bold">{editBranchId ? 'Sửa chi nhánh' : 'Thêm chi nhánh'}</h3>
            <input type="text" className="border p-2 rounded w-full mb-4" value={branchInput} onChange={e => setBranchInput(e.target.value)} />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowBranchModal(false)} className="px-3 py-1 bg-gray-200 rounded">Huỷ</button>
              {editBranchId ? (
                <button onClick={handleEditBranch} className="px-3 py-1 bg-blue-500 text-white rounded">Lưu</button>
              ) : (
                <button onClick={handleAddBranch} className="px-3 py-1 bg-green-600 text-white rounded">Thêm</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal category */}
      {showCategoryModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-20 z-50">
          <div className="bg-white p-6 rounded shadow-md min-w-[300px]">
            <h3 className="mb-2 font-bold">{editCategoryId ? 'Sửa thư mục' : 'Thêm thư mục'}</h3>
            <input type="text" className="border p-2 rounded w-full mb-4" value={categoryInput} onChange={e => setCategoryInput(e.target.value)} />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowCategoryModal(false)} className="px-3 py-1 bg-gray-200 rounded">Huỷ</button>
              {editCategoryId ? (
                <button onClick={handleEditCategory} className="px-3 py-1 bg-blue-500 text-white rounded">Lưu</button>
              ) : (
                <button onClick={handleAddCategory} className="px-3 py-1 bg-green-600 text-white rounded">Thêm</button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4">
        <LogoutButton />
      </div>

      <div className="flex justify-center space-x-2 mb-6">
        <button onClick={() => (window.location.href = "/nhap-hang")} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">📥 Nhập hàng</button>
        <button onClick={() => (window.location.href = "/xuat-hang")} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">📤 Xuất hàng</button>
        <button onClick={() => (window.location.href = "/ton-kho-so-luong")} className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700">📦 Tồn kho</button>
        <button onClick={() => (window.location.href = "/bao-cao")} className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700">📋 Báo cáo</button>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Nhập hàng iPhone</h2>

      {/* ---- BỘ LỌC --- */}
      <div className="flex gap-4 mb-4">
        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="border p-2 rounded w-40" placeholder="Ngày nhập" />
        {/* filterBranch dropdown */}
        <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)} className="border p-2 rounded w-40">
          <option value="">Chi nhánh</option>
          {branches.map(b => (
            <option key={b._id} value={b.name}>{b.name}</option>
          ))}
        </select>
        {/* filterCategory dropdown */}
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="border p-2 rounded w-40">
          <option value="">Thư mục</option>
          {categories.map(c => (
            <option key={c._id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-between mb-4 gap-4">
        <label className="flex items-center bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700">
          📤 Nhập từ Excel
          <input type="file" accept=".xlsx,.xls" onChange={importFromExcel} hidden />
        </label>
        <button onClick={exportToExcel} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          ⬇️ Xuất Excel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
        <input
          name="imei"
          placeholder="IMEI"
          value={formData.imei}
          onChange={handleChange}
          className={inputClass}
        />
        <input
          name="product_name"
          placeholder="Tên sản phẩm"
          value={formData.product_name}
          onChange={handleChange}
          className={inputClass}
          required
        />
        <input
          name="sku"
          placeholder="SKU"
          value={formData.sku}
          onChange={handleChange}
          className={inputClass}
          required
        />
        <input
          name="price_import"
          type="number"
          placeholder="Giá nhập"
          value={formData.price_import}
          onChange={handleChange}
          className={inputClass}
          required
        />
        <input
          name="import_date"
          type="date"
          placeholder="Ngày nhập"
          value={formData.import_date}
          onChange={handleChange}
          className={inputClass}
          required
        />
        <input
          name="supplier"
          placeholder="Nhà cung cấp"
          value={formData.supplier}
          onChange={handleChange}
          className={inputClass}
        />

        {/* Chi nhánh: dropdown + nút quản lý */}
        <div className="flex gap-2 items-center">
          <select name="branch" value={formData.branch} onChange={handleChange} className={inputClass} required>
            <option value="">Chọn chi nhánh</option>
            {branches.map(b => (
              <option key={b._id} value={b.name}>{b.name}</option>
            ))}
          </select>
          <button type="button" className="text-green-600 text-xl" title="Thêm" onClick={() => { setShowBranchModal(true); setEditBranchId(null); setBranchInput(''); }}>➕</button>
          <button type="button" className="text-yellow-600 text-xl" title="Sửa" onClick={() => {
            if (!formData.branch) return;
            const br = branches.find(b => b.name === formData.branch);
            setEditBranchId(br?._id);
            setBranchInput(formData.branch);
            setShowBranchModal(true);
          }}>✏️</button>
          <button type="button" className="text-red-600 text-xl" title="Xoá" onClick={() => {
            const br = branches.find(b => b.name === formData.branch);
            if (br) handleDeleteBranch(br._id);
          }}>🗑️</button>
        </div>

        <input
          name="note"
          placeholder="Ghi chú"
          value={formData.note}
          onChange={handleChange}
          className={inputClass}
        />
        <input
          name="quantity"
          type="number"
          placeholder="Số lượng"
          value={formData.quantity}
          onChange={handleChange}
          className={inputClass}
          required
        />

        {/* Thư mục: dropdown + nút quản lý */}
        <div className="flex gap-2 items-center">
          <select name="category" value={formData.category} onChange={handleChange} className={inputClass} required>
            <option value="">Chọn thư mục</option>
            {categories.map(c => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
          </select>
          <button type="button" className="text-green-600 text-xl" title="Thêm" onClick={() => { setShowCategoryModal(true); setEditCategoryId(null); setCategoryInput(''); }}>➕</button>
          <button type="button" className="text-yellow-600 text-xl" title="Sửa" onClick={() => {
            if (!formData.category) return;
            const cat = categories.find(c => c.name === formData.category);
            setEditCategoryId(cat?._id);
            setCategoryInput(formData.category);
            setShowCategoryModal(true);
          }}>✏️</button>
          <button type="button" className="text-red-600 text-xl" title="Xoá" onClick={() => {
            const cat = categories.find(c => c.name === formData.category);
            if (cat) handleDeleteCategory(cat._id);
          }}>🗑️</button>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold">
          {editingItemId ? "Cập nhật" : "Nhập hàng"}
        </button>
      </form>

      {message && <p className="mt-4 text-center font-semibold text-green-600">{message}</p>}

      <div className="mt-10">
        <input type="text" placeholder="🔍 Tìm kiếm IMEI, Tên, SKU..." value={search} onChange={(e) => setSearch(e.target.value)} className="border px-4 py-2 rounded w-full mb-4" />
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">IMEI</th>
              <th className="border p-2">Tên sản phẩm</th>
              <th className="border p-2">SKU</th>
              <th className="border p-2 text-center">Giá nhập</th>
              <th className="border p-2">Ngày nhập</th>
              <th className="border p-2">Số lượng</th>
              <th className="border p-2">Thư mục</th>
              <th className="border p-2">Nhà cung cấp</th>
              <th className="border p-2">Chi nhánh</th>
              <th className="border p-2">Ghi chú</th>
              <th className="border p-2 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item) => (
              <tr key={item._id}>
                <td className="border p-2">{item.imei}</td>
                <td className="border p-2">{item.product_name || item.tenSanPham}</td>
                <td className="border p-2">{item.sku}</td>
                <td className="border p-2 text-center">{item.price_import?.toLocaleString()}đ</td>
                <td className="border p-2">{item.import_date?.slice(0, 10)}</td>
                <td className="border p-2">{item.quantity}</td>
                <td className="border p-2">{item.category}</td>
                <td className="border p-2">{item.supplier}</td>
                <td className="border p-2">{item.branch}</td>
                <td className="border p-2">{item.note}</td>
                <td className="border p-2 text-center space-x-1">
                  <button onClick={() => handleEdit(item)} className="bg-yellow-400 text-white px-2 py-1 rounded">✏️</button>
                  <button onClick={() => handleDelete(item._id)} className="bg-red-600 text-white px-2 py-1 rounded">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-center space-x-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i + 1} onClick={() => setPage(i + 1)} className={`px-3 py-1 rounded ${page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NhapHang;
