import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useCompany } from "../context/CompanyContext";

// Tax declaration codes from to_khai_thue.js
const validTaxCodes = [
  "01/GTGT", "02/GTGT", "03/GTGT", "04/GTGT", "05/GTGT", "01/GTGT (TT80/2021)", "02/GTGT (TT80/2021)", 
  "03/GTGT (TT80/2021)", "04/GTGT (TT80/2021)", "05/GTGT (TT80/2021)", "03/TNDN", "01A/TNDN", 
  "GH_TNDN_TT170", "GH_TNDN_TT83", "01B/TNDN", "04/TNDN", "06/TNDN", "05/TNDN", "02/TNDN", 
  "05/TNDN (TT80/2021)", "06/TNDN (TT80/2021)", "04/TNDN (TT80/2021)", "02/TNDN (TT80/2021)", 
  "03/TNDN (TT80/2021)", "06/KK-TNCN", "01/KK-BHDC", "02TH", "01/XS-BHDC", "05/DS-TNCN", 
  "05/KK-TNCN (TT92/2015)", "05/QTT-TNCN (TT92/2015)", "06/TNCN (TT92/2015)", "05/KK-TNCN (TT156/2013)", 
  "02/KK-BHÐC (TT156/2013)", "02/KK-XS (TT156/2013)", "01/KK-XS (TT156/2013)", "02/KK-TNCN (TT156/2013)", 
  "01/XSBHĐC", "03/KK-TNCN", "04/CNV-TNCN (TT80/2021)", "04/ÐTV-TNCN (TT80/2021)", "05/KK-TNCN (TT80/2021)", 
  "06/TNCN (TT80/2021)", "05/QTT-TNCN (TT80/2021)", "01/TAIN", "02/TAIN", "01/TAIN (TT80/2021)", 
  "02/TAIN (TT80/2021)", "01/TTĐB", "02/TTĐB", "03/TTĐB", "01/TTĐB (TT80/2021)", "02/TTĐB (TT80/2021)", 
  "03/TTĐB (TT80/2021)", "04/TTĐB (TT80/2021)", "01/BVE", "01/HPM", "02/HPM", "03/HPM", "01/HPM (TT80/2021)", 
  "02/HPM (TT80/2021)", "03/HPM (TT80/2021)", "01/PHM", "02/PHM", "01/PHM (TT80/2021)", "02/PHM (TT80/2021)", 
  "01/TCM", "02/TCM", "01/TCM (TT80/2021)", "02/TCM (TT80/2021)", "01/TSD", "02/TSD", "01/TSD (TT80/2021)", 
  "02/TSD (TT80/2021)", "01/GSM", "02/GSM", "01/GSM (TT80/2021)", "02/GSM (TT80/2021)", "01/MAT", 
  "02/MAT", "01/MAT (TT80/2021)", "02/MAT (TT80/2021)", "01/TTS", "02/TTS", "01/TTS (TT80/2021)", 
  "02/TTS (TT80/2021)", "01/TTS_TT40", "01/CNKD", "01/LNCN-VSP", "01/TK-VSP", "01-1/PTHU-VSP", 
  "01-1/TNDN-VSP", "01/TNS", "02/TNDN-VSP", "02/LNCN-VSP", "02/TAIN-VSP", "01/ĐCĐB-VSP", "02/PTHU-VSP", 
  "01/ĐK-BL", "TB01/AC", "BC01/AC", "BC21/AC", "TB03/AC", "BC7/AC", "TT303/BLaiCDD", "TT303/ThayDoiTT", 
  "01/TEM", "03/TEM"
];

// toKhaiArray structure (simplified for frontend use)
const toKhaiArray = {
  "THUẾ GIÁ TRỊ GIA TĂNG": [
    { "ten_to_khai": "01/GTGT - Tờ khai thuế giá trị gia tăng (GTGT)", "ten_viet_tat": "01/GTGT" },
    { "ten_to_khai": "02/GTGT - Tờ khai thuế GTGT dành cho dự án đầu tư", "ten_viet_tat": "02/GTGT" },
    { "ten_to_khai": "03/GTGT - Tờ khai GTGT theo phương pháp trực tiếp", "ten_viet_tat": "03/GTGT" },
    { "ten_to_khai": "04/GTGT - Tờ khai GTGT theo phương pháp trực tiếp trên doanh thu", "ten_viet_tat": "04/GTGT" },
    { "ten_to_khai": "05/GTGT - Tờ khai GTGT tạm nộp trên doanh số đối với kinh doanh ngoại tỉnh", "ten_viet_tat": "05/GTGT" },
    { "ten_to_khai": "01/GTGT - TỜ KHAI THUẾ GIÁ TRỊ GIA TĂNG (TT80/2021)", "ten_viet_tat": "01/GTGT (TT80/2021)" },
    { "ten_to_khai": "02/GTGT - TỜ KHAI THUẾ GIÁ TRỊ GIA TĂNG (TT80/2021)", "ten_viet_tat": "02/GTGT (TT80/2021)" },
    { "ten_to_khai": "03/GTGT - TỜ KHAI THUẾ GIÁ TRỊ GIA TĂNG (TT80/2021)", "ten_viet_tat": "03/GTGT (TT80/2021)" },
    { "ten_to_khai": "04/GTGT - TỜ KHAI THUẾ GIÁ TRỊ GIA TĂNG (TT80/2021)", "ten_viet_tat": "04/GTGT (TT80/2021)" },
    { "ten_to_khai": "05/GTGT - TỜ KHAI THUẾ GIÁ TRỊ GIA TĂNG (TT80/2021)", "ten_viet_tat": "05/GTGT (TT80/2021)" }
  ],
  "THUẾ THU NHẬP DOANH NGHIỆP": [
    { "ten_to_khai": "03/TNDN - Tờ khai quyết toán thuế TNDN", "ten_viet_tat": "03/TNDN" },
    { "ten_to_khai": "01A/TNDN - Tờ khai thuế TNDN tạm tính", "ten_viet_tat": "01A/TNDN" },
    { "ten_to_khai": "GH_TNDN_TT170 - Bảng kê gia hạn thuế TNDN theo TT170", "ten_viet_tat": "GH_TNDN_TT170" },
    { "ten_to_khai": "GH_TNDN_TT83 - Bảng kê gia hạn thuế TNDN theo TT83/2012/TT-BTC", "ten_viet_tat": "GH_TNDN_TT83" },
    { "ten_to_khai": "01B/TNDN - Tờ khai thuế TNDN tạm tính", "ten_viet_tat": "01B/TNDN" },
    { "ten_to_khai": "04/TNDN - Tờ khai thuế TNDN tính theo tỷ lệ thu nhập trên doanh thu", "ten_viet_tat": "04/TNDN" },
    { "ten_to_khai": "06/TNDN - Tờ khai thuế thu nhập doanh nghiệp", "ten_viet_tat": "06/TNDN" },
    { "ten_to_khai": "05/TNDN - Tờ khai thuế thu nhập doanh nghiệp đối với thu nhập từ chuyển nhượng vốn", "ten_viet_tat": "05/TNDN" },
    { "ten_to_khai": "02/TNDN - TỜ KHAI THUẾ THU NHẬP DOANH NGHIỆP", "ten_viet_tat": "02/TNDN" },
    { "ten_to_khai": "05/TNDN - Thuế thu nhập doanh nghiệp (TT80/2021)", "ten_viet_tat": "05/TNDN (TT80/2021)" },
    { "ten_to_khai": "06/TNDN - Tờ khai thuế thu nhập doanh nghiệp(TT80/2021)", "ten_viet_tat": "06/TNDN (TT80/2021)" },
    { "ten_to_khai": "04/TNDN - TỜ KHAI THUẾ THU NHẬP DOANH NGHIỆP (TT80/2021)", "ten_viet_tat": "04/TNDN (TT80/2021)" },
    { "ten_to_khai": "02/TNDN - TỜ KHAI THUẾ THU NHẬP DOANH NGHIỆP (TT80/2021)", "ten_viet_tat": "02/TNDN (TT80/2021)" },
    { "ten_to_khai": "03/TNDN - Tờ khai quyết toán thuế TNDN (TT80/2021)", "ten_viet_tat": "03/TNDN (TT80/2021)" }
  ],
  "THUẾ THU NHẬP CÁ NHÂN": [
    { "ten_to_khai": "06/KK-TNCN - Tờ khai quyết toán thuế thu nhập cá nhân (TT156/2013)", "ten_viet_tat": "06/KK-TNCN" },
    { "ten_to_khai": "01/KK-BHDC - Tờ khai khấu trừ thuế thu nhập cá nhân (TT156/2013)", "ten_viet_tat": "01/KK-BHDC" },
    { "ten_to_khai": "02TH - Bảng tổng hợp đăng ký người phụ thuộc giảm trừ gia cảnh", "ten_viet_tat": "02TH" },
    { "ten_to_khai": "01/XS-BHDC - Tờ khai khấu trừ thuế XSHBDC (TT92/2015)", "ten_viet_tat": "01/XS-BHDC" },
    { "ten_to_khai": "05/DS-TNCN - Danh sách cá nhân nhận thu nhập (TT92/2015)", "ten_viet_tat": "05/DS-TNCN" },
    { "ten_to_khai": "05/KK-TNCN - Tờ khai khấu trừ thuế thu nhập cá nhân (TT92/2015)", "ten_viet_tat": "05/KK-TNCN (TT92/2015)" },
    { "ten_to_khai": "05/QTT-TNCN - Tờ khai quyết toán thuế TNCN Dành cho tổ chức, cá nhân trả thu nhập chịu thuế từ tiền lương, tiền công cho cá nhân (TT92/2015)", "ten_viet_tat": "05/QTT-TNCN (TT92/2015)" },
    { "ten_to_khai": "06/TNCN - Tờ khai khấu trừ thuế TNCN (TT92/2015)", "ten_viet_tat": "06/TNCN (TT92/2015)" },
    { "ten_to_khai": "05/KK-TNCN - Tờ khai quyết toán thuế thu nhập cá nhân (TT156/2013)", "ten_viet_tat": "05/KK-TNCN (TT156/2013)" },
    { "ten_to_khai": "02/KK-BHÐC - Tờ khai quyết toán thuế thu nhập cá nhân (TT156/2013)", "ten_viet_tat": "02/KK-BHÐC (TT156/2013)" },
    { "ten_to_khai": "02/KK-XS - Tờ khai quyết toán thuế thu nhập cá nhân (TT156/2013)", "ten_viet_tat": "02/KK-XS (TT156/2013)" },
    { "ten_to_khai": "01/KK-XS - Tờ khai khấu trừ thuế thu nhập cá nhân (TT156/2013)", "ten_viet_tat": "01/KK-XS (TT156/2013)" },
    { "ten_to_khai": "02/KK-TNCN - Tờ khai khấu trừ thuế thu nhập cá nhân (TT156/2013)", "ten_viet_tat": "02/KK-TNCN (TT156/2013)" },
    { "ten_to_khai": "01/XSBHĐC - Tờ khai thuế thu nhập cá nhân (TT40/2021)", "ten_viet_tat": "01/XSBHĐC" },
    { "ten_to_khai": "03/KK-TNCN - Tờ khai khấu trừ thuế thu nhập cá nhân (TT156/2013)", "ten_viet_tat": "03/KK-TNCN" },
    { "ten_to_khai": "04/CNV-TNCN - Tờ khai thuế thu nhập cá nhân (TT80/2021)", "ten_viet_tat": "04/CNV-TNCN (TT80/2021)" },
    { "ten_to_khai": "04/ÐTV-TNCN - Tờ khai thuế thu nhập cá nhân (TT80/2021)", "ten_viet_tat": "04/ÐTV-TNCN (TT80/2021)" },
    { "ten_to_khai": "05/KK-TNCN - Tờ khai khấu trừ thuế thu nhập cá nhân (TT80)", "ten_viet_tat": "05/KK-TNCN (TT80/2021)" },
    { "ten_to_khai": "06/TNCN - Tờ khai khấu trừ thuế TNCN (TT80)", "ten_viet_tat": "06/TNCN (TT80/2021)" },
    { "ten_to_khai": "05/QTT-TNCN - TỜ KHAI QUYẾT TOÁN THUẾ THU NHẬP CÁ NHÂN (TT80/2021)", "ten_viet_tat": "05/QTT-TNCN (TT80/2021)" }
  ],
  "THUẾ TÀI NGUYÊN": [
    { "ten_to_khai": "01/TAIN - Tờ khai thuế tài nguyên", "ten_viet_tat": "01/TAIN" },
    { "ten_to_khai": "02/TAIN - Tờ khai quyết toán thuế tài nguyên", "ten_viet_tat": "02/TAIN" },
    { "ten_to_khai": "01/TAIN - Tờ khai thuế tài nguyên (TT80/2021)", "ten_viet_tat": "01/TAIN (TT80/2021)" },
    { "ten_to_khai": "02/TAIN - Tờ khai quyết toán thuế tài nguyên (TT80/2021)", "ten_viet_tat": "02/TAIN (TT80/2021)" }
  ],
  "THUẾ TIÊU THỤ ĐẶC BIỆT": [
    { "ten_to_khai": "01/TTĐB - Tờ khai thuế tiêu thụ đặc biệt (TT156/2013)", "ten_viet_tat": "01/TTĐB" },
    { "ten_to_khai": "01/TTĐB - Tờ khai thuế TTĐB (TT195/2015)", "ten_viet_tat": "01/TTĐB" },
    { "ten_to_khai": "01/TTĐB - Tờ khai thuế tiêu thụ đặc biệt (TT80/2021)", "ten_viet_tat": "01/TTĐB (TT80/2021)" },
    { "ten_to_khai": "02/TTĐB - Tờ khai thuế tiêu thụ đặc biệt (TT80/2021)", "ten_viet_tat": "02/TTĐB (TT80/2021)" },
    { "ten_to_khai": "03/TTĐB - Tờ khai thuế tiêu thụ đặc biệt (TT80/2021)", "ten_viet_tat": "03/TTĐB (TT80/2021)" },
    { "ten_to_khai": "04/TTĐB - Tờ khai thuế tiêu thụ đặc biệt (TT80/2021)", "ten_viet_tat": "04/TTĐB (TT80/2021)" }
  ],
  "THUẾ BẢO VỆ MÔI TRƯỜNG": [
    { "ten_to_khai": "01/TBVMT - Tờ khai thuế bảo vệ môi trường", "ten_viet_tat": "01/TBVMT" },
    { "ten_to_khai": "01/TBVMT - Tờ khai thuế bảo vệ môi trường theo TT80", "ten_viet_tat": "01/TBVMT" }
  ],
  "BIÊN LAI": [
    { "ten_to_khai": "01/ĐK-BL - Tờ khai đăng ký sử dụng biên lai điện tử mẫu số 01/ĐK-BL", "ten_viet_tat": "01/ĐK-BL" },
    { "ten_to_khai": "TB01/AC - THÔNG BÁO phát hành biên lai", "ten_viet_tat": "TB01/AC" },
    { "ten_to_khai": "BC01/AC - BÁO CÁO về việc nhận in/cung cấp phần mềm tự in biên lai/cung cấp giải pháp biên lai điện tử", "ten_viet_tat": "BC01/AC" },
    { "ten_to_khai": "BC21/AC - Báo cáo mất, cháy, hỏng biên lai", "ten_viet_tat": "BC21/AC" },
    { "ten_to_khai": "TB03/AC - Thông báo kết quả hủy biên lai", "ten_viet_tat": "TB03/AC" },
    { "ten_to_khai": "BC7/AC - Báo cáo tình hình sử dụng biên lai", "ten_viet_tat": "BC7/AC" },
    { "ten_to_khai": "TT303/BLaiCDD - Bảng kê biên lai chưa sử dụng của cơ quan thu phí, lệ phí chuyển địa điểm khác địa bàn cơ quan thuế quản lý", "ten_viet_tat": "TT303/BLaiCDD" },
    { "ten_to_khai": "TT303/ThayDoiTT - Điều chỉnh thông tin tại thông báo phát hành biên lai", "ten_viet_tat": "TT303/ThayDoiTT" }
  ],
  "Miscellaneous": [
    { "ten_to_khai": "01/TEM - Đăng ký sử dụng tem điện tử", "ten_viet_tat": "01/TEM" },
    { "ten_to_khai": "03/TEM - Đơn đề nghị mua tem điện tử thuốc lá hoặc tem điện tử rượu sản xuất để tiêu thụ trong nước", "ten_viet_tat": "03/TEM" }
  ]
};

// Function to find tax code by exact tax declaration name match
const findTaxCodeByName = (taxDeclarationName) => {
  if (!taxDeclarationName) return "undefined";
  
  const trimmedName = taxDeclarationName.trim();
  
  // Normalize text for comparison - remove extra spaces, normalize punctuation
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\s*-\s*/g, '-') // Normalize dashes (remove spaces around dashes)
      .replace(/\s*\/\s*/g, '/') // Normalize slashes
      .replace(/\s*\(\s*/g, '(') // Normalize parentheses
      .replace(/\s*\)\s*/g, ')') 
      .trim();
  };
  
  const normalizedInput = normalizeText(trimmedName);
  
  let bestMatch = null;
  let bestMatchLength = 0;
  
  // Search through all categories in toKhaiArray
  for (const category in toKhaiArray) {
    const taxForms = toKhaiArray[category];
    for (const form of taxForms) {
      // Try exact match first
      if (form.ten_to_khai === trimmedName) {
        return form.ten_viet_tat;
      }
      
      // Try normalized exact match
      const normalizedForm = normalizeText(form.ten_to_khai);
      if (normalizedForm === normalizedInput) {
        return form.ten_viet_tat;
      }
      
      // For substring matching, collect matches and prioritize longer ones
      if (normalizedInput.includes(normalizedForm)) {
        // Prefer longer, more specific matches
        if (normalizedForm.length > bestMatchLength) {
          bestMatch = form.ten_viet_tat;
          bestMatchLength = normalizedForm.length;
        }
      }
    }
  }
  
  // Return the best (longest) substring match if found
  if (bestMatch) {
    return bestMatch;
  }
  
  return "undefined";
};

// Function to validate tax code
const validateTaxCode = (code) => {
  if (!code) return "undefined";
  
  // Clean the code by removing extra spaces and special characters
  const cleanCode = code.trim();
  
  // Check if the code exists in validTaxCodes array
  const isValid = validTaxCodes.some(validCode => {
    // Exact match
    if (validCode === cleanCode) return true;
    
    // Check if cleanCode starts with validCode (for variations)
    if (cleanCode.startsWith(validCode.split(' ')[0])) return true;
    
    return false;
  });
  
  return isValid ? cleanCode : "undefined";
};

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
  const [submittedTaxResults, setSubmittedTaxResults] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const { selectedCompany } = useCompany();

  const handleSearch = async () => {
    setLoadingSearch(true);
    try {
      console.log("[DEBUG] Starting search with dates:", fromDate, toDate);
      
      // Convert date format from yyyy-mm-dd to dd/mm/yyyy
      const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

      // Prepare query parameters
      const params = new URLSearchParams();
      if (fromDate) params.append('fromdate', formatDate(fromDate));
      if (toDate) params.append('todate', formatDate(toDate));

      const url = `http://localhost:8000/displaylisttax${params.toString() ? '?' + params.toString() : ''}`;
      console.log("[DEBUG] Calling URL:", url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log("[DEBUG] Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("[ERROR] Response not ok:", response.status, errorText);
        throw new Error(`Failed to fetch tax declaration list: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("[DEBUG] API Response:", result);
      
      // Get submitted tax declarations if dates are provided
      let submittedTaxData = [];
      if (fromDate && toDate) {
        try {
          console.log("[DEBUG] Calling search and display endpoints...");
          const formattedFromDate = formatDate(fromDate);
          const formattedToDate = formatDate(toDate);

          // Call search endpoint
          const formData = new FormData();
          formData.append('from_date', formattedFromDate);
          formData.append('to_date', formattedToDate);
          formData.append('maTKhai', '00'); // All tax types

          console.log("[DEBUG] Search form data:", {
            from_date: formattedFromDate,
            to_date: formattedToDate,
            maTKhai: '00'
          });

          const searchResponse = await fetch('http://localhost:8000/search', {
            method: 'POST',
            body: formData
          });

          console.log("[DEBUG] Search response status:", searchResponse.status);

          if (searchResponse.ok) {
            // Call display endpoint to get the results
            const displayResponse = await fetch('http://localhost:8000/display');
            console.log("[DEBUG] Display response status:", displayResponse.status);
            
            if (displayResponse.ok) {
              const displayResult = await displayResponse.json();
              console.log("[DEBUG] Display result:", displayResult);
              if (displayResult.table && displayResult.table.length > 0) {
                submittedTaxData = displayResult.table;
                setSubmittedTaxResults(displayResult.table);
              } else {
                console.log("[DEBUG] No submitted tax results found");
                setSubmittedTaxResults([]);
              }
            } else {
              const displayError = await displayResponse.text();
              console.error("[ERROR] Display response error:", displayError);
            }
          } else {
            const searchError = await searchResponse.text();
            console.error("[ERROR] Search response error:", searchError);
          }
        } catch (searchError) {
          console.error("Error fetching submitted tax declarations:", searchError);
          setSubmittedTaxResults([]);
        }
      } else {
        console.log("[DEBUG] No dates provided, skipping search/display");
        setSubmittedTaxResults([]);
      }

      // Compare tables and update status
      if (result.data && result.data.length > 1) {
        const updatedSearchResults = [...result.data];
        
        // Extract tax codes from submitted tax results (lower table)
        const submittedTaxCodes = new Set();
        if (submittedTaxData.length > 1) {
          // Skip header row (index 0)
          submittedTaxData.slice(1).forEach(row => {
            const tenToKhai = row[2] || ""; // Tờ khai/Phụ lục column
            const taxCode = findTaxCodeByName(tenToKhai);
            if (taxCode && taxCode !== "undefined") {
              submittedTaxCodes.add(taxCode);
              console.log("[DEBUG] Added submitted tax code:", taxCode);
            }
          });
        }
        
        console.log("[DEBUG] Submitted tax codes:", Array.from(submittedTaxCodes));
        
        // Update status in upper table based on tax code matches
        for (let i = 1; i < updatedSearchResults.length; i++) { // Skip header row
          const maColumn = updatedSearchResults[i][2]; // Mã column (index 2)
          const validatedCode = validateTaxCode(maColumn);
          
          if (validatedCode !== "undefined" && submittedTaxCodes.has(validatedCode)) {
            updatedSearchResults[i][5] = "Hoàn thành"; // Update status column (index 5)
            console.log("[DEBUG] Updated status to 'Hoàn thành' for tax code:", validatedCode);
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
    <div className="p-8 w-full flex flex-col overflow-y-auto">
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

        {/* Date Range Inputs */}
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
          </div>
        </div>
      </div>

      {/* Results Table */}
      {searchResults.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-auto shadow-sm mb-6 h-[500px]">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Danh sách nghĩa vụ kê khai thuế</h3>
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
                {searchResults.slice(1).map((row, rowIdx) => (
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
      )}

      {/* Submitted Tax Declarations Table */}
      {submittedTaxResults.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-auto shadow-sm h-[500px]">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Danh sách tờ khai đã nộp</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-700">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left font-medium text-gray-800 border-b border-gray-200 w-16">STT</th>
                  <th className="px-6 py-4 text-left font-medium text-gray-800 border-b border-gray-200 w-48">Tên tờ khai</th>
                  <th className="px-6 py-4 text-left font-medium text-gray-800 border-b border-gray-200 w-32">Mã</th>
                  <th className="px-6 py-4 text-left font-medium text-gray-800 border-b border-gray-200 w-32">Kỳ kê khai</th>
                  <th className="px-6 py-4 text-left font-medium text-gray-800 border-b border-gray-200 w-32">Hạn nộp</th>
                  <th className="px-6 py-4 text-left font-medium text-gray-800 border-b border-gray-200 w-32">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {submittedTaxResults.slice(1).map((row, rowIdx) => {
                  // Extract data from the original search results
                  // Row structure: [STT, Mã giao dịch, Tờ khai/Phụ lục, Kỳ tính thuế, Loại tờ khai, Lần nộp, Lần bổ sung, Ngày nộp, Nơi nộp, Tiến trình giải quyết]
                  const tenToKhai = row[2] || ""; // Tờ khai/Phụ lục
                  const kyKeKhai = row[3] || ""; // Kỳ tính thuế
                  const ngayNop = row[7] || ""; // Ngày nộp as Hạn nộp
                  
                  // Find tax code by exact name match in tokhaiArray
                  const ma = findTaxCodeByName(tenToKhai);
                  
                  return (
                    <tr
                      key={rowIdx}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap w-16">{rowIdx + 1}</td>
                      <td className="px-6 py-4 whitespace-normal w-48">
                        <div className="max-w-[16rem] break-words">
                          {tenToKhai}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap w-32">{ma}</td>
                      <td className="px-6 py-4 whitespace-nowrap w-32">{kyKeKhai}</td>
                      <td className="px-6 py-4 whitespace-nowrap w-32">{ngayNop}</td>
                      <td className="px-6 py-4 whitespace-nowrap w-32">
                        <span className="text-green-600 font-medium">Hoàn thành</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
 