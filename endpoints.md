Endpoints your backend should expose
1) POST /api/analyze/step1
Purpose: Upload the two Excel files (heating/cooling KLT/HZG and ventilation RLT), parse/merge, and return the step 1 optimization summary.
Accepts: multipart/form-data
file_heating: File (.xls, .xlsx, .xlsm)
file_ventilation: File (.xls, .xlsx, .xlsm)
options (optional, JSON string or individual form fields):
projectName?: string
autoDetectStructure?: boolean (default true)
headerRow?: number (if autoDetectStructure=false)
Returns: 200 application/json
TypeScript shape used by the frontend (extends current Step1Response to future-proof):
analysisId: string (unique id for subsequent calls)
step1:
optimizedRooms: number
totalRooms: number
improvementRate: number
confidence: number
details (optional but useful for Step1View UI as it grows):
originalRoomTypesCount?: number
optimizedRoomTypesCount?: number
avgRoomSizeM2?: number
totalAreaM2?: number
keyChanges?: Array<{ from: string; to: string; count: number }>
Errors:
400: missing files / invalid file types (must allow .xls, .xlsx, .xlsm)
422: Excel parsing/merge failure
500: internal error
Notes:

This aligns with fetchStep1Analysis(file1, file2) and your new .xlsm acceptance on the frontend.
Backend can implement the heavy lifting by calling your existing Python utilities (e.g., merge_excel_files.py, room type optimizer, etc.).
Important: Accept MIME types for .xlsm (application/vnd.ms-excel.sheet.macroEnabled.12).
Example response:
{
"analysisId": "f1d2d2f9-7c3e-4a1a-9a67-5f2d9b1b2a30",
"step1": {
"optimizedRooms": 47,
"totalRooms": 52,
"improvementRate": 90,
"confidence": 98
},
"details": {
"originalRoomTypesCount": 52,
"optimizedRoomTypesCount": 47,
"avgRoomSizeM2": 24.5,
"totalAreaM2": 1274,
"keyChanges": [
{ "from": "Büro Standard", "to": "Büro Optimiert", "count": 5 }
]
}
}

2) POST /api/analyze/step2
Purpose: Run the step 2 energy/consumption/cost analysis based on prior step’s results.
Accepts: application/json
analysisId: string (from step1)
parameters (optional):
pricePerKWh?: number
climateZone?: string
scenario?: 'standard' | 'optimized' | ...
Returns: 200 application/json
TypeScript shape used by the frontend (extends current Step2Response so the UI can evolve):
step2:
energyConsumption: number // W/m²
reductionPercentage: number // %
annualSavings: number // €
details (optional):
heatingPowerKw?: number
annualConsumptionKwh?: number
savingsKwh?: number
breakdownByRoomType?: Array<{ roomType: string; wPerM2: number; sharePercent?: number }>
Errors:
400: missing analysisId
404: analysis not found
500: internal error
Example request:
{ "analysisId": "f1d2d2f9-7c3e-4a1a-9a67-5f2d9b1b2a30" }

Example response:
{
"step2": {
"energyConsumption": 45,
"reductionPercentage": 18,
"annualSavings": 7800
},
"details": {
"heatingPowerKw": 57,
"annualConsumptionKwh": 143820,
"savingsKwh": 25680,
"breakdownByRoomType": [
{ "roomType": "Büros", "wPerM2": 42, "sharePercent": 40 },
{ "roomType": "Konferenzräume", "wPerM2": 55, "sharePercent": 25 }
]
}
}

3) GET /api/report/:analysisId
Purpose: Provide consolidated data for the final report view (KPIs, cost time series, savings).
Accepts: query/path
analysisId: string (path param)
Returns: 200 application/json
Suggested shape that fits ReportView and its charts:
kpis:
energySavingsPercent: number
costSavingsEuro: number
heatingPowerKw: number
co2ReductionTons: number
costData: Array<{ month: string; standard: number; optimized: number }>
savingsSummary:
totalSavingsEuro: number
savingsPercentage: number
roiYears?: number
parameterDiffTable: Array<{ label: string; standard: string | number; optimized: string | number; delta: string }>
Errors:
404: analysis not found
500: internal error
Example response:
{
"kpis": {
"energySavingsPercent": 18,
"costSavingsEuro": 7800,
"heatingPowerKw": 57,
"co2ReductionTons": 4.8
},
"costData": [
{ "month": "Jan", "standard": 4200, "optimized": 3100 },
{ "month": "Feb", "standard": 3800, "optimized": 2900 }
],
"savingsSummary": {
"totalSavingsEuro": 7800,
"savingsPercentage": 26,
"roiYears": 2.4
},
"parameterDiffTable": [
{ "label": "Raumtypen", "standard": 52, "optimized": 47, "delta": "↓ 5 (9.6%)" },
{ "label": "W/m²", "standard": 55, "optimized": 45, "delta": "↓ 10 (18%)" }
]
}

4) GET /api/report/:analysisId/export?format=pdf
Purpose: Download a PDF report.
Accepts:
analysisId: string (path)
format?: 'pdf' (default pdf)
Returns: 200 application/pdf (file download)
Errors:
404: analysis not found
500: generation error
5) GET /api/status/:analysisId (optional but recommended)
Purpose: Poll long-running job status (useful if step 1/2 become async).
Returns: 200 application/json
{ analysisId: string, state: 'pending' | 'processing' | 'completed' | 'failed', progressPercent?: number, step?: 'step1' | 'step2' | 'report', errorMessage?: string }
Errors:
404: analysis not found
6) GET /healthz (optional)
Purpose: Basic health check.
Returns: 200 text/plain "ok"
Frontend integration notes
api.ts wiring:

fetchStep1Analysis(file1, file2):
Build FormData with keys: file_heating, file_ventilation.
POST to /api/analyze/step1.
Store analysisId in context alongside step1Data for subsequent calls.
fetchStep2Analysis():
Change signature to accept analysisId (recommended) and POST to /api/analyze/step2 with JSON body { analysisId }.
Store returned step2Data.
ReportView:
Fetch GET /api/report/:analysisId to populate charts and summary; or call lazily when entering the report step.
Export:
Call GET /api/report/:analysisId/export?format=pdf; trigger file download.
File types:

Ensure backend validation allows .xls, .xlsx, .xlsm. The frontend already accepts '.xlsm' in UploadArea.tsx.
Minimal TypeScript types (for client usage)
Step1
type Step1Response = {
analysisId: string;
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
};

Step2
type Step2Response = {
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
};

Report
type ReportResponse = {
kpis: {
energySavingsPercent: number;
costSavingsEuro: number;
heatingPowerKw: number;
co2ReductionTons: number;
};
costData: { month: string; standard: number; optimized: number }[];
savingsSummary: {
totalSavingsEuro: number;
savingsPercentage: number;
roiYears?: number;
};
parameterDiffTable: { label: string; standard: string | number; optimized: string | number; delta: string }[];
};

Backend implementation hints (Python side)
Use merge_excel_files.py for reading/merging the two Excel files (.xlsm supported via pandas/openpyxl).
Use your cost/metrics modules under costestimator and power estimators for step 2.
Use reporting to produce report data and optional PDF export.
Persist an analysisId with intermediate artifacts (parsed dataframes, merged outputs) to avoid re-parsing on step 2 and report.
If you want, I can wire api.ts to these endpoints and add the analysisId propagation in the context next.
