import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useCompany } from "../context/CompanyContext";

function Spinner({ size = 5 }) {
  return (
    <div
      className={`w-${size} h-${size} border-2 border-blue-500 border-t-transparent rounded-full animate-spin`}
    />
  );
}

export default function TaxObligationSearch() {
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const { selectedCompany } = useCompany();

  const handleSearch = async () => {
    setLoadingSearch(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Mock data for demonstration
      setSearchResults([
        ["STT", "Loại tờ khai", "Kỳ tính thuế", "Ngày nộp", "Trạng thái"],
        ["1", "Thuế GTGT", "Quý 1/2024", "15/04/2024", "Chưa nộp"],
        ["2", "Thuế TNCN", "Tháng 3/2024", "20/04/2024", "Đã nộp"],
        ["3", "Thuế TNDN", "Quý 4/2023", "30/01/2024", "Đã nộp"],
      ]);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoadingSearch(false);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">
            TRA CỨU NGHĨA VỤ KÊ KHAI THUẾ
          </h1>
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
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="space-y-3">
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

      {/* Results Table */}
      {searchResults.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-700">
              <thead className="bg-gray-50">
                <tr>
                  {searchResults[0].map((header, idx) => (
                    <th
                      key={idx}
                      className="px-6 py-4 text-left font-medium text-gray-800 border-b border-gray-200"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {searchResults.slice(1).map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-6 py-4 whitespace-nowrap">
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
 