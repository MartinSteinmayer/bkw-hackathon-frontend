'use client';

import { Download } from 'lucide-react';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { downloadBase64Excel } from '@/services/api';

/**
 * Button component to download the processed Excel file from Step 1
 * This can be added to Step1View, Step2View, or ReportView
 */
export function DownloadExcelButton() {
  const { state } = useAnalysis();

  const handleDownload = () => {
    if (state.processedExcelBase64 && state.processedExcelFilename) {
      downloadBase64Excel(state.processedExcelBase64, state.processedExcelFilename);
    }
  };

  // Don't show button if no Excel data is available
  if (!state.processedExcelBase64) {
    return null;
  }

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-dark transition-colors"
    >
      <Download className="w-4 h-4" />
      <span>Excel herunterladen</span>
    </button>
  );
}
