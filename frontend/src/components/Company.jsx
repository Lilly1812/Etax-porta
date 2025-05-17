import React, { useState, useRef, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiRefreshCw } from "react-icons/fi";
import { useCompany } from "../context/CompanyContext";
import { useAuth } from "../context/AuthContext";
import CompanyFormSheet from "./CompanyFormSheet";

export default function Company() {
  const { selectedCompany, setSelectedCompany } = useCompany();
  const { handleCompanyChange } = useAuth();
  const [highlightedCompany, setHighlightedCompany] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [columns, setColumns] = useState([
    { id: 'checkbox', width: 60 },
    { id: 'taxId', label: 'Mã số thuế', width: 150 },
    { id: 'name', label: 'Tên công ty', width: 300 },
    { id: 'address', label: 'Địa chỉ', width: 250 },
    { id: 'email', label: 'Email', width: 200 },
    { id: 'phone', label: 'Điện thoại', width: 150 },
    { id: 'website', label: 'Website', width: 200 }
  ]);
  const [companies, setCompanies] = useState([
    {
      taxId: "0110898594",
      name: "CÔNG TY TNHH DỊCH VỤ VÀ ĐÀO TẠO LÀM ĐẸP ĐÀO HƯƠNG QUỲNH",
      address: "123 Đường Láng, Đống Đa, Hà Nội",
      email: "contact@daohuongquynh.com",
      phone: "0987654321",
      website: "www.daohuongquynh.com",
    },
    {
      taxId: "0318712400",
      name: "CÔNG TY TNHH BEEMORE",
      address: "456 Lê Văn Lương, Thanh Xuân, Hà Nội",
      email: "info@beemore.vn",
      phone: "0123456789",
      website: "www.beemore.vn",
    },
    {
      taxId: "0109798789",
      name: "HDT TECHNOLOGY COMPANY",
      address: "789 Trần Duy Hưng, Cầu Giấy, Hà Nội",
      email: "contact@hdt.vn",
      phone: "0369852147",
      website: "www.hdt.vn",
    },
    {
      taxId: "0102456789",
      name: "CÔNG TY CỔ PHẦN THƯƠNG MẠI ĐIỆN TỬ ABC",
      address: "321 Giảng Võ, Ba Đình, Hà Nội",
      email: "sales@abc.com.vn",
      phone: "0987123456",
      website: "www.abc.com.vn",
    },
    {
      taxId: "0103789456",
      name: "CÔNG TY TNHH SẢN XUẤT XYZ",
      address: "159 Xuân Thủy, Cầu Giấy, Hà Nội",
      email: "info@xyz.vn",
      phone: "0123789456",
      website: "www.xyz.vn",
    },
  ]);

  const [resizing, setResizing] = useState(null);
  const tableRef = useRef(null);

  const handleDoubleClick = (company) => {
    setSelectedCompany(company);
    handleCompanyChange(company.taxId);
  };

  const handleAddCompany = (newCompany) => {
    setCompanies((prevCompanies) => [...prevCompanies, newCompany]);
  };

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

  const handleResizeStart = (index, e) => {
    setResizing({
      index,
      startX: e.pageX,
      startWidth: columns[index].width
    });
  };

  const handleResizeMove = (e) => {
    if (!resizing) return;

    const diff = e.pageX - resizing.startX;
    const newColumns = [...columns];
    newColumns[resizing.index].width = Math.max(50, resizing.startWidth + diff);
    setColumns(newColumns);
  };

  const handleResizeEnd = () => {
    setResizing(null);
  };

  useEffect(() => {
    if (resizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizing]);

  return (
    <div className="p-6 h-full flex flex-col rounded-2xl shadow-md bg-white m-6">
      {/* Header */}
      <div className="mb-4 flex gap-2">
        <h1 className="text-2xl font-bold">
          Danh sách công ty
        </h1>
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
          <button className="flex items-center gap-2 px-4 py-2 bg-[#ffaf24] text-white rounded-3xl hover:bg-amber-700">
            <FiEdit2 /> Sửa
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-3xl hover:bg-red-700">
            <FiTrash2 /> Xóa
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-3xl hover:bg-green-700 ">
            <FiRefreshCw /> Làm mới
          </button>
        </div>
      </div>

      {/* Company Form Sheet */}
      <CompanyFormSheet
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleAddCompany}
      />

      {/* Table Container */}
      <div className="flex-1 overflow-hidden  flex flex-col py-2">
        <div className="overflow-auto flex-1" ref={tableRef}>
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
                      {column.id === 'checkbox' ? (
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedCompanies.length === companies.length}
                          onChange={handleSelectAll}
                        />
                      ) : (
                        column.label
                      )}
                    </div>
                    {index < columns.length - 1 && (
                      <div
                        className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500 group"
                        onMouseDown={(e) => handleResizeStart(index, e)}
                      >
                        <div className="absolute right-0 top-0 h-full w-1 opacity-0 group-hover:opacity-100 bg-blue-500"></div>
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.map((company) => (
                <tr
                  key={company.taxId}
                  className={`cursor-pointer ${
                    highlightedCompany?.taxId === company.taxId
                      ? "bg-blue-50"
                      : ""
                  } ${
                    selectedCompany?.taxId === company.taxId ? "bg-blue-200" : ""
                  }`}
                  onClick={() => setHighlightedCompany(company)}
                  onDoubleClick={() => handleDoubleClick(company)}
                >
                  <td className="px-4 py-3 text-sm text-gray-900" style={{ width: columns[0].width }}>
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedCompanies.includes(company.taxId)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleCheckboxChange(company.taxId);
                      }}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap" style={{ width: columns[1].width }}>
                    {company.taxId}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900" style={{ width: columns[2].width }}>
                    {company.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900" style={{ width: columns[3].width }}>
                    {company.address}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900" style={{ width: columns[4].width }}>
                    {company.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap" style={{ width: columns[5].width }}>
                    {company.phone}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900" style={{ width: columns[6].width }}>
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
    </div>
  );
}
