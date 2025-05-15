import React, { useState } from "react";
import axios from "axios";

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

      console.log('Sending search request with:', {
        from_date: formattedFromDate,
        to_date: formattedToDate,
        maTKhai: selectedTaxType
      });

      const formData = new FormData();
      formData.append('from_date', formattedFromDate);
      formData.append('to_date', formattedToDate);
      formData.append('maTKhai', selectedTaxType);

      const response = await axios.post(
        "http://localhost:8000/search",
        formData,
        {
          headers: { 
            "Content-Type": "multipart/form-data"
          },
        }
      );

      console.log('Search response:', response.data);

      const res = await axios.get("http://localhost:8000/display");
      setTableData(res.data.table);
    } catch (err) {
      console.error("Search error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      alert("Tra cứu thất bại. Vui lòng thử lại.");
    } finally {
      setLoadingSearch(false);
    }
  };

  return (
    <div className="space-y-4 p-8">
      <h2 className="text-2xl font-semibold text-gray-800 text-center">
        Tra cứu tờ khai
      </h2>
      <input
        type="date"
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        value={dates.from}
        onChange={(e) => setDates({ ...dates, from: e.target.value })}
      />
      <input
        type="date"
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        value={dates.to}
        onChange={(e) => setDates({ ...dates, to: e.target.value })}
      />
      <select
        id="maTKhai"
        name="maTKhai"
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
      <button
        onClick={handleSearch}
        disabled={loadingSearch}
        className="w-full bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors flex justify-center items-center text-lg font-semibold"
      >
        {loadingSearch ? <Spinner /> : "Tra cứu"}
      </button>

      {tableData.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Kết quả tra cứu
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 text-sm text-gray-700">
              <thead className="bg-gray-50">
                <tr>
                  {tableData[0].map((header, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-3 border-b text-left font-medium text-gray-800"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.slice(1).map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b hover:bg-gray-50">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-3 border-b">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 