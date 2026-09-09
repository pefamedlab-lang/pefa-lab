PEFA LAB — CHEMISTRY PANEL DIRECT MASTER_TEST FIX

Replace these files:

src/services/laboratory/chemistry/chemistryPanelParameterService.js
src/pages/laboratory/panel/chemistry/ChemistryPanelResultEntry.jsx
src/pages/laboratory/panel/chemistry/RFTPanelResultEntry.jsx

Also keep the existing LFTPanelResultEntry.jsx and FLPPanelResultEntry.jsx from this package if desired.

Key fixes:
1. chemistryPanelParameterService.js now imports the existing client from ../../../supabase.
2. ChemistryPanelResultEntry no longer skips the database query when a wrapper supplies analytes.
3. Supplied structural analytes and database master_tests metadata are merged.
4. master_tests remains authoritative for units/reference metadata.
5. Sex/age-specific master_tests ranges are used as display fallback when reference_range/reference_value is empty.
6. RFT always supplies its complete structural list while database metadata enriches those rows.
7. No testService.js is imported by these chemistry files.
8. No Supabase client is created here; src/supabase.js is reused.

Expected behavior:
- LFT should not be limited to the four rows shown in the screenshot if additional child master_tests exist.
- FLP should not stop at six structural rows when additional database children exist.
- RFT should show Urea, Creatinine, Sodium, Potassium, Chloride, Bicarbonate, Uric Acid, eGFR and calculated rows, with database metadata applied where available.
- Reference Range should display the configured master_tests range instead of Not configured whenever the relevant metadata exists.
