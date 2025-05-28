import React, { useState, useEffect } from "react";
import { FiFileText } from "react-icons/fi";
import { useCompany } from "../context/CompanyContext";
import { findTaxCodeByName, validateTaxCode } from "../utils/taxCodeUtils";
import { getTaxDeclarationList, searchSubmittedTaxDeclarations } from "../services/taxService";
import TaxSearchForm from "../components/TaxSearchForm";
import TaxSearchFilters from "../components/TaxSearchFilters";
import TaxSearchResults from "../components/TaxSearchResults";


export default function TaxObligationSearch() {
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [submittedTaxResults, setSubmittedTaxResults] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedTaxType, setSelectedTaxType] = useState("all"); // "all", "gtgt", "tncn"
  const [selectedStatus, setSelectedStatus] = useState("all"); // "all", "completed", "pending"
  const { selectedCompany } = useCompany();
  // Set default dates on mount
  useEffect(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);

    const formatDateForInput = (date) => date.toISOString().split('T')[0];

    setFromDate(formatDateForInput(startOfYear));
    setToDate(formatDateForInput(today));
  }, []);
  // Filter results based on selected tax type and status
  const getFilteredResults = () => {
    if (!searchResults.length) return [];
    
    const data = searchResults.slice(1);
    
    return data.filter(row => {
      // Filter by tax type
      const taxCode = row[2]?.toLowerCase() || ""; // Mã column
      const taxTypeMatch = 
        selectedTaxType === "all" ||
        (selectedTaxType === "gtgt" && taxCode.includes("gtgt")) ||
        (selectedTaxType === "tncn" && taxCode.includes("tncn"));
      
      // Filter by status
      const status = row[5] || ""; // Trạng thái column
      const statusMatch = 
        selectedStatus === "all" ||
        (selectedStatus === "completed" && status === "Hoàn thành") ||
        (selectedStatus === "pending" && status !== "Hoàn thành");
      
      return taxTypeMatch && statusMatch;
    });
  };

  // Calculate counts for each status
  const getStatusCounts = () => {
    if (!searchResults.length) return { all: 0, completed: 0, pending: 0 };
    
    const data = searchResults.slice(1);
    return {
      all: data.length,
      completed: data.filter(row => row[5] === "Hoàn thành").length,
      pending: data.filter(row => row[5] !== "Hoàn thành").length
    };
  };

  // Function to determine status from processing status
  const getStatus = (processingStatus) => {
    if (!processingStatus) return "";
    const status = processingStatus.toLowerCase();
    if (status.includes("không chấp nhận")) {
      return "Không chấp nhận";
    } else if (status.includes("chấp nhận")) {
      return "Đã Chấp nhận";
    } else if (status.includes("tiếp nhận")) {
      return "Đã tiếp nhận";
    }
    return "";
  };

  const handleSearch = async () => {
    setLoadingSearch(true);
    try {
      // Get tax declaration list
      const result = await getTaxDeclarationList(fromDate, toDate);
      
      // Get submitted tax declarations if dates are provided
      let submittedTaxData = [];
      if (fromDate && toDate) {
        try {
          submittedTaxData = await searchSubmittedTaxDeclarations(fromDate, toDate);
          setSubmittedTaxResults(submittedTaxData);
        } catch (error) {
          console.error("Error fetching submitted tax declarations:", error);
          setSubmittedTaxResults([]);
        }
      } else {
        setSubmittedTaxResults([]);
      }

      // Compare tables and update status
      if (result.data && result.data.length > 1) {
        const updatedSearchResults = [...result.data];
        
        // Extract tax codes and periods from submitted tax results (lower table)
        const submittedTaxInfo = new Map();
        if (submittedTaxData && submittedTaxData.length > 1) {
          // Get header row first
          const headerRow = submittedTaxData[0];
          if (!headerRow) {
            console.warn("No header row found in submitted tax data");
            return;
          }

          // Find the processing status column index
          const processingStatusIndex = headerRow.findIndex(h => 
            h === 'Tiến trình giải quyết hồ sơ (Trạng thái)'
          );

          if (processingStatusIndex === -1) {
            console.warn("Processing status column not found in submitted tax data");
            return;
          }

          // Skip header row (index 0)
          submittedTaxData.slice(1).forEach(row => {
            const tenToKhai = row[2] || ""; // Tờ khai/Phụ lục column
            const kyKeKhai = row[3] || ""; // Kỳ kê khai column
            const processingStatus = row[processingStatusIndex] || "";
            const status = getStatus(processingStatus);
            
            // Debug log for submitted tax info
            console.log("[DEBUG] Processing submitted tax:", {
              tenToKhai,
              kyKeKhai,
              status,
              processingStatus
            });
            
            // Only include if status is "Đã Chấp nhận"
            if (status === "Đã Chấp nhận") {
              const taxCode = findTaxCodeByName(tenToKhai);
              if (taxCode && taxCode !== "undefined") {
                // Store both code and period as a key
                const key = `${taxCode}|${kyKeKhai}`;
                submittedTaxInfo.set(key, true);
              }
            }
          });
        }
        
        // Debug log for submitted tax info map
        console.log("[DEBUG] Submitted tax info map:", 
          Array.from(submittedTaxInfo.keys()).map(key => {
            const [code, period] = key.split('|');
            return { code, period };
          })
        );
        
        // Update status in upper table based on tax code and period matches
        for (let i = 1; i < updatedSearchResults.length; i++) { // Skip header row
          const maColumn = updatedSearchResults[i][2]; // Mã column (index 2)
          const kyKeKhai = updatedSearchResults[i][3]; // Kỳ kê khai column (index 3)
          const currentStatus = updatedSearchResults[i][5] || ""; // Current status column
          
          // Debug log for current row
          console.log("[DEBUG] Processing row:", {
            maColumn,
            kyKeKhai,
            currentStatus
          });
          
          // Create the same key format as in submittedTaxInfo
          const key = `${maColumn}|${kyKeKhai}`;
          
          // Check if this exact code+period combination exists in submitted codes
          if (submittedTaxInfo.has(key) && 
              !currentStatus.toLowerCase().includes("không chấp nhận")) {
            updatedSearchResults[i][5] = "Hoàn thành";
            console.log("[DEBUG] Updated status to 'Hoàn thành' for:", {
              code: maColumn,
              period: kyKeKhai
            });
          }
        }
        
        setSearchResults(updatedSearchResults);
      } else {
        setSearchResults(result.data || []);
      }

    } catch (error) {
      console.error("Search failed:", error);
      alert(`Search failed: ${error.message}`);
    } finally {
      setLoadingSearch(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow m-6 px-8 flex flex-col gap-4">
      {/* Header */}
      <div className="mb-4">
      <div className="flex items-center mb-4">
        <FiFileText size={26} className="text-green-700 mr-2" />
        <span className="text-lg font-semibold tracking-wide">TRA CỨU NGHĨA VỤ KÊ KHAI THUẾ</span>
      </div>


        {/* Search Form */}
        <TaxSearchForm
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          loadingSearch={loadingSearch}
          handleSearch={handleSearch}
        />
      </div>

      {/* Filters */}
      <TaxSearchFilters
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedTaxType={selectedTaxType}
        setSelectedTaxType={setSelectedTaxType}
        statusCounts={getStatusCounts()}
      />

      {/* Results Table */}
      <TaxSearchResults
        searchResults={searchResults}
        getFilteredResults={getFilteredResults}
      />

      {/* Submitted Tax Declarations Table
      {submittedTaxResults.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Tờ khai đã nộp</h2>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-700">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 border-b border-gray-400 text-left font-medium text-gray-800">STT</th>
                    <th className="px-4 py-3 border-b border-gray-400 text-left font-medium text-gray-800">Mã</th>
                    <th className="px-4 py-3 border-b border-gray-400 text-left font-medium text-gray-800">Tờ khai/Phụ lục</th>
                    <th className="px-4 py-3 border-b border-gray-400 text-left font-medium text-gray-800">Kỳ kê khai</th>
                    <th className="px-4 py-3 border-b border-gray-400 text-left font-medium text-gray-800">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {submittedTaxResults.slice(1).map((row, rowIndex) => {
                    const tenToKhaiIndex = submittedTaxResults[0].findIndex(h => 
                      h === 'Tờ khai/Phụ lục' || h === 'Tên tờ khai'
                    );
                    const kyKeKhaiIndex = submittedTaxResults[0].findIndex(h => 
                      h === 'Kỳ kê khai' || h === 'Kỳ tính thuế'
                    );
                    const maGiaoDichIndex = submittedTaxResults[0].findIndex(h => h === 'Mã giao dịch');
                    const processingStatusIndex = submittedTaxResults[0].findIndex(h => 
                      h === 'Tiến trình giải quyết hồ sơ (Trạng thái)'
                    );
                    
                    const tenToKhai = row[tenToKhaiIndex] || '';
                    const kyKeKhai = row[kyKeKhaiIndex] || '';
                    const maGiaoDich = row[maGiaoDichIndex];
                    const processingStatus = row[processingStatusIndex] || '';
                    const status = getStatus(processingStatus);
                    
                    // Extract tax code from declaration name
                    const taxCode = findTaxCodeByName(tenToKhai);

                    return (
                      <tr key={rowIndex} className="border-b border-gray-400 hover:bg-gray-50">
                        <td className="px-4 py-3">{rowIndex + 1}</td>
                        <td className="px-4 py-3">{taxCode}</td>
                        <td className="px-4 py-3">
                          {maGiaoDich ? (
                            <a
                              href={`http://localhost:8000/download?ma_giao_dich=${maGiaoDich}`}
                              className="text-blue-600 underline hover:text-blue-800"
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Tải tệp tờ khai về"
                              onClick={(e) => {
                                e.preventDefault();
                                window.open(`http://localhost:8000/download?ma_giao_dich=${maGiaoDich}`, '_blank');
                              }}
                            >
                              {tenToKhai}
                            </a>
                          ) : (
                            tenToKhai
                          )}
                        </td>
                        <td className="px-4 py-3">{kyKeKhai}</td>
                        <td className="px-4 py-3">{status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}