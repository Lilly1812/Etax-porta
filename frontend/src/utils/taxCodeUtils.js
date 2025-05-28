// Tax declaration codes
export const validTaxCodes = [
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

// Tax declaration structure
export const toKhaiArray = {
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
};

// Function to find tax code by exact tax declaration name match
export const findTaxCodeByName = (taxDeclarationName) => {
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
export const validateTaxCode = (code) => {
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