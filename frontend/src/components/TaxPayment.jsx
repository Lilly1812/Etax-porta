import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useCompany } from "../context/CompanyContext";
import { useSidebar } from "../context/SidebarContext";

function Spinner({ size = 5 }) {
  return (
    <div
      className={`w-${size} h-${size} border-2 border-blue-500 border-t-transparent rounded-full animate-spin`}
    />
  );
}

export default function TaxPayment() {
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const { selectedCompany } = useCompany();
  const { sidebarCollapsed } = useSidebar();

  const handleSearch = async () => {
    setLoadingSearch(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Mock data for demonstration
      setSearchResults([
        {
          section: "A. CÁC KHOẢN CÒN PHẢI NỘP",
          subsections: [
            {
              title: "I. Các khoản thuế, tiền phạt",
              items: [
                {
                  id: "1",
                  stt: "1",
                  thuTucThanhToan: "Đội Thuế quận Hoàng Mai",
                  coQuanThu: "Tạm nộp/nộp thừa",
                  soThamChieu: "5800279051850001",
                  idKhoanPhaiNop: "",
                  soQuyetDinh: "00/10/2022",
                  kyThue: "06/10/2022",
                  tieuMuc: "4931 - Tiền chậm nộp thuế giá trị gia tăng từ hàng hóa sản xuất kinh doanh trong nước khác còn lại",
                  soTien: "3",
                  goiYXuLy: {
                    nopThue: false,
                    hoanKiemBuTru: false,
                    buTruMSTKhac: false,
                    traSoat: false
                  }
                }
              ]
            },
            {
              title: "II. Các khoản tiền chậm nộp",
              items: []
            },
            {
              title: "III. Các khoản thu khác thuộc NSNN trừ tiền chậm nộp, tiền phạt",
              items: []
            },
            {
              title: "IV. Khoản thuế đang chờ xử lý",
              items: []
            }
          ]
        },
        {
          section: "B. CÁC KHOẢN THUẾ ĐÃ NỘP",
          subsections: [
            {
              title: "",
              items: [
                {
                  stt: "1",
                  thuTucThanhToan: "Đội Thuế quận Hoàng Mai",
                  coQuanThu: "Tạm nộp/nộp thừa",
                  soThamChieu: "5800279051850001",
                  idKhoanPhaiNop: "",
                  soQuyetDinh: "00/10/2022",
                  kyThue: "06/10/2022",
                  tieuMuc: "4931 - Tiền chậm nộp thuế giá trị gia tăng từ hàng hóa sản xuất kinh doanh trong nước khác còn lại",
                  soTien: "3"
                }
              ]
            }
          ]
        },
        {
          section: "C. CÁC KHOẢN THUẾ CÒN ĐƯỢC HOÀN",
          subsections: [
            {
              title: "",
              items: []
            }
          ]
        }
      ]);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoadingSearch(false);
    }
  };

  const renderTableHeader = () => (
    <thead className="sticky top-0">
      <tr>
        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b w-16">STT</th>
        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b min-w-[200px]">Thủ tục thanh toán</th>
        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b min-w-[150px]">Cơ quan thu</th>
        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b min-w-[150px]">Số tham chiếu</th>
        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b min-w-[150px]">ID khoản phải nộp</th>
        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b min-w-[150px]">Số quyết định/ Số thông báo</th>
        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b min-w-[120px]">Kỳ thuế</th>
        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b min-w-[300px]">Tiểu mục</th>
        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b min-w-[120px]">Số tiền</th>
        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b w-24">Loại tiền</th>
        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b w-28">Mã chương</th>
        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b w-28">ĐBHC</th>
        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b min-w-[120px]">Hạn nộp/Ngày chứng từ</th>
        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b min-w-[150px]">Số tiền đã nộp tại NHTM</th>
        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b min-w-[120px]">Trạng thái</th>
        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b min-w-[150px]">Tính chất khoản nộp</th>
        <th colSpan="4" className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b min-w-[400px]">
          Gợi ý xử lý
        </th>
      </tr>
      <tr className="bg-gray-50">
        <th colSpan="16" className="border-b"></th>
        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b w-[100px]">
          Nộp thuế
        </th>
        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b w-[100px]">
          Hoàn kiểm bù trừ
        </th>
        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b w-[100px]">
          Bù trừ cho MST khác
        </th>
        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b w-[100px]">
          Tra soát
        </th>
      </tr>
    </thead>
  );

  const renderTableRow = (item, itemIdx) => (
    <tr 
      key={itemIdx} 
      className="hover:bg-gray-50 transition-colors duration-200"
    >
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.stt}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.thuTucThanhToan}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.coQuanThu}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.soThamChieu}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.idKhoanPhaiNop}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.soQuyetDinh}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.kyThue}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{item.tieuMuc}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.soTien}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.loaiTien || "VND"}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.maChuong || "754"}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.dbhc || "008HH"}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.hanNop}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.soTienDaNop || "0"}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.trangThai || "Chưa nộp"}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.tinhChatKhoanNop || "Nộp thuế"}</td>
      <td className="px-4 py-4 text-center">
        <input
          type="checkbox"
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          checked={item.goiYXuLy?.nopThue}
          onChange={(e) => handleSuggestionChange(item.id, 'nopThue', e.target.checked)}
        />
      </td>
      <td className="px-4 py-4 text-center">
        <input
          type="checkbox"
          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          checked={item.goiYXuLy?.hoanKiemBuTru}
          onChange={(e) => handleSuggestionChange(item.id, 'hoanKiemBuTru', e.target.checked)}
        />
      </td>
      <td className="px-4 py-4 text-center">
        <input
          type="checkbox"
          className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
          checked={item.goiYXuLy?.buTruMSTKhac}
          onChange={(e) => handleSuggestionChange(item.id, 'buTruMSTKhac', e.target.checked)}
        />
      </td>
      <td className="px-4 py-4 text-center">
        <input
          type="checkbox"
          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          checked={item.goiYXuLy?.traSoat}
          onChange={(e) => handleSuggestionChange(item.id, 'traSoat', e.target.checked)}
        />
      </td>
    </tr>
  );

  // Add state to manage checkbox changes
  const [suggestions, setSuggestions] = useState({});

  const handleSuggestionChange = (itemId, type, checked) => {
    setSuggestions(prev => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || {}),
        [type]: checked
      }
    }));
  };

  const renderSection = (section) => (
    <div key={section.section} className="mb-8">
      <div className="text-lg font-semibold text-gray-800 mb-4">{section.section}</div>
      {section.subsections.map((subsection, idx) => (
        <div key={idx} className="mb-6">
          {subsection.title && (
            <div className="text-sm font-medium text-gray-700 mb-3">{subsection.title}</div>
          )}
          {subsection.items.length > 0 && (
            <div className="bg-blue-50 rounded-lg shadow-sm">
              <div className="">
                <div className={`${sidebarCollapsed ? 'w-336' : 'w-296'} overflow-x-auto transition-all duration-300`}>
                  <table className="table-auto">
                    {renderTableHeader()}
                    <tbody className="bg-white divide-y divide-gray-200">
                      {subsection.items.map((item, itemIdx) => renderTableRow(item, itemIdx))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-8 h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">NỘP THUẾ</h1>
          {/* Search Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSearch}
              disabled={loadingSearch}
              className="bg-[#4680ef] text-white px-6 py-2.5 rounded-xl font-medium 
                     hover:bg-blue-600 active:bg-blue-700 
                     transition-all duration-300 ease-in-out
                     transform hover:-translate-y-0.5 active:translate-y-0
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
                     flex items-center gap-2 shadow-lg shadow-blue-100"
            >
              {loadingSearch ? (
                <Spinner size={5} />
              ) : (
                <>
                  <FiSearch size={20} />
                  <span>Tra cứu</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Company Info Card */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 space-y-3">
            <div className="flex items-start">
              <span className="w-48 text-gray-600">Mã số thuế:</span>
              <span className="font-medium text-gray-900">
                {selectedCompany?.taxId}
              </span>
            </div>
            <div className="flex items-start">
              <span className="w-48 text-gray-600">Tên người nộp thuế:</span>
              <span className="font-medium text-gray-900">
                {selectedCompany?.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {searchResults.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Mục I: Các khoản phải nộp, đã nộp, còn phải nộp, nộp thừa, được miễn giảm, được xóa nợ, được hoàn, đã hoàn, còn được hoàn
              </h2>
              <h2 className="text-lg font-semibold text-gray-800">
                Mục II: Các khoản còn phải nộp, nộp thừa, còn được hoàn đã được ghi nhận trong hệ thống ứng dụng quản lý thuế
              </h2>
            </div>
            <div className="space-y-8">
              {searchResults.map(section => renderSection(section))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 