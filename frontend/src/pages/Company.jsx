import React, { useState, useRef, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiRefreshCw } from "react-icons/fi";
import { useCompany } from "../context/CompanyContext";
import { useAuth } from "../context/AuthContext";
import CompanyFormSheet from "../components/CompanyFormSheet";

export default function Company() {
  const { selectedCompany, setSelectedCompany } = useCompany();
  const { handleCompanyChange } = useAuth();
  const [highlightedCompany, setHighlightedCompany] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [openPeriodModal, setOpenPeriodModal] = useState(false);
  const [selectedCompanyPeriods, setSelectedCompanyPeriods] = useState([]);
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
const [companies, setCompanies] = useState([
  {
    taxId: "0110898594",
    name: "CÔNG TY TNHH DỊCH VỤ VÀ ĐÀO TẠO LÀM ĐẸP ĐÀO HƯƠNG QUỲNH",
    companystartdate: "2002-06-15",
    address: "123 Đường Láng, Đống Đa, Hà Nội",
    email: "contact@daohuongquynh.com",
    phone: "0987654321",
    website: "www.daohuongquynh.com",
    periods: [{ type: "theo_nam", startYear: "2022", endYear: "2024" }],
  },
  {
    taxId: "0318712400",
    name: "CÔNG TY TNHH BEEMORE",
    companystartdate: "2000-03-22",
    address: "456 Lê Văn Lương, Thanh Xuân, Hà Nội",
    email: "info@beemore.vn",
    phone: "0123456789",
    website: "www.beemore.vn",
    periods: [{ type: "theo_quy", startYear: "2002", endYear: "2020" }],
  },
  {
    taxId: "0101245789",
    name: "CÔNG TY CỔ PHẦN CÔNG NGHỆ GREENDEV",
    companystartdate: "2010-09-10",
    address: "22 Nguyễn Chí Thanh, Ba Đình, Hà Nội",
    email: "contact@greendev.vn",
    phone: "0912345678",
    website: "www.greendev.vn",
    periods: [{ type: "theo_nam", startYear: "2015", endYear: "2024" }],
  },
  {
    taxId: "0401029384",
    name: "CÔNG TY TNHH XÂY DỰNG HOÀNG LONG",
    companystartdate: "2015-01-05",
    address: "99 Trường Chinh, Cẩm Lệ, Đà Nẵng",
    email: "support@hoanglongbuild.com",
    phone: "0909876543",
    website: "www.hoanglongbuild.com",
    periods: [{ type: "theo_quy", startYear: "2016", endYear: "2023" }],
  },
  {
    taxId: "0201234567",
    name: "CÔNG TY TNHH SẢN XUẤT NỘI THẤT AN GIA",
    companystartdate: "2018-04-25",
    address: "11 Nguyễn Hữu Cảnh, Quận Bình Thạnh, TP.HCM",
    email: "contact@noithatangia.vn",
    phone: "0938123123",
    website: "www.noithatangia.vn",
    periods: [{ type: "theo_nam", startYear: "2018", endYear: "2025" }],
  },
  {
    taxId: "0312233445",
    name: "CÔNG TY TNHH GIẢI PHÁP PHẦN MỀM VIỆT",
    companystartdate: "2013-08-18",
    address: "55 Lý Thường Kiệt, Quận 10, TP.HCM",
    email: "info@giaiphapphanmemviet.com",
    phone: "0979777888",
    website: "www.giaiphapphanmemviet.com",
    periods: [{ type: "theo_quy", startYear: "2013", endYear: "2024" }],
  },
  {
    taxId: "0105566778",
    name: "CÔNG TY TNHH DỊCH VỤ TÀI CHÍNH FINSERV",
    companystartdate: "2012-11-30",
    address: "144 Lạc Long Quân, Tây Hồ, Hà Nội",
    email: "contact@finserv.vn",
    phone: "0944555666",
    website: "www.finserv.vn",
    periods: [{ type: "theo_nam", startYear: "2012", endYear: "2023" }],
  },
  {
    taxId: "0809988776",
    name: "CÔNG TY TNHH VẬN TẢI TOÀN CẦU",
    companystartdate: "2014-07-12",
    address: "222 Hai Bà Trưng, Quận 1, TP.HCM",
    email: "vanphong@toancau.com",
    phone: "0911999888",
    website: "www.toancaulogistics.vn",
    periods: [{ type: "theo_quy", startYear: "2015", endYear: "2024" }],
  },
  {
    taxId: "0506677889",
    name: "CÔNG TY TNHH TRUYỀN THÔNG MEDIAZ",
    companystartdate: "2017-02-28",
    address: "5 Hoàng Quốc Việt, Cầu Giấy, Hà Nội",
    email: "hello@mediaz.vn",
    phone: "0988888999",
    website: "www.mediaz.vn",
    periods: [{ type: "theo_nam", startYear: "2017", endYear: "2023" }],
  },
  {
    taxId: "0704455667",
    name: "CÔNG TY TNHH ĐẦU TƯ THƯƠNG MẠI MEGABIZ",
    companystartdate: "2016-12-01",
    address: "777 Phạm Văn Đồng, Thủ Đức, TP.HCM",
    email: "megabiz@megabiz.vn",
    phone: "0909090009",
    website: "www.megabiz.vn",
    periods: [{ type: "theo_nam", startYear: "2016", endYear: "2024" }],
  },
  {
    taxId: "0603344556",
    name: "CÔNG TY TNHH SÁNG TẠO TECHLAB",
    companystartdate: "2020-05-17",
    address: "8 Tô Hiệu, Hà Đông, Hà Nội",
    email: "info@techlab.vn",
    phone: "0933444555",
    website: "www.techlab.vn",
    periods: [{ type: "theo_quy", startYear: "2020", endYear: "2025" }],
  },
  {
    taxId: "0902233445",
    name: "CÔNG TY CỔ PHẦN PHÁT TRIỂN GIÁO DỤC NEXTGEN",
    companystartdate: "2011-10-03",
    address: "18 Nguyễn Trãi, Thanh Xuân, Hà Nội",
    email: "contact@nextgen.edu.vn",
    phone: "0966123456",
    website: "www.nextgen.edu.vn",
    periods: [{ type: "theo_nam", startYear: "2011", endYear: "2024" }],
  },
]);



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
                    {company.companystartdate}
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
