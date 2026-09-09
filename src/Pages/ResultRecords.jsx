import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  Eye,
  X,
  Printer,
  Download,
  CheckCircle2,
  Unlock,
  FileText,
  User,
} from "lucide-react";

import "../styles/resultRecords.css";

import {
  getResults,
  authorizeResult as authorizeResultService,
  releaseResult as releaseResultService,
  updatePrintCount,
  updateDownloadCount,
} from "../services/resultService";

import groupResultRecords from "../utils/groupResultRecords";
import { logAudit } from "../utils/auditLogger";
import { supabase } from "../supabase";
import PatientHeader from "../components/printing/PatientHeader";

/* ==========================================================
   RESULT RECORDS
   ----------------------------------------------------------
   PAGE RULES

   1. Nothing is displayed before SEARCH.
   2. User enters LAB NUMBER and presses SEARCH.
   3. Registration data is fetched directly from registrations.
   4. ALL tests belonging to that Lab Number are displayed.
   5. Each registered test is one report.
   6. Panel parameters stay together.
   7. CBC / FLP / LFT / RFT etc. never become one report.
   8. Each report has its own VIEW button.
   9. Result JSON is parsed before display.
  10. Authorization / Release / Print / Download act on
      the complete report.
========================================================== */

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function firstValue(...values) {
  for (const value of values) {
    if (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
    ) {
      return value;
    }
  }
  return null;
}

function isTrue(value) {
  if (value === true || value === 1) return true;

  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    return v === "true" || v === "1" || v === "yes";
  }

  return false;
}

function getCurrentUser() {
  try {
    const stored = localStorage.getItem("pefa_user");
    if (!stored) return {};

    const parsed = JSON.parse(stored);

    return parsed && typeof parsed === "object"
      ? parsed
      : {};
  } catch {
    return {};
  }
}

/* ==========================================================
   STRUCTURED RESULT
========================================================== */

function parseResultObject(value) {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value;
  }

  if (typeof value === "string") {
    const text = value.trim();

    if (!text) return null;

    try {
      const parsed = JSON.parse(text);

      if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed)
      ) {
        return parsed;
      }
    } catch {
      return null;
    }
  }

  return null;
}

/* ==========================================================
   RESULT DISPLAY HELPERS

   Example stored result:

   {
     parameter: "HDL Cholesterol",
     result: {
       result: "43.6",
       unit: "mg/dL",
       reference_range: ">=40",
       flag: "Normal"
     }
   }

   The UI must show:

   HDL Cholesterol | 43.6 | mg/dL | >=40 | Normal

   NOT the JSON object.
========================================================== */

function getResultPayload(row = {}) {
  const structured = parseResultObject(row?.result);

  if (structured) {
    const nested = parseResultObject(structured?.result);

    if (nested) {
      return {
        ...structured,
        ...nested,
      };
    }

    return structured;
  }

  return null;
}

function getResultValue(row = {}) {
  const payload = getResultPayload(row);

  if (payload) {
    return firstValue(
      payload?.value,
      payload?.result_value,
      payload?.resultValue,
      payload?.result,
      payload?.reading,
      payload?.interpretation
    );
  }

  return firstValue(
    row?.value,
    row?.result_value,
    row?.resultValue,
    row?.entered_result,
    row?.enteredResult,
    row?.result
  );
}

function getResultUnit(row = {}) {
  const payload = getResultPayload(row);

  return firstValue(
    payload?.unit,
    row?.unit
  );
}

function getReferenceRange(row = {}) {
  const payload = getResultPayload(row);

  const direct = firstValue(
    payload?.reference_range,
    payload?.referenceRange,
    row?.reference_range,
    row?.referenceRange
  );

  if (direct !== null) return direct;

  const sex = normalize(
    firstValue(
      row?.sex,
      row?.gender
    )
  );

  if (sex === "male" || sex === "m") {
    return firstValue(
      row?.male_range,
      row?.reference_value
    );
  }

  if (sex === "female" || sex === "f") {
    return firstValue(
      row?.female_range,
      row?.reference_value
    );
  }

  return firstValue(
    row?.reference_value,
    row?.child_range,
    row?.elderly_range
  );
}

function getResultFlag(row = {}) {
  const payload = getResultPayload(row);

  return firstValue(
    payload?.flag,
    row?.flag
  );
}

function hasResultValue(row = {}) {
  const value = getResultValue(row);

  return (
    value !== null &&
    value !== undefined &&
    String(value).trim() !== ""
  );
}

function getParameterName(row = {}) {
  const payload = getResultPayload(row);

  return firstValue(
    row?.test_name,
    row?.testName,
    payload?.parameter,
    payload?.test_name,
    payload?.testName,
    payload?.name,
    row?.parameter,
    row?.name,
    row?.test_type,
    "Laboratory Test"
  );
}

/* ==========================================================
   REPORT ITEMS
========================================================== */

function getReportItems(report = {}) {
  if (Array.isArray(report?.items)) {
    return report.items;
  }

  if (Array.isArray(report?.results)) {
    return report.results;
  }

  if (Array.isArray(report?.records)) {
    return report.records;
  }

  if (Array.isArray(report)) {
    return report;
  }

  return [];
}

/* ==========================================================
   METADATA
========================================================== */

function getReportMetadata(report = {}) {
  const items = getReportItems(report);
  const first = items[0] || report;

  return {
    lab_number: firstValue(
      report?.lab_number,
      first?.lab_number
    ),

    registration_number: firstValue(
      report?.registration_number,
      first?.registration_number
    ),

    patient_id: firstValue(
      report?.patient_id,
      first?.patient_id
    ),

    patient_name: firstValue(
      report?.patient_name,
      report?.full_name,
      first?.patient_name,
      first?.full_name
    ),

    sex: firstValue(
      report?.sex,
      report?.gender,
      first?.sex,
      first?.gender
    ),

    gender: firstValue(
      report?.gender,
      report?.sex,
      first?.gender,
      first?.sex
    ),

    age: firstValue(
      report?.age,
      first?.age
    ),

    dob: firstValue(
      report?.dob,
      report?.date_of_birth,
      first?.dob,
      first?.date_of_birth
    ),

    branch: firstValue(
      report?.branch,
      first?.branch
    ),

    referral_hospital: firstValue(
      report?.referral_hospital,
      report?.referral_name,
      first?.referral_hospital,
      first?.referral_name
    ),

    referral_doctor: firstValue(
      report?.referral_doctor,
      report?.referring_doctor,
      first?.referral_doctor,
      first?.referring_doctor
    ),

    clinical_history: firstValue(
      report?.clinical_history,
      first?.clinical_history
    ),

    register_date_time: firstValue(
      report?.register_date_time,
      report?.registered_at,
      report?.created_at,
      first?.register_date_time,
      first?.registered_at,
      first?.created_at
    ),

    sample_collection_date_time: firstValue(
      report?.sample_collection_date_time,
      report?.specimen_collection_time,
      report?.collection_datetime,
      report?.collection_date,
      first?.sample_collection_date_time,
      first?.specimen_collection_time,
      first?.collection_datetime,
      first?.collection_date
    ),

    report_date_time: firstValue(
      report?.report_date_time,
      report?.reported_at,
      report?.report_date,
      first?.report_date_time,
      first?.reported_at,
      first?.report_date
    ),

    registered_test_id: firstValue(
      report?.registered_test_id,
      first?.registered_test_id
    ),

    master_test_id: firstValue(
      report?.master_test_id,
      first?.master_test_id
    ),

    test_id: firstValue(
      report?.test_id,
      first?.test_id
    ),

    panel_id: firstValue(
      report?.panel_id,
      first?.panel_id
    ),

    panel_master_test_id: firstValue(
      report?.panel_master_test_id,
      first?.panel_master_test_id
    ),

    panel_name: firstValue(
      report?.panel_name,
      first?.panel_name
    ),

    test_name: firstValue(
      report?.test_name,
      first?.test_name
    ),

    department: firstValue(
      report?.department,
      first?.department
    ),

    template_type: firstValue(
      report?.template_type,
      first?.template_type
    ),

    authorization_status: firstValue(
      report?.authorization_status,
      first?.authorization_status
    ),

    release_status: firstValue(
      report?.release_status,
      first?.release_status
    ),

    authorized_by: firstValue(
      report?.authorized_by,
      first?.authorized_by
    ),

    authorized_at: firstValue(
      report?.authorized_at,
      first?.authorized_at
    ),

    released_by: firstValue(
      report?.released_by,
      first?.released_by
    ),

    released_at: firstValue(
      report?.released_at,
      first?.released_at
    ),
  };
}

/* ==========================================================
   REPORT IDENTITY

   registered_test_id is strongest.

   This is critical:

      LAB260868 + CBC
      LAB260868 + FLP
      LAB260868 + LFT

   remain three separate reports.

   Parameters belonging to the same registered test remain
   inside that report.
========================================================== */

function getReportIdentity(row = {}) {
  const meta = getReportMetadata(row);

  const lab = String(meta.lab_number ?? "").trim();
  const registered = String(
    meta.registered_test_id ?? ""
  ).trim();

  const panelId = String(
    meta.panel_id ?? ""
  ).trim();

  const panelMaster = String(
    meta.panel_master_test_id ?? ""
  ).trim();

  const panelName = normalize(
    meta.panel_name
  );

  const master = String(
    meta.master_test_id ?? ""
  ).trim();

  const testId = String(
    meta.test_id ?? ""
  ).trim();

  const testName = normalize(
    meta.test_name
  );

  if (registered) {
    return `${lab}::registered-test::${registered}`;
  }

  if (panelId) {
    return `${lab}::panel-id::${panelId}`;
  }

  if (panelMaster) {
    return `${lab}::panel-master::${panelMaster}`;
  }

  if (panelName) {
    return `${lab}::panel-name::${panelName}`;
  }

  if (master) {
    return `${lab}::test-id::${master}`;
  }

  if (testId) {
    return `${lab}::test-id::${testId}`;
  }

  return `${lab}::test-name::${testName}`;
}

function getReportType(report = {}) {
  const meta = getReportMetadata(report);

  if (
    isTrue(report?.is_panel) ||
    isTrue(report?.isPanel)
  ) {
    return "panel";
  }

  if (
    meta.panel_id ||
    meta.panel_master_test_id ||
    meta.panel_name
  ) {
    return "panel";
  }

  return "single";
}

function getReportTitle(report = {}) {
  const meta = getReportMetadata(report);

  return (
    getReportType(report) === "panel"
      ? firstValue(
          meta.panel_name,
          meta.test_name,
          "Laboratory Report"
        )
      : firstValue(
          meta.test_name,
          meta.panel_name,
          "Laboratory Report"
        )
  ) || "Laboratory Report";
}

/* ==========================================================
   GROUPING

   groupResultRecords() remains the first grouping authority.

   After that, the groups are rebuilt by report identity so a
   bad/old grouping implementation cannot merge two registered
   tests simply because they share a Lab Number.
========================================================== */

function forceReportBoundaries(rows = []) {
  const map = new Map();

  rows.forEach((row) => {
    const key = getReportIdentity(row);

    if (!map.has(key)) {
      map.set(key, {
        ...row,
        items: [],
      });
    }

    map.get(key).items.push(row);
  });

  return Array.from(map.values());
}

function buildReportGroups(rows = []) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return [];
  }

  let grouped = [];

  try {
    const result = groupResultRecords(rows);

    if (Array.isArray(result)) {
      grouped = result;
    }
  } catch (error) {
    console.error(
      "[ResultRecords] groupResultRecords error:",
      error
    );
  }

  /*
   * Flatten the grouping utility's output back to hydrated rows.
   * Then force the registered-test boundary.
   *
   * This preserves the existing grouping architecture while
   * preventing cross-test merging.
   */
  const flattened = [];

  grouped.forEach((group) => {
    const items = getReportItems(group);

    if (items.length > 0) {
      items.forEach((item) => {
        flattened.push({
          ...item,
          /*
           * Preserve group metadata where the row does not have it.
           */
          registered_test_id: firstValue(
            item?.registered_test_id,
            group?.registered_test_id
          ),
          panel_id: firstValue(
            item?.panel_id,
            group?.panel_id
          ),
          panel_master_test_id: firstValue(
            item?.panel_master_test_id,
            group?.panel_master_test_id
          ),
          panel_name: firstValue(
            item?.panel_name,
            group?.panel_name
          ),
          test_name: firstValue(
            item?.test_name,
            group?.test_name
          ),
          department: firstValue(
            item?.department,
            group?.department
          ),
        });
      });
    } else {
      flattened.push(group);
    }
  });

  /*
   * If the utility returned nothing, use the original rows.
   */
  const source =
    flattened.length > 0
      ? flattened
      : rows;

  return forceReportBoundaries(source);
}

/* ==========================================================
   STATUS
========================================================== */

function getAuthorizationStatus(report) {
  const status = normalize(
    getReportMetadata(report)
      .authorization_status
  );

  return status === "authorized" ||
    status === "approved"
    ? "Authorized"
    : "Pending";
}

function getReleaseStatus(report) {
  const status = normalize(
    getReportMetadata(report)
      .release_status
  );

  return status === "released" ||
    status === "release"
    ? "Released"
    : "Not Released";
}

/* ==========================================================
   DATE FORMAT
========================================================== */

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString();
}

/* ==========================================================
   AGE FROM DOB
========================================================== */

function calculateAgeFromDob(dob) {
  if (!dob) return null;

  const birthDate = new Date(dob);

  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();

  let age =
    today.getFullYear() -
    birthDate.getFullYear();

  const month =
    today.getMonth() -
    birthDate.getMonth();

  if (
    month < 0 ||
    (
      month === 0 &&
      today.getDate() < birthDate.getDate()
    )
  ) {
    age--;
  }

  return age >= 0
    ? `${age} years`
    : null;
}


/* ==========================================================
   COMPONENT
========================================================== */

export default function ResultRecords() {
  const user = useMemo(
    () => getCurrentUser(),
    []
  );

  const [labNumber, setLabNumber] = useState("");
  const [searchedLabNumber, setSearchedLabNumber] =
    useState("");

  const [results, setResults] = useState([]);
  const [searchedReports, setSearchedReports] =
    useState([]);

  const [registration, setRegistration] =
    useState(null);

  const [hasSearched, setHasSearched] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [selectedResult, setSelectedResult] =
    useState(null);

  /* ========================================================
     SEARCH
  ======================================================== */

  const handleSearch = useCallback(
    async () => {
      const query = String(
        labNumber ?? ""
      ).trim();

      if (!query) {
        setError(
          "Please enter a Lab Number."
        );
        setHasSearched(false);
        setSearchedReports([]);
        setRegistration(null);
        return;
      }

      setLoading(true);
      setError(null);
      setHasSearched(false);
      setSearchedReports([]);
      setRegistration(null);
      setSelectedResult(null);

      try {
        /*
         * 1. Fetch registration directly.
         *
         * We intentionally use limit(1) instead of maybeSingle()
         * so duplicate historical registrations cannot trigger
         * PGRST116.
         */
        const {
          data: registrationRows,
          error: registrationError,
        } = await supabase
          .from("registrations")
          .select("*")
          .eq("lab_number", query)
          .order("created_at", {
            ascending: false,
          })
          .limit(1);

        if (registrationError) {
          console.error(
            "[ResultRecords] REGISTRATION ERROR:",
            registrationError
          );
        }

        const registrationRow =
          Array.isArray(registrationRows) &&
          registrationRows.length > 0
            ? registrationRows[0]
            : null;

        /*
         * 2. Fetch result rows.
         */
        const response =
          await getResults();

        if (response?.error) {
          throw response.error;
        }

        const loaded =
          Array.isArray(response?.data)
            ? response.data
            : [];

        /*
         * 3. Match Lab Number exactly.
         */
        const matchedRows =
          loaded.filter(
            (row) =>
              normalize(
                row?.lab_number
              ) === normalize(query)
          );

        if (
          matchedRows.length === 0
        ) {
          setHasSearched(true);
          setSearchedLabNumber(query);
          setResults([]);
          setSearchedReports([]);
          setRegistration(
            registrationRow
          );
          setError(
            registrationRow
              ? "No saved laboratory results were found for this Lab Number."
              : "No registration or laboratory results were found for this Lab Number."
          );
          return;
        }

        /*
         * 4. Build complete report groups.
         */
        const reports =
          buildReportGroups(
            matchedRows
          ).map(
            (report, index) => {
              const items =
                getReportItems(
                  report
                );

              const meta =
                getReportMetadata(
                  report
                );

              /*
               * Registration is the authoritative source for
               * patient/registration information.
               */
              return {
                ...report,

                lab_number:
                  firstValue(
                    registrationRow?.lab_number,
                    meta.lab_number,
                    query
                  ),

                registration_number:
                  firstValue(
                    registrationRow?.registration_number,
                    meta.registration_number
                  ),

                patient_id:
                  firstValue(
                    registrationRow?.patient_id,
                    meta.patient_id
                  ),

                patient_name:
                  firstValue(
                    registrationRow?.full_name,
                    meta.patient_name
                  ),

                full_name:
                  firstValue(
                    registrationRow?.full_name,
                    meta.patient_name
                  ),

                sex:
                  firstValue(
                    registrationRow?.sex,
                    meta.sex
                  ),

                gender:
                  firstValue(
                    registrationRow?.sex,
                    meta.gender
                  ),

                age:
                  firstValue(
                    registrationRow?.age,
                    meta.age
                  ),

                dob:
                  firstValue(
                    registrationRow?.dob,
                    meta.dob
                  ),

                branch:
                  firstValue(
                    registrationRow?.branch,
                    meta.branch
                  ),

                referral_hospital:
                  firstValue(
                    registrationRow?.referral_hospital,
                    registrationRow?.referral_name,
                    meta.referral_hospital
                  ),

                referral_doctor:
                  firstValue(
                    registrationRow?.referral_doctor,
                    registrationRow?.referring_doctor,
                    meta.referral_doctor
                  ),

                clinical_history:
                  firstValue(
                    registrationRow?.clinical_history,
                    meta.clinical_history
                  ),

                register_date_time:
                  firstValue(
                    registrationRow?.created_at,
                    meta.register_date_time
                  ),

                sample_collection_date_time:
                  firstValue(
                    registrationRow?.specimen_collection_time,
                    registrationRow?.collection_datetime,
                    registrationRow?.collection_date,
                    meta.sample_collection_date_time
                  ),

                report_date_time:
                  firstValue(
                    meta.report_date_time,
                    registrationRow?.report_date
                  ),

                reportId:
                  getReportIdentity(
                    report
                  ),

                reportType:
                  getReportType(
                    report
                  ),

                reportTitle:
                  getReportTitle(
                    report
                  ),

                items,

                resultCount:
                  items.filter(
                    hasResultValue
                  ).length,

                _groupIndex:
                  index,
              };
            }
          );

        setResults(
          matchedRows
        );

        setRegistration(
          registrationRow
        );

        setSearchedReports(
          reports
        );

        setSearchedLabNumber(
          query
        );

        setHasSearched(true);

        /*
         * Registration can be absent while patient_results
         * still contain enough information to display results.
         */
        setError(
          registrationRow
            ? null
            : "Registration record was not found. Result data was found, but registration details are unavailable."
        );
      } catch (searchError) {
        console.error(
          "[ResultRecords] SEARCH ERROR:",
          searchError
        );

        setError(
          searchError?.message ||
          "Unable to search this Lab Number."
        );

        setHasSearched(true);
        setSearchedReports([]);
      } finally {
        setLoading(false);
      }
    },
    [labNumber]
  );

  /* ========================================================
     ENTER KEY
  ======================================================== */

  const handleKeyDown =
    useCallback(
      (event) => {
        if (
          event.key === "Enter"
        ) {
          event.preventDefault();
          handleSearch();
        }
      },
      [handleSearch]
    );

  /* ========================================================
     SELECT REPORT
  ======================================================== */

  const openResultView =
    useCallback(
      (report) => {
        if (!report) return;
        setSelectedResult(report);
      },
      []
    );

  const closeResultView =
    useCallback(
      () => {
        setSelectedResult(null);
      },
      []
    );

  /* ========================================================
     ESCAPE KEY
  ======================================================== */

  useEffect(() => {
    if (!selectedResult) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeResultView();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [
    selectedResult,
    closeResultView,
  ]);

  /* ========================================================
     REFRESH AFTER ACTION
  ======================================================== */

  const refreshSearch =
    useCallback(
      async () => {
        if (!searchedLabNumber) return;

        setLabNumber(
          searchedLabNumber
        );

        /*
         * Re-run the same exact search.
         */
        const query =
          searchedLabNumber;

        try {
          const {
            data: registrationRows,
          } = await supabase
            .from("registrations")
            .select("*")
            .eq("lab_number", query)
            .order("created_at", {
              ascending: false,
            })
            .limit(1);

          const registrationRow =
            registrationRows?.[0] ||
            null;

          const response =
            await getResults();

          const loaded =
            Array.isArray(
              response?.data
            )
              ? response.data
              : [];

          const matchedRows =
            loaded.filter(
              (row) =>
                normalize(
                  row?.lab_number
                ) === normalize(query)
            );

          const reports =
            buildReportGroups(
              matchedRows
            ).map(
              (report, index) => {
                const items =
                  getReportItems(
                    report
                  );

                const meta =
                  getReportMetadata(
                    report
                  );

                return {
                  ...report,
                  lab_number:
                    firstValue(
                      registrationRow?.lab_number,
                      meta.lab_number,
                      query
                    ),
                  registration_number:
                    firstValue(
                      registrationRow?.registration_number,
                      meta.registration_number
                    ),
                  patient_id:
                    firstValue(
                      registrationRow?.patient_id,
                      meta.patient_id
                    ),
                  patient_name:
                    firstValue(
                      registrationRow?.full_name,
                      meta.patient_name
                    ),
                  full_name:
                    firstValue(
                      registrationRow?.full_name,
                      meta.patient_name
                    ),
                  sex:
                    firstValue(
                      registrationRow?.sex,
                      meta.sex
                    ),
                  gender:
                    firstValue(
                      registrationRow?.sex,
                      meta.gender
                    ),
                  age:
                    firstValue(
                      registrationRow?.age,
                      meta.age
                    ),
                  dob:
                    firstValue(
                      registrationRow?.dob,
                      meta.dob
                    ),
                  branch:
                    firstValue(
                      registrationRow?.branch,
                      meta.branch
                    ),
                  referral_hospital:
                    firstValue(
                      registrationRow?.referral_hospital,
                      registrationRow?.referral_name,
                      meta.referral_hospital
                    ),
                  referral_doctor:
                    firstValue(
                      registrationRow?.referral_doctor,
                      registrationRow?.referring_doctor,
                      meta.referral_doctor
                    ),
                  clinical_history:
                    firstValue(
                      registrationRow?.clinical_history,
                      meta.clinical_history
                    ),
                  register_date_time:
                    firstValue(
                      registrationRow?.created_at,
                      meta.register_date_time
                    ),
                  sample_collection_date_time:
                    firstValue(
                      registrationRow?.specimen_collection_time,
                      registrationRow?.collection_datetime,
                      registrationRow?.collection_date,
                      meta.sample_collection_date_time
                    ),
                  report_date_time:
                    firstValue(
                      meta.report_date_time,
                      registrationRow?.report_date
                    ),
                  reportId:
                    getReportIdentity(
                      report
                    ),
                  reportType:
                    getReportType(
                      report
                    ),
                  reportTitle:
                    getReportTitle(
                      report
                    ),
                  items,
                  resultCount:
                    items.filter(
                      hasResultValue
                    ).length,
                  _groupIndex: index,
                };
              }
            );

          setRegistration(
            registrationRow
          );

          setResults(
            matchedRows
          );

          setSearchedReports(
            reports
          );

          if (
            selectedResult
          ) {
            const updated =
              reports.find(
                (report) =>
                  report.reportId ===
                  selectedResult.reportId
              );

            if (updated) {
              setSelectedResult(
                updated
              );
            }
          }
        } catch (error) {
          console.error(
            "[ResultRecords] REFRESH ERROR:",
            error
          );
        }
      },
      [
        searchedLabNumber,
        selectedResult,
      ]
    );

  /* ========================================================
     REPORT ACTION HELPERS
  ======================================================== */

  const isAuthorized =
    useCallback(
      (report) =>
        getAuthorizationStatus(
          report
        ) === "Authorized",
      []
    );

  const isReleased =
    useCallback(
      (report) =>
        getReleaseStatus(
          report
        ) === "Released",
      []
    );

  const canAuthorize =
    useCallback(
      (report) => {
        if (!report) return false;
        if (isAuthorized(report)) return false;

        return getReportItems(
          report
        ).some(hasResultValue);
      },
      [isAuthorized]
    );

  const canRelease =
    useCallback(
      (report) => {
        if (!report) return false;
        if (!isAuthorized(report)) return false;
        if (isReleased(report)) return false;

        return getReportItems(
          report
        ).some(hasResultValue);
      },
      [
        isAuthorized,
        isReleased,
      ]
    );

  /* ========================================================
     AUTHORIZE
  ======================================================== */

  const handleAuthorize =
    useCallback(
      async (report) => {
        if (
          !report ||
          actionLoading ||
          !canAuthorize(report)
        ) {
          return;
        }

        setActionLoading(true);

        try {
          const response =
            await authorizeResultService(
              report
            );

          if (response?.error) {
            throw response.error;
          }

          const meta =
            getReportMetadata(
              report
            );

          await logAudit({
            action:
              "authorize_result",
            module:
              "Result Records",
            description:
              `Authorized ${getReportTitle(
                report
              )}`,
            lab_number:
              meta.lab_number,
            patient_id:
              meta.patient_id,
            test_name:
              getReportTitle(
                report
              ),
            record_id:
              report.reportId,
            user_id:
              user?.id,
            username:
              user?.username ||
              user?.email,
          });

          await refreshSearch();
        } catch (error) {
          console.error(
            "[ResultRecords] AUTHORIZE ERROR:",
            error
          );
        } finally {
          setActionLoading(false);
        }
      },
      [
        actionLoading,
        canAuthorize,
        refreshSearch,
        user,
      ]
    );

  /* ========================================================
     RELEASE
  ======================================================== */

  const handleRelease =
    useCallback(
      async (report) => {
        if (
          !report ||
          actionLoading ||
          !canRelease(report)
        ) {
          return;
        }

        setActionLoading(true);

        try {
          const response =
            await releaseResultService(
              report
            );

          if (response?.error) {
            throw response.error;
          }

          const meta =
            getReportMetadata(
              report
            );

          await logAudit({
            action:
              "release_result",
            module:
              "Result Records",
            description:
              `Released ${getReportTitle(
                report
              )}`,
            lab_number:
              meta.lab_number,
            patient_id:
              meta.patient_id,
            test_name:
              getReportTitle(
                report
              ),
            record_id:
              report.reportId,
            user_id:
              user?.id,
            username:
              user?.username ||
              user?.email,
          });

          await refreshSearch();
        } catch (error) {
          console.error(
            "[ResultRecords] RELEASE ERROR:",
            error
          );
        } finally {
          setActionLoading(false);
        }
      },
      [
        actionLoading,
        canRelease,
        refreshSearch,
        user,
      ]
    );

  /* ========================================================
     PRINT
  ======================================================== */

  const handlePrint =
    useCallback(
      async (report) => {
        if (
          !report ||
          actionLoading
        ) {
          return;
        }

        const rows =
          getReportItems(
            report
          );

        if (
          rows.length === 0
        ) {
          return;
        }

        try {
          await updatePrintCount(
            report.reportId
          );

          await logAudit({
            action:
              "print_result",
            module:
              "Result Records",
            description:
              `Printed ${getReportTitle(
                report
              )}`,
            lab_number:
              report.lab_number,
            patient_id:
              report.patient_id,
            test_name:
              getReportTitle(
                report
              ),
            record_id:
              report.reportId,
            user_id:
              user?.id,
            username:
              user?.username ||
              user?.email,
          });

          window.print();
        } catch (error) {
          console.error(
            "[ResultRecords] PRINT ERROR:",
            error
          );
        }
      },
      [
        actionLoading,
        user,
      ]
    );

  /* ========================================================
     DOWNLOAD
  ======================================================== */

  const handleDownload =
    useCallback(
      async (report) => {
        if (
          !report ||
          actionLoading
        ) {
          return;
        }

        try {
          await updateDownloadCount(
            report.reportId
          );

          await logAudit({
            action:
              "download_result",
            module:
              "Result Records",
            description:
              `Downloaded ${getReportTitle(
                report
              )}`,
            lab_number:
              report.lab_number,
            patient_id:
              report.patient_id,
            test_name:
              getReportTitle(
                report
              ),
            record_id:
              report.reportId,
            user_id:
              user?.id,
            username:
              user?.username ||
              user?.email,
          });
        } catch (error) {
          console.error(
            "[ResultRecords] DOWNLOAD ERROR:",
            error
          );
        }
      },
      [
        actionLoading,
        user,
      ]
    );

  /* ========================================================
     PATIENT DISPLAY DATA
  ======================================================== */

  const patientInfo = useMemo(
    () => {
      if (!hasSearched) {
        return null;
      }

      const firstReport =
        searchedReports[0] || {};

      const meta =
        getReportMetadata(
          firstReport
        );

      return {
        name:
          firstValue(
            registration?.full_name,
            firstReport?.patient_name,
            meta.patient_name
          ),

        lab:
          firstValue(
            registration?.lab_number,
            firstReport?.lab_number,
            searchedLabNumber
          ),

        patientId:
          firstValue(
            registration?.patient_id,
            firstReport?.patient_id
          ),

        sex:
          firstValue(
            registration?.sex,
            firstReport?.sex
          ),

        age:
          firstValue(
            registration?.age,
            registration?.patient_age,
            firstReport?.age,
            firstReport?.patient_age,
            calculateAgeFromDob(
              registration?.date_of_birth ||
              registration?.dob ||
              firstReport?.date_of_birth ||
              firstReport?.dob
            )
          ),

        dob:
          firstValue(
            registration?.date_of_birth,
            registration?.dob,
            firstReport?.date_of_birth,
            firstReport?.dob
          ),

        status:
          searchedReports.some(
            isReleased
          )
            ? "Released"
            : searchedReports.some(
                isAuthorized
              )
              ? "Authorized"
              : "Not Released",

        branch:
          firstValue(
            registration?.branch,
            firstReport?.branch
          ),

        referralHospital:
          firstValue(
            registration?.referral_hospital,
            registration?.referral_name,
            firstReport?.referral_hospital
          ),

        referralDoctor:
          firstValue(
            registration?.referral_doctor,
            registration?.referring_doctor,
            firstReport?.referral_doctor
          ),

        registerDateTime:
          firstValue(
            registration?.created_at,
            firstReport?.register_date_time
          ),

        collectionDateTime:
          firstValue(
            registration?.specimen_collection_time,
            registration?.collection_datetime,
            registration?.collection_date,
            firstReport?.sample_collection_date_time
          ),

        reportDateTime:
          firstValue(
            firstReport?.report_date_time,
            registration?.report_date
          ),

        clinicalHistory:
          firstValue(
            registration?.clinical_history,
            firstReport?.clinical_history
          ),
      };
    },
    [
      hasSearched,
      searchedReports,
      registration,
      searchedLabNumber,
      isReleased,
      isAuthorized,
    ]
  );

  return (
    <div className="result-records-page">
      <div className="result-records-header">
        <div>
          <div className="result-records-kicker">
            LABORATORY INFORMATION SYSTEM
          </div>

          <h1>
            Result Records
          </h1>

          <p>
            Search a Lab Number to view all
            registered laboratory reports.
          </p>
        </div>
      </div>

      {/* ======================================================
          SEARCH
      ====================================================== */}

      <section className="result-search-card">
        <div className="result-search-label">
          <Search size={18} />
          Search by Lab Number
        </div>

        <div className="result-search-row">
          <input
            value={labNumber}
            onChange={(event) =>
              setLabNumber(
                event.target.value
              )
            }
            onKeyDown={
              handleKeyDown
            }
            placeholder="Enter Lab No. e.g. LAB260868"
            autoComplete="off"
          />

          <button
            type="button"
            className="result-search-button"
            onClick={
              handleSearch
            }
            disabled={
              loading
            }
          >
            <Search size={18} />

            {loading
              ? "Searching..."
              : "Search"}
          </button>
        </div>

        {error && (
          <div className="result-search-error">
            {error}
          </div>
        )}
      </section>

      {/* ======================================================
          NOTHING BEFORE SEARCH
      ====================================================== */}

      {!hasSearched && (
        <section className="result-empty-state">
          <FileText size={42} />

          <h2>
            Search for a Laboratory Report
          </h2>

          <p>
            Enter a Lab Number above and
            press Search to display the
            patient's information and all
            registered tests.
          </p>
        </section>
      )}

      {/* ======================================================
          PATIENT INFORMATION
      ====================================================== */}

      {hasSearched &&
        patientInfo && (
          <section className="patient-information-card">
            <div className="section-heading">
              <div>
                <User size={19} />
                <span>
                  Patient Information
                </span>
              </div>
            </div>

            <div className="patient-grid">
              <Info
                label="Name"
                value={
                  patientInfo.name
                }
              />

              <Info
                label="Lab No"
                value={
                  patientInfo.lab
                }
              />

              <Info
                label="Patient ID"
                value={
                  patientInfo.patientId
                }
              />

              <Info
                label="Sex"
                value={
                  patientInfo.sex
                }
              />

              <Info
                label="Age"
                value={
                  patientInfo.age
                }
              />

              <Info
                label="Status"
                value={
                  patientInfo.status
                }
                badge
              />

              <Info
                label="Branch"
                value={
                  patientInfo.branch
                }
              />

              <Info
                label="Referral Hospital"
                value={
                  patientInfo.referralHospital
                }
              />

              <Info
                label="Referral Doctor"
                value={
                  patientInfo.referralDoctor
                }
              />

              <Info
                label="Register Date/Time"
                value={formatDateTime(
                  patientInfo.registerDateTime
                )}
              />

              <Info
                label="Sample Collection Date/Time"
                value={formatDateTime(
                  patientInfo.collectionDateTime
                )}
              />

              <Info
                label="Report Date/Time"
                value={formatDateTime(
                  patientInfo.reportDateTime
                )}
              />
            </div>

            <div className="clinical-history-box">
              <span>
                Clinical History
              </span>

              <p>
                {patientInfo.clinicalHistory ||
                  "—"}
              </p>
            </div>
          </section>
        )}

      {/* ======================================================
          REGISTERED TESTS
      ====================================================== */}

      {hasSearched && (
        <section className="registered-tests-section">
          <div className="section-heading tests-heading">
            <div>
              <FileText size={19} />
              <span>
                Registered Tests
              </span>
            </div>

            <strong>
              {searchedReports.length}
            </strong>
          </div>

          {searchedReports.length === 0 ? (
            <div className="no-tests">
              No registered laboratory result
              was found for this Lab Number.
            </div>
          ) : (
            <div className="test-record-list">
              {searchedReports.map(
                (report) => {
                  const items =
                    getReportItems(
                      report
                    );

                  const title =
                    getReportTitle(
                      report
                    );

                  const auth =
                    isAuthorized(
                      report
                    );

                  const released =
                    isReleased(
                      report
                    );

                  return (
                    <article
                      className="test-record-card"
                      key={
                        report.reportId
                      }
                    >
                      <div className="test-record-main">
                        <div className="test-record-icon">
                          <FileText
                            size={22}
                          />
                        </div>

                        <div className="test-record-details">
                          <div className="test-record-title">
                            {title}
                          </div>

                          <div className="test-record-meta">
                            <span>
                              {report.department ||
                                "Laboratory"}
                            </span>

                            <span>
                              {report.reportType ===
                              "panel"
                                ? "Panel"
                                : "Single Test"}
                            </span>

                            <span>
                              {report.resultCount ||
                                0}{" "}
                              result
                              {report.resultCount ===
                              1
                                ? ""
                                : "s"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="test-record-status">
                        <span
                          className={
                            auth
                              ? "status authorized"
                              : "status pending"
                          }
                        >
                          {auth
                            ? "Authorized"
                            : "Pending"}
                        </span>

                        <span
                          className={
                            released
                              ? "status released"
                              : "status not-released"
                          }
                        >
                          {released
                            ? "Released"
                            : "Not Released"}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="view-result-button"
                        onClick={() =>
                          openResultView(
                            report
                          )
                        }
                      >
                        <Eye
                          size={17}
                        />
                        View
                      </button>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </section>
      )}

      {/* ======================================================
          RESULT VIEW MODAL
      ====================================================== */}

      {selectedResult && (
        <div
          className="result-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeResultView();
            }
          }}
        >
          <div
            className="result-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="result-modal-header">
              <div>
                <div className="result-modal-department">
                  {selectedResult.department ||
                    "LABORATORY"}
                </div>

                <h2>
                  {getReportTitle(
                    selectedResult
                  )}
                </h2>

                <p>
                  Complete laboratory report
                </p>
              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={
                  closeResultView
                }
                aria-label="Close"
              >
                <X size={21} />
              </button>
            </div>

            <div className="result-modal-body">
              {/* ==================================================
                  SHARED PATIENT HEADER

                  The modal uses the same patientInfo object as
                  Result Records. This prevents the View Result
                  modal from showing a reduced patient record.
              ================================================== */}

              <PatientHeader
                patient={{
                  ...(patientInfo || {}),

                  full_name:
                    patientInfo?.name ||
                    selectedResult?.patient_name ||
                    selectedResult?.full_name ||
                    null,

                  patient_name:
                    patientInfo?.name ||
                    selectedResult?.patient_name ||
                    selectedResult?.full_name ||
                    null,

                  lab_number:
                    patientInfo?.lab ||
                    selectedResult?.lab_number ||
                    null,

                  patient_id:
                    patientInfo?.patientId ||
                    selectedResult?.patient_id ||
                    null,

                  sex:
                    patientInfo?.sex ||
                    selectedResult?.sex ||
                    selectedResult?.gender ||
                    null,

                  age:
                    patientInfo?.age ||
                    selectedResult?.age ||
                    calculateAgeFromDob(
                      patientInfo?.dob ||
                      selectedResult?.date_of_birth ||
                      selectedResult?.dob
                    ),

                  branch:
                    patientInfo?.branch ||
                    selectedResult?.branch ||
                    null,

                  referral_name:
                    patientInfo?.referralHospital ||
                    selectedResult?.referral_hospital ||
                    selectedResult?.referral_name ||
                    null,

                  referring_doctor:
                    patientInfo?.referralDoctor ||
                    selectedResult?.referral_doctor ||
                    selectedResult?.referring_doctor ||
                    null,

                  clinical_history:
                    patientInfo?.clinicalHistory ||
                    selectedResult?.clinical_history ||
                    null,

                  created_at:
                    patientInfo?.registerDateTime ||
                    selectedResult?.created_at ||
                    null,

                  register_date_time:
                    patientInfo?.registerDateTime ||
                    selectedResult?.register_date_time ||
                    selectedResult?.created_at ||
                    null,

                  sample_collection_date_time:
                    patientInfo?.collectionDateTime ||
                    selectedResult?.sample_collection_date_time ||
                    null,

                  report_date_time:
                    patientInfo?.reportDateTime ||
                    selectedResult?.report_date_time ||
                    selectedResult?.reported_at ||
                    selectedResult?.released_at ||
                    selectedResult?.authorized_at ||
                    null,

                  status:
                    patientInfo?.status ||
                    (
                      isReleased(selectedResult)
                        ? "Released"
                        : isAuthorized(selectedResult)
                          ? "Authorized"
                          : "Not Released"
                    ),
                }}
                results={[
                  {
                    ...selectedResult,

                    released_at:
                      selectedResult?.released_at ||
                      selectedResult?.releasedAt ||
                      null,

                    authorized_at:
                      selectedResult?.authorized_at ||
                      selectedResult?.authorizedAt ||
                      null,

                    reported_at:
                      selectedResult?.reported_at ||
                      selectedResult?.reportedAt ||
                      selectedResult?.report_date_time ||
                      patientInfo?.reportDateTime ||
                      null,

                    created_at:
                      selectedResult?.created_at ||
                      patientInfo?.registerDateTime ||
                      null,

                    register_date_time:
                      selectedResult?.register_date_time ||
                      patientInfo?.registerDateTime ||
                      null,

                    sample_collection_date_time:
                      selectedResult?.sample_collection_date_time ||
                      patientInfo?.collectionDateTime ||
                      null,

                    clinical_history:
                      selectedResult?.clinical_history ||
                      patientInfo?.clinicalHistory ||
                      null,
                  },
                ]}
              />

              <div className="result-table-wrapper">
                <table className="result-table">
                  <thead>
                    <tr>
                      <th>
                        Parameter
                      </th>
                      <th>
                        Result
                      </th>
                      <th>
                        Unit
                      </th>
                      <th>
                        Reference Range
                      </th>
                      <th>
                        Flag
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {getReportItems(
                      selectedResult
                    )
                      .slice()
                      .sort(
                        (a, b) =>
                          Number(
                            firstValue(
                              a?.display_order,
                              a?.displayOrder,
                              999999
                            )
                          ) -
                          Number(
                            firstValue(
                              b?.display_order,
                              b?.displayOrder,
                              999999
                            )
                          )
                      )
                      .map(
                        (row, index) => {
                          const value =
                            getResultValue(
                              row
                            );

                          const flag =
                            getResultFlag(
                              row
                            );

                          return (
                            <tr
                              key={
                                row?.id ||
                                `${getParameterName(
                                  row
                                )}-${index}`
                              }
                            >
                              <td>
                                <strong>
                                  {getParameterName(
                                    row
                                  )}
                                </strong>
                              </td>

                              <td className="result-value-cell">
                                {value ??
                                  "—"}
                              </td>

                              <td>
                                {getResultUnit(
                                  row
                                ) || "—"}
                              </td>

                              <td>
                                {getReferenceRange(
                                  row
                                ) || "—"}
                              </td>

                              <td>
                                <span
                                  className={`result-flag result-flag-${normalize(
                                    flag ||
                                      "normal"
                                  ).replace(
                                    /\s+/g,
                                    "-"
                                  )}`}
                                >
                                  {flag ||
                                    "—"}
                                </span>
                              </td>
                            </tr>
                          );
                        }
                      )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="result-modal-actions">
              <button
                type="button"
                className="action-button secondary"
                onClick={
                  closeResultView
                }
              >
                <X size={16} />
                Close
              </button>

              <button
                type="button"
                className="action-button secondary"
                disabled={
                  actionLoading
                }
                onClick={() =>
                  handlePrint(
                    selectedResult
                  )
                }
              >
                <Printer size={16} />
                Print
              </button>

              <button
                type="button"
                className="action-button secondary"
                disabled={
                  actionLoading
                }
                onClick={() =>
                  handleDownload(
                    selectedResult
                  )
                }
              >
                <Download size={16} />
                Download
              </button>

              {!isAuthorized(
                selectedResult
              ) && (
                <button
                  type="button"
                  className="action-button authorize"
                  disabled={
                    actionLoading ||
                    !canAuthorize(
                      selectedResult
                    )
                  }
                  onClick={() =>
                    handleAuthorize(
                      selectedResult
                    )
                  }
                >
                  <CheckCircle2
                    size={16}
                  />
                  Authorize
                </button>
              )}

              {isAuthorized(
                selectedResult
              ) &&
                !isReleased(
                  selectedResult
                ) && (
                  <button
                    type="button"
                    className="action-button release"
                    disabled={
                      actionLoading ||
                      !canRelease(
                        selectedResult
                      )
                    }
                    onClick={() =>
                      handleRelease(
                        selectedResult
                      )
                    }
                  >
                    <Unlock
                      size={16}
                    />
                    Release
                  </button>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================
   INFO COMPONENT
========================================================== */

function Info({
  label,
  value,
  badge = false,
}) {
  return (
    <div className="info-item">
      <span className="info-label">
        {label}
      </span>

      {badge ? (
        <span className="info-value status-value">
          {value || "—"}
        </span>
      ) : (
        <strong className="info-value">
          {value === null ||
          value === undefined ||
          String(value).trim() === ""
            ? "—"
            : String(value)}
        </strong>
      )}
    </div>
  );
}
