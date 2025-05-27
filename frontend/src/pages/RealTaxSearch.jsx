import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiSearch, FiFileText } from "react-icons/fi";
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

  // Run search when dates are set (on first load)
  useEffect(() => {
    if (dates.from && dates.to) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dates.from, dates.to]);

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
        {/* Loại tờ khai */}
        <div className="flex flex-col min-w-[260px] flex-1">
          <label className="text-xs text-gray-500 mb-1">Loại tờ khai</label>
          <select
            id="maTKhai"
            name="maTKhai"
            className="p-2 border border-gray-300 rounded"
            value={selectedTaxType}
            onChange={(e) => setSelectedTaxType(e.target.value)}
          >
            <option value="00">--Tất cả--</option>
            <option value="--">THUẾ GIÁ TRỊ GIA TĂNG</option>
            <option value="01">&nbsp;&nbsp;&nbsp;&nbsp;01/GTGT - Tờ khai thuế giá trị gia tăng (GTGT)</option>
            <option value="02">&nbsp;&nbsp;&nbsp;&nbsp;02/GTGT - Tờ khai thuế GTGT dành cho dự án đầu tư</option>
            <option value="04">&nbsp;&nbsp;&nbsp;&nbsp;03/GTGT - Tờ khai GTGT theo phương pháp trực tiếp</option>
            <option value="07">&nbsp;&nbsp;&nbsp;&nbsp;04/GTGT - Tờ khai GTGT theo phương pháp trực tiếp trên doanh thu</option>
            <option value="53">&nbsp;&nbsp;&nbsp;&nbsp;05/GTGT - Tờ khai GTGT tạm nộp trên doanh số đối với kinh doanh ngoại tỉnh</option>
            <option value="842">&nbsp;&nbsp;&nbsp;&nbsp;01/GTGT - TỜ KHAI THUẾ GIÁ TRỊ GIA TĂNG (TT80/2021)</option>
            <option value="844">&nbsp;&nbsp;&nbsp;&nbsp;02/GTGT - TỜ KHAI THUẾ GIÁ TRỊ GIA TĂNG (TT80/2021)</option>
            <option value="846">&nbsp;&nbsp;&nbsp;&nbsp;03/GTGT - TỜ KHAI THUẾ GIÁ TRỊ GIA TĂNG (TT80/2021)</option>
            <option value="847">&nbsp;&nbsp;&nbsp;&nbsp;04/GTGT - TỜ KHAI THUẾ GIÁ TRỊ GIA TĂNG (TT80/2021)</option>
            <option value="--">THUẾ THU NHẬP DOANH NGHIỆP</option>
            <option value="03">&nbsp;&nbsp;&nbsp;&nbsp;03/TNDN - Tờ khai quyết toán thuế TNDN</option>
            <option value="892">&nbsp;&nbsp;&nbsp;&nbsp;03/TNDN - Tờ khai quyết toán thuế TNDN (TT80/2021)</option>
            <option value="--">THUẾ THU NHẬP CÁ NHÂN</option>
            <option value="103">&nbsp;&nbsp;&nbsp;&nbsp;06/KK-TNCN - Tờ khai quyết toán thuế thu nhập cá nhân (TT156/2013)</option>
            <option value="139">&nbsp;&nbsp;&nbsp;&nbsp;01/KK-BHDC - Tờ khai khấu trừ thuế thu nhập cá nhân (TT156/2013)</option>
            <option value="394">&nbsp;&nbsp;&nbsp;&nbsp;05/KK-TNCN - Tờ khai khấu trừ thuế thu nhập cá nhân (TT92/2015)</option>
            <option value="395">&nbsp;&nbsp;&nbsp;&nbsp;05/QTT-TNCN - Tờ khai quyết toán thuế TNCN Dành cho tổ chức, cá nhân trả thu nhập chịu thuế từ tiền lương, tiền công cho cá nhân (TT92/2015)</option>
            <option value="864">&nbsp;&nbsp;&nbsp;&nbsp;05/KK-TNCN - Tờ khai khấu trừ thuế thu nhập cá nhân (TT80)</option>
            <option value="953">&nbsp;&nbsp;&nbsp;&nbsp;05/QTT-TNCN - TỜ KHAI QUYẾT TOÁN THUẾ THU NHẬP CÁ NHÂN (TT80/2021)</option>
            <option value="--">BÁO CÁO TÀI CHÍNH</option>
            <option value="285">&nbsp;&nbsp;&nbsp;&nbsp;TT 95/2008/TT-BTC - Báo cáo tài chính</option>
            <option value="402">&nbsp;&nbsp;&nbsp;&nbsp;TT200 - Bộ báo cáo tài chính</option>
            <option value="683">&nbsp;&nbsp;&nbsp;&nbsp;TT133_VuaVaNho_LT_B01a - Bộ báo cáo tài chính dành cho doanh nghiệp vừa và nhỏ hoạt động liên tục mẫu B01a (thông tư 133/2016/TT-BTC)</option>
            <option value="695">&nbsp;&nbsp;&nbsp;&nbsp;TT24/BCTC_B01A - (excel)Bộ BCTC theo mẫu B01a của TT133 đáp ứng TT24</option>
            <option value="699">&nbsp;&nbsp;&nbsp;&nbsp;BCTC_TT24_B01a - Báo cáo tài chính năm (TT24/2017/TT-BTC - mẫu B01a theo TT133)</option>
            <option value="--">THUẾ MÔN BÀI</option>
            <option value="464">&nbsp;&nbsp;&nbsp;&nbsp;01/MBAI - Tờ khai lệ phí môn bài (NĐ139/2016)</option>
            <option value="55">&nbsp;&nbsp;&nbsp;&nbsp;01/MBAI - Tờ khai thuế môn bài (TT156/2013)</option>
            <option value="824">&nbsp;&nbsp;&nbsp;&nbsp;01/LPMB - Tờ khai lệ phí môn bài (TT80/2021)</option>
            <option value="--">THÔNG BÁO HÓA ĐƠN</option>
            <option value="106">&nbsp;&nbsp;&nbsp;&nbsp;TB01/AC - Thông báo phát hành hóa đơn</option>
            <option value="107">&nbsp;&nbsp;&nbsp;&nbsp;TB03/AC - Thông báo kết quả hủy hóa đơn</option>
            <option value="--">BÁO CÁO HÓA ĐƠN</option>
            <option value="102">&nbsp;&nbsp;&nbsp;&nbsp;BC26/AC - Báo cáo tình hình sử dụng hóa đơn</option>
            <option value="300">&nbsp;&nbsp;&nbsp;&nbsp;BC26/AC - Báo cáo tình hình sử dụng hóa đơn theo số lượng</option>
          </select>
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
        {/* Nút tra cứu */}
        <button
          onClick={handleSearch}
          disabled={loadingSearch}
          className="ml-auto flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 transition-colors text-base font-semibold min-w-[120px] h-12 justify-center"
          style={{ marginTop: 22 }}
        >
          {loadingSearch ? <Spinner size={8} /> : (
            <>
              <FiSearch size={22} className="mr-2" />
              <span>Tra cứu</span>
            </>
          )}
        </button>
      </div>
      {/* Table */}
      <div className="bg-white border border-gray-400 rounded-lg overflow-x-auto">
        {tableData.length > 0 ? (
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-50">
              <tr>
                {tableData[0].map((header, idx) => (
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
              {tableData.slice(1).map((row, rowIndex) => {
                return (
                  <tr key={rowIndex} className="border-b border-gray-400 hover:bg-gray-50">
                    {row.map((cell, cellIndex) => {
                      const isTenToKhai = tableData[0][cellIndex] === 'Tờ khai/Phụ lục';
                      const maGiaoDichIndex = tableData[0].findIndex(h => h === 'Mã giao dịch');
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
                            >
                              {cell}
                            </a>
                          </td>
                        );
                      }
                      return (
                        <td
                          key={cellIndex}
                          className={`px-4 py-3 break-words ${tableData[0][cellIndex] === 'Tên tờ khai' ? 'w-32' : ''}`}
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