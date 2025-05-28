import React from 'react';
import { validateTaxCode } from '../utils/taxCodeUtils';

const TaxSearchResults = ({ searchResults, getFilteredResults }) => {
  if (!searchResults.length) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-auto shadow-sm mb-6 h-[500px]">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-gray-800">Danh sách nghĩa vụ kê khai thuế</h3>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-gray-50">
            <tr>
              {searchResults[0].map((header, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-4 text-left font-medium text-gray-800 border-b border-gray-200 ${
                    idx === 0 ? 'w-16' : // STT
                    idx === 1 ? 'w-48' : // Tên tờ khai
                    idx === 2 ? 'w-32' : // Mã
                    idx === 3 ? 'w-32' : // Kỳ kê khai
                    idx === 4 ? 'w-32' : // Hạn nộp
                    'w-32' // Trạng thái
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {getFilteredResults().map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                {row.map((cell, cellIdx) => {
                  // Validate the "Mã" column (index 2) using tokhaiArray rules
                  let displayValue = cell;
                  if (cellIdx === 2) { // Mã column
                    displayValue = validateTaxCode(cell);
                  }
                  
                  return (
                    <td 
                      key={cellIdx} 
                      className={`px-6 py-4 ${
                        cellIdx === 1 ? 'whitespace-normal' : 'whitespace-nowrap'
                      } ${
                        cellIdx === 5 ? // Trạng thái column
                          cell === 'Hoàn thành' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'
                          : ''
                      }`}
                    >
                      <div className={`${
                        cellIdx === 1 ? 'max-w-[16rem] break-words' : ''
                      }`}>
                        {displayValue}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaxSearchResults; 