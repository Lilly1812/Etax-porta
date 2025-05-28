import React from 'react';
import { validateTaxCode } from '../utils/taxCodeUtils';

const TaxSearchResults = ({ searchResults, getFilteredResults }) => {
  if (!searchResults.length) {
    return (
      <div className="bg-white border border-gray-400 rounded-lg p-8 text-center">
        <div className="text-gray-400">Không có dữ liệu</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-6">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Danh sách nghĩa vụ kê khai thuế</h3>
      </div>

      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {searchResults[0].map((header, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-3 text-left font-medium text-gray-700 border-b border-gray-200 ${
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
          <tbody className="divide-y divide-gray-100">
            {getFilteredResults().map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="hover:bg-gray-50/50 transition-colors duration-150"
              >
                {row.map((cell, cellIdx) => {
                  let displayValue = cell;
                  if (cellIdx === 2) {
                    displayValue = validateTaxCode(cell);
                  }
                  
                  return (
                    <td 
                      key={cellIdx} 
                      className={`px-6 py-3.5 ${
                        cellIdx === 1 ? 'whitespace-normal' : 'whitespace-nowrap'
                      } ${
                        cellIdx === 5 ? // Trạng thái column
                          cell === 'Hoàn thành' 
                            ? 'text-emerald-600 font-medium' 
                            : 'text-rose-600 font-medium'
                          : 'text-gray-600'
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