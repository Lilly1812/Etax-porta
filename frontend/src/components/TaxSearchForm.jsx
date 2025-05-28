import React from 'react';
import { FiSearch, FiFile } from 'react-icons/fi';
import Spinner from './Spinner';
const handleExport = async () => {
  if (filteredTableData.length <= 1) {
    toast.warning('Không có dữ liệu để xuất');
    return;
  }
  // Implement export logic here
  toast.info('Đang xuất dữ liệu ra file Excel...');
};
const TaxSearchForm = ({ 
  fromDate, 
  setFromDate, 
  toDate, 
  setToDate, 
  loadingSearch, 
  handleSearch 
}) => {
  return (
    <div className="">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col">
          <label htmlFor="fromDate" className="text-xs text-gray-500 mb-1">
          Thời gian
          </label>
          <input
            type="date"
            id="fromDate"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="p-2 border border-gray-300 rounded min-w-[140px]"
            placeholder="Từ ngày"
          />
        </div>
        <span className="text-gray-400 mb-2">-</span>
        <div className="flex flex-col">
          <label htmlFor="toDate" className="text-xs text-gray-500 mb-1">
          &nbsp;
          </label>
          <input
            type="date"
            id="toDate"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="p-2 border border-gray-300 rounded min-w-[140px]"
            placeholder="Đến ngày"
          />
        </div>
        <div className="flex items-end gap-4 ml-auto">
          <button
            onClick={handleSearch}
            disabled={loadingSearch}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 transition-colors text-base font-semibold min-w-[120px] h-12 justify-center"
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
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg shadow hover:bg-purple-700 transition-colors text-base font-semibold min-w-[120px] h-12 justify-center"
          >
            <FiFile size={22} className="mr-2" />
            <span>Xuất</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaxSearchForm; 