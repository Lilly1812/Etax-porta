import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiSearch, FiFileText, FiDownload, FiFile } from "react-icons/fi";
import { toast } from 'react-toastify';

function Spinner({ size = 8 }) {
  return (
    <div
      className={`w-${size} h-${size} border-4 border-green-500 border-t-transparent rounded-full animate-spin`}
      style={{
        minWidth: '2rem',
        minHeight: '2rem',
        margin: '0.5rem'
      }}
    />
  );
}

export default function RealTaxSearch() {
  const [dates, setDates] = useState({ from: "", to: "" });
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [selectedTaxType, setSelectedTaxType] = useState("00");
  const [transactionCode, setTransactionCode] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [categoryCounts, setCategoryCounts] = useState({
    all: 0,
    gtgt: 0,
    tncn: 0,
    other: 0
  });
  const [filteredTableData, setFilteredTableData] = useState([]);

  // Function to determine tax category from declaration name
  const getTaxCategory = (declarationName) => {
    if (!declarationName) return "other";
    const name = declarationName.toLowerCase();
    if (name.includes("gtgt") || name.includes("giá trị gia tăng")) {
      return "gtgt";
    } else if (name.includes("tncn") || name.includes("thu nhập cá nhân")) {
      return "tncn";
    }
    return "other";
  };

  // Function to determine status from processing status
  const getStatus = (processingStatus) => {
    if (!processingStatus) return "";
    const status = processingStatus.toLowerCase();
    if (status.includes("không chấp nhận")) {
      return "Không chấp nhận";
    } else if (status.includes("chấp nhận")) {
      return "Đã Chấp nhận";
    } else if (status.includes("tiếp nhận")) {
      return "Đã tiếp nhận";
    }
    return "";
  };

  // Update category counts when table data changes
  useEffect(() => {
    if (tableData.length > 1) {
      const counts = {
        all: tableData.length - 1, // Subtract header row
        gtgt: 0,
        tncn: 0,
        other: 0
      };

      // Find the index of the declaration name column
      const declarationNameIndex = tableData[0].findIndex(header => 
        header === "Tờ khai/Phụ lục" || header === "Tên tờ khai"
      );

      if (declarationNameIndex !== -1) {
        tableData.slice(1).forEach(row => {
          const category = getTaxCategory(row[declarationNameIndex]);
          counts[category]++;
        });
      }

      setCategoryCounts(counts);
    }
  }, [tableData]);

  // Update filtered data when table data, active category, or selected status changes
  useEffect(() => {
    if (tableData.length > 1) {
      let filteredData = tableData;
      
      // First filter by category
      if (activeCategory !== "all") {
        const declarationNameIndex = tableData[0].findIndex(header => 
          header === "Tờ khai/Phụ lục" || header === "Tên tờ khai"
        );

        if (declarationNameIndex !== -1) {
          filteredData = [
            tableData[0],
            ...tableData.slice(1).filter(row => 
              getTaxCategory(row[declarationNameIndex]) === activeCategory
            )
          ];
        }
      }

      // Add status column
      const dataWithStatus = [
        [...filteredData[0], "Trạng thái"],
        ...filteredData.slice(1).map(row => {
          const processingStatusIndex = tableData[0].findIndex(header => 
            header === "Tiến trình giải quyết hồ sơ (Trạng thái)"
          );
          const status = processingStatusIndex !== -1 ? getStatus(row[processingStatusIndex]) : "";
          return [...row, status];
        })
      ];

      // Then filter by status if not "all"
      if (selectedStatus !== "all") {
        const statusIndex = dataWithStatus[0].length - 1; // Last column is status
        filteredData = [
          dataWithStatus[0],
          ...dataWithStatus.slice(1).filter(row => row[statusIndex] === selectedStatus)
        ];
      } else {
        filteredData = dataWithStatus;
      }

      setFilteredTableData(filteredData);
    }
  }, [tableData, activeCategory, selectedStatus]);

  const taxCategories = [
    { id: "all", label: "Tất cả" },
    { id: "gtgt", label: "Thuế GTGT" },
    { id: "tncn", label: "Thuế TNCN" },
    { id: "other", label: "Khác" }
  ];

  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
    if (categoryId === "all") {
      setSelectedTaxType("00");
    } else {
      const declarationNameIndex = tableData[0].findIndex(header => 
        header === "Tờ khai/Phụ lục" || header === "Tên tờ khai"
      );

      if (declarationNameIndex !== -1) {
        const matchingRow = tableData.slice(1).find(row => 
          getTaxCategory(row[declarationNameIndex]) === categoryId
        );

        if (matchingRow) {
          const taxType = matchingRow[declarationNameIndex].split(" - ")[0].trim();
          setSelectedTaxType(taxType);
        }
      }
    }
  };

  // Set default dates on mount
  useEffect(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);

    const formatDateForInput = (date) => date.toISOString().split('T')[0];

    setDates({
      from: formatDateForInput(startOfYear),
      to: formatDateForInput(today)
    });
  }, []);

  const handleSearch = async () => {
    setLoadingSearch(true);
    try {
      const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const [year, month, day] = dateStr.split("-");
        return `${day}/${month}/${year}`;
      };

      const formattedFromDate = formatDate(dates.from);
      const formattedToDate = formatDate(dates.to);

      const formData = new FormData();
      formData.append('from_date', formattedFromDate);
      formData.append('to_date', formattedToDate);
      formData.append('maTKhai', selectedTaxType);
      // Nếu backend hỗ trợ mã giao dịch thì thêm dòng này:
      // formData.append('transaction_code', transactionCode);

      await axios.post(
        "http://localhost:8000/search",
        formData,
        {
          headers: { 
            "Content-Type": "multipart/form-data"
          },
        }
      );

      const res = await axios.get("http://localhost:8000/display");
      setTableData(res.data.table);
    } catch (err) {
      // alert("Tra cứu thất bại. Vui lòng thử lại.");
      toast.error('Tra cứu thất bại. Vui lòng thử lại.');
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleDownload = async () => {
    if (selectedRows.size === 0) {
      toast.warning('Vui lòng chọn ít nhất một tờ khai để tải xuống');
      return;
    }
    // Implement download logic here
    toast.info('Đang tải xuống các tờ khai đã chọn...');
  };

  const handleExport = async () => {
    if (filteredTableData.length <= 1) {
      toast.warning('Không có dữ liệu để xuất');
      return;
    }
    // Implement export logic here
    toast.info('Đang xuất dữ liệu ra file Excel...');
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allRows = new Set(filteredTableData.slice(1).map((_, index) => index));
      setSelectedRows(allRows);
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (rowIndex) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(rowIndex)) {
      newSelectedRows.delete(rowIndex);
    } else {
      newSelectedRows.add(rowIndex);
    }
    setSelectedRows(newSelectedRows);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow m-6 px-8">
      {/* Header */}
      <div className="flex items-center mb-2">
        <FiFileText size={26} className="text-green-700 mr-2" />
        <span className="text-lg font-semibold tracking-wide">TRA CỨU TỜ KHAI THUẾ</span>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-end gap-4 mb-4">
        {/* Thời gian */}
        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">Thời gian</label>
          <input
            type="date"
            className="p-2 border border-gray-300 rounded min-w-[140px]"
            value={dates.from}
            onChange={(e) => setDates({ ...dates, from: e.target.value })}
            placeholder="Từ ngày"
          />
        </div>
        <span className="text-gray-400 mb-2">-</span>
        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">&nbsp;</label>
          <input
            type="date"
            className="p-2 border border-gray-300 rounded min-w-[140px]"
            value={dates.to}
            onChange={(e) => setDates({ ...dates, to: e.target.value })}
            placeholder="Đến ngày"
          />
        </div>
        {/* Mã giao dịch */}
        <div className="flex flex-col min-w-[180px]">
          <label className="text-xs text-gray-500 mb-1">Mã giao dịch</label>
          <input
            type="text"
            className="p-2 border border-gray-300 rounded"
            value={transactionCode}
            onChange={(e) => setTransactionCode(e.target.value)}
            placeholder="Mã giao dịch"
          />
        </div>
        <div className="flex ml-auto gap-2">
          {/* Nút tra cứu */}
          <button
            onClick={handleSearch}
            disabled={loadingSearch}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 transition-colors text-base font-semibold min-w-[120px] h-12 justify-center"
            style={{ marginTop: 22 }}
          >
            {loadingSearch ? <Spinner size={8} /> : (
              <>
                <FiSearch size={22} className="mr-2" />
                <span>Tra cứu</span>
              </>
            )}
          </button>
          {/* Nút tải xuống */}
          <button
            onClick={handleDownload}
            disabled={selectedRows.size === 0}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors text-base font-semibold min-w-[120px] h-12 justify-center"
            style={{ marginTop: 22 }}
          >
            <FiDownload size={22} className="mr-2" />
            <span>Tải xuống</span>
          </button>
          {/* Nút xuất file excel */}
          <button
            onClick={handleExport}
            disabled={filteredTableData.length <= 1}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg shadow hover:bg-purple-700 transition-colors text-base font-semibold min-w-[120px] h-12 justify-center"
            style={{ marginTop: 22 }}
          >
            <FiFile size={22} className="mr-2" />
            <span>Xuất</span>
          </button>
        </div>
      </div>
      
      {/* Navigation Bar */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {taxCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center
              ${activeCategory === category.id 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {category.label}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              activeCategory === category.id 
                ? 'bg-white/20 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}>
              {categoryCounts[category.id]}
            </span>
          </button>
        ))}
        
        {/* Status Filter Dropdown */}
        <div className="ml-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 border-0"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Đã Chấp nhận">Đã Chấp nhận</option>
            <option value="Không chấp nhận">Không chấp nhận</option>
            <option value="Đã tiếp nhận">Đã tiếp nhận</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-400 rounded-lg overflow-x-auto">
        {filteredTableData.length > 0 ? (
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 border-b border-gray-400 text-left font-medium text-gray-800 w-12">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedRows.size === filteredTableData.length - 1}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                </th>
                {filteredTableData[0].map((header, idx) => (
                  <th
                    key={idx}
                    className={
                      `px-4 py-3 border-b border-gray-400 text-left font-medium text-gray-800 ${header === 'Tên tờ khai' ? 'w-32' : ''}`
                    }
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTableData.slice(1).map((row, rowIndex) => {
                return (
                  <tr key={rowIndex} className="border-b border-gray-400 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(rowIndex)}
                        onChange={() => handleSelectRow(rowIndex)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                    </td>
                    {row.map((cell, cellIndex) => {
                      const isTenToKhai = filteredTableData[0][cellIndex] === 'Tờ khai/Phụ lục' || 
                                        filteredTableData[0][cellIndex] === 'Tên tờ khai';
                      const maGiaoDichIndex = filteredTableData[0].findIndex(h => h === 'Mã giao dịch');
                      const maGiaoDich = row[maGiaoDichIndex];
                      
                      if (isTenToKhai && maGiaoDich) {
                        return (
                          <td key={cellIndex} className="px-4 py-3 w-32 break-words">
                            <a
                              href={`http://localhost:8000/download?ma_giao_dich=${maGiaoDich}`}
                              className="text-blue-600 underline hover:text-blue-800"
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Tải tệp tờ khai về"
                              onClick={(e) => {
                                e.preventDefault();
                                window.open(`http://localhost:8000/download?ma_giao_dich=${maGiaoDich}`, '_blank');
                              }}
                            >
                              {cell}
                            </a>
                          </td>
                        );
                      }
                      return (
                        <td
                          key={cellIndex}
                          className={`px-4 py-3 break-words ${filteredTableData[0][cellIndex] === 'Tên tờ khai' ? 'w-32' : ''}`}
                        >
                          {cell}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center text-gray-400 py-8">Không có dữ liệu</div>
        )}
      </div>
    </div>
  );
} 