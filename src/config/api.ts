const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  spreadsheets: `${API_BASE_URL}/api/spreadsheets`,
  spreadsheetData: (id: string) => `${API_BASE_URL}/api/spreadsheet-data?id=${id}`,
}; 