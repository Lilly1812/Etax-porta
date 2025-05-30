import React, { useState, useRef, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiRefreshCw } from "react-icons/fi";
import { useCompany } from "../context/CompanyContext";
import { useAuth } from "../context/AuthContext";
import CompanyFormAdd from "../components/CompanyFormAdd";
import CompanyFormEdit from "../components/CompanyFromEdit";
import axios from "axios";

export default function Company() {
  const { selectedCompany, setSelectedCompany } = useCompany();
  const { handleCompanyChange } = useAuth();
  const [highlightedCompany, setHighlightedCompany] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [openPeriodModal, setOpenPeriodModal] = useState(false);
  const [selectedCompanyPeriods, setSelectedCompanyPeriods] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [columns, setColumns] = useState([
    { id: "checkbox", width: 60 },
    { id: "taxId", label: "Mã số thuế", },
    { id: "name", label: "Tên công ty" },
    { id: "companystartdate", label: "Thời gian thành lập"},
    { id: "periods", label: "Kỳ kê khai"},
    { id: "address", label: "Địa chỉ" },
    { id: "phone", label: "Điện thoại"},
    { id: "website", label: "Website"},
  ]);
  
  // Lấy danh sách công ty từ API
  useEffect(() => {
    axios.get("/api/companies")
      .then(res => {
        const mapped = res.data.map(item => ({
          taxId: item.taxId,
          name: item.name,
          companystartdate: item.companystartdate,
          address: item.address,
          phone: item.phone,
          website: item.website,
          periods: item.periods || [],
        }));
        setCompanies(mapped);
      })
      .catch(err => {
        console.error("Lỗi khi lấy danh sách công ty:", err);
        setCompanies([]);
      });
  }, []);

// Thêm công ty
// const handleAddCompany = async (newCompany) => {
//   try {
//     console.log(newCompany);
//     await axios.post("/api/companies", newCompany);
//     // Sau khi thêm, reload lại danh sách
//     const res = await axios.get("/api/companies");
//     setCompanies(res.data.map(item => ({
//       taxId: item.TAX_CODE || item.taxId,
//       name: item.COMPANY_NAME || item.name,
//       companystartdate: item.ESTABLISHED_DATE || item.companystartdate,
//       address: item.ADDRESS || item.address,
//       phone: item.PHONE || item.phone,
//       website: item.WEBSITE || item.website,
//       periods: item.PERIODS || item.periods || [],
//     })));
//     setIsFormOpen(false); // Đóng form
//   } catch (err) {
//     alert("Lỗi khi thêm công tyabc: " + (err.response?.data?.detail || err.message));
//     console.error("Lỗi khi thêm công tybde:", err);
//   }
// };
const handleAddCompany = async (newCompany) => {
  try {
    const payload = {
      taxId: newCompany.taxId,
      name: newCompany.name,
      companystartdate: newCompany.companystartdate,
      address: newCompany.address,
      phone: newCompany.phone,
      website: newCompany.website,
      periods: newCompany.periods?.map(p => ({
      ...p,
      startYear: String(p.startYear),
      endYear: String(p.endYear),
    })) || [], // gửi cả periods lên backend
    };
    await axios.post("/api/companies", payload);
    const res = await axios.get("/api/companies");
    setCompanies(res.data.map(item => ({
      taxId: item.taxId,
      name: item.name,
      companystartdate: item.companystartdate,
      address: item.address,
      phone: item.phone,
      website: item.website,
      periods: item.periods || [],
    })));
    setIsFormOpen(false);
  } catch (err) {
    alert("Lỗi khi thêm công ty: " + (err.response?.data?.detail || err.message));
    console.error("Lỗi khi thêm công ty:", err);
  }
};
// const handleAddCompany = async (newCompany) => {
//   try {
//     // Chỉ gửi đúng các trường backend cần
//     const payload = {
//       taxId: newCompany.taxId,
//       name: newCompany.name,
//       companystartdate: newCompany.companystartdate,
//       address: newCompany.address,
//       phone: newCompany.phone,
//       website: newCompany.website,
//     };
//     console.log("Payload gửi lên:", payload);
//     await axios.post("/api/companies", payload);
//     const res = await axios.get("/api/companies");
//     setCompanies(res.data.map(item => ({
//       taxId: item.TAX_CODE || item.taxId,
//       name: item.COMPANY_NAME || item.name,
//       companystartdate: item.ESTABLISHED_DATE || item.companystartdate,
//       address: item.ADDRESS || item.address,
//       phone: item.PHONE || item.phone,
//       website: item.WEBSITE || item.website,
//       periods: item.PERIODS || item.periods || [],
//     })));
//     setIsFormOpen(false);
//   } catch (err) {
//     alert("Lỗi khi thêm công ty: " + (err.response?.data?.detail || err.message));
//     console.error("Lỗi khi thêm công ty:", err);
//   }
// };
const handleEditClick = () => {
  if (selectedCompanies.length !== 1) {
    alert("Vui lòng chọn 1 công ty để sửa!");
    return;
  }
  const company = companies.find(c => c.taxId === selectedCompanies[0]);
  setSelectedCompany(company);
  setIsEditOpen(true);
};
// Sửa công ty
const handleEditCompany = async (taxId, updatedCompany) => {
  try {
    await axios.put(`/api/companies/${taxId}`, updatedCompany);
    // Sau khi sửa, reload lại danh sách
    const res = await axios.get("/api/companies");
    setCompanies(res.data.map(item => ({
      taxId: item.TAX_CODE || item.taxId,
      name: item.COMPANY_NAME || item.name,
      companystartdate: item.ESTABLISHED_DATE || item.companystartdate,
      address: item.ADDRESS || item.address,
      phone: item.PHONE || item.phone,
      website: item.WEBSITE || item.website,
      periods: item.PERIODS || item.periods || [],
    })));
  } catch (err) {
    alert("Lỗi khi sửa công ty: " + (err.response?.data?.detail || err.message));
    console.error("Lỗi khi sửa công ty:", err);
  }
};

// Xoá công ty
const handleDeleteCompany = async (taxId) => {
  try {
    await axios.delete(`/api/companies/${taxId}`);
    // Sau khi xoá, reload lại danh sách
    const res = await axios.get("/api/companies");
    setCompanies(res.data.map(item => ({
      taxId: item.TAX_CODE || item.taxId,
      name: item.COMPANY_NAME || item.name,
      companystartdate: item.ESTABLISHED_DATE || item.companystartdate,
      address: item.ADDRESS || item.address,
      phone: item.PHONE || item.phone,
      website: item.WEBSITE || item.website,
      periods: item.PERIODS || item.periods || [],
    })));
  } catch (err) {
    console.error("Lỗi khi xoá công ty:", err);
  }
};

const handleDeleteClick = async () => {
  if (selectedCompanies.length === 0) {
    alert("Vui lòng chọn ít nhất 1 công ty để xoá!");
    return;
  }
  if (window.confirm("Bạn có chắc chắn muốn xoá các công ty đã chọn không?")) {
    try {
      // Xoá từng công ty theo taxId
      for (const taxId of selectedCompanies) {
        await handleDeleteCompany(taxId);
      }
      setSelectedCompanies([]);
    } catch (err) {
      alert("Lỗi khi xoá công ty!");
    }
  }
};
  const tableRef = useRef(null);

  const handleDoubleClick = (company) => {
    setSelectedCompany(company);
    handleCompanyChange(company.taxId);
  };

  // const handleAddCompany = (newCompany) => {
  //   setCompanies((prevCompanies) => [...prevCompanies, newCompany]);
  // };

  const handleCheckboxChange = (taxId) => {
    setSelectedCompanies((prev) => {
      if (prev.includes(taxId)) {
        return prev.filter((id) => id !== taxId);
      } else {
        return [...prev, taxId];
      }
    });
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedCompanies(companies.map((company) => company.taxId));
    } else {
      setSelectedCompanies([]);
    }
  };

  return (
    <div className="p-6 h-12/13 flex flex-col rounded-2xl shadow-md bg-white m-6">
      {/* Header */}
      <div className="mb-4 flex gap-2">
        <h1 className="text-2xl font-bold">Danh sách công ty</h1>
      </div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-gray-500">Chọn công ty</div>
        <div className=" flex gap-2">
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#4680ef] text-white rounded-3xl hover:bg-blue-700"
          >
            <FiPlus /> Thêm
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#ffaf24] text-white rounded-3xl hover:bg-amber-700"
          onClick={handleEditClick}
          >
            <FiEdit2 /> Sửa
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-3xl hover:bg-red-700"
            onClick={handleDeleteClick}>
            <FiTrash2 /> Xóa
          </button> 
        </div>
      </div>

      {/* Company Form Sheet */}
      <CompanyFormAdd
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleAddCompany}
      />

      {/* Form sửa công ty */}
      <CompanyFormEdit
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={(updatedCompany) => handleEditCompany(updatedCompany.taxId, updatedCompany)}
        company={selectedCompany}
      />

      {/* Table Container */}
      <div className="flex-1  flex flex-col py-2 h-100">
        <div className="overflow-y-scroll flex-1" ref={tableRef}>
          <table className="w-full table-auto relative">
            <thead className="bg-white sticky top-0 z-10">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={column.id}
                    className="relative bg-white"
                    style={{ width: column.width }}
                  >
                    <div className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                      {column.id === "checkbox" ? (
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={
                            selectedCompanies.length === companies.length
                          }
                          onChange={handleSelectAll}
                        />
                      ) : (
                        column.label
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            {/* Phần table body  */}
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.map((company) => (
                <tr
                  key={company.taxId}
                  className={`cursor-pointer ${
                    highlightedCompany?.taxId === company.taxId
                      ? "bg-blue-50"
                      : ""
                  } ${
                    selectedCompany?.taxId === company.taxId
                      ? "bg-blue-200"
                      : ""
                  }`}
                  onClick={() => setHighlightedCompany(company)}
                  onDoubleClick={() => handleDoubleClick(company)}
                >
                  <td style={{ width: columns[0].width }} className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedCompanies.includes(company.taxId)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleCheckboxChange(company.taxId);
                      }}
                    />
                  </td>
                  <td  className="px-4 py-3">
                    {company.taxId}
                  </td>
                  <td  className="px-4 py-3">
                    {company.name}
                  </td>
                  <td className="px-4 py-3">
                    {company.companystartdate
                      ? company.companystartdate.slice(0, 10)
                      : ""}
                  </td>
                  <td
                    
                    className="px-4 py-3 text-blue-600 underline cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCompanyPeriods(company.periods || []);
                      setOpenPeriodModal(true);
                    }}
                  >
                    Chi tiết
                  </td>
                  <td  className="px-4 py-3">
                    {company.address}
                  </td>
                  <td  className="px-4 py-3">
                    {company.phone}
                  </td>
                  <td  className="px-4 py-3">
                    {company.website}
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination or Status Bar */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <div>Tổng số: {companies.length} công ty</div>
        <div>
          Bản ghi: 1-{companies.length} / {companies.length}
        </div>
      </div>
      {openPeriodModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl h-80 shadow-lg relative">
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-black"
              onClick={() => setOpenPeriodModal(false)}
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-4">Danh sách kỳ kê khai</h2>
            <div className="border rounded overflow-y-scroll max-h-72">
              <table className="min-w-full text-sm text-left table-auto">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-2 font-medium text-gray-700">
                      Từ năm
                    </th>
                    <th className="px-4 py-2 font-medium text-gray-700">
                      Đến năm
                    </th>
                    <th className="px-4 py-2 font-medium text-gray-700">
                      Loại kê khai
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCompanyPeriods.map((p, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-4 py-2">{p.startYear}</td>
                      <td className="px-4 py-2">{p.endYear}</td>
                      <td className="px-4 py-2">
                        {p.type === "theo_nam"
                          ? "Theo năm"
                          : p.type === "theo_quy"
                          ? "Theo quý"
                          : "Theo tháng"}
                      </td>
                    </tr>
                  ))}
                  {selectedCompanyPeriods.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-2 text-center text-gray-500"
                      >
                        Chưa có kỳ kê khai nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
