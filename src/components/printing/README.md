# PEFA Laboratory Printing — Clean Route Package

## Purpose

This package establishes the laboratory-only printing route requested for PEFA Enterprise LIS.

### Printing rules

1. Chemistry single tests are grouped into one Chemistry table.
   Example: FBS + HbA1c + Urea + Creatinine.
2. Haematology single tests are grouped into one Haematology table.
3. Endocrinology single tests are grouped into one Endocrinology table.
4. Qualitative tests are grouped into one Qualitative/Serology table.
5. Panels are atomic print units:
   - LFT = one page
   - RFT/KFT = one page
   - FLP = one page
   - CBC/FBC = one page
   - Coagulation Profile = one page
   - Iron Profile = one page
   - TFT/hormonal panels = one page
6. Special tests are atomic print units:
   - Widal = one page
   - MP = one page
   - Urinalysis = one page
   - SFA = one page
   - MCS = one page
   - Blood Culture = one page
   - Stool Analysis = one page
   - Drug Screen = one page
   - Donor Screening = one page
   - Grouping/Crossmatch = one page
   - Qualitative = grouped where applicable
7. No Radiology imports or routes are present in the supplied PrintRouter.

## Files

- `PrintRouter.jsx`
- `PrintPage.jsx`
- `PrintSingleTestGroup.jsx`
- `PrintPanelResult.jsx`
- `resolver/PrintPanelLaboratoryResultEntryResolver.jsx`
- `resolver/PrintSpecialLaboratoryResultEntryResolver.jsx`
- `printing-laboratory.css`

## Installation

Copy the files into:

`src/components/printing/`

and:

`src/components/printing/resolver/`

Then import the CSS from the application's existing printing entry point:

`import "./printing-laboratory.css";`

The existing specialized renderers remain dependencies of the special resolver:

- PrintWidal
- PrintQualitative
- PrintUrinalysis
- PrintSFA
- PrintDrugScreen
- PrintGroupingCrossMatch
- PrintDonorScreening
- PrintMicrobiologyMCS
- PrintBloodCulture
- PrintStoolAnalysis
- PrintMalariaParasite

The package deliberately does not modify the Supabase payload structure.
