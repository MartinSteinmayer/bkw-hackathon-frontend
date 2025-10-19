// API calls for backend integration

// Backend API base URL - change this for different environments
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bkw-hackathon-backend.onrender.com';

export interface Step1Response {
  analysisId: string;
  processedExcelBase64?: string; // Base64 encoded processed/merged Excel file
  processedExcelFilename?: string; // Suggested filename (e.g., "merged_analysis.xlsx")
  step1: {
    optimizedRooms: number;
    totalRooms: number;
    improvementRate: number;
    confidence: number;
  };
  details?: {
    originalRoomTypesCount?: number;
    optimizedRoomTypesCount?: number;
    avgRoomSizeM2?: number;
    totalAreaM2?: number;
    keyChanges?: { from: string; to: string; count: number }[];
  };
}

export interface Step2Response {
  step2: {
    energyConsumption: number;
    reductionPercentage: number;
    annualSavings: number;
  };
  details?: {
    heatingPowerKw?: number;
    annualConsumptionKwh?: number;
    savingsKwh?: number;
    breakdownByRoomType?: { roomType: string; wPerM2: number; sharePercent?: number }[];
  };
}

export async function fetchStep1Analysis(file1: File, file2: File): Promise<Step1Response> {
  const formData = new FormData();
  formData.append('file_heating', file1); // Leistungsermittlung_KLT_HZG
  formData.append('file_ventilation', file2); // Leistungsermittlung_RLT

  const response = await fetch(`${API_BASE_URL}/api/analyze/step1`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(error.detail || error.message || `Upload failed with status ${response.status}`);
  }

  return response.json();
}

export async function fetchStep2Analysis(analysisId: string): Promise<Step2Response> {
  const response = await fetch(`${API_BASE_URL}/api/analyze/step2`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ analysisId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Analysis failed' }));
    throw new Error(error.detail || error.message || `Analysis failed with status ${response.status}`);
  }

  return response.json();
}

/**
 * Download a base64 encoded Excel file
 * @param base64Data - Base64 encoded file content
 * @param filename - Filename for download (default: processed-data.xlsx)
 */
export function downloadBase64Excel(base64Data: string, filename = 'processed-data.xlsx'): void {
  // Convert base64 to blob
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });

  // Create download link
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}