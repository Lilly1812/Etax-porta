// Format date from yyyy-mm-dd to dd/mm/yyyy
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Get tax declaration list
export const getTaxDeclarationList = async (fromDate, toDate) => {
  const params = new URLSearchParams();
  if (fromDate) params.append('fromdate', formatDate(fromDate));
  if (toDate) params.append('todate', formatDate(toDate));

  const url = `http://localhost:8000/displaylisttax${params.toString() ? '?' + params.toString() : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch tax declaration list: ${response.status} - ${errorText}`);
  }

  return response.json();
};

// Search for submitted tax declarations
export const searchSubmittedTaxDeclarations = async (fromDate, toDate) => {
  const formattedFromDate = formatDate(fromDate);
  const formattedToDate = formatDate(toDate);

  // Call search endpoint
  const formData = new FormData();
  formData.append('from_date', formattedFromDate);
  formData.append('to_date', formattedToDate);
  formData.append('maTKhai', '00'); // All tax types

  const searchResponse = await fetch('http://localhost:8000/search', {
    method: 'POST',
    body: formData
  });

  if (!searchResponse.ok) {
    const errorText = await searchResponse.text();
    throw new Error(`Search failed: ${searchResponse.status} - ${errorText}`);
  }

  // Call display endpoint to get the results
  const displayResponse = await fetch('http://localhost:8000/display');
  
  if (!displayResponse.ok) {
    const errorText = await displayResponse.text();
    throw new Error(`Display failed: ${displayResponse.status} - ${errorText}`);
  }

  const displayResult = await displayResponse.json();
  return displayResult.table || [];
}; 