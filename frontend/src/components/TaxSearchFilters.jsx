import React from 'react';

const TaxSearchFilters = ({
  selectedStatus,
  setSelectedStatus,
  selectedTaxType,
  setSelectedTaxType,
  statusCounts,
  taxTypeCounts
}) => {
  return (
    <div className="flex gap-2">
      {/* Tax Type Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedTaxType("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center
            ${selectedTaxType === "all"
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Tất cả
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${selectedTaxType === 'all' ? 'bg-white/20 text-white'
            : 'bg-gray-200 text-gray-700'}`}>
            {(typeof taxTypeCounts !== 'undefined' ? taxTypeCounts.all : statusCounts.all) || 0}
          </span>
        </button>
        <button
          onClick={() => setSelectedTaxType("gtgt")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center
            ${selectedTaxType === "gtgt"
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          GTGT
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${selectedTaxType === 'gtgt' ? 'bg-white/20 text-white'
            : 'bg-gray-200 text-gray-700'}`}>
            {(typeof taxTypeCounts !== 'undefined' ? taxTypeCounts.gtgt : statusCounts.completed) || 0}
          </span>
        </button>
        <button
          onClick={() => setSelectedTaxType("tncn")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center
            ${selectedTaxType === "tncn"
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          TNCN
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${selectedTaxType === 'tncn' ? 'bg-white/20 text-white'
            : 'bg-gray-200 text-gray-700'}`}>
            {(typeof taxTypeCounts !== 'undefined' ? taxTypeCounts.tncn : statusCounts.pending) || 0}
          </span>
        </button>
      </div>
      {/* Status Filter */}
      <div className="flex gap-2 items-center ml-auto">
        <select
          id="status-select"
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">
            Tất cả trạng thái ({statusCounts.all})
          </option>
          <option value="completed">
            Hoàn thành ({statusCounts.completed})
          </option>
          <option value="pending">
            Chưa hoàn thành ({statusCounts.pending})
          </option>
        </select>
      </div>
    </div>
  );
};

export default TaxSearchFilters; 