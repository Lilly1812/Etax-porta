import React from 'react';

const TaxSearchFilters = ({ 
  selectedStatus, 
  setSelectedStatus, 
  selectedTaxType, 
  setSelectedTaxType,
  statusCounts 
}) => {
  return (
    <div className="flex gap-2 my-4">
      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto p-2 bg-white rounded-lg shadow-sm">
        <button
          onClick={() => setSelectedStatus("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center
            ${selectedStatus === "all" 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Tất cả
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
            selectedStatus === "all" 
              ? 'bg-white/20 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}>
            {statusCounts.all}
          </span>
        </button>
        <button
          onClick={() => setSelectedStatus("completed")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center
            ${selectedStatus === "completed" 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Hoàn thành
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
            selectedStatus === "completed" 
              ? 'bg-white/20 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}>
            {statusCounts.completed}
          </span>
        </button>
        <button
          onClick={() => setSelectedStatus("pending")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center
            ${selectedStatus === "pending" 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Chưa hoàn thành
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
            selectedStatus === "pending" 
              ? 'bg-white/20 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}>
            {statusCounts.pending}
          </span>
        </button>
      </div>

      {/* Tax Type Filter */}
      <div className="flex gap-2 overflow-x-auto p-2 bg-white rounded-lg shadow-sm">
        <button
          onClick={() => setSelectedTaxType("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center
            ${selectedTaxType === "all" 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setSelectedTaxType("gtgt")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center
            ${selectedTaxType === "gtgt" 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          GTGT
        </button>
        <button
          onClick={() => setSelectedTaxType("tncn")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center
            ${selectedTaxType === "tncn" 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          TNCN
        </button>
      </div>
    </div>
  );
};

export default TaxSearchFilters; 