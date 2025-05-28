import React from 'react';
import { FiSearch } from 'react-icons/fi';
import Spinner from './Spinner';

const TaxSearchForm = ({ 
  fromDate, 
  setFromDate, 
  toDate, 
  setToDate, 
  loadingSearch, 
  handleSearch 
}) => {
  return (
    <div className="mt-4 bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700 mb-1">
            Từ ngày
          </label>
          <input
            type="date"
            id="fromDate"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="toDate" className="block text-sm font-medium text-gray-700 mb-1">
            Đến ngày
          </label>
          <input
            type="date"
            id="toDate"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-end">
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
    </div>
  );
};

export default TaxSearchForm; 