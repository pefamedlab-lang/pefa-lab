import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Download,
  Eye,
  FileCheck2,
  FileText,
  FlaskConical,
  Loader2,
  LockKeyhole,
  Mail,
  MessageCircle,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  UnlockKeyhole,
  Users,
  X,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../supabase";

import {
  getLaboratoryResultWorkspace,
  updateLaboratoryResult,
} from "../../services/laboratory/laboratoryResultService";
import FormalResultRenderer from "../../components/printing/FormalResultRenderer";
import { getAgeAwareBilirubinResult } from "../../services/laboratory/neonatalBilirubinReferenceEngine";
import { QRCodeSVG } from "qrcode.react";
import logo from "../../assets/logo.png";
import "./LaboratoryResultDashboard.css";

/*
  PEFA LABORATORY RESULT DASHBOARD
  --------------------------------
  REVIEW / VERIFICATION / AUTHORIZATION / RELEASE / PRINT

  Report-boundary rules:
  1. Same Lab Number does NOT automatically mean one report.
  2. Panel registrations remain separate reports.
  3. Special result registrations remain separate reports.
  4. Single quantitative results are grouped by:
       Lab Number + Department + Quantitative
  5. Single qualitative results are grouped by:
       Lab Number + Department + Qualitative
  6. Therefore Chemistry singles, Hematology singles and Endocrine
     singles are grouped together within their own department.
  7. A registered panel/special result is never merged into a single
     department report.
  8. Empty result rows are never shown as saved results.
  9. Existing Supabase/result-service payload shape is not changed.
  10. Printing supports exactly two report formats:
        - PRE-PRINTED LETTERHEAD
        - FULL DIGITAL LETTERHEAD
*/

const text = (value) => String(value ?? "").trim();

const normalize = (value) =>
  text(value)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();

const pretty = (value) =>
  text(value)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const isSavedValue = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (typeof value === "number" || typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.length > 0;
  if (isObject(value)) return Object.keys(value).length > 0;
  return false;
};

const firstValue = (...values) => {
  for (const value of values) {
    if (value !== null && value !== undefined && text(value) !== "") return value;
  }
  return null;
};

const firstScalarValue = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    if (typeof value === "object") continue;
    if (text(value) !== "") return value;
  }
  return null;
};

const patientName = (row) =>
  firstValue(
    row?.patient_name,
    row?.patientName,
    row?.full_name,
    row?.patient?.full_name,
    row?.registration?.full_name,
    "Unknown Patient"
  );

const patientId = (row) =>
  firstValue(row?.patient_id, row?.patientId, row?.patient?.patient_id, "—");

const labNumber = (row) =>
  firstValue(row?.lab_number, row?.labNumber, row?.patient?.lab_number, "");

const registrationNumber = (row) =>
  firstValue(
    row?.registration_number,
    row?.registrationNumber,
    row?.registration?.registration_number,
    ""
  );

const testName = (row) =>
  firstValue(
    row?.test_name,
    row?.testName,
    row?.name,
    row?.test,
    row?.masterTest?.test_name,
    row?.master_test?.test_name,
    "Laboratory Test"
  );

const panelName = (row) =>
  firstValue(
    row?.panel_name,
    row?.panelName,
    row?.masterTest?.panel_name,
    row?.master_test?.panel_name,
    row?.parent_panel,
    ""
  );

const department = (row) =>
  firstValue(
    row?.department,
    row?.category,
    row?.department_name,
    row?.masterTest?.department,
    row?.master_test?.department,
    "Laboratory"
  );

const resultType = (row) =>
  normalize(
    firstValue(
      row?.result_type,
      row?.resultType,
      row?.masterTest?.result_type,
      row?.master_test?.result_type,
      ""
    )
  );

const unit = (row) =>
  firstValue(
    row?.unit,
    row?.result_unit,
    row?.resultUnit,
    row?.masterTest?.unit,
    row?.master_test?.unit,
    ""
  );

const referenceRange = (row) =>
  firstValue(
    row?.reference_range,
    row?.referenceRange,
    row?.reference_value,
    row?.referenceValue,
    row?.masterTest?.reference_range,
    row?.master_test?.reference_range,
    row?.masterTest?.reference_value,
    row?.master_test?.reference_value,
    ""
  );

const timestamp = (row) => row?.updated_at || row?.created_at || null;

const status = (row) => {
  const release = normalize(row?.release_status);
  const authorization = normalize(row?.authorization_status);
  const resultStatus = normalize(row?.result_status || row?.status || "pending");

  if (release === "released") return "released";
  if (authorization === "authorized") return "authorized";
  if (resultStatus === "released") return "released";
  if (resultStatus === "authorized") return "authorized";
  if (resultStatus === "verified") return "verified";
  // Current Result Entry workflow stores a completed entry as Performed.
  if (resultStatus === "performed") return "entered";
  // Keep legacy Completed rows visible as Entered.
  if (resultStatus === "completed") return "entered";
  if (resultStatus === "entered") return "entered";

  // A structured Blood Bank result can legitimately retain legacy/payload
  // result_status = Pending while the actual result object is already saved.
  // The presence of a persisted result value is authoritative for Dashboard
  // visibility/status.
  if (resultStatus === "pending" && hasSavedResult(row)) {
    return "entered";
  }

  return resultStatus || "pending";
};

const statusLabel = (value) => {
  const v = normalize(value);
  if (v === "entered") return "Entered";
  if (v === "verified") return "Verified";
  if (v === "authorized") return "Authorized";
  if (v === "released") return "Released";
  return pretty(v || "Pending");
};

const statusRank = { pending: 0, entered: 1, performed: 1, completed: 1, verified: 2, authorized: 3, released: 4 };

const resultValue = (row) => {
  if (!row) return null;
  if (isSavedValue(row.result)) return row.result;
  if (row.result_numeric !== null && row.result_numeric !== undefined && row.result_numeric !== "") {
    return row.result_numeric;
  }
  if (row.result_value !== null && row.result_value !== undefined && row.result_value !== "") {
    return row.result_value;
  }
  if (row.value !== null && row.value !== undefined && row.value !== "") return row.value;
  return null;
};

const hasSavedResult = (row) => isSavedValue(resultValue(row));

const parseResultObject = (value) => {
  if (isObject(value)) return value;
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const parsed = JSON.parse(value);
    return isObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const flattenResult = (value, prefix = "") => {
  const rows = [];
  if (value === null || value === undefined) return rows;

  if (!isObject(value) && !Array.isArray(value)) {
    if (text(value) !== "") {
      rows.push({
        key: prefix || "result",
        label: pretty(prefix || "Result"),
        value,
      });
    }
    return rows;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      rows.push(...flattenResult(item, prefix ? `${prefix} ${index + 1}` : `Result ${index + 1}`));
    });
    return rows;
  }

  const hidden = new Set([
    "editmode",
    "edit_mode",
    "parameterloading",
    "parameter_loading",
    "parametersource",
    "parameter_source",
    "parametererror",
    "parameter_error",
    "demographics",
    "metadata",
    "internal",
  ]);

  Object.entries(value).forEach(([key, item]) => {
    if (hidden.has(normalize(key).replace(/\s+/g, ""))) return;
    const next = prefix ? `${prefix}.${key}` : key;

    if (isObject(item) || Array.isArray(item)) {
      rows.push(...flattenResult(item, next));
    } else if (item !== null && item !== undefined && text(item) !== "") {
      rows.push({ key: next, label: pretty(key), value: item });
    }
  });

  return rows;
};

const savedRows = (row) => {
  const result = resultValue(row);
  const structured = parseResultObject(result);

  if (structured) {
    const nested = parseResultObject(structured.result);
    const payload = nested ? { ...structured, ...nested } : structured;

    const value = firstScalarValue(
      payload.value,
      payload.result_value,
      payload.resultValue,
      payload.result,
      payload.reading,
      payload.interpretation
    );

    if (value !== null && value !== undefined && text(value) !== "") {
      return [{
        key: "result",
        label: firstValue(payload.parameter, payload.test_name, payload.testName, testName(row)),
        value,
        unit: firstValue(payload.unit, unit(row), ""),
        reference: firstValue(
          payload.reference_range,
          payload.referenceRange,
          referenceRange(row),
          ""
        ),
        flag: firstValue(payload.flag, row?.flag, row?.result_flag, ""),
      }];
    }

    return flattenResult(result);
  }

  if (hasSavedResult(row)) {
    return [{
      key: "result",
      label: testName(row),
      value: result,
      unit: unit(row),
      reference: referenceRange(row),
      flag: row?.flag || row?.result_flag || "",
    }];
  }

  return [];
};

const KNOWN_PANEL_NAMES = [
  "lipid profile",
  "fasting lipid profile",
  "flp",
  "liver function test",
  "liver function tests",
  "lft",
  "liver profile",
  "renal function test",
  "renal function tests",
  "rft",
  "kidney function test",
  "renal profile",
  "electrolytes",
  "electrolyte profile",
  "electrolytes urea creatinine",
  "electrolytes urea creatinine profile",
  "euc",
  "e u c",
  "uec",
  "thyroid function test",
  "thyroid function tests",
  "tft",
  "diabetes profile",
  "complete blood count",
  "full blood count",
  "cbc",
  "fbc",
  "serum bilirubin",
  "bilirubin profile",
  "bilirubin panel",
  "total and direct bilirubin",
  "total direct bilirubin",
];

const SPECIAL_RESULT_NAMES = [
  "widal",
  "widal test",
  "malaria parasite",
  "malaria parasite microscopy",
  "malaria parasite microscopy test",
  "urinalysis",
  "routine urinalysis",
  "urine microscopy",
  "stool analysis",
  "stool microscopy",
  "semen analysis",
  "seminal fluid analysis",
  "blood culture",
  "blood culture mcs",
  "hvs",
  "high vaginal swab",
  "ecs",
  "endocervical swab",
  "mcs",
  "microscopy culture sensitivity",
  "drug screen",
  "drug screening",
  "donor screening",
  "blood grouping",
  "blood group",
  "crossmatch",
  "cross matching",
];

const includesKnownName = (name, names) =>
  names.some((item) => {
    const n = normalize(item);
    return name === n || name.includes(n);
  });

const isPCVRow = (row = {}) => {
  const identities = [
    row?.test_name,
    row?.testName,
    row?.name,
    row?.test,
    row?.parameter,
    row?.parameter_name,
    row?.parameterName,
    row?.masterTest?.test_name,
    row?.masterTest?.testName,
    row?.masterTest?.name,
    row?.master_test?.test_name,
    row?.master_test?.testName,
    row?.master_test?.name,
    row?.code,
    row?.test_code,
    row?.testCode,
    row?.key,
  ]
    .filter((value) => value !== null && value !== undefined && text(value) !== "")
    .map((value) =>
      normalize(value)
        .replace(/[()\[\]{}]+/g, " ")
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    );

  return identities.some((identity) => {
    const compact = identity.replace(/\s+/g, "");
    return compact === "pcv" || compact === "packedcellvolume";
  });
};

const isUricAcidRow = (row = {}) => {
  const identities = [
    row?.test_name, row?.testName, row?.name, row?.test,
    row?.parameter, row?.parameter_name, row?.parameterName,
    row?.masterTest?.test_name, row?.masterTest?.testName, row?.masterTest?.name,
    row?.master_test?.test_name, row?.master_test?.testName, row?.master_test?.name,
    row?.code, row?.test_code, row?.testCode, row?.key,
  ].filter((value) => value !== null && value !== undefined && text(value) !== "")
    .map((value) => normalize(value)
      .replace(/[()\[\]{}]+/g, " ")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim());

  return identities.some((identity) => {
    const compact = identity.replace(/\s+/g, "");
    return compact === "uricacid" || compact === "uric" || compact === "serumuricacid";
  });
};

const isHbA1cRow = (row = {}) => {
  const identities = [
    row?.test_name, row?.testName, row?.name, row?.test,
    row?.parameter, row?.parameter_name, row?.parameterName,
    row?.masterTest?.test_name, row?.masterTest?.testName, row?.masterTest?.name,
    row?.master_test?.test_name, row?.master_test?.testName, row?.master_test?.name,
    row?.code, row?.test_code, row?.testCode, row?.key,
  ].filter((value) => value !== null && value !== undefined && text(value) !== "")
    .map((value) => normalize(value)
      .replace(/[()\[\]{}]+/g, " ")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim());

  return identities.some((identity) => {
    const compact = identity.replace(/\s+/g, "");
    return (
      compact === "hba1c" ||
      compact === "hba1" ||
      compact === "glycatedhaemoglobin" ||
      compact === "glycatedhemoglobin" ||
      compact === "glycosylatedhaemoglobin" ||
      compact === "glycosylatedhemoglobin"
    );
  });
};

const PEFA_URIC_ACID_DASHBOARD_UNIT = "mg/dL";
const PEFA_HBA1C_DASHBOARD_UNIT = "%";
const PEFA_HBA1C_DASHBOARD_REFERENCE = "4.0 - 6.0 %";

// PEFA serum uric acid reference ranges. Keep sex-specific because uric acid
// reference intervals commonly differ between adult males and females.
const getUricAcidDashboardReference = (row, report = {}) => {
  const { sex, age } = getSavedDemographics(row, report);
  if (age !== null && age < 18) return "2.5 - 5.5 mg/dL";
  if (sex === "female") return "2.4 - 6.0 mg/dL";
  if (sex === "male") return "3.4 - 7.0 mg/dL";
  return "3.4 - 7.0 mg/dL";
};

const PEFA_PCV_DASHBOARD_UNIT = "%";

const getPCVDashboardReference = (row, report = {}) => {
  const { sex, age } = getSavedDemographics(row, report);

  // Keep the PCV ranges aligned with the PEFA hematology test library.
  if (age !== null && age < 18) return "35 - 45 %";
  if (age !== null && age >= 65) return "35 - 50 %";
  if (sex === "female") return "36 - 48 %";
  if (sex === "male") return "40 - 54 %";

  return "";
};

const isFBSRow = (row = {}) => {
  const identities = [
    row?.test_name,
    row?.testName,
    row?.name,
    row?.test,
    row?.parameter,
    row?.parameter_name,
    row?.parameterName,
    row?.masterTest?.test_name,
    row?.masterTest?.testName,
    row?.masterTest?.name,
    row?.master_test?.test_name,
    row?.master_test?.testName,
    row?.master_test?.name,
    row?.code,
    row?.test_code,
    row?.testCode,
    row?.key,
  ]
    .filter((value) => value !== null && value !== undefined && text(value) !== "")
    .map((value) =>
      normalize(value)
        .replace(/[()\[\]{}]+/g, " ")
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    );

  return identities.some((identity) => {
    const compact = identity.replace(/\s+/g, "");

    return (
      compact === "fbs" ||
      compact === "fbsglucometer" ||
      compact === "fastingbloodsugar" ||
      compact === "fastingbloodsugarglucometer" ||
      compact === "fastingbloodglucose" ||
      compact === "fastingbloodglucoseglucometer" ||
      compact === "fastingplasmaglucose"
    );
  });
};

const isRBSRow = (row = {}) => {
  const identities = [
    row?.test_name,
    row?.testName,
    row?.name,
    row?.test,
    row?.parameter,
    row?.parameter_name,
    row?.parameterName,
    row?.masterTest?.test_name,
    row?.masterTest?.testName,
    row?.masterTest?.name,
    row?.master_test?.test_name,
    row?.master_test?.testName,
    row?.master_test?.name,
    row?.code,
    row?.test_code,
    row?.testCode,
    row?.key,
  ]
    .filter((value) => value !== null && value !== undefined && text(value) !== "")
    .map((value) =>
      normalize(value)
        .replace(/[()\[\]{}]+/g, " ")
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    );

  return identities.some((identity) => {
    const compact = identity.replace(/\s+/g, "");
    return (
      compact === "rbs" ||
      compact === "rbsglucometer" ||
      compact === "randombloodsugar" ||
      compact === "randombloodsugarglucometer" ||
      compact === "randombloodglucose" ||
      compact === "randombloodglucoseglucometer" ||
      compact === "randomplasmaglucose" ||
      compact === "randomplasmaglucoseglucometer"
    );
  });
};

const PEFA_FBS_DASHBOARD_UNIT = "mg/dL";
const PEFA_FBS_DASHBOARD_REFERENCE = "70 - 110 mg/dL";
const PEFA_RBS_DASHBOARD_UNIT = "mg/dL";
const PEFA_RBS_DASHBOARD_REFERENCE = "90.0 - 180.0 mg/dL";

const presentation = (row) => {
  const name = normalize(testName(row));
  const panel = normalize(panelName(row));
  const template = normalize(
    row?.template_type ||
      row?.templateType ||
      row?.masterTest?.template_type ||
      row?.master_test?.template_type ||
      ""
  );
  const category = normalize(
    row?.result_category ||
      row?.masterTest?.result_category ||
      row?.master_test?.result_category ||
      ""
  );
  const type = resultType(row);

  // PCV is ALWAYS a quantitative hematology measurement. This override
  // prevents stale/legacy qualitative metadata from changing the Dashboard
  // report type.
  if (isPCVRow(row) || isUricAcidRow(row) || isHbA1cRow(row)) {
    return "quantitative";
  }

  // PEFA FBS is ALWAYS a quantitative result. This override prevents stale
  // qualitative metadata from changing the Dashboard report type.
  if (isFBSRow(row) || isRBSRow(row)) {
    return "quantitative";
  }

  // ESR is a true quantitative hematology measurement. Some legacy/result-entry
  // rows may carry qualitative metadata, but ESR must never be rendered as a
  // qualitative report. Keep this override before generic type detection.
  if (
    name === "esr" ||
    name === "erythrocyte sedimentation rate" ||
    name.includes("erythrocyte sedimentation rate")
  ) {
    return "quantitative";
  }

  // IMPORTANT: classification must come from the registered/result-entry row.
  // A master test may also be a child of a panel and may carry inherited
  // panel metadata. That must NEVER convert an ordinary single result into
  // a panel report.
  const explicitTestType = normalize(
    row?.test_type ||
      row?.testType ||
      ""
  );
  const explicitIsPanel =
    row?.is_panel === true ||
    row?.isPanel === true ||
    explicitTestType === "panel" ||
    explicitTestType === "profile";
  const explicitIsSingle =
    row?.is_panel === false ||
    row?.isPanel === false ||
    explicitTestType === "single test" ||
    explicitTestType === "single" ||
    explicitTestType === "individual test";

  // Coombs tests have a dedicated Blood Bank report boundary and renderer.
  if (isCoombsRow(row)) {
    return "coombs";
  }

  // Explicit special forms always win over generic result-type detection.
  if (
    includesKnownName(name, SPECIAL_RESULT_NAMES) ||
    includesKnownName(panel, SPECIAL_RESULT_NAMES) ||
    template.includes("malaria") ||
    template.includes("microscopy") ||
    template.includes("special") ||
    category.includes("special")
  ) {
    return "special";
  }

  // Canonical Serum Bilirubin is ALWAYS a quantitative panel. This protects
  // the Dashboard from stale legacy result_type values such as "Qualitative".
  if (
    name === "serum bilirubin" ||
    name.includes("serum bilirubin") ||
    name.includes("bilirubin profile") ||
    name.includes("bilirubin panel") ||
    name.includes("total and direct bilirubin") ||
    name.includes("total direct bilirubin")
  ) {
    return "panel";
  }

  // A single-test classification is authoritative. A master test may belong
  // to one or more panel definitions in panel_tests, but that does NOT turn
  // the registered single test into a panel report.
  if (explicitIsSingle) return "quantitative";

  // Explicit/known panel registrations are panels. Do NOT use panel_name
  // alone because child single tests can inherit a panel_name from master
  // metadata (e.g. HbA1c/FBS under a glucose profile).
  if (
    explicitIsPanel ||
    includesKnownName(name, KNOWN_PANEL_NAMES) ||
    template.includes("panel") ||
    category.includes("panel")
  ) {
    return "panel";
  }

  if (
    type.includes("quantitative") ||
    type.includes("numeric") ||
    type.includes("number") ||
    template.includes("quantitative") ||
    unit(row)
  ) {
    return "quantitative";
  }

  return "qualitative";
};

const isPanel = (row) => presentation(row) === "panel";
const isSpecial = (row) => presentation(row) === "special";
const isCoombs = (row) => presentation(row) === "coombs";

const isHematologyReport = (report = {}) => {
  const department = canonicalReportDepartment(report?.department);
  const textValue = normalize([
    report?.title,
    report?.test_name,
    report?.testName,
    report?.panel_name,
    report?.panelName,
  ].filter(Boolean).join(" "));

  return (
    department === "haematology" ||
    textValue.includes("haematology") ||
    textValue.includes("hematology") ||
    textValue.includes("full blood count") ||
    textValue === "fbc" ||
    textValue.includes("complete blood count") ||
    textValue.includes("cbc")
  );
};

const canonicalReportDepartment = (value) => {
  const v = normalize(value);
  if (v.includes("hematology") || v.includes("haematology")) return "haematology";
  if (v.includes("endocrinology") || v.includes("endocrine")) return "endocrinology";
  if (v === "chemistry" || v.includes("chemical pathology") || v.includes("clinical chemistry") || v.includes("biochemistry")) return "chemical pathology";
  return v;
};

const reportKey = (row) => {
  const lab = text(labNumber(row));
  const registered = text(row?.registered_test_id ?? row?.registeredTestId);
  const panelId = text(row?.panel_id ?? row?.panelId);
  const panelMaster = text(row?.panel_master_test_id ?? row?.panelMasterTestId);
  const master = text(row?.master_test_id ?? row?.masterTestId);
  const testId = text(row?.test_id ?? row?.testId);
  const p = presentation(row);

  /*
    IMPORTANT:
    registered_test_id is a report boundary ONLY for panels and special
    result forms. It must NOT split ordinary single tests such as FBS,
    HbA1c, Urea, Creatinine, etc.
  */
  if (isCoombsRow(row)) {
    if (registered) return `${lab}::coombs-registered::${registered}`;
    if (testId) return `${lab}::coombs::${testId}`;
    if (master) return `${lab}::coombs-master::${master}`;
    return `${lab}::coombs::${getCoombsMode(row) || normalize(testName(row))}`;
  }

  if (isPanel(row)) {
    if (registered) return `${lab}::panel-registered::${registered}`;
    if (panelId) return `${lab}::panel-id::${panelId}`;
    if (panelMaster) return `${lab}::panel-master::${panelMaster}`;
    return `${lab}::panel-name::${normalize(panelName(row) || testName(row))}`;
  }

  /*
    Special reports remain independent. Widal, Malaria, Urinalysis,
    Stool, Semen, Blood Culture, etc. never merge into a department
    single-test report.
  */
  if (isSpecial(row)) {
    if (registered) return `${lab}::special-registered::${registered}`;
    if (testId) return `${lab}::special::${testId}`;
    if (master) return `${lab}::special-master::${master}`;
    return `${lab}::special::${normalize(testName(row))}`;
  }

  /*
    Ordinary singles:
      Lab Number + Department + Presentation

    This deliberately ignores registered_test_id/test_id/master_test_id,
    because those identifiers identify the individual test row, not the
    report boundary for ordinary single results.
  */
  return `${lab}::single::${canonicalReportDepartment(department(row))}::${p}`;
};

const reportTitle = (rows) => {
  const first = rows[0] || {};
  const p = presentation(first);

  if (p === "panel") {
    const name = panelName(first) || testName(first);
    return pretty(name);
  }

  if (p === "coombs") {
    return pretty(testName(first));
  }

  if (p === "special") {
    return pretty(testName(first));
  }

  // Single quantitative/qualitative reports intentionally have no individual
  // test title in the laboratory report. The renderer receives the rows and
  // displays them together as one department table.
  return "";
};

const buildReports = (rows) => {
  const map = new Map();

  rows
    .filter((row) => hasSavedResult(row) || isStructuredSavedResult(row))
    .forEach((row) => {
      const key = reportKey(row);

      if (!map.has(key)) {
        map.set(key, {
          id: key,
          key,
          items: [],
          first: row,
        });
      }

      map.get(key).items.push(row);
    });

  return Array.from(map.values())
    .map((report) => {
      const first = report.items[0];
      return {
        ...report,
        lab_number: labNumber(first),
        patient_name: patientName(first),
        patient_id: patientId(first),
        registration_number: registrationNumber(first),
        sex: firstValue(first.sex, first.gender, first.registration?.sex, first.registration?.gender),
        age: firstValue(first.age, first.age_years, first.registration?.age, first.registration?.age_years),
        dob: firstValue(first.dob, first.date_of_birth, first.registration?.dob, first.registration?.date_of_birth),
        department: department(first),
        presentation: presentation(first),
        title: reportTitle(report.items),
        resultCount: report.items.reduce((sum, item) => sum + savedRows(item).length, 0),
        latest: report.items.reduce((latest, item) => {
          const a = new Date(timestamp(latest) || 0).getTime();
          const b = new Date(timestamp(item) || 0).getTime();
          return b > a ? item : latest;
        }, first),
      };
    })
    .sort((a, b) => {
      const ta = new Date(timestamp(a.latest) || 0).getTime();
      const tb = new Date(timestamp(b.latest) || 0).getTime();
      return tb - ta;
    });
};

const reportStatus = (report) => {
  const values = report.items.map(status);
  return values.reduce(
    (best, current) => (statusRank[current] < statusRank[best] ? current : best),
    "released"
  );
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return text(value);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function calculateAgeFromDob(dob, referenceDate = null) {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const reference = referenceDate ? new Date(referenceDate) : new Date();
  if (Number.isNaN(reference.getTime())) return null;
  let years = reference.getFullYear() - birth.getFullYear();
  const month = reference.getMonth() - birth.getMonth();
  if (month < 0 || (month === 0 && reference.getDate() < birth.getDate())) years -= 1;
  return years >= 0 && years <= 120 ? years : null;
}

function getReportPatient(row = {}, report = {}) {
  const first = row || {};
  const resultObject = (() => {
    for (const candidate of [first?.result, first?.result_data, first?.resultData, first?.payload, first?.data]) {
      const parsed = parseSavedResultObject(candidate);
      if (parsed) {
        const nested = parseSavedResultObject(parsed.result);
        return nested ? { ...parsed, ...nested } : parsed;
      }
    }
    return {};
  })();

  const patientObject = first?.patient || resultObject?.patient || {};
  const registrationObject = first?.registration || resultObject?.registration || {};
  const pick = (...values) => firstValue(...values) || "—";

  const sex = pick(
    first.sex, first.gender,
    registrationObject.sex, registrationObject.gender,
    patientObject.sex, patientObject.gender,
    resultObject.sex, resultObject.gender,
    report.sex, report.gender
  );

  const registrationDate = pick(
    first.registration_date, first.registered_at, first.registration_datetime,
    first.registration_time, first.registered_on, first.date_registered,
    registrationObject.registration_date, registrationObject.registered_at,
    registrationObject.registration_datetime, registrationObject.registered_on,
    registrationObject.date_registered, registrationObject.created_at,
    first.created_at
  );

  const directAge = firstValue(
    first.age, first.age_years, first.ageYears,
    registrationObject.age, registrationObject.age_years,
    patientObject.age, patientObject.age_years,
    resultObject.age, resultObject.age_years,
    report.age, report.age_years
  );
  const numericAge = Number(String(directAge ?? "").replace(/,/g, "").trim());
  const dob = firstValue(
    first.dob, first.date_of_birth,
    registrationObject.dob, registrationObject.date_of_birth,
    patientObject.dob, patientObject.date_of_birth,
    resultObject.dob, resultObject.date_of_birth,
    report.dob, report.date_of_birth
  );
  const calculatedAge =
    Number.isFinite(numericAge) && numericAge >= 0 && numericAge <= 120
      ? numericAge
      : calculateAgeFromDob(dob, registrationDate !== "—" ? registrationDate : null);

  return {
    full_name: pick(first.full_name, first.patient_name, first.patientName, registrationObject.full_name, registrationObject.patient_name, patientObject.full_name, patientObject.patient_name, resultObject.full_name, resultObject.patient_name, report.patient_name),
    patient_name: pick(first.patient_name, first.patientName, first.full_name, registrationObject.full_name, registrationObject.patient_name, patientObject.full_name, patientObject.patient_name, resultObject.full_name, resultObject.patient_name, report.patient_name),
    patient_id: pick(first.patient_id, first.patientId, registrationObject.patient_id, registrationObject.patientId, patientObject.patient_id, patientObject.patientId, resultObject.patient_id, report.patient_id),
    lab_number: pick(first.lab_number, first.labNumber, registrationObject.lab_number, registrationObject.labNumber, patientObject.lab_number, patientObject.labNumber, resultObject.lab_number, report.lab_number),
    registration_number: pick(first.registration_number, first.registrationNumber, registrationObject.registration_number, registrationObject.registrationNumber, resultObject.registration_number, report.registration_number),
    sex,
    age: calculatedAge !== null ? calculatedAge : "—",
    dob: dob || "—",
    branch: pick(first.branch, first.branch_name, registrationObject.branch, registrationObject.branch_name, patientObject.branch, patientObject.branch_name, resultObject.branch, resultObject.branch_name, report.branch),
    referring_hospital: pick(
      first.referring_hospital, first.referral_hospital, first.referring_facility,
      first.referral_facility, first.hospital, first.hospital_name,
      first.referral_hospital_name, first.referral_name,
      registrationObject.referring_hospital, registrationObject.referral_hospital,
      registrationObject.referring_facility, registrationObject.referral_facility,
      registrationObject.hospital, registrationObject.hospital_name,
      registrationObject.referral_name, patientObject.referring_hospital,
      patientObject.referral_hospital, patientObject.referring_facility,
      patientObject.referral_facility, patientObject.hospital,
      resultObject.referring_hospital, resultObject.referral_hospital,
      resultObject.referral_name
    ),
    referring_doctor: pick(
      first.referring_doctor, first.referral_doctor, first.doctor, first.doctor_name,
      first.referring_physician, first.referral_physician,
      registrationObject.referring_doctor, registrationObject.referral_doctor,
      registrationObject.doctor, patientObject.referring_doctor,
      patientObject.referral_doctor, patientObject.doctor,
      resultObject.referring_doctor, resultObject.referral_doctor
    ),
    registration_date: registrationDate,
    sample_collection_date: pick(
      first.sample_collection_date, first.sample_collection_datetime,
      first.sample_collection_time, first.sample_collected_at,
      first.specimen_collected_at, first.specimen_collection_date,
      first.specimen_collection_datetime, first.specimen_collection_time,
      first.collected_at, first.collected_on, first.date_collected,
      first.collection_date, registrationObject.sample_collection_date,
      registrationObject.sample_collection_datetime, registrationObject.sample_collected_at,
      registrationObject.specimen_collected_at, registrationObject.specimen_collection_date,
      registrationObject.specimen_collection_datetime, registrationObject.collected_at,
      registrationObject.collected_on, registrationObject.date_collected,
      registrationObject.collection_date
    ),
    report_date: pick(first.report_date, first.released_at, first.updated_at, first.created_at, report.report_date, report.released_at, report.updated_at),
    clinical_history: pick(first.clinical_history, first.clinicalHistory, registrationObject.clinical_history, registrationObject.clinicalHistory, patientObject.clinical_history, resultObject.clinical_history),
  };
}


/* ==========================================================
   RFT / KFT eGFR RECOVERY
   ----------------------------------------------------------
   Result Entry calculates eGFR and persists it inside the saved
   panel payload. The Dashboard must therefore read it from the
   saved parameter containers. If an older payload contains the
   eGFR definition but lost/blanked the calculated value, recover
   it from saved creatinine + patient age + sex without changing
   the database payload.
   ========================================================== */
const isRenalReportName = (value) => {
  const n = normalize(value);
  return (
    n === "rft" ||
    n === "kft" ||
    n === "renal function test" ||
    n === "renal function tests" ||
    n === "renal profile" ||
    n === "renal function" ||
    n === "kidney function test" ||
    n === "kidney function" ||
    n.includes("renal function") ||
    n.includes("renal profile") ||
    n.includes("kidney function") ||
    n.includes("electrolytes urea creatinine") ||
    n.includes("urea creatinine")
  );
};

const isEgfrName = (value) => {
  const n = normalize(value);
  return (
    n === "egfr" ||
    n === "egfr ckd epi" ||
    n === "egfr (ckd epi)" ||
    n === "estimated gfr" ||
    n === "estimated glomerular filtration rate" ||
    n === "estimated glomerular filtration rate (egfr)" ||
    n.includes("estimated gfr") ||
    n.includes("estimated glomerular filtration rate")
  );
};

const numericValue = (value) => {
  if (value === null || value === undefined || text(value) === "") return null;
  const n = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : null;
};

const getSavedAgeSex = (row, report = {}) => {
  const demo = getSavedDemographics(row, report);
  return {
    age: demo.age,
    sex: demo.sex,
  };
};

const calculateDashboardEgfr = ({ creatinine, creatinineRow, age, sex }) => {
  const scrRaw = numericValue(creatinine);
  const numericAge = numericValue(age);
  const normalizedSex = normalize(sex);

  if (scrRaw === null || scrRaw <= 0) return null;
  if (numericAge === null || numericAge <= 0 || numericAge > 120) return null;

  const female = ["female", "f", "woman"].includes(normalizedSex);
  const male = ["male", "m", "man"].includes(normalizedSex);
  if (!female && !male) return null;

  const creatinineUnit = normalize(
    firstValue(
      creatinineRow?.unit,
      creatinineRow?.result_unit,
      creatinineRow?.resultUnit,
      ""
    )
  );

  const scr =
    creatinineUnit.includes("µmol") ||
    creatinineUnit.includes("umol") ||
    creatinineUnit.includes("micromol")
      ? scrRaw / 88.4
      : scrRaw;

  if (!Number.isFinite(scr) || scr <= 0) return null;

  // 2021 CKD-EPI creatinine equation; no race coefficient.
  const kappa = female ? 0.7 : 0.9;
  const alpha = female ? -0.241 : -0.302;
  const ratio = scr / kappa;

  const egfr =
    142 *
    Math.pow(Math.min(ratio, 1), alpha) *
    Math.pow(Math.max(ratio, 1), -1.2) *
    Math.pow(0.9938, numericAge) *
    (female ? 1.012 : 1);

  return Number.isFinite(egfr) ? Number(egfr.toFixed(1)) : null;
};

const recoverRftEgfr = (children, row, payload) => {
  const reportName = firstValue(
    payload?.panel_name,
    payload?.panelName,
    row?.panel_name,
    row?.panelName,
    row?.test_name,
    row?.testName,
    ""
  );

  if (!isRenalReportName(reportName)) return children;

  const findChild = (predicate) =>
    children.find((child) => predicate(normalize(savedParameter(child))));

  const egfrChild = findChild(isEgfrName);
  const creatinineChild = findChild(
    (name) => name === "creatinine" || name === "serum creatinine" || name.includes("creatinine")
  );

  if (!creatinineChild) return children;

  const existingEgfrValue = egfrChild ? savedScalar(egfrChild) : null;
  if (egfrChild && isSavedValue(existingEgfrValue)) return children;

  const { age, sex } = getSavedAgeSex(row, {});
  const egfr = calculateDashboardEgfr({
    creatinine: savedScalar(creatinineChild),
    creatinineRow: creatinineChild,
    age,
    sex,
  });

  if (egfr === null) return children;

  const egfrRow = {
    ...(egfrChild || row),
    test_name: "eGFR (CKD-EPI)",
    testName: "eGFR (CKD-EPI)",
    parameter: "eGFR (CKD-EPI)",
    parameter_name: "eGFR (CKD-EPI)",
    parameterName: "eGFR (CKD-EPI)",
    name: "eGFR (CKD-EPI)",
    value: egfr.toFixed(1),
    result: egfr.toFixed(1),
    result_value: egfr.toFixed(1),
    resultValue: egfr.toFixed(1),
    unit: "mL/min/1.73 m²",
    result_unit: "mL/min/1.73 m²",
    _savedParameterChild: true,
    _calculatedOnDashboard: true,
  };

  if (egfrChild) {
    return children.map((child) =>
      child === egfrChild ? egfrRow : child
    );
  }

  return [...children, egfrRow];
};

const getStructuredSavedPayload = (row) => {
  if (!row || typeof row !== "object") return null;

  const candidates = [
    row?.result,
    row?.result_data,
    row?.resultData,
    row?.payload,
    row?.data,
  ];

  for (const candidate of candidates) {
    const parsed = parseSavedResultObject(candidate);
    if (parsed) {
      const nested = parseSavedResultObject(parsed.result);
      const merged = nested ? { ...parsed, ...nested } : parsed;
      if (
        merged?.parameters ||
        merged?.parameter_results ||
        merged?.result_parameters ||
        merged?.results
      ) {
        return merged;
      }
    }
  }

  // Some Result Entry integrations persist the structured payload directly
  // on the result row rather than inside the `result` column.
  if (
    row.parameters ||
    row.parameter_results ||
    row.result_parameters
  ) {
    return row;
  }

  return null;
};

const isStructuredSavedResult = (row) => Boolean(getStructuredSavedPayload(row));

const parameterEntries = (container) => {
  if (!container) return [];

  if (typeof container === "string") {
    const parsed = parseSavedResultObject(container);
    if (parsed) return parameterEntries(parsed);
    try {
      const array = JSON.parse(container);
      if (Array.isArray(array)) return array.map((item, index) => [String(index), item]);
    } catch {
      // Ignore invalid serialized parameter containers.
    }
    return [];
  }

  if (Array.isArray(container)) {
    return container.map((item, index) => {
      const key = firstValue(
        item?.key,
        item?.id,
        item?.parameter_id,
        item?.parameterId,
        item?.parameter,
        item?.parameter_name,
        item?.test_name,
        item?.testName,
        item?.name,
        String(index)
      );
      return [String(key), item];
    });
  }

  if (typeof container === "object") {
    return Object.entries(container);
  }

  return [];
};

const expandSavedResultRow = (row) => {
  if (!row || typeof row !== "object") return [];

  const payload = getStructuredSavedPayload(row);
  if (!payload) return [row];

  const containers = [
    payload.parameters,
    payload.parameter_results,
    payload.result_parameters,
    payload.results,
  ];

  /*
   * Result Entry can persist panel metadata and saved values in separate
   * containers. In particular, calculated values such as eGFR may exist in
   * parameter_results while the parameter definition exists in parameters.
   * Merge all containers by parameter identity instead of stopping at the
   * first non-empty container.
   */
  const mergedEntries = new Map();

  containers.forEach((container) => {
    parameterEntries(container).forEach(([key, parameter]) => {
      const objectParameter =
        parameter && typeof parameter === "object" && !Array.isArray(parameter)
          ? parameter
          : { value: parameter };

      const identity = normalize(
        firstValue(
          objectParameter.key,
          objectParameter.parameter_id,
          objectParameter.parameterId,
          objectParameter.test_name,
          objectParameter.testName,
          objectParameter.parameter_name,
          objectParameter.parameterName,
          objectParameter.name,
          objectParameter.label,
          key
        )
      ) || String(key);

      const existing = mergedEntries.get(identity);
      const previousParameter =
        existing?.[1] && typeof existing[1] === "object"
          ? existing[1]
          : {};

      // Merge field-by-field without allowing an empty value from one
      // persisted container to erase a real value from another container.
      // This is especially important for calculated eGFR values.
      const mergedParameter = { ...previousParameter, ...objectParameter };
      Object.keys(previousParameter).forEach((field) => {
        const incoming = objectParameter?.[field];
        if (incoming === null || incoming === undefined || text(incoming) === "") {
          mergedParameter[field] = previousParameter[field];
        }
      });

      mergedEntries.set(identity, [
        String(firstValue(existing?.[0], key)),
        mergedParameter,
      ]);
    });
  });

  const entries = Array.from(mergedEntries.values());
  if (!entries.length) return [row];

  const children = entries
    .map(([key, parameter]) => {
      const objectParameter =
        parameter && typeof parameter === "object" && !Array.isArray(parameter)
          ? parameter
          : { value: parameter };

      const parameterName = firstValue(
        objectParameter.test_name,
        objectParameter.testName,
        objectParameter.parameter,
        objectParameter.parameter_name,
        objectParameter.parameterName,
        objectParameter.name,
        objectParameter.label,
        key
      );

      const value = firstValue(
        objectParameter.value,
        objectParameter.result_value,
        objectParameter.resultValue,
        objectParameter.result,
        objectParameter.reading,
        objectParameter.display_value,
        objectParameter.displayValue,
        ""
      );

      // Empty parameter definitions must never replace the parent result row.
      if (value === null || value === undefined || text(value).trim() === "") {
        return null;
      }

      const inheritedTestName = firstValue(
        row?.test_name,
        row?.testName,
        row?.panel_name,
        row?.panelName,
        ""
      );

      return {
        ...row,
        // Child metadata MUST override parent panel metadata.
        test_name: parameterName,
        testName: parameterName,
        parameter: parameterName,
        parameter_name: parameterName,
        name: parameterName,
        value,
        result: value,
        result_value: value,
        resultValue: value,
        unit: firstValue(
          objectParameter.unit,
          objectParameter.result_unit,
          objectParameter.resultUnit,
          row?.unit,
          ""
        ),
        result_unit: firstValue(
          objectParameter.result_unit,
          objectParameter.resultUnit,
          objectParameter.unit,
          row?.result_unit,
          ""
        ),
        reference_range: firstValue(
          objectParameter.reference_range,
          objectParameter.referenceRange,
          objectParameter.reference_value,
          objectParameter.referenceValue,
          row?.reference_range,
          ""
        ),
        referenceRange: firstValue(
          objectParameter.referenceRange,
          objectParameter.reference_range,
          objectParameter.referenceValue,
          objectParameter.reference_value,
          row?.referenceRange,
          ""
        ),
        male_range: firstValue(objectParameter.male_range, objectParameter.maleRange, row?.male_range, row?.maleRange, ""),
        female_range: firstValue(objectParameter.female_range, objectParameter.femaleRange, row?.female_range, row?.femaleRange, ""),
        child_range: firstValue(objectParameter.child_range, objectParameter.childRange, row?.child_range, row?.childRange, ""),
        elderly_range: firstValue(objectParameter.elderly_range, objectParameter.elderlyRange, row?.elderly_range, row?.elderlyRange, ""),
        reference_value: firstValue(objectParameter.reference_value, objectParameter.referenceValue, row?.reference_value, row?.referenceValue, ""),
        flag: firstValue(
          objectParameter.flag,
          objectParameter.result_flag,
          objectParameter.resultFlag,
          objectParameter.status,
          ""
        ),
        result_flag: firstValue(
          objectParameter.result_flag,
          objectParameter.resultFlag,
          objectParameter.flag,
          objectParameter.status,
          ""
        ),
        // Preserve useful panel identity separately so report grouping and
        // patient/report metadata are not lost during expansion.
        parent_test_name: inheritedTestName,
        parent_panel_name: firstValue(
          payload.panel_name,
          payload.panelName,
          row?.panel_name,
          row?.panelName,
          inheritedTestName,
          ""
        ),
        _savedParameterChild: true,
        _savedParentRowId: row.id || row.lab_number || null,
        _savedParameterKey: String(key),
      };
    })
    .filter(Boolean);

  /*
   * RFT eGFR hardening:
   * If Result Entry saved the calculated eGFR value in a different
   * representation, recover it here so the Dashboard cannot silently
   * omit the calculated analyte. If no persisted eGFR value is available,
   * calculate the same 2021 CKD-EPI creatinine eGFR used by Result Entry
   * from the saved creatinine + patient age + sex.
   */
  const panelName = normalize(firstValue(
    payload?.panel_name, payload?.panelName,
    row?.panel_name, row?.panelName,
    row?.test_name, row?.testName,
    ""
  ));
  const isRft =
    panelName === "rft" ||
    panelName === "kft" ||
    panelName.includes("renal function") ||
    panelName.includes("renal profile") ||
    panelName.includes("kidney function") ||
    panelName === "e u c" ||
    panelName === "euc" ||
    panelName.includes("electrolytes urea creatinine");

  if (isRft) {
    const findChild = (names) => {
      const targets = names.map(normalize);
      return children.find((item) =>
        targets.includes(normalize(savedParameter(item)))
      );
    };

    const existingEgfr = findChild([
      "eGFR",
      "eGFR (CKD-EPI)",
      "eGFR CKD EPI",
      "Estimated GFR",
      "Estimated Glomerular Filtration Rate",
      "Estimated Glomerular Filtration Rate (eGFR)",
    ]);

    const hasEgfrValue = existingEgfr && isSavedValue(savedScalar(existingEgfr));

    if (!hasEgfrValue) {
      const creatinine = findChild(["Creatinine", "Serum Creatinine"]);
      const demographics = getSavedDemographics(row, {});
      const age = Number(String(demographics.age ?? "").replace(/,/g, "").trim());
      const sex = normalizeSexValue(demographics.sex);
      const creatinineValue = numericValue(savedScalar(creatinine));
      const creatinineUnit = normalize(savedUnit(creatinine, savedObject(creatinine)));

      let calculatedEgfr = null;
      if (creatinine && Number.isFinite(age) && age > 0 && age <= 120 && sex && Number.isFinite(creatinineValue) && creatinineValue > 0) {
        const scr =
          creatinineUnit.includes("µmol") ||
          creatinineUnit.includes("umol") ||
          creatinineUnit.includes("micromol")
            ? creatinineValue / 88.4
            : creatinineValue;

        if (scr > 0) {
          const female = sex === "female";
          const kappa = female ? 0.7 : 0.9;
          const alpha = female ? -0.241 : -0.302;
          const ratio = scr / kappa;
          calculatedEgfr =
            142 *
            Math.pow(Math.min(ratio, 1), alpha) *
            Math.pow(Math.max(ratio, 1), -1.2) *
            Math.pow(0.9938, age);
          if (female) calculatedEgfr *= 1.012;
          calculatedEgfr = Number(calculatedEgfr.toFixed(1));
        }
      }

      if (calculatedEgfr !== null) {
        const egfrParameter = existingEgfr || {
          ...row,
          test_name: "eGFR (CKD-EPI)",
          testName: "eGFR (CKD-EPI)",
          parameter: "eGFR (CKD-EPI)",
          parameter_name: "eGFR (CKD-EPI)",
          name: "eGFR (CKD-EPI)",
          unit: "mL/min/1.73 m²",
          result_unit: "mL/min/1.73 m²",
          _savedParameterChild: true,
          _savedParentRowId: row.id || row.lab_number || null,
          _savedParameterKey: "egfr",
        };

        if (existingEgfr) {
          existingEgfr.value = calculatedEgfr;
          existingEgfr.result = calculatedEgfr;
          existingEgfr.result_value = calculatedEgfr;
          existingEgfr.resultValue = calculatedEgfr;
          existingEgfr.unit = firstValue(existingEgfr.unit, "mL/min/1.73 m²");
          existingEgfr.result_unit = firstValue(existingEgfr.result_unit, existingEgfr.unit, "mL/min/1.73 m²");
        } else {
          children.push({
            ...egfrParameter,
            value: calculatedEgfr,
            result: calculatedEgfr,
            result_value: calculatedEgfr,
            resultValue: calculatedEgfr,
          });
        }
      }
    }
  }

  if (!children.length) return [row];

  /*
   * RFT safeguard: if eGFR was calculated by Result Entry but the
   * persisted parameter definition/value containers disagree, recover
   * the value from the saved Creatinine + demographics. This is display
   * logic only; nothing is written back to Supabase.
   */
  return recoverRftEgfr(children, row, payload);
};

const getSavedRendererInput = (report) => {
  if (!report) return [];

  const rawItems = Array.isArray(report.items)
    ? report.items.filter(Boolean)
    : [];

  /*
   * Widal is a dedicated structured report. Its `results` object contains
   * the eight O/H titres and may also contain an embedded malaria-parasite
   * examination. NEVER expand this payload into generic parameter rows: doing
   * so destroys the Widal identity and makes SavedResultContent fall through
   * to the generic renderer, which is what produced O/H = Pending.
   *
   * Keep the original parent row(s) intact so SavedWidalResult can read both
   * the Widal payload and any separately saved Malaria Parasite row.
   */
  if (rawItems.some(isWidalRow) || rawItems.some((row) => {
    const obj = savedObject(row);
    return normalize(obj?.testType || obj?.test_type || "") === "widal" ||
      (obj?.results && typeof obj.results === "object" &&
        ["salmonella_typhi_o", "salmonella_typhi_h",
         "salmonella_paratyphi_a_o", "salmonella_paratyphi_a_h"].some((k) =>
          Object.prototype.hasOwnProperty.call(obj.results, k)
        ));
  })) {
    return rawItems;
  }

  // All other structured panel results continue through the normal expansion
  // path so CBC, LFT, FLP, E/U/Cr, etc. remain unchanged.
  return rawItems.flatMap(expandSavedResultRow).filter(Boolean);
};


/* ==========================================================
   SAVED RESULT PRESENTATION OVERRIDES
   ----------------------------------------------------------
   These helpers only control how already-saved results are
   displayed in the dashboard. The existing report shell,
   workflow, printing controls and database payload are kept
   unchanged.
   ========================================================== */

const parseSavedResultObject = (value) => {
  if (value && typeof value === "object" && !Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : null;
  } catch {
    return null;
  }
};

const normalizeSexValue = (value) => {
  const v = normalize(value);
  if (v === "m" || v === "male" || v === "man" || v === "boy") return "male";
  if (v === "f" || v === "female" || v === "woman" || v === "girl") return "female";
  return "";
};

const getSavedDemographics = (row = {}, report = {}) => {
  const objectValue = savedObject(row);
  const patient = row?.patient || objectValue?.patient || {};
  const registration = row?.registration || objectValue?.registration || {};

  const sex = normalizeSexValue(firstValue(
    row?.sex, row?.gender, registration?.sex, registration?.gender,
    patient?.sex, patient?.gender, objectValue?.sex, objectValue?.gender,
    report?.sex, report?.gender
  ));

  const directAge = firstValue(
    row?.age, row?.age_years, row?.ageYears,
    registration?.age, registration?.age_years,
    patient?.age, patient?.age_years,
    objectValue?.age, objectValue?.age_years,
    report?.age, report?.age_years
  );
  const parsedAge = Number(String(directAge ?? "").replace(/,/g, "").trim());

  const dob = firstValue(
    row?.dob, row?.date_of_birth, registration?.dob, registration?.date_of_birth,
    patient?.dob, patient?.date_of_birth, objectValue?.dob, objectValue?.date_of_birth,
    report?.dob, report?.date_of_birth
  );
  const referenceDate = firstValue(
    row?.sample_collection_date, row?.sample_collection_datetime,
    row?.sample_collected_at, row?.registration_date, row?.registered_at,
    registration?.sample_collection_date, registration?.registration_date,
    objectValue?.sample_collection_date, objectValue?.registration_date,
    report?.sample_collection_date, report?.registration_date,
    row?.created_at, report?.created_at
  );

  const age =
    Number.isFinite(parsedAge) && parsedAge >= 0 && parsedAge <= 120
      ? parsedAge
      : calculateAgeFromDob(dob, referenceDate);

  return { sex, age };
};

const getReferenceMetadata = (row = {}, objectValue = {}) => {
  const nestedMaster =
    row?.master_test || row?.masterTest || row?.master_tests ||
    objectValue?.master_test || objectValue?.masterTest || objectValue?.master_tests || {};

  return {
    male_range: firstValue(row?.male_range, row?.maleRange, objectValue?.male_range, objectValue?.maleRange, nestedMaster?.male_range, nestedMaster?.maleRange),
    female_range: firstValue(row?.female_range, row?.femaleRange, objectValue?.female_range, objectValue?.femaleRange, nestedMaster?.female_range, nestedMaster?.femaleRange),
    child_range: firstValue(row?.child_range, row?.childRange, objectValue?.child_range, objectValue?.childRange, nestedMaster?.child_range, nestedMaster?.childRange),
    elderly_range: firstValue(row?.elderly_range, row?.elderlyRange, objectValue?.elderly_range, objectValue?.elderlyRange, nestedMaster?.elderly_range, nestedMaster?.elderlyRange),
    reference_value: firstValue(row?.reference_value, row?.referenceValue, objectValue?.reference_value, objectValue?.referenceValue, nestedMaster?.reference_value, nestedMaster?.referenceValue),
    reference_range: firstValue(row?.reference_range, row?.referenceRange, objectValue?.reference_range, objectValue?.referenceRange, nestedMaster?.reference_range, nestedMaster?.referenceRange),
  };
};

const extractLabeledReferenceRange = (value, sex) => {
  const raw = text(value);
  if (!raw || !sex) return "";
  const patterns = sex === "male"
    ? [/male\s*:\s*([^;|]+)/i, /(?:^|[;|])\s*male\s+([^;|]+)/i, /\bM\s*:\s*([^;|]+)/i]
    : [/female\s*:\s*([^;|]+)/i, /(?:^|[;|])\s*female\s+([^;|]+)/i, /\bF\s*:\s*([^;|]+)/i];
  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (match?.[1] && text(match[1])) return text(match[1]);
  }
  return "";
};

const isCompositeReferenceRange = (value) => {
  const v = normalize(value);
  return v.includes("male:") || v.includes("female:") || (v.includes("male ") && v.includes("female "));
};

const resolveDashboardReference = (row, objectValue = {}, report = {}) => {
  // PEFA FBS reference range is authoritative and must not be replaced by
  // stale/blank master-test or saved metadata.
  if (isFBSRow(row)) {
    return PEFA_FBS_DASHBOARD_REFERENCE;
  }
  if (isRBSRow(row)) {
    return PEFA_RBS_DASHBOARD_REFERENCE;
  }
  if (isPCVRow(row)) {
    return getPCVDashboardReference(row, report);
  }
  if (isHbA1cRow(row)) {
    return PEFA_HBA1C_DASHBOARD_REFERENCE;
  }

  const { sex, age } = getSavedDemographics(row, report);
  const metadata = getReferenceMetadata(row, objectValue);

  // Pediatric and elderly ranges take precedence over adult sex-specific ranges.
  if (age !== null && age < 18 && text(metadata.child_range)) return text(metadata.child_range);
  if (age !== null && age >= 65 && text(metadata.elderly_range)) return text(metadata.elderly_range);
  if (sex === "male" && text(metadata.male_range)) return text(metadata.male_range);
  if (sex === "female" && text(metadata.female_range)) return text(metadata.female_range);

  const labelled = extractLabeledReferenceRange(
    metadata.reference_range || metadata.reference_value,
    sex
  );
  if (labelled) return labelled;

  const generic = firstValue(metadata.reference_value, metadata.reference_range);
  // Never expose a composite Male/Female range when demographics cannot resolve it.
  return isCompositeReferenceRange(generic) ? "" : text(generic);
};

const resolveDashboardFlag = (row, objectValue, value, report = {}) => {
  const ageAware = getBilirubinAgeAware(row, value);
  if (ageAware?.flag) return ageAware.flag;

  const stored = firstValue(
    row?.flag, row?.result_flag, row?.resultFlag,
    objectValue?.flag, objectValue?.result_flag, objectValue?.resultFlag,
    objectValue?.status
  );
  const range = resolveDashboardReference(row, objectValue, report);
  const numeric = Number(String(value ?? "").replace(/,/g, "").trim());
  if (!range || !Number.isFinite(numeric)) return stored || "";
  const matches = text(range).match(/-?\d+(?:\.\d+)?/g);
  if (!matches || matches.length < 2) return stored || "";
  const low = Number(matches[0]), high = Number(matches[1]);
  if (!Number.isFinite(low) || !Number.isFinite(high)) return stored || "";
  if (numeric < low) return "Low";
  if (numeric > high) return "High";
  return "Normal";
};

const savedScalar = (row) => {
  const raw = resultValue(row);
  const parsed = parseSavedResultObject(raw);

  if (!parsed) return raw;

  const nested = parseSavedResultObject(parsed.result);
  const source = nested ? { ...parsed, ...nested } : parsed;

  return firstScalarValue(
    source.value,
    source.result_value,
    source.resultValue,
    source.reading,
    source.result,
    source.display_value,
    source.displayValue,
    ""
  );
};

const savedObject = (row) => {
  const raw = resultValue(row);
  const parsed = parseSavedResultObject(raw);
  if (!parsed) return {};
  const nested = parseSavedResultObject(parsed.result);
  return nested ? { ...parsed, ...nested } : parsed;
};

const savedSex = (row) => getSavedDemographics(row).sex;

const savedParameter = (row) =>
  firstValue(
    row?.test_name,
    row?.testName,
    row?.parameter,
    row?.parameter_name,
    row?.name,
    "Laboratory Test"
  );

const savedUnit = (row, objectValue = {}) => {
  // PEFA FBS always reports in mg/dL. Do not depend on stale/blank metadata.
  if (isFBSRow(row)) {
    return PEFA_FBS_DASHBOARD_UNIT;
  }
  if (isRBSRow(row)) {
    return PEFA_RBS_DASHBOARD_UNIT;
  }
  if (isPCVRow(row)) {
    return PEFA_PCV_DASHBOARD_UNIT;
  }
  if (isUricAcidRow(row)) {
    return PEFA_URIC_ACID_DASHBOARD_UNIT;
  }
  if (isHbA1cRow(row)) {
    return PEFA_HBA1C_DASHBOARD_UNIT;
  }

  return firstValue(
    row?.unit,
    row?.result_unit,
    row?.resultUnit,
    objectValue?.unit,
    objectValue?.result_unit,
    objectValue?.resultUnit,
    ""
  );
};

const isBilirubinPanelRow = (row) => {
  const name = normalize(testName(row));
  const panel = normalize(panelName(row));
  return (
    name === "serum bilirubin" ||
    name.includes("serum bilirubin") ||
    name.includes("bilirubin profile") ||
    name.includes("bilirubin panel") ||
    name.includes("total and direct bilirubin") ||
    name.includes("total direct bilirubin") ||
    panel === "serum bilirubin" ||
    panel.includes("bilirubin")
  );
};

const bilirubinParameterKey = (row) => {
  const name = normalize(firstValue(
    row?.parameter,
    row?.parameter_name,
    row?.test_name,
    row?.testName,
    row?.name,
    ""
  ));
  if (name.includes("total bilirubin")) return "total_bilirubin";
  if (name.includes("direct bilirubin")) return "direct_bilirubin";
  if (name.includes("indirect bilirubin")) return "indirect_bilirubin";
  return "";
};

const getBilirubinAgeAware = (row, value) => {
  if (!isBilirubinPanelRow(row)) return null;
  const key = bilirubinParameterKey(row);
  if (!key) return null;
  try {
    return getAgeAwareBilirubinResult({
      parameterKey: key,
      value,
      patient: row?.patient || null,
      registration: row?.registration || null,
      test: row,
      row,
      collectionDateTime:
        row?.sample_collection_date_time ||
        row?.specimen_collection_time ||
        row?.collection_datetime ||
        row?.collection_date ||
        null,
    });
  } catch {
    return null;
  }
};

const savedReference = (row, objectValue = {}, report = {}) => {
  // PEFA FBS always uses 70 - 110 mg/dL.
  if (isFBSRow(row)) {
    return PEFA_FBS_DASHBOARD_REFERENCE;
  }
  if (isPCVRow(row)) {
    return getPCVDashboardReference(row, report);
  }
  if (isHbA1cRow(row)) {
    return PEFA_HBA1C_DASHBOARD_REFERENCE;
  }

  const ageAware = getBilirubinAgeAware(row, savedScalar(row));
  if (ageAware?.reference?.text) return ageAware.reference.text;
  return resolveDashboardReference(row, objectValue, report);
};

const isESR = (row) => {
  const name = normalize(savedParameter(row));
  return (
    name === "esr" ||
    name === "erythrocyte sedimentation rate" ||
    name.includes("erythrocyte sedimentation rate")
  );
};

const getESRReference = (row) => {
  const sex = savedSex(row);

  if (sex.includes("female") || sex === "f") return "0–20 mm/hr";
  if (sex.includes("male") || sex === "m") return "0–15 mm/hr";

  return "0–15 mm/hr (Male); 0–20 mm/hr (Female)";
};

const getESRFlag = (row, value) => {
  const objectValue = savedObject(row);
  const storedFlag = firstValue(
    row?.flag,
    row?.result_flag,
    row?.resultFlag,
    objectValue?.flag,
    objectValue?.result_flag,
    objectValue?.resultFlag,
    objectValue?.status,
    ""
  );

  if (text(storedFlag)) return storedFlag;

  const numeric = Number(String(value ?? "").replace(/,/g, "").trim());
  if (!Number.isFinite(numeric)) return "";

  const sex = savedSex(row);
  const upper =
    sex.includes("female") || sex === "f"
      ? 20
      : sex.includes("male") || sex === "m"
        ? 15
        : null;

  if (upper === null) return "";

  return numeric > upper ? "High" : "Normal";
};

const savedFlag = (row, objectValue = {}, value = "") =>
  firstValue(
    row?.flag,
    row?.result_flag,
    row?.resultFlag,
    objectValue?.flag,
    objectValue?.result_flag,
    objectValue?.resultFlag,
    objectValue?.status,
    isESR(row) ? getESRFlag(row, value) : "",
    ""
  );

const flagClass = (value) => {
  const v = normalize(value);
  if (
    v.includes("high") ||
    v.includes("positive") ||
    v.includes("critical") ||
    v.includes("significant")
  ) {
    return "high";
  }
  if (
    v.includes("low") ||
    v.includes("negative")
  ) {
    return "low";
  }
  if (v.includes("normal")) return "normal";
  return "none";
};

const isWidalRow = (row) => {
  const name = normalize(testName(row));
  const template = normalize(
    row?.template_type ||
      row?.templateType ||
      row?.masterTest?.template_type ||
      row?.master_test?.template_type ||
      ""
  );

  return (
    name === "widal" ||
    name === "widal test" ||
    name.includes("widal") ||
    template === "widal" ||
    template.includes("widal")
  );
};

const isCoombsRow = (row) => {
  const name = normalize(testName(row));
  const objectValue = savedObject(row);
  const type = normalize(
    firstValue(
      row?.coombs_type,
      row?.coombsType,
      row?.test_mode,
      row?.testMode,
      objectValue?.coombs_type,
      objectValue?.coombsType,
      objectValue?.testType,
      ""
    )
  );

  return (
    type === "dat" ||
    type === "iat" ||
    name === "dat" ||
    name === "iat" ||
    name.includes("direct coombs") ||
    name.includes("indirect coombs") ||
    name.includes("direct antiglobulin") ||
    name.includes("indirect antiglobulin")
  );
};

const isGroupingCrossMatchingRow = (row = {}) => {
  const name = normalize(testName(row))
    .replace(/[()\\/\\-]+/g, " ")
    .replace(/\\s+/g, " ")
    .trim();

  const template = normalize(
    firstValue(
      row?.template_type,
      row?.templateType,
      row?.masterTest?.template_type,
      row?.master_test?.template_type,
      ""
    )
  );

  const category = normalize(
    firstValue(
      row?.result_category,
      row?.category,
      row?.masterTest?.result_category,
      row?.master_test?.result_category,
      ""
    )
  );

  return (
    name === "grouping & cross matching" ||
    name === "grouping and cross matching" ||
    name === "grouping cross matching" ||
    name === "blood grouping & cross matching" ||
    name === "blood grouping and cross matching" ||
    name === "blood grouping cross matching" ||
    name.includes("grouping & cross matching") ||
    name.includes("grouping and cross matching") ||
    ((template.includes("blood_bank") || template.includes("blood bank")) &&
      (name.includes("grouping") || name.includes("cross matching"))) ||
    (category === "blood bank" &&
      (name.includes("grouping") || name.includes("cross matching")))
  );
};

const getCoombsMode = (row) => {
  const name = normalize(testName(row));
  const objectValue = savedObject(row);
  const type = normalize(
    firstValue(
      row?.coombs_type,
      row?.coombsType,
      row?.test_mode,
      row?.testMode,
      objectValue?.coombs_type,
      objectValue?.coombsType,
      objectValue?.testType,
      ""
    )
  );

  if (
    type === "iat" ||
    name === "iat" ||
    name.includes("indirect coombs") ||
    name.includes("indirect antiglobulin")
  ) {
    return "IAT";
  }

  if (
    type === "dat" ||
    name === "dat" ||
    name.includes("direct coombs") ||
    name.includes("direct antiglobulin")
  ) {
    return "DAT";
  }

  return "";
};

const isQualitativeRow = (row) => {
  const name = normalize(testName(row));
  const type = resultType(row);

  // FBS is never qualitative, even if legacy metadata says otherwise.
  if (isFBSRow(row) || isRBSRow(row) || isPCVRow(row) || isUricAcidRow(row) || isHbA1cRow(row)) {
    return false;
  }

  // ESR must never be classified as qualitative, even when legacy metadata
  // incorrectly stores result_type as qualitative.
  if (
    name === "esr" ||
    name === "erythrocyte sedimentation rate" ||
    name.includes("erythrocyte sedimentation rate")
  ) {
    return false;
  }

  if (
    type.includes("qualitative") ||
    type === "positive/negative" ||
    type === "positive negative"
  ) {
    return true;
  }

  return (
    name === "hcv" ||
    name.includes("hepatitis c") ||
    name === "hbsag" ||
    name.includes("hepatitis b surface antigen") ||
    name === "hiv" ||
    name.includes("human immunodeficiency virus")
  );
};

const isMalariaParasiteRow = (row) => {
  const name = normalize(testName(row));
  const template = normalize(
    row?.template_type ||
      row?.templateType ||
      row?.masterTest?.template_type ||
      row?.master_test?.template_type ||
      ""
  );

  return (
    name.includes("malaria parasite") ||
    name.includes("malaria microscopy") ||
    template.includes("malaria") ||
    template.includes("microscopy")
  );
};

const isQualitativeReport = (report, items) => {
  // A report containing FBS must never be routed to the qualitative renderer.
  if (items.some((row) => isFBSRow(row) || isRBSRow(row) || isPCVRow(row) || isUricAcidRow(row) || isHbA1cRow(row))) {
    return false;
  }

  const source = normalize([
    report?.title,
    report?.test_name,
    report?.testName,
    report?.panel_name,
    report?.panelName,
    report?.presentation,
    report?.result_type,
    report?.test_type,
    report?.testType,
    report?.category,
    items[0]?.test_name,
    items[0]?.testName,
  ].join(" "));

  return (
    source.includes("qualitative") ||
    source.includes("hepatitis c") ||
    source.includes("hcv") ||
    source.includes("hbsag") ||
    source.includes("hepatitis b surface antigen") ||
    source.includes("hiv") ||
    source.includes("human immunodeficiency virus") ||
    (items.length > 0 && items.every(isQualitativeRow) && !items.some(isESR))
  );
};

const isLipidProfileReport = (report, items) => {
  const source = normalize([
    report?.title,
    report?.test_name,
    report?.testName,
    report?.panel_name,
    report?.panelName,
    report?.test_code,
    report?.testCode,
    report?.presentation,
    report?.test_type,
    report?.testType,
    items.map((item) => testName(item)).join(" "),
  ].join(" "));

  return source.includes("lipid profile") || source.includes("fasting lipid profile") || source === "flp";
};

const getWidalPayload = (row) => {
  const objectValue = savedObject(row);
  const results =
    objectValue?.results &&
    typeof objectValue.results === "object" &&
    !Array.isArray(objectValue.results)
      ? objectValue.results
      : {};

  const malariaParasite =
    objectValue?.malariaParasite ??
    objectValue?.malaria_parasite ??
    objectValue?.mp ??
    null;

  return {
    results,
    method: firstValue(
      objectValue?.method,
      row?.method,
      "Slide / Tube Agglutination"
    ),
    significantTitre:
      Number(objectValue?.significantTitre) > 0
        ? Number(objectValue.significantTitre)
        : 80,
    interpretation: firstValue(
      objectValue?.interpretation,
      row?.interpretation,
      ""
    ),
    comment: firstValue(
      objectValue?.comment,
      objectValue?.comments,
      row?.comment,
      row?.comments,
      ""
    ),
    malariaParasite:
      malariaParasite && typeof malariaParasite === "object"
        ? malariaParasite
        : null,
  };
};

const hasEnteredMP = (mp) => {
  if (!mp || typeof mp !== "object") return false;

  return [
    mp.parasite_seen,
    mp.parasite_form,
    mp.species,
    mp.density,
    mp.parasite_count,
    mp.result,
    mp.interpretation,
    mp.impression,
    mp.remark,
  ].some((value) => text(value) !== "");
};

const sanitizeWidalText = (value) =>
  text(value)
    .replace(
      /\s*(?:;|\||,)?\s*(?:ESR|Erythrocyte\s+Sedimentation\s+Rate)\s*(?:;|\||,)?\s*$/i,
      ""
    )
    .trim();

const WIDAL_DISPLAY_ROWS = [
  {
    organism: "Salmonella Typhi",
    o: "salmonella_typhi_o",
    h: "salmonella_typhi_h",
  },
  {
    organism: "Salmonella Paratyphi A",
    o: "salmonella_paratyphi_a_o",
    h: "salmonella_paratyphi_a_h",
  },
  {
    organism: "Salmonella Paratyphi B",
    o: "salmonella_paratyphi_b_o",
    h: "salmonella_paratyphi_b_h",
  },
  {
    organism: "Salmonella Paratyphi C",
    o: "salmonella_paratyphi_c_o",
    h: "salmonella_paratyphi_c_h",
  },
];

const titreDenominator = (value) => {
  const match = text(value).match(/(?:1\s*[:\/]\s*)(\d+(?:\.\d+)?)/i);
  if (match) return Number(match[1]) || 0;

  const numeric = text(value).match(/\d+(?:\.\d+)?/);
  return numeric ? Number(numeric[0]) || 0 : 0;
};

const widalFlag = (value, threshold) => {
  const n = titreDenominator(value);
  if (!n) return "Pending";
  return n >= threshold ? "Significant" : "Low titre";
};

function SavedWidalResult({ report }) {
  const items = Array.isArray(report?.items) ? report.items.filter(Boolean) : [];

  /* Locate the actual structured Widal parent, not an arbitrary first row. */
  const source =
    items.find(isWidalRow) ||
    items.find((row) => {
      const obj = savedObject(row);
      const results = obj?.results;
      return (
        normalize(obj?.testType || obj?.test_type || "") === "widal" ||
        (results && typeof results === "object" &&
          ["salmonella_typhi_o", "salmonella_typhi_h",
           "salmonella_paratyphi_a_o", "salmonella_paratyphi_a_h"].some((k) =>
            Object.prototype.hasOwnProperty.call(results, k)
          ))
      );
    }) ||
    {};

  const data = getWidalPayload(source);
  const threshold = data.significantTitre;

  const interpretation = sanitizeWidalText(data.interpretation);

  /*
   * MP can be stored in two valid ways:
   *   1. embedded inside the Widal structured payload; or
   *   2. as its own laboratory_results row.
   * Prefer embedded data, but fall back to the separately saved MP row.
   */
  const embeddedMP = data.malariaParasite;
  const separateMPSource = items.find((row) => isMalariaParasiteRow(row));
  const separateMPObject = separateMPSource ? savedObject(separateMPSource) : {};
  const separateMP =
    separateMPObject && typeof separateMPObject === "object"
      ? (separateMPObject.malariaParasite ||
         separateMPObject.malaria_parasite ||
         separateMPObject.mp ||
         separateMPObject)
      : null;

  const mp = hasEnteredMP(embeddedMP)
    ? embeddedMP
    : hasEnteredMP(separateMP)
      ? separateMP
      : null;
  const showMP = hasEnteredMP(mp);

  return (
    <div className="pefa-saved-result">
      <div className="pefa-saved-result-header pefa-single-result-title">
        <span>WIDAL TEST RESULT</span>
      </div>

      <div className="pefa-saved-result-table-wrap">
        <table className="pefa-saved-result-table pefa-widal-table">
          <thead>
            <tr>
              <th>Organism</th>
              <th>O</th>
              <th>O Flag</th>
              <th>H</th>
              <th>H Flag</th>
            </tr>
          </thead>
          <tbody>
            {WIDAL_DISPLAY_ROWS.map((item) => {
              const oValue = text(data.results?.[item.o]);
              const hValue = text(data.results?.[item.h]);
              const oFlag = widalFlag(oValue, threshold);
              const hFlag = widalFlag(hValue, threshold);

              return (
                <tr key={item.organism}>
                  <td><strong>{item.organism}</strong></td>
                  <td>{oValue || "—"}</td>
                  <td>
                    <span className={`pefa-result-flag pefa-result-flag--${flagClass(oFlag)}`}>
                      {oFlag}
                    </span>
                  </td>
                  <td>{hValue || "—"}</td>
                  <td>
                    <span className={`pefa-result-flag pefa-result-flag--${flagClass(hFlag)}`}>
                      {hFlag}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {interpretation && (
        <div className="pefa-saved-narrative">
          <label>Interpretation</label>
          <p>{interpretation}</p>
        </div>
      )}

      {data.comment && (
        <div className="pefa-saved-narrative">
          <label>Laboratory Comment</label>
          <p>{data.comment}</p>
        </div>
      )}

      {showMP && (
        <section className="pefa-saved-mp">
          <div className="pefa-saved-result-header pefa-single-result-title">
            <span>MALARIA PARASITE EXAMINATION (MICROSCOPY)</span>
          </div>

          <div className="pefa-saved-result-table-wrap">
            <section className="pefa-renderer-special pefa-widal-embedded-mp">
              <table className="pefa-renderer-table">
                <thead>
                  <tr>
                    <th>PARAMETER</th>
                    <th>RESULT</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Parasite Seen", mp.parasite_seen],
                    ["Parasite Form", mp.parasite_form],
                    ["Species", mp.species],
                    ["Density", mp.density],
                    ["Parasite Count", mp.parasite_count],
                    ["Result", mp.result],
                  ]
                    .filter(([, value]) => text(value).trim() !== "")
                    .map(([label, value]) => (
                      <tr key={label}>
                        <td><strong>{label}</strong></td>
                        <td>{text(value)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </section>
          </div>

        </section>
      )}
    </div>
  );
}

function SavedMalariaParasiteResult({ report }) {
  const items = (report?.items || []).filter(hasSavedResult);
  const source = items.find(isMalariaParasiteRow) || items[0] || {};
  const objectValue = savedObject(source) || {};

  const rows = [
    ["Parasite Seen", objectValue.parasite_seen],
    ["Parasite Form", objectValue.parasite_form],
    ["Species", objectValue.species],
    ["Density", objectValue.density],
    ["Parasite Count", objectValue.parasite_count],
    ["Result", objectValue.result],
  ].filter(([, value]) => text(value) !== "");

  return (
    <div className="pefa-saved-result">
      <div className="pefa-saved-result-header pefa-single-result-title">
        <span>MALARIA PARASITE EXAMINATION (MICROSCOPY)</span>
      </div>

      <div className="pefa-saved-result-table-wrap">
        <table className="pefa-saved-result-table pefa-special-malaria-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label}>
                <td><strong>{label}</strong></td>
                <td>{text(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SavedGroupingCrossMatchingResult({ report }) {
  const items = (report?.items || []).filter(hasSavedResult);
  const source = items.find(isGroupingCrossMatchingRow) || items[0] || {};
  const data = savedObject(source) || {};

  const displayValue = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") return "";
    return text(value);
  };

  const rows = [
    ["ABO Blood Group", firstValue(data.abo_group, data.recipient_abo_group)],
    ["Rh(D) Type", firstValue(data.rh_type, data.recipient_rh_type)],
    ["Donor ABO Group", data.donor_abo_group],
    ["Donor Rh(D) Type", data.donor_rh_type],
    ["Donor / Unit Bag No.", data.donor_bag_no],
    ["HIV", data.hiv_status],
    ["HBsAg", data.hbsag],
    ["HCV", data.hcv],
    ["VDRL", data.vdrl],
    ["RVS", data.rvs],
    ["Expiry Date", data.expiry_date],
    ["Crossmatching", data.crossmatching],
    ["Remarks", data.remarks],
  ].filter(([, value]) => displayValue(value) !== "");

  const crossmatches = Array.isArray(data.crossmatches)
    ? data.crossmatches.filter(Boolean)
    : [];

  return (
    <div className="pefa-saved-result pefa-saved-result--blood-grouping">
      <div className="pefa-saved-result-header">
        <div>
          <span>BLOOD BANK • GROUPING &amp; CROSS MATCHING</span>
          <strong>Grouping &amp; Cross Matching</strong>
        </div>
        <small>{statusLabel(firstValue(source?.result_status, "Entered"))}</small>
      </div>

      <div className="pefa-saved-result-table-wrap">
        <table className="pefa-saved-result-table pefa-blood-grouping-table">
          <thead>
            <tr>
              <th>Parameter / Test</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label}>
                <td><strong>{label}</strong></td>
                <td className={
                  normalize(label) === "crossmatching" &&
                  normalize(value).includes("compatible")
                    ? "pefa-coombs-final-result"
                    : ""
                }>
                  {displayValue(value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {crossmatches.length > 0 && (
        <div className="pefa-saved-result-table-wrap pefa-blood-crossmatch-wrap">
          <table className="pefa-saved-result-table pefa-blood-grouping-table">
            <thead>
              <tr>
                <th>Donor Unit</th>
                <th>Blood Group</th>
                <th>Rh(D)</th>
                <th>Compatibility</th>
                <th>Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              {crossmatches.map((match, index) => (
                <tr key={`${match?.donorUnit || "unit"}-${index}`}>
                  <td>{displayValue(match?.donorUnit) || "—"}</td>
                  <td>{displayValue(match?.donorBloodGroup) || "—"}</td>
                  <td>{displayValue(match?.donorRh) || "—"}</td>
                  <td className={
                    normalize(match?.compatibility).includes("compatible")
                      ? "pefa-coombs-final-result"
                      : ""
                  }>
                    {displayValue(match?.compatibility) || "—"}
                  </td>
                  <td>{displayValue(match?.expiryDate) || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SavedCoombsResult({ report }) {
  const items = (report?.items || []).filter(hasSavedResult);
  const source = items.find(isCoombsRow) || items[0] || {};
  const objectValue = savedObject(source) || {};
  const mode = getCoombsMode(source) || (normalize(objectValue?.testType) === "iat" ? "IAT" : "DAT");

  const displayValue = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") return "";
    return text(value);
  };

  const rows =
    mode === "IAT"
      ? [
          ["Screening Cell I", objectValue.screeningCellI],
          ["Screening Cell II", objectValue.screeningCellII],
          ["Screening Cell III", objectValue.screeningCellIII],
          ["AHG Phase", objectValue.ahgPhase],
          ["Reaction Grade", objectValue.reactionGrade],
          ["Final Result", objectValue.finalResult],
          ["Interpretation", objectValue.interpretation],
          ["Laboratory Comment", objectValue.comment],
        ]
      : [
          ["Polyspecific AHG", objectValue.polyspecificAHG],
          ["Anti-IgG", objectValue.antiIgG],
          ["Anti-C3d", objectValue.antiC3d],
          ["Reaction Grade", objectValue.reactionGrade],
          ["Final Result", objectValue.finalResult],
          ["Interpretation", objectValue.interpretation],
          ["Laboratory Comment", objectValue.comment],
        ];

  return (
    <div className="pefa-saved-result pefa-saved-result--coombs">
      <div className="pefa-saved-result-header">
        <div>
          <span>COOMBS / ANTIGLOBULIN TEST</span>
          <strong>
            {mode === "IAT"
              ? "Indirect Coombs Test (IAT)"
              : "Direct Coombs Test (DAT)"}
          </strong>
        </div>
        <small>Result Entered</small>
      </div>

      <div className="pefa-saved-result-table-wrap">
        <table className="pefa-saved-result-table pefa-coombs-result-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {rows
              .filter(([, value]) => displayValue(value) !== "")
              .map(([label, value]) => (
                <tr key={label}>
                  <td><strong>{label}</strong></td>
                  <td className={label === "Final Result" ? "pefa-coombs-final-result" : ""}>
                    {displayValue(value)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SavedQualitativeResult({ report }) {
  const items = (report?.items || []).filter(hasSavedResult);

  return (
    <div className="pefa-saved-result">
      <div className="pefa-saved-result-header">
        <div>
          <span>QUALITATIVE RESULT</span>
          <strong>{report?.title || "Qualitative Laboratory Results"}</strong>
        </div>
        <small>Result Entered</small>
      </div>

      <div className="pefa-saved-result-table-wrap">
        <table className="pefa-saved-result-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => {
              const objectValue = savedObject(row);
              const nested = parseSavedResultObject(objectValue?.result);
              const value = firstValue(
                nested?.result,
                nested?.value,
                objectValue?.result,
                objectValue?.value,
                objectValue?.result_value,
                objectValue?.resultValue,
                objectValue?.reading,
                objectValue?.display_value,
                objectValue?.displayValue,
                savedScalar(row),
                resultValue(row),
                ""
              );

              return (
                <tr key={row.id || savedParameter(row)}>
                  <td><strong>{savedParameter(row)}</strong></td>
                  <td>{text(value) || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ==========================================================
   COMPACT CLINICAL INTERPRETATION
   ----------------------------------------------------------
   Report policy:
   - The result table already carries the abnormality FLAG.
   - Do not repeat "elevated/reduced" in the narrative.
   - Use one compact INTERPRETATION section.
   - Prefer the clinical impression concept, expressed as the
     relevant biochemical/clinical condition or differential.
   - Wording remains appropriately non-diagnostic ("may occur
     with", "suggests", "is consistent with") unless the result
     itself defines a laboratory condition such as hyperuricaemia.
   ========================================================== */

const savedFlagForInterpretation = (row, report = {}) => {
  const objectValue = savedObject(row);
  const value = savedScalar(row);

  /*
   * IMPORTANT:
   * Interpretation must use the SAME patient-specific reference resolver
   * as the displayed result table. Do not depend on a flag saved by Result
   * Entry because older CBC records may have been flagged against a generic
   * or different reference range.
   */
  return normalize(resolveDashboardFlag(row, objectValue, value, report));
};

const savedNumericByIdentity = (items, identities) => {
  const wanted = new Set(identities.map(normalize));
  const row = items.find((item) => wanted.has(normalize(savedParameter(item))));
  if (!row) return null;
  const value = Number(String(savedScalar(row) ?? "").replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : null;
};

const savedFlagByIdentity = (items, identities, report) => {
  const wanted = new Set(identities.map(normalize));
  const row = items.find((item) => wanted.has(normalize(savedParameter(item))));
  if (!row) return "";
  return normalize(savedFlagForInterpretation(row, report));
};

const buildCBCRedCellMorphologyInterpretation = (items, report) => {
  const names = {
    hb: ["haemoglobin", "hemoglobin", "hb"],
    rbc: ["rbc", "red blood cell", "red blood cells", "red cell count", "erythrocyte count"],
    mcv: ["mcv", "mean corpuscular volume"],
    mch: ["mch", "mean corpuscular haemoglobin", "mean corpuscular hemoglobin"],
    mchc: ["mchc", "mean corpuscular haemoglobin concentration", "mean corpuscular hemoglobin concentration"],
    rdw: ["rdw", "rdw cv", "rdw-cv", "red cell distribution width"],
  };

  const hb = savedNumericByIdentity(items, names.hb);
  const rbc = savedNumericByIdentity(items, names.rbc);
  const mcv = savedNumericByIdentity(items, names.mcv);
  const mch = savedNumericByIdentity(items, names.mch);
  const mchc = savedNumericByIdentity(items, names.mchc);
  const rdw = savedNumericByIdentity(items, names.rdw);

  const hbFlag = savedFlagByIdentity(items, names.hb, report);
  const mcvFlag = savedFlagByIdentity(items, names.mcv, report);
  const mchFlag = savedFlagByIdentity(items, names.mch, report);
  const mchcFlag = savedFlagByIdentity(items, names.mchc, report);
  const rdwFlag = savedFlagByIdentity(items, names.rdw, report);

  const low = (v, f, cut) => f === "low" || f === "critical low" || (v !== null && v < cut);
  const high = (v, f, cut) => f === "high" || f === "critical high" || (v !== null && v > cut);
  const normal = (v, f, lo, hi) => f === "normal" || (v !== null && v >= lo && v <= hi);

  const mcvLow = low(mcv, mcvFlag, 80);
  const mcvHigh = high(mcv, mcvFlag, 100);
  const mcvNormal = normal(mcv, mcvFlag, 80, 100);
  const mchLow = low(mch, mchFlag, 27);
  const mchcLow = low(mchc, mchcFlag, 32);
  const mchcNormal = normal(mchc, mchcFlag, 32, 36);
  const rdwHigh = high(rdw, rdwFlag, 14.5);
  const hbLow = hbFlag === "low" || hbFlag === "critical low" || (hb !== null && hb < 12);

  const findings = [];
  let morphology = "";

  if (mcvLow) {
    morphology = (mchLow || mchcLow)
      ? "microcytic hypochromic red-cell pattern"
      : "microcytic red-cell pattern";
  } else if (mcvHigh) {
    morphology = "macrocytic" + ((mchcNormal || mchc === null) ? " normochromic" : "") + " red-cell pattern";
  } else if (mcvNormal) {
    morphology = (mchLow || mchcLow)
      ? "normocytic hypochromic red-cell pattern"
      : "normocytic normochromic red-cell pattern";
  }

  if (morphology) {
    findings.push(
      hbLow
        ? `Red-cell indices indicate a ${morphology}, giving an ${morphology.includes("microcytic") ? "microcytic" : morphology.includes("macrocytic") ? "macrocytic" : "normocytic"} anaemic pattern.`
        : `Red-cell indices indicate a ${morphology}.`
    );
  }

  if (rdwHigh) {
    findings.push("Increased RDW indicates anisocytosis, with increased variation in red-cell size.");
  }

  if (mcv !== null && rbc !== null && mcv < 80 && rbc > 0) {
    const mentzer = mcv / rbc;
    if (mentzer < 13) {
      findings.push("The low MCV with a relatively preserved/high RBC count gives a Mentzer index below 13, a pattern that may favour thalassaemia trait over iron deficiency; this is a screening clue, not a diagnosis.");
    } else {
      findings.push("The low MCV with a Mentzer index of 13 or above may favour iron deficiency over thalassaemia trait; correlate with ferritin/iron studies and clinical findings.");
    }
  }

  return findings;
};

const buildCBCWhiteCellInterpretation = (items, report) => {
  const names = {
    wbc: ["wbc", "white blood cell", "white blood cells", "total wbc", "leucocyte count", "leukocyte count"],
    neutPct: ["neutrophils", "neutrophil", "neutrophils %", "neutrophil %"],
    lymphPct: ["lymphocytes", "lymphocyte", "lymphocytes %", "lymphocyte %"],
    monoPct: ["monocytes", "monocyte", "monocytes %", "monocyte %"],
    eosPct: ["eosinophils", "eosinophil", "eosinophils %", "eosinophil %"],
    basoPct: ["basophils", "basophil", "basophils %", "basophil %"],
    anc: ["neutrophils absolute", "absolute neutrophil count", "anc"],
    alc: ["lymphocytes absolute", "absolute lymphocyte count", "alc"],
    amc: ["monocytes absolute", "absolute monocyte count", "amc"],
    aec: ["eosinophils absolute", "absolute eosinophil count", "aec"],
    abc: ["basophils absolute", "absolute basophil count", "abc"],
  };

  const value = (ids) => savedNumericByIdentity(items, ids);
  const flag = (ids) => savedFlagByIdentity(items, ids, report);
  const abnormal = (f, v, lo, hi) => ({
    low: f === "low" || f === "critical low" || (v !== null && v < lo),
    high: f === "high" || f === "critical high" || (v !== null && v > hi),
  });

  const wbc = value(names.wbc), wbcF = flag(names.wbc);
  const anc = value(names.anc), ancF = flag(names.anc);
  const alc = value(names.alc), alcF = flag(names.alc);
  const amc = value(names.amc), amcF = flag(names.amc);
  const aec = value(names.aec), aecF = flag(names.aec);
  const abc = value(names.abc), abcF = flag(names.abc);
  const neut = value(names.neutPct), neutF = flag(names.neutPct);
  const lymph = value(names.lymphPct), lymphF = flag(names.lymphPct);
  const mono = value(names.monoPct), monoF = flag(names.monoPct);
  const eos = value(names.eosPct), eosF = flag(names.eosPct);
  const baso = value(names.basoPct), basoF = flag(names.basoPct);

  const findings = [];
  const pushUnique = (textValue) => { if (textValue && !findings.includes(textValue)) findings.push(textValue); };

  const w = abnormal(wbcF, wbc, 4.0, 11.0);
  if (w.high) pushUnique("The total white-cell count shows leucocytosis, which may occur with infection, inflammation, physiological stress, tissue injury or haematological disorders.");
  if (w.low) pushUnique("The total white-cell count shows leucopenia, which may occur with viral infection, marrow suppression, drug effects, autoimmune disease or severe systemic illness.");

  const diff = [
    ["neutrophil", anc, ancF, 2.0, 7.5, neut, neutF, 40, 75],
    ["lymphocyte", alc, alcF, 1.0, 4.0, lymph, lymphF, 20, 45],
    ["monocyte", amc, amcF, 0.2, 1.0, mono, monoF, 2, 10],
    ["eosinophil", aec, aecF, 0.0, 0.5, eos, eosF, 1, 6],
    ["basophil", abc, abcF, 0.0, 0.1, baso, basoF, 0, 2],
  ];

  for (const [type, abs, absF, alo, ahi, pct, pctF, plo, phi] of diff) {
    const a = abnormal(absF, abs, alo, ahi);
    const pctAbnormal = abnormal(pctF, pct, plo, phi);
    if (a.high) {
      pushUnique(type === "neutrophil"
        ? "Neutrophilia is present, based preferably on the absolute neutrophil count; this may accompany bacterial infection, acute inflammation, stress or corticosteroid effect."
        : type === "lymphocyte"
          ? "Lymphocytosis is present, based preferably on the absolute lymphocyte count; this may occur with viral infection, some chronic infections or lymphoproliferative disorders."
          : type === "monocyte"
            ? "Monocytosis is present, based preferably on the absolute monocyte count; this may occur with chronic infection, inflammation, recovery from acute infection or some haematological disorders."
            : type === "eosinophil"
              ? "Eosinophilia is present, based preferably on the absolute eosinophil count; common associations include allergic disease, parasitic infection and selected drug or inflammatory disorders."
              : "Basophilia is present; correlate with allergic/inflammatory states and, when persistent or marked, possible myeloproliferative disease.");
    } else if (a.low) {
      pushUnique(type === "neutrophil"
        ? "Neutropenia is present, based preferably on the absolute neutrophil count; clinical significance depends on severity and duration and may occur with infection, drug effects, marrow suppression or immune-mediated disease."
        : type === "lymphocyte"
          ? "Lymphopenia is present, based preferably on the absolute lymphocyte count; it may accompany acute systemic stress, corticosteroid effect, immunodeficiency or severe illness."
          : type === "monocyte"
            ? "Monocytopenia is present; correlate with the overall white-cell profile and clinical context."
            : type === "eosinophil"
              ? "A reduced eosinophil count is usually of limited isolated clinical significance and should be interpreted with the clinical context."
              : "A reduced basophil count is usually of limited isolated clinical significance.");
    } else if (abs === null && pctAbnormal.high) {
      pushUnique(`${type[0].toUpperCase()+type.slice(1)} percentage is increased; interpretation should be confirmed with the absolute count where available.`);
    } else if (abs === null && pctAbnormal.low) {
      pushUnique(`${type[0].toUpperCase()+type.slice(1)} percentage is reduced; interpretation should be confirmed with the absolute count where available.`);
    }
  }

  return findings;
};

const compactClinicalPhrase = (name, flag) => {
  const n = normalize(name);
  const f = normalize(flag);

  if (!["high", "critical high", "low", "critical low"].includes(f)) {
    return "";
  }

  const high = f.includes("high");
  const critical = f.includes("critical");

  /* Renal */
  if (n.includes("urea") || n.includes("blood urea nitrogen") || n === "bun") {
    if (high) {
      return "Azotaemia may occur with reduced renal perfusion, renal impairment, dehydration, increased protein catabolism or gastrointestinal blood loss.";
    }
    return "Reduced serum urea may occur with low protein intake, impaired hepatic urea synthesis or overhydration.";
  }

  if (n.includes("creatinine")) {
    if (high) {
      return critical
        ? "Marked creatininaemia warrants correlation with glomerular filtration and the clinical context; causes include acute or chronic renal impairment, urinary obstruction and reduced renal perfusion."
        : "Creatininaemia may occur with reduced glomerular filtration, renal impairment, urinary obstruction or reduced renal perfusion.";
    }
    return "Reduced serum creatinine may be associated with low muscle mass, reduced creatine production or increased renal clearance.";
  }

  if (n.includes("uric acid") || n === "uric") {
    return high
      ? "Hyperuricaemia may occur with reduced renal urate excretion, increased purine turnover, metabolic disorders or high purine intake."
      : "Hypouricaemia may occur with increased renal urate clearance, reduced urate production or certain medications.";
  }

  /* Hepatobiliary */
  if (n === "ast" || n.includes("aspartate aminotransferase")) {
    return high
      ? "AST elevation may reflect hepatocellular injury or extrahepatic tissue injury, particularly skeletal or cardiac muscle injury."
      : "Reduced AST is usually of limited clinical significance when isolated.";
  }

  if (n === "alt" || n.includes("alanine aminotransferase")) {
    return high
      ? "ALT elevation is compatible with hepatocellular injury and may occur with viral hepatitis, metabolic fatty liver disease, drug-induced liver injury or other hepatic insults."
      : "Reduced ALT is usually of limited clinical significance when isolated.";
  }

  if (n.includes("alkaline phosphatase") || n === "alp") {
    return high
      ? "Cholestatic hepatobiliary disease or increased osteoblastic activity should be considered; correlate with GGT, bilirubin and clinical findings."
      : "Reduced alkaline phosphatase may occur with nutritional deficiency, hypophosphatasia or impaired osteoblastic activity.";
  }

  if (n === "ggt" || n.includes("gamma glutamyl transferase") || n.includes("gamma glutamyl")) {
    return high
      ? "Hepatobiliary enzyme induction may occur with cholestasis, alcohol exposure or enzyme-inducing medications."
      : "Reduced GGT is generally of limited clinical significance when isolated.";
  }

  if (n.includes("total bilirubin")) {
    return high
      ? "Hyperbilirubinaemia may reflect increased bilirubin production, impaired hepatic handling or cholestasis; fractionation helps distinguish unconjugated from conjugated processes."
      : "Reduced bilirubin is generally of limited clinical significance.";
  }

  if (n.includes("direct bilirubin") || n.includes("conjugated bilirubin")) {
    return high
      ? "Conjugated hyperbilirubinaemia may occur with hepatocellular dysfunction or impaired biliary excretion, including cholestasis and biliary obstruction."
      : "Reduced direct bilirubin is generally of limited clinical significance.";
  }

  if (n === "albumin" || n.includes("serum albumin")) {
    return high
      ? "Hyperalbuminaemia is most often associated with reduced plasma water, particularly dehydration."
      : "Hypoalbuminaemia may occur with impaired hepatic synthesis, protein loss, malnutrition or systemic inflammation.";
  }

  if (n.includes("total protein")) {
    return high
      ? "Hyperproteinaemia may occur with dehydration or increased immunoglobulin production."
      : "Hypoproteinaemia may occur with malnutrition, protein-losing states, impaired hepatic synthesis or dilutional states.";
  }

  if (n.includes("globulin")) {
    return high
      ? "Hyperglobulinaemia may occur with chronic inflammation, infection, autoimmune disease or monoclonal gammopathy."
      : "Hypoglobulinaemia may occur with impaired immunoglobulin production or increased protein loss.";
  }

  /* Lipids */
  if (n.includes("triglyceride")) {
    return high
      ? "Hypertriglyceridaemia may occur with insulin resistance, diabetes mellitus, obesity, alcohol exposure, hypothyroidism or familial dyslipidaemia."
      : "Low triglyceride concentrations are usually of limited clinical significance but may occur with malnutrition or malabsorption.";
  }

  if (n.includes("hdl")) {
    return high
      ? "Increased HDL cholesterol is generally not considered an adverse lipid finding."
      : "Low HDL cholesterol is associated with increased atherogenic risk and commonly accompanies insulin resistance, obesity and hypertriglyceridaemia.";
  }

  if (n.includes("ldl")) {
    return high
      ? "Hyper-LDL-cholesterolaemia is associated with increased atherosclerotic cardiovascular risk and may reflect primary or secondary dyslipidaemia."
      : "Low LDL cholesterol may occur with lipid-lowering therapy, malnutrition, malabsorption or certain systemic disorders.";
  }

  if (n.includes("vldl")) {
    return high
      ? "Increased VLDL cholesterol is commonly associated with hypertriglyceridaemia and insulin resistance."
      : "Reduced VLDL cholesterol is generally of limited clinical significance when isolated.";
  }

  if (n.includes("cholesterol") || n.includes("total cholesterol")) {
    return high
      ? "Hypercholesterolaemia is associated with increased atherosclerotic cardiovascular risk and may reflect primary or secondary dyslipidaemia."
      : "Low total cholesterol may occur with malnutrition, malabsorption, hyperthyroidism or chronic systemic disease.";
  }

  /* Glucose / glycaemic markers */
  if (n.includes("hba1c")) {
    return high
      ? "Chronic hyperglycaemia is suggested, consistent with suboptimal glycaemic control over the preceding 2–3 months."
      : "Low HbA1c may occur with shortened erythrocyte survival, haemolysis or recent intensive glucose-lowering therapy.";
  }

  if (n.includes("fasting blood glucose") || n === "fbs" || n.includes("fasting glucose")) {
    return high
      ? "Hyperglycaemia may occur with diabetes mellitus, stress-related hormonal responses or medication effects."
      : "Hypoglycaemia may occur with glucose-lowering therapy, prolonged fasting, endocrine dysfunction or critical illness.";
  }

  if (n.includes("random blood glucose") || n === "rbs" || n.includes("random glucose")) {
    return high
      ? "Hyperglycaemia may occur with diabetes mellitus, acute physiological stress or medication effects."
      : "Hypoglycaemia may occur with glucose-lowering therapy, prolonged fasting, endocrine dysfunction or critical illness.";
  }

  if (n.includes("glucose")) {
    return high
      ? "Hyperglycaemia may occur with diabetes mellitus, acute physiological stress or medication effects."
      : "Hypoglycaemia may occur with glucose-lowering therapy, prolonged fasting, endocrine dysfunction or critical illness.";
  }

  /* Electrolytes */
  if (n.includes("sodium")) {
    return high
      ? "Hypernatraemia commonly reflects water deficit relative to sodium and may occur with dehydration or impaired free-water access."
      : "Hyponatraemia may occur with excess free water, diuretic therapy, syndrome of inappropriate antidiuresis, heart failure or renal disease.";
  }

  if (n.includes("potassium")) {
    return high
      ? "Hyperkalaemia may occur with impaired renal potassium excretion, medications affecting potassium handling, acidosis or cellular potassium release."
      : "Hypokalaemia may occur with gastrointestinal or renal potassium loss, diuretic therapy or intracellular potassium shift.";
  }

  if (n.includes("chloride")) {
    return high
      ? "Hyperchloraemia may occur with dehydration, saline load or metabolic acidosis."
      : "Hypochloraemia may occur with vomiting, diuretic therapy or disorders associated with metabolic alkalosis.";
  }

  if (n.includes("bicarbonate") || n.includes("total co2")) {
    return high
      ? "Increased bicarbonate may occur with metabolic alkalosis or chronic respiratory acidosis with renal compensation."
      : "Reduced bicarbonate may indicate metabolic acidosis or compensation for respiratory alkalosis.";
  }

  if (n.includes("calcium")) {
    return high
      ? "Hypercalcaemia may occur with primary hyperparathyroidism, malignancy, vitamin D excess or granulomatous disease."
      : "Hypocalcaemia may occur with vitamin D deficiency, hypoparathyroidism, chronic kidney disease or hypoalbuminaemia.";
  }

  if (n.includes("magnesium")) {
    return high
      ? "Hypermagnesaemia may occur with renal impairment or excessive magnesium intake, particularly in susceptible patients."
      : "Hypomagnesaemia may occur with gastrointestinal loss, renal wasting, poor intake or certain medications.";
  }

  if (n.includes("phosphate") || n.includes("phosphorus")) {
    return high
      ? "Hyperphosphataemia may occur with renal impairment, increased phosphate load or cellular breakdown."
      : "Hypophosphataemia may occur with poor intake, malabsorption, increased cellular uptake or renal phosphate wasting.";
  }

  if (n.includes("esr") || n.includes("erythrocyte sedimentation")) {
    return high
      ? "An increased erythrocyte sedimentation rate is a nonspecific marker that may accompany inflammation, infection, autoimmune disease or malignancy."
      : "A low erythrocyte sedimentation rate is generally of limited clinical significance and may occur with erythrocytosis or altered plasma proteins.";
  }

  /* Common haematology abnormalities */
  if (n.includes("haemoglobin") || n.includes("hemoglobin")) {
    return high
      ? "Erythrocytosis may occur with chronic hypoxaemia, dehydration or primary/secondary erythropoietic disorders."
      : "Anaemia may result from blood loss, haemolysis, nutritional deficiency, chronic disease or impaired erythropoiesis.";
  }

  if (n === "pcv" || n.includes("packed cell volume") || n.includes("haematocrit") || n.includes("hematocrit")) {
    return high
      ? "Erythrocytosis or haemoconcentration may occur with dehydration or chronic hypoxaemia."
      : "Anaemia or haemodilution should be considered; correlate with red-cell indices and clinical findings.";
  }

  if (n === "wbc" || n.includes("white blood cell")) {
    return high
      ? "Leucocytosis may occur with infection, inflammation, stress responses, tissue injury or haematological disorders."
      : "Leucopenia may occur with viral infection, marrow suppression, drug effects, autoimmune disease or severe systemic illness.";
  }

  if (n.includes("neutrophil")) {
    return high
      ? "Neutrophilia may occur with bacterial infection, acute inflammation, physiological stress or corticosteroid effect."
      : "Neutropenia may occur with viral infection, drug-induced marrow suppression, autoimmune disease or severe sepsis.";
  }

  if (n.includes("lymphocyte")) {
    return high
      ? "Lymphocytosis may occur with viral infection, some chronic infections or lymphoproliferative disorders."
      : "Lymphopenia may occur with acute systemic stress, corticosteroid effect, immunodeficiency or severe illness.";
  }

  if (n.includes("platelet")) {
    return high
      ? "Thrombocytosis may be reactive to inflammation, infection, iron deficiency or tissue injury, or may reflect a myeloproliferative disorder."
      : "Thrombocytopenia may occur with reduced production, increased peripheral destruction or consumption.";
  }

  return "";
};

const buildCBCIntegratedDashboardInterpretation = (items, report) => {
  const has = (names) => items.find((row) => names.includes(normalize(savedParameter(row))));
  const val = (row) => {
    const n = Number(String(savedScalar(row) ?? "").replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : null;
  };
  const st = (row, low, high) => {
    const f = normalize(savedFlagForInterpretation(row, report));
    const v = val(row);
    return { low: f === "l" || f === "low" || (v !== null && v < low), high: f === "h" || f === "high" || (v !== null && v > high), normal: f === "n" || f === "normal" || (v !== null && v >= low && v <= high), value: v };
  };
  const hb = st(has(["haemoglobin", "hemoglobin", "hb"]), 12, 17.5);
  const rbc = val(has(["rbc", "red blood cell", "red blood cells", "red cell count", "erythrocyte count"]));
  const mcv = st(has(["mcv", "mean corpuscular volume"]), 80, 100);
  const mch = st(has(["mch", "mean corpuscular haemoglobin", "mean corpuscular hemoglobin"]), 27, 33);
  const mchc = st(has(["mchc", "mean corpuscular haemoglobin concentration", "mean corpuscular hemoglobin concentration"]), 32, 36);
  const rdw = st(has(["rdw", "rdw cv", "rdw-cv", "red cell distribution width"]), 11.5, 14.5);
  const wbc = st(has(["wbc", "white blood cell", "white blood cells", "total wbc"]), 4, 11);
  const anc = st(has(["neutrophils absolute", "absolute neutrophil count", "anc", "neutrophils_absolute"]), 2, 7.5);
  const alc = st(has(["lymphocytes absolute", "absolute lymphocyte count", "alc", "lymphocytes_absolute"]), 1, 4);
  const amc = st(has(["monocytes absolute", "absolute monocyte count", "amc", "monocytes_absolute"]), 0.2, 1);
  const aec = st(has(["eosinophils absolute", "absolute eosinophil count", "aec", "eosinophils_absolute"]), 0, 0.5);
  const abc = st(has(["basophils absolute", "absolute basophil count", "abc", "basophils_absolute"]), 0, 0.1);
  const platelets = st(has(["platelets", "platelet", "plt"]), 150, 450);

  const findings = [];
  let morphology = "";
  if (mcv.low) morphology = (mch.low || mchc.low) ? "microcytic hypochromic" : "microcytic";
  else if (mcv.high) morphology = mchc.low ? "macrocytic hypochromic" : "macrocytic normochromic";
  else if (mcv.normal) morphology = (mch.low || mchc.low) ? "normocytic hypochromic" : "normocytic normochromic";

  if (morphology) findings.push(hb.low ? `${morphology} red-cell pattern with anaemia` : `${morphology} red-cell pattern`);
  else if (hb.low) findings.push("anaemia");
  else if (hb.high) findings.push("erythrocytosis pattern");
  if (rdw.high) findings.push("anisocytosis");
  if (wbc.high) findings.push("leucocytosis"); else if (wbc.low) findings.push("leucopenia");
  if (anc.high) findings.push("neutrophilia"); else if (anc.low) findings.push("neutropenia");
  if (alc.high) findings.push("lymphocytosis"); else if (alc.low) findings.push("lymphopenia");
  if (amc.high) findings.push("monocytosis"); else if (amc.low) findings.push("monocytopenia");
  if (aec.high) findings.push("eosinophilia"); else if (aec.low && aec.value !== null) findings.push("eosinopenia");
  if (abc.high) findings.push("basophilia"); else if (abc.low && abc.value !== null) findings.push("basopenia");
  if (platelets.high) findings.push("thrombocytosis"); else if (platelets.low) findings.push("thrombocytopenia");

  if (!findings.length) return ["No significant haematological abnormality detected from the reported parameters."];
  const sentence = `${findings[0]}${findings.length > 1 ? ` with ${findings.slice(1).join(", ")}` : ""}.`;
  const comments = [];
  if (hb.low && morphology.includes("microcytic")) comments.push("The microcytic pattern may be associated with iron deficiency or thalassaemia trait; correlate with ferritin/iron studies and clinical findings.");
  else if (hb.low && morphology.includes("macrocytic")) comments.push("The macrocytic pattern may be associated with vitamin B12/folate deficiency, alcohol exposure, liver disease, medication effects or other causes; correlate clinically.");
  else if (hb.low) comments.push("Anaemia should be correlated with red-cell indices, reticulocyte response and clinical findings.");
  if (mcv.value !== null && rbc !== null && mcv.value < 80 && rbc > 0) {
    const mentzer = mcv.value / rbc;
    comments.push(mentzer < 13
      ? "A Mentzer index below 13 may favour thalassaemia trait over iron deficiency; this is a screening clue, not a diagnosis."
      : "A Mentzer index of 13 or above may favour iron deficiency over thalassaemia trait; correlate with ferritin/iron studies and clinical findings.");
  }
  return [sentence, ...comments];
};

const buildCompactClinicalInterpretation = (report) => {
  const items = (report?.items || []).filter(hasSavedResult);
  if (!items.length) return "";

  const phrases = [];
  const seen = new Set();

  /* CBC INTEGRATED INTERPRETATION */
  const hasCBC = items.some((row) => {
    const n = normalize(savedParameter(row));
    return n === "mcv" || n === "mch" || n === "mchc" || n === "rdw cv" || n === "rbc" || n.includes("red blood cell");
  });

  if (hasCBC) {
    buildCBCIntegratedDashboardInterpretation(items, report).forEach((phrase) => {
      const key = normalize(phrase);
      if (!seen.has(key)) {
        seen.add(key);
        phrases.push(phrase);
      }
    });
  }


  items.forEach((row) => {
    const flag = savedFlagForInterpretation(row, report);
    const phrase = compactClinicalPhrase(savedParameter(row), flag);
    if (!phrase) return;

    const key = normalize(phrase);
    if (seen.has(key)) return;

    seen.add(key);
    phrases.push(phrase);
  });

  /*
   * Prefer the already-saved clinical impression when it exists and
   * the compact engine has no parameter-specific wording. This keeps
   * legacy/specialized tests readable without fabricating content.
   */
  // For quantitative/panel reports, never fall back to a legacy saved
  // impression. The Dashboard is the single canonical interpretation layer.
  // This prevents old Result Entry text such as "Anaemia. Clinical
  // correlation..." from being reproduced after the result rows are
  // reconstructed.
  return phrases.join(" ");
}

function CompactClinicalInterpretation({ report }) {
  const items = (report?.items || []).filter(hasSavedResult);
  /*
   * Keep qualitative/special structured reports on their own
   * dedicated presentation. This block is for quantitative/
   * panel-style laboratory reporting.
   */
  const special =
    items.some(isWidalRow) ||
    items.some(isMalariaParasiteRow) ||
    items.some(isCoombsRow) ||
    items.some(isGroupingCrossMatchingRow) ||
    isQualitativeReport(report, items);

  if (special) return null;

  const interpretation = buildCompactClinicalInterpretation(report);
  if (!interpretation) return null;

  return (
    <section className="pefa-compact-interpretation" aria-label="Clinical interpretation">
      <div className="pefa-compact-interpretation-label">INTERPRETATION</div>
      <p>{interpretation}</p>
    </section>
  );
}

function SavedQuantitativeResult({ report }) {
  /*
   * PANEL/QUANTITATIVE DISPLAY RULE
   * --------------------------------------------------------
   * The report shell already displays the authoritative test/panel
   * title and department. Do NOT render another "QUANTITATIVE RESULT"
   * heading, panel name, or "Saved Result" badge here. The renderer
   * must begin directly with the result table.
   */
  const items = (report?.items || []).filter(hasSavedResult);

  return (
    <div className="pefa-saved-result pefa-saved-result--table-only">
      <div className="pefa-saved-result-table-wrap">
        <table className="pefa-saved-result-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Result</th>
              <th>Unit</th>
              <th>Reference Range</th>
              <th>Flag</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => {
              const objectValue = savedObject(row);
              const value = savedScalar(row);
              const itemUnit = isESR(row)
                ? "mm/hr"
                : isPCVRow(row)
                  ? PEFA_PCV_DASHBOARD_UNIT
                  : isUricAcidRow(row)
                    ? PEFA_URIC_ACID_DASHBOARD_UNIT
                    : isHbA1cRow(row)
                      ? PEFA_HBA1C_DASHBOARD_UNIT
                      : isFBSRow(row)
                    ? PEFA_FBS_DASHBOARD_UNIT
                    : isRBSRow(row)
                      ? PEFA_RBS_DASHBOARD_UNIT
                      : savedUnit(row, objectValue) || "—";
              const itemReference = isESR(row)
                ? getESRReference(row)
                : isPCVRow(row)
                  ? getPCVDashboardReference(row, report) || "—"
                  : isUricAcidRow(row)
                    ? getUricAcidDashboardReference(row, report) || "3.4 - 7.0 mg/dL"
                    : isHbA1cRow(row)
                      ? PEFA_HBA1C_DASHBOARD_REFERENCE
                      : isFBSRow(row)
                        ? PEFA_FBS_DASHBOARD_REFERENCE
                        : isRBSRow(row)
                          ? PEFA_RBS_DASHBOARD_REFERENCE
                          : savedReference(row, objectValue, report) || "—";
              const itemFlag = resolveDashboardFlag(row, objectValue, value, report);

              return (
                <tr key={row.id || savedParameter(row)}>
                  <td><strong>{savedParameter(row)}</strong></td>
                  <td><strong>{text(value) || "—"}</strong></td>
                  <td>{itemUnit}</td>
                  <td>{itemReference}</td>
                  <td>
                    <span className={`pefa-result-flag pefa-result-flag--${flagClass(itemFlag)}`}>
                      {itemFlag || "—"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function isDedicatedPanelReport(report) {
  const reportName = normalize(
    firstValue(
      report?.title,
      report?.test_name,
      report?.testName,
      report?.panel_name,
      report?.panelName,
      ""
    )
  );

  const explicitType = normalize(
    firstValue(report?.test_type, report?.testType, "")
  );

  return (
    report?.is_panel === true ||
    report?.isPanel === true ||
    explicitType === "panel" ||
    explicitType === "profile" ||
    includesKnownName(reportName, KNOWN_PANEL_NAMES)
  );
}

function SavedResultContent({ report, patient, printMode }) {
  const items = (report?.items || []).filter(hasSavedResult);
  if (!items.length) {
    return (
      <div className="pefa-results-empty">
        <AlertCircle size={18} />
        No saved result values are available for this report.
      </div>
    );
  }

  // Dedicated special reports ALWAYS win over generic quantitative metadata.
  if (items.some(isWidalRow)) {
    return <SavedWidalResult report={{ ...report, items }} />;
  }

  if (items.some(isMalariaParasiteRow) || normalize(report?.title).includes("malaria parasite")) {
    return <SavedMalariaParasiteResult report={{ ...report, items }} />;
  }

  if (items.some(isGroupingCrossMatchingRow)) {
    return <SavedGroupingCrossMatchingResult report={{ ...report, items }} />;
  }

  if (items.some(isCoombsRow)) {
    return <SavedCoombsResult report={{ ...report, items }} />;
  }

  // PCV, Uric Acid and HbA1c are always quantitative scalar results. This must run
  // before legacy qualitative metadata or renderer decisions.
  if (items.some((row) => isPCVRow(row) || isUricAcidRow(row) || isHbA1cRow(row))) {
    return <SavedQuantitativeResult report={{ ...report, items }} />;
  }

  // FBS/RBS are always quantitative scalar results. This must run before any
  // legacy qualitative metadata or renderer decision.
  if (items.some((row) => isFBSRow(row) || isRBSRow(row))) {
    return <SavedQuantitativeResult report={{ ...report, items }} />;
  }

  // Qualitative reports ALWAYS use Parameter | Result. Never render the
  // generic quantitative table and never expose saved JSON/method text.
  if (isQualitativeReport(report, items)) {
    return <SavedQualitativeResult report={{ ...report, items }} />;
  }

  // Haematology reports use the same compact quantitative table as other
  // numeric reports. This deliberately bypasses FormalResultRenderer's
  // legacy Interpretation + Impression section; the single canonical
  // INTERPRETATION block is rendered after the result table.
  if (isHematologyReport(report)) {
    return <SavedQuantitativeResult report={{ ...report, items }} />;
  }

  // ALL quantitative/profile/panel reports use the same table-first renderer.
  // Do not send chemistry panels through FormalResultRenderer because that
  // legacy renderer can reproduce the saved Result Entry Interpretation /
  // Impression block. The Dashboard is the single canonical interpretation layer.
  if (isLipidProfileReport(report, items) || isDedicatedPanelReport(report)) {
    return <SavedQuantitativeResult report={{ ...report, items }} />;
  }

  if (items.every((row) => resultType(row).includes("quantitative") || isESR(row) || !!unit(row))) {
    return <SavedQuantitativeResult report={{ ...report, items }} />;
  }

  return (
    <FormalResultRenderer
      report={{
        ...report,
        items,
        patient,
        sex: patient?.sex,
        age: patient?.age,
        dob: patient?.dob,
        masterTests: report?.masterTests || [],
      }}
      printMode={printMode === "record" ? "preprinted" : "full"}
    />
  );
}

const SAVED_RESULT_VIEW_STYLES = `
/* Quantitative/panel renderer is table-first; the report shell owns the title. */
.pefa-saved-result--table-only{width:100%;margin:0;padding:0}
.pefa-saved-result-header{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:12px 14px;margin:0 0 10px;border:1px solid #dbe3ec;border-radius:9px;background:#f8fafc}
.pefa-saved-result-header div{display:flex;flex-direction:column;gap:2px}
.pefa-saved-result-header span{font-size:9px;font-weight:800;letter-spacing:.08em;color:#64748b}
.pefa-saved-result-header strong{font-size:14px;color:#0f172a}
.pefa-saved-result-header small{font-size:10px;color:#64748b;font-weight:700}
.pefa-saved-result-table-wrap{width:100%;overflow-x:auto}
.pefa-saved-result-table{width:100%;border-collapse:collapse;background:#fff}
.pefa-special-malaria-table th,.pefa-special-malaria-table td{width:50%}
.pefa-coombs-result-table th:first-child,.pefa-coombs-result-table td:first-child{width:38%}
.pefa-coombs-result-table th:last-child,.pefa-coombs-result-table td:last-child{width:62%}
.pefa-coombs-final-result{font-weight:900}
.pefa-saved-result--coombs .pefa-saved-result-header{border-left:4px solid #2563eb}
/* Blood Bank grouping / crossmatching table: keep each column aligned. */
.pefa-saved-result--blood-grouping .pefa-saved-result-header{border-left:4px solid #7c3aed}
.pefa-blood-grouping-table{width:100%;table-layout:fixed}
.pefa-blood-grouping-table th,.pefa-blood-grouping-table td{vertical-align:middle;white-space:normal;overflow-wrap:anywhere}
.pefa-blood-grouping-table th:first-child,.pefa-blood-grouping-table td:first-child{width:42%}
.pefa-blood-grouping-table th:last-child,.pefa-blood-grouping-table td:last-child{width:58%}
.pefa-blood-crossmatch-wrap{margin-top:12px}
.pefa-blood-crossmatch-wrap .pefa-blood-grouping-table th:nth-child(1),
.pefa-blood-crossmatch-wrap .pefa-blood-grouping-table td:nth-child(1){width:24%}
.pefa-blood-crossmatch-wrap .pefa-blood-grouping-table th:nth-child(2),
.pefa-blood-crossmatch-wrap .pefa-blood-grouping-table td:nth-child(2){width:15%}
.pefa-blood-crossmatch-wrap .pefa-blood-grouping-table th:nth-child(3),
.pefa-blood-crossmatch-wrap .pefa-blood-grouping-table td:nth-child(3){width:15%}
.pefa-blood-crossmatch-wrap .pefa-blood-grouping-table th:nth-child(4),
.pefa-blood-crossmatch-wrap .pefa-blood-grouping-table td:nth-child(4){width:22%}
.pefa-blood-crossmatch-wrap .pefa-blood-grouping-table th:nth-child(5),
.pefa-blood-crossmatch-wrap .pefa-blood-grouping-table td:nth-child(5){width:24%;white-space:nowrap}
.pefa-saved-result-table th{padding:9px 10px;background:#f1f5f9;border:1px solid #dbe3ec;color:#334155;font-size:10px;font-weight:800;text-align:left;white-space:nowrap}
.pefa-saved-result-table td{padding:9px 10px;border:1px solid #e2e8f0;color:#172033;font-size:11px;vertical-align:middle}
.pefa-saved-result-table td strong{font-weight:800;color:#0f172a}
.pefa-widal-table th,.pefa-widal-table td{text-align:left}
.pefa-result-flag{display:inline-flex;align-items:center;justify-content:center;padding:4px 7px;border-radius:999px;font-size:8px;font-weight:900;white-space:nowrap}
.pefa-result-flag--normal{background:#dcfce7;color:#166534}
.pefa-result-flag--low{background:#fef3c7;color:#92400e}
.pefa-result-flag--high{background:#fee2e2;color:#991b1b}
.pefa-result-flag--none{background:#f1f5f9;color:#64748b}
.pefa-saved-narrative{margin-top:10px;padding:10px 12px;border:1px solid #dbe3ec;border-radius:8px;background:#f8fafc}
.pefa-saved-narrative label{display:block;margin-bottom:4px;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.06em;color:#475569}
.pefa-saved-narrative p{margin:0;font-size:11px;line-height:1.55;color:#334155}
.pefa-result-detail-row td{background:#fafafa;font-size:10px;line-height:1.5}
.pefa-result-detail-row td div+div{margin-top:3px}
.pefa-saved-mp{margin-top:16px;padding-top:2px}
.pefa-report-signature-image{display:block;width:min(210px,100%);height:52px;object-fit:contain;object-position:center bottom;margin:0 auto 2px}
.pefa-signature-space{display:flex;align-items:flex-end;justify-content:center;min-height:58px}
.pefa-signature-card>strong{display:block;margin-top:5px;font-size:11px;line-height:1.25}
.pefa-signature-card>span{display:block;margin-top:2px;font-size:9px;font-weight:800;line-height:1.25}
.pefa-signature-card>small{display:block;margin-top:2px;font-size:7px;font-weight:900;letter-spacing:.05em;color:#64748b;text-transform:uppercase}
@media(max-width:700px){
  .pefa-saved-result-header{align-items:flex-start;flex-direction:column}
  .pefa-saved-result-table{min-width:760px}
}
`;

/* ==========================================================
   STAFF SIGNATURE RESOLUTION
   ----------------------------------------------------------
   Result reports intentionally use ONLY:
   - signature_url
   - full_name
   - role (displayed as designation)

   profile_photo is never used by the report renderer.
   Staff identity can be saved as an ID, auth UUID, username,
   or full name by different legacy Result Entry versions.
   This resolver supports all of those forms without changing
   the existing laboratory result payload/schema.
   ========================================================== */
const resolveReportStaff = (value, staffDirectory = []) => {
  const raw = text(value);
  if (!raw || !Array.isArray(staffDirectory) || !staffDirectory.length) return null;

  const normalized = normalize(raw);

  // 1. Exact identity match: ID, auth UUID, username or full name.
  const exact = staffDirectory.find((staff) => {
    const candidates = [
      staff?.id,
      staff?.auth_user_id,
      staff?.username,
      staff?.full_name,
    ];

    return candidates.some((candidate) => {
      const candidateText = text(candidate);
      if (!candidateText) return false;
      return (
        candidateText === raw ||
        normalize(candidateText) === normalized
      );
    });
  });

  if (exact) return exact;

  // 2. Backward compatibility for older results that stored only a role
  //    instead of the actual staff identity.
  const isScientistLabel =
    normalized === "laboratory scientist" ||
    normalized === "scientist" ||
    normalized === "lab scientist";

  const isDirectorLabel =
    normalized === "director" ||
    normalized === "chief medical laboratory scientist" ||
    normalized === "director chief medical laboratory scientist" ||
    normalized.includes("chief medical laboratory scientist");

  if (isDirectorLabel) {
    return (
      staffDirectory.find((staff) =>
        normalize(staff?.role) === "director" &&
        text(staff?.signature_url)
      ) ||
      staffDirectory.find((staff) => normalize(staff?.role) === "director") ||
      null
    );
  }

  if (isScientistLabel) {
    return (
      staffDirectory.find((staff) =>
        normalize(staff?.role) === "scientist" &&
        text(staff?.signature_url)
      ) ||
      staffDirectory.find((staff) => normalize(staff?.role) === "scientist") ||
      null
    );
  }

  return null;
};

const reportStaffDesignation = (staff, fallback = "") => {
  const role = text(staff?.role);
  const designation = text(staff?.designation);

  /*
   * Access control continues to use the database role "Director".
   * The professional designation printed on laboratory reports is
   * intentionally kept simple: Director.
   */
  if (normalize(role) === "director") {
    return "Director";
  }

  return firstValue(
    designation,
    role,
    fallback,
    "Laboratory Scientist"
  );
};

function ReportSignatureCard({
  staff,
  fallbackName,
  fallbackDesignation,
  label,
}) {
  const name = firstValue(
    staff?.full_name,
    fallbackName,
    "Laboratory Scientist"
  );
  const designation = reportStaffDesignation(
    staff,
    fallbackDesignation
  );
  const signatureUrl = text(staff?.signature_url);
  const renderedSignatureUrl = signatureUrl
    ? `${signatureUrl}${signatureUrl.includes("?") ? "&" : "?"}pefa_sig=${encodeURIComponent(text(staff?.id) || name)}`
    : "";

  return (
    <div className="pefa-signature-card">
      <div className="pefa-signature-space">
        {renderedSignatureUrl ? (
          <img
            src={renderedSignatureUrl}
            alt={`${name} signature`}
            className="pefa-report-signature-image"
            onError={(event) => {
              console.warn(
                "[PEFA RESULT DASHBOARD] Staff signature image failed to load:",
                {
                  name,
                  signatureUrl: renderedSignatureUrl,
                }
              );
              event.currentTarget.style.display = "none";
            }}
          />
        ) : null}
      </div>

      <div className="pefa-signature-line" />

      <strong>{name}</strong>
      <span>{designation}</span>
      <small>{label}</small>
    </div>
  );
}

function PEFAReportShell({ report, printMode = "full", staffDirectory = [] }) {
  const rows = report?.items || [];
  const first = rows[0] || {};
  const patient = getReportPatient(first, report);
  const enteredBy = firstValue(
    first.entered_by,
    first.enteredBy,
    first.entered_by_name,
    first.enteredByName,
    first.entered_by_user_id,
    first.enteredByUserId,
    report.entered_by,
    report.enteredBy,
    "Laboratory Scientist"
  );
  const authorizedBy = firstValue(
    first.authorized_by,
    first.authorizedBy,
    first.authorized_by_name,
    first.authorizedByName,
    first.authorized_by_user_id,
    first.authorizedByUserId,
    report.authorized_by,
    report.authorizedBy,
    "Director"
  );
  const releasedBy = firstValue(first.released_by, first.releasedBy, report.released_by, authorizedBy);
  const enteredStaff = resolveReportStaff(enteredBy, staffDirectory);
  const authorizedStaff = resolveReportStaff(authorizedBy, staffDirectory);
  const verificationId = firstValue(first.verification_id, first.verificationId, report.verification_id, `${report.lab_number || "PEFA"}-${report.title || `${report.department || "LAB"}-REPORT`}`);
  const releasedAt = firstValue(first.released_at, first.releasedAt, report.released_at, first.updated_at);
  const showLetterhead = printMode !== "record";

  return (
    <article className={`pefa-report-document ${showLetterhead ? "is-digital" : "is-preprinted"}`}>
      {showLetterhead && (
        <header className="pefa-report-letterhead">
          <div className="pefa-letterhead-top">
            <div className="pefa-letterhead-logo-wrap">
              <img src={logo} alt="PEFA Logo" className="pefa-letterhead-logo" />
            </div>
            <div className="pefa-letterhead-title">
              <h1>PEFA MEDICAL</h1>
              <h2>DIAGNOSTIC SERVICES</h2>
              <p>Leading the way in Medical Excellence through Timely, Affordable &amp; Precision Laboratory Services</p>
              <div className="pefa-service-strip">
                <span>Laboratory</span><span>Ultrasound</span><span>Blood Bank</span><span>ECG</span>
                <b>REG NO: 3450274</b>
              </div>
            </div>
            <div className="pefa-letterhead-qr">
              <QRCodeSVG value={String(verificationId)} size={64} level="H" />
            </div>
          </div>
          <div className="pefa-office-row">
            <div><strong>HEAD OFFICE</strong><span>32, Ogunru-Ori, Pakuro Road, Mowe, Ogun State.</span></div>
            <div><strong>MOWE BRANCH</strong><span>5, Olorombo Street, Imedu-Nla, Mowe, Ogun State.</span></div>
            <div><strong>ORIMERUNMU</strong><span>Iya-Ijebu Junction, Orimerunmu Road, Ogun State.</span></div>
          </div>
          <div className="pefa-contact-strip">
            <span>+234 808 661 8621</span><span>|</span><span>+234 808 568 1720</span><span>|</span><span>+234 808 833 6440</span><span>|</span><span>pefa.medlab@gmail.com</span><span>|</span><span>www.pefamedlab.com</span>
          </div>
          <div className="pefa-header-ribbon"><i /><i /><i /></div>
        </header>
      )}

      <section className="pefa-report-patient">
        <div className="pefa-report-patient-title">PATIENT INFORMATION</div>
        <div className="pefa-report-patient-grid">
          <div><label>Patient Name</label><strong>{patient.full_name}</strong></div>
          <div><label>Patient ID</label><strong>{patient.patient_id}</strong></div>
          <div><label>Lab Number</label><strong>{patient.lab_number}</strong></div>
          <div><label>Registration No.</label><strong>{patient.registration_number}</strong></div>
          <div><label>Sex</label><strong>{patient.sex}</strong></div>
          <div><label>Age</label><strong>{patient.age}</strong></div>
          <div><label>Branch</label><strong>{patient.branch}</strong></div>
          <div><label>Referring Hospital</label><strong>{patient.referring_hospital}</strong></div>
          <div><label>Referring Doctor</label><strong>{patient.referring_doctor}</strong></div>
          <div><label>Registration Date</label><strong>{formatDateTime(patient.registration_date)}</strong></div>
          <div><label>Sample Collection</label><strong>{formatDateTime(patient.sample_collection_date)}</strong></div>
          <div><label>Report Date</label><strong>{formatDateTime(patient.report_date)}</strong></div>
        </div>
        {patient.clinical_history !== "—" && (
          <div className="pefa-clinical-history"><label>Clinical History</label><span>{patient.clinical_history}</span></div>
        )}
      </section>

      <main className="pefa-report-body">
        <div className="pefa-report-heading">
          <span>LABORATORY REPORT</span>
          {(() => {
            const titleKey = normalize(report?.title || "");
            const isWidalOrMalariaSpecial =
              titleKey.includes("widal") ||
              titleKey.includes("malaria parasite") ||
              titleKey === "mp";

            if (isWidalOrMalariaSpecial) return null;

            return (
              <>
                <h2>{report.title}</h2>
                <small>{report.department} · {pretty(report.presentation)}</small>
              </>
            );
          })()}
        </div>
        <div className="pefa-router-body pefa-formal-renderer-body">
          <style>{SAVED_RESULT_VIEW_STYLES}</style>
          {(() => {
            const savedRendererItems = getSavedRendererInput(report);
            const savedRendererReport = { ...report, items: savedRendererItems };
            return (
              <>
                <SavedResultContent
                  report={savedRendererReport}
                  patient={patient}
                  printMode={printMode}
                />
                <CompactClinicalInterpretation
                  report={savedRendererReport}
                />
              </>
            );
          })()}
        </div>
      </main>

      <section className="pefa-report-signatures">
        <ReportSignatureCard
          staff={enteredStaff}
          fallbackName={enteredBy}
          fallbackDesignation={
            enteredStaff?.role ||
            (normalize(enteredBy).includes("laboratory")
              ? enteredBy
              : "Laboratory Scientist")
          }
          label="RESULT ENTERED BY"
        />

        <ReportSignatureCard
          staff={authorizedStaff}
          fallbackName={authorizedBy}
          fallbackDesignation={
            authorizedStaff?.role ||
            (normalize(authorizedBy).includes("laboratory")
              ? authorizedBy
              : "Director")
          }
          label="AUTHORIZED BY"
        />
      </section>

      <section className="pefa-report-verification">
        <div className="pefa-verification-qr"><QRCodeSVG value={String(verificationId)} size={64} level="H" /></div>
        <div className="pefa-verification-item"><label>Verification ID</label><strong>{verificationId}</strong></div>
        <div className="pefa-verification-item"><label>Released On</label><strong>{releasedAt ? formatDateTime(releasedAt) : "N/A"}</strong></div>
        <div className="pefa-verification-item"><label>Entered By</label><strong>{enteredBy}</strong></div>
        <div className="pefa-verification-item"><label>Authorized By</label><strong>{authorizedBy}</strong></div>
        <div className="pefa-verification-item"><label>Released By</label><strong>{releasedBy}</strong></div>
      </section>

      <div className="pefa-confidential-notice">This report is confidential and intended solely for the patient and attending physician. Unauthorized copying, distribution or disclosure is prohibited.</div>

      <footer className="pefa-report-footer">
        Leading the way in Medical Excellence through Timely, Affordable &amp; Reliable Laboratory Services
      </footer>
    </article>
  );
}

function SavedReportPreview({ report, printMode = "full", staffDirectory = [] }) {
  if (!report?.items?.length) {
    return (
      <div className="pefa-results-empty">
        <AlertCircle size={18} />
        No saved result values are available for this report.
      </div>
    );
  }

  return <PEFAReportShell report={report} printMode={printMode} staffDirectory={staffDirectory} />;
}

function PatientSummary({ report }) {
  const row = report.items[0] || {};
  return (
    <div className="pefa-patient-grid">
      <div className="pefa-patient-primary">
        <div className="pefa-avatar">
          <Users size={19} />
        </div>
        <div>
          <span>Patient</span>
          <strong>{patientName(row)}</strong>
          <small>ID: {patientId(row)}</small>
        </div>
      </div>

      <div className="pefa-meta">
        <div><span>Lab Number</span><strong>{labNumber(row) || "—"}</strong></div>
        <div><span>Registration</span><strong>{registrationNumber(row) || "—"}</strong></div>
        <div><span>Department</span><strong>{department(row)}</strong></div>
        <div><span>Sex / Age</span><strong>{firstValue(row?.sex, row?.gender, "—")} / {firstValue(row?.age, row?.age_years, "—")}</strong></div>
      </div>
    </div>
  );
}

export default function LaboratoryResultDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialLab = params.get("lab_number") || params.get("labNumber") || "";

  const [labNumberInput, setLabNumberInput] = useState(initialLab);
  const [searchedLabNumber, setSearchedLabNumber] = useState(initialLab);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [workspace, setWorkspace] = useState({ results: [] });
  const [staffDirectory, setStaffDirectory] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [printBusy, setPrintBusy] = useState(false);
  const [printMode, setPrintMode] = useState("preprinted");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [shareType, setShareType] = useState("whatsapp");
  const [shareRecipient, setShareRecipient] = useState("");

  /* ==========================================================
     LOAD STAFF SIGNATURE DIRECTORY
     ----------------------------------------------------------
     The report needs only full_name, role and signature_url.
     profile_photo is deliberately excluded.
     ========================================================== */
  const loadStaffDirectory = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("staff_users")
        .select("id, auth_user_id, username, full_name, role, signature_url, status")
        .eq("status", "Active")
        .order("full_name", { ascending: true });

      if (error) {
        console.warn(
          "[PEFA RESULT DASHBOARD] Staff signature directory could not be loaded:",
          error
        );
        setStaffDirectory([]);
        return;
      }

      const activeStaff = Array.isArray(data) ? data : [];
      setStaffDirectory(activeStaff);

      console.debug("[PEFA RESULT DASHBOARD] Staff signature records:", activeStaff.map((staff) => ({
        id: staff.id,
        name: staff.full_name,
        role: staff.role,
        signature_url: staff.signature_url || "",
      })));

      console.debug(
        "[PEFA RESULT DASHBOARD] Staff signature directory loaded:",
        activeStaff.map((staff) => ({
          id: staff.id,
          full_name: staff.full_name,
          role: staff.role,
          has_signature: Boolean(text(staff.signature_url)),
        }))
      );
    } catch (error) {
      console.warn(
        "[PEFA RESULT DASHBOARD] Staff directory load failed:",
        error
      );
      setStaffDirectory([]);
    }
  }, []);

  useEffect(() => {
    loadStaffDirectory();
  }, [loadStaffDirectory]);

  const load = useCallback(
    async ({ requestedLab = searchedLabNumber, requestedSearch = search } = {}) => {
      setLoading(true);
      setError("");

      try {
        const data = await getLaboratoryResultWorkspace({
          labNumber: text(requestedLab) || null,
          search: text(requestedSearch) || "",
        });

        const raw = Array.isArray(data?.results) ? data.results : [];
        const saved = raw.filter(hasSavedResult);

        setWorkspace({
          results: saved,
          masterTests: data?.masterTests || [],
          panelTests: data?.panelTests || [],
          groups: data?.groups || [],
        });

        return data;
      } catch (err) {
        console.error("[LaboratoryResultDashboard] load failed:", err);
        setWorkspace({ results: [] });
        setError(err?.message || "Unable to load saved laboratory results.");
      } finally {
        setLoading(false);
      }
    },
    [searchedLabNumber, search]
  );

  useEffect(() => {
    if (initialLab) {
      load({ requestedLab: initialLab, requestedSearch: "" });
    }
    // Initial URL load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLab]);

  const allReports = useMemo(
    () =>
      buildReports(workspace.results).map((report) => ({
        ...report,
        masterTests: workspace.masterTests || [],
        panelTests: workspace.panelTests || [],
        groups: workspace.groups || [],
      })),
    [workspace.results, workspace.masterTests, workspace.panelTests, workspace.groups]
  );

  useEffect(() => {
    if (!workspace.results.length) return;
    console.debug("[PEFA RESULT DASHBOARD] Reports built", {
      labNumber: searchedLabNumber,
      savedRows: workspace.results.length,
      reports: allReports.map((report) => ({
        key: report.key,
        title: report.title,
        department: report.department,
        presentation: report.presentation,
        items: report.items.map((item) => testName(item)),
      })),
    });
  }, [workspace.results, allReports, searchedLabNumber]);

  const departments = useMemo(
    () => Array.from(new Set(allReports.map((report) => text(report.department)).filter(Boolean))).sort(),
    [allReports]
  );

  const filteredReports = useMemo(() => {
    const q = normalize(search);

    return allReports.filter((report) => {
      const reportStatusValue = reportStatus(report);

      if (statusFilter !== "all" && reportStatusValue !== statusFilter) return false;
      if (departmentFilter !== "all" && normalize(report.department) !== normalize(departmentFilter)) return false;
      if (typeFilter !== "all" && report.presentation !== typeFilter) return false;

      if (!q) return true;

      const haystack = [
        report.patient_name,
        report.patient_id,
        report.lab_number,
        report.registration_number,
        report.title,
        report.department,
        ...report.items.map((item) => testName(item)),
      ].join(" ");

      return normalize(haystack).includes(q);
    });
  }, [allReports, search, statusFilter, departmentFilter, typeFilter]);

  const summary = useMemo(() => {
    const count = (s) => allReports.filter((r) => reportStatus(r) === s).length;
    return {
      total: allReports.length,
      entered: count("entered"),
      verified: count("verified"),
      authorized: count("authorized"),
      released: count("released"),
    };
  }, [allReports]);

  const selectedStatus = selectedReport ? reportStatus(selectedReport) : "";
  const canVerify = selectedReport && selectedStatus === "entered";
  const canAuthorize = selectedReport && selectedStatus === "verified";
  const canRelease = selectedReport && selectedStatus === "authorized";
  const canPrint = selectedReport && (selectedStatus === "authorized" || selectedStatus === "released");

  const closeModal = useCallback(() => {
    if (actionLoading || printBusy) return;
    setSelectedReport(null);
  }, [actionLoading, printBusy]);

  useEffect(() => {
    if (!selectedReport) return undefined;

    const handler = (event) => {
      if (event.key === "Escape") closeModal();
    };

    document.addEventListener("keydown", handler);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = previous;
    };
  }, [selectedReport, closeModal]);

  const handleSearch = async (event) => {
    event?.preventDefault();

    const query = text(labNumberInput);

    if (!query) {
      setError("Please enter a Lab Number.");
      setWorkspace({ results: [] });
      setSearchedLabNumber("");
      return;
    }

    setSearchedLabNumber(query);
    setSelectedReport(null);
    setSuccess("");
    await load({ requestedLab: query, requestedSearch: search });
  };

  const handleReset = async () => {
    setLabNumberInput("");
    setSearchedLabNumber("");
    setSearch("");
    setStatusFilter("all");
    setDepartmentFilter("all");
    setTypeFilter("all");
    setSelectedReport(null);
    setWorkspace({ results: [] });
    setError("");
    setSuccess("");
  };

  const handleRefresh = async () => {
    if (!searchedLabNumber) return;
    await load({ requestedLab: searchedLabNumber, requestedSearch: search });
  };

  const performStatusAction = async (nextStatus) => {
    if (!selectedReport) return;

    const current = reportStatus(selectedReport);

    if (nextStatus === "verified" && current !== "entered") {
      setError("Only an Entered report can be verified.");
      return;
    }
    if (nextStatus === "authorized" && current !== "verified") {
      setError("Only a Verified report can be authorized.");
      return;
    }
    if (nextStatus === "released" && current !== "authorized") {
      setError("Only an Authorized report can be released.");
      return;
    }

    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      /*
        Apply the workflow transition to every saved row in the report.
        This is essential for grouped Chemistry/Hematology/Endocrine
        single-test reports so the report remains internally consistent.
      */
      const transitionPayload =
        nextStatus === "verified"
          ? { result_status: "Verified" }
          : nextStatus === "authorized"
          ? { authorization_status: "Authorized" }
          : nextStatus === "released"
          ? { release_status: "Released" }
          : {};

      await Promise.all(
        selectedReport.items.map((row) =>
          updateLaboratoryResult(row.id, transitionPayload)
        )
      );

      // =====================================================
      // WHATSAPP RESULT RELEASE NOTIFICATION
      // -----------------------------------------------------
      // Only fire when the workflow actually transitions to
      // Released. Notification failure must not roll back a
      // successfully released laboratory report.
      // =====================================================
      if (nextStatus === "released") {
        try {
          const firstRow = selectedReport.items?.[0] || {};
          const selectedLabNumber =
            text(selectedReport.lab_number || firstRow.lab_number || "");
          const selectedRegistrationNumber =
            text(selectedReport.registration_number || firstRow.registration_number || "");

          let registration = null;

          if (selectedRegistrationNumber) {
            const { data } = await supabase
              .from("registrations")
              .select("*")
              .eq("registration_number", selectedRegistrationNumber)
              .maybeSingle();
            registration = data || null;
          }

          if (!registration && selectedLabNumber) {
            const { data } = await supabase
              .from("registrations")
              .select("*")
              .eq("lab_number", selectedLabNumber)
              .maybeSingle();
            registration = data || null;
          }

          const patientPhone =
            text(
              registration?.phone ||
              firstRow.phone ||
              firstRow.patient_phone ||
              selectedReport.patient_phone ||
              ""
            );

          const patientName =
            text(
              registration?.full_name ||
              firstRow.patient_name ||
              firstRow.full_name ||
              selectedReport.patient_name ||
              "Patient"
            );

          if (patientPhone) {
            const reportTitle =
              text(
                selectedReport.title ||
                `${selectedReport.department || "Laboratory"} ${pretty(selectedReport.presentation || "")} Results`
              );

            const { data: whatsappData, error: whatsappError } =
              await supabase.functions.invoke(
                "send-registration-whatsapp",
                {
                  body: {
                    event_type: "result_released",
                    registration_id: registration?.id || firstRow.registration_id || null,
                    patient_name: patientName,
                    phone: patientPhone,
                    lab_number: selectedLabNumber,
                    registration_number: selectedRegistrationNumber,
                    access_code: registration?.access_code || firstRow.access_code || "",
                    report_name: reportTitle || "Laboratory Result",
                  },
                }
              );

            if (whatsappError) {
              console.warn(
                "Result released, but WhatsApp notification failed:",
                whatsappError
              );
            } else {
              console.log(
                "WhatsApp released-result notification:",
                whatsappData
              );
            }
          } else {
            console.warn(
              "Result released, but no patient WhatsApp number was available."
            );
          }
        } catch (whatsappError) {
          console.warn(
            "Result released, but WhatsApp notification could not be sent:",
            whatsappError
          );
        }
      }

      const refreshedWorkspace = await load({
        requestedLab: searchedLabNumber,
        requestedSearch: search,
      });

      const refreshedRows = Array.isArray(refreshedWorkspace?.results)
        ? refreshedWorkspace.results.filter(hasSavedResult)
        : [];

      const refreshed = buildReports(refreshedRows).find(
        (report) => report.key === selectedReport.key
      );

      if (refreshed) {
        setSelectedReport(refreshed);
      } else {
        setSelectedReport(null);
      }

      setSuccess(`${selectedReport.title || `${selectedReport.department} ${pretty(selectedReport.presentation)} Results`} marked as ${statusLabel(nextStatus)}.`);
    } catch (err) {
      console.error("[LaboratoryResultDashboard] workflow action failed:", err);
      setError(err?.message || `Unable to mark report as ${statusLabel(nextStatus)}.`);
    } finally {
      setActionLoading(false);
    }
  };

const prepareA4PrintSurface = async () => {
  await new Promise((resolve) =>
    requestAnimationFrame(() =>
      requestAnimationFrame(resolve)
    )
  );

  const printArea = document.getElementById("pefa-result-print-area");
  const reportDocument = printArea?.querySelector(".pefa-report-document");

  if (!printArea || !reportDocument) {
    throw new Error("The A4 report surface is not ready.");
  }

  /*
   * IMPORTANT:
   * Do NOT use CSS zoom here.
   *
   * The previous implementation scaled the entire 210mm report down
   * when its content height exceeded an arbitrary pixel threshold.
   * That also reduced the report width and caused the narrow,
   * left-sided Browser Print Preview shown in the screenshot.
   *
   * The report now stays at its true A4 width and is allowed to
   * flow naturally to another page when the content requires it.
   */
  reportDocument.style.zoom = "1";

  await new Promise((resolve) =>
    requestAnimationFrame(resolve)
  );

  return { printArea, reportDocument };
};

  const handlePrint = async () => {
    if (!selectedReport || !canPrint) {
      setError("Only an Authorized or Released report can be printed.");
      return;
    }

    setPrintBusy(true);
    setError("");

    try {
      /* The print surface is mounted only while printBusy is true.
       * Therefore it must be queried AFTER React has rendered it. */
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

     const { printArea } = await prepareA4PrintSurface();

document.body.classList.add("pefa-printing-result");
printArea.classList.add("pefa-active-result-print");

      await new Promise((resolve) => requestAnimationFrame(resolve));
      window.print();
    } catch (err) {
      console.error("[LaboratoryResultDashboard] print failed:", err);
      const printArea = document.getElementById("pefa-result-print-area");
      printArea?.classList.remove("pefa-active-result-print");
      document.body.classList.remove("pefa-printing-result");
      setPrintBusy(false);
      setError(err?.message || "Unable to print laboratory report.");
    }
  };

  useEffect(() => {
    const cleanupPrintSurface = () => {
      const printArea = document.getElementById("pefa-result-print-area");
      printArea?.classList.remove("pefa-active-result-print");
      document.body.classList.remove("pefa-printing-result");
      setPrintBusy(false);
    };

    window.addEventListener("afterprint", cleanupPrintSurface);
    return () => window.removeEventListener("afterprint", cleanupPrintSurface);
  }, []);

  const handleDownload = async () => {
    if (!selectedReport || !canPrint) {
      setError("Only an Authorized or Released report can be downloaded.");
      return;
    }

    setPrintBusy(true);
    setError("");

    try {
      /*
       * The PDF target is mounted only while printBusy is true.
       * Wait for React to commit the report and for its layout/images to settle.
       */
      await new Promise((resolve) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(resolve)
        )
      );

      const printArea = document.getElementById("pefa-result-print-area");
      const reportDocument = printArea?.querySelector(".pefa-report-document");

      if (!printArea || !reportDocument) {
        throw new Error("The A4 report surface is not ready.");
      }

      /*
       * IMPORTANT:
       * .pefa-print-surface is intentionally hidden/off-screen for normal
       * dashboard use. html2canvas must NOT capture that hidden parent.
       *
       * The export class temporarily exposes the complete A4 surface.
       */
      printArea.classList.add("pefa-active-result-print");
      document.body.classList.add("pefa-pdf-exporting");

      await new Promise((resolve) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(resolve)
        )
      );

      /*
       * Capture the actual report document, not the hidden dashboard wrapper.
       * This prevents the previous blank-PDF problem caused by opacity:0 and
       * left:-100000px on .pefa-print-surface.
       */
      const module = await import("html2pdf.js");
      const html2pdf = module?.default || module;

      if (typeof html2pdf !== "function") {
        throw new Error(
          "PDF engine could not be loaded. Install html2pdf.js."
        );
      }

      const safePart = (value, fallback) =>
        text(value)
          .replace(/[^a-z0-9]+/gi, "_")
          .replace(/^_+|_+$/g, "")
          .slice(0, 90) || fallback;

      const safeLab = safePart(
        selectedReport.lab_number,
        "PEFA-Laboratory"
      );

      const selectedPatient = getReportPatient(
        selectedReport.items?.[0] || {},
        selectedReport
      );

      const safePatient = safePart(
        selectedPatient.full_name,
        "Patient"
      );

      const safeTest = safePart(
        selectedReport.title ||
          `${selectedReport.department || "Laboratory"}-${selectedReport.presentation || "Results"}`,
        "Report"
      );

      const reportWidth = Math.max(
        reportDocument.scrollWidth || reportDocument.offsetWidth || 794,
        794
      );

      const reportHeight = Math.max(
        reportDocument.scrollHeight || reportDocument.offsetHeight || 1123,
        1123
      );

      await html2pdf()
        .set({
          margin: 0,
          filename: `${safeLab}_${safePatient}_${safeTest}.pdf`,
          image: {
            type: "jpeg",
            quality: 0.98,
          },
          html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            backgroundColor: "#ffffff",
            logging: false,
            scrollX: 0,
            scrollY: 0,
            windowWidth: Math.max(1200, reportWidth),
            windowHeight: Math.max(reportHeight, 1123),
          },
          pagebreak: {
            mode: ["css", "legacy"],
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
            compress: true,
          },
        })
        .from(reportDocument)
        .save();

      setSuccess("Laboratory report PDF downloaded successfully.");
    } catch (err) {
      console.error("[LaboratoryResultDashboard] PDF ERROR:", err);
      setError(
        err?.message || "Unable to generate the laboratory report PDF."
      );
    } finally {
      document.body.classList.remove("pefa-pdf-exporting");

      const printArea = document.getElementById("pefa-result-print-area");
      printArea?.classList.remove("pefa-active-result-print");

      setPrintBusy(false);
    }
  };

  const getSelectedPatientContact = () => {
    const row = selectedReport?.items?.[0] || {};
    const patient = getReportPatient(row, selectedReport || {});
    return {
      name: text(patient?.full_name || patient?.name || selectedReport?.patient_name || "Patient"),
      email: text(
        patient?.email ||
        row?.patient_email ||
        row?.email ||
        selectedReport?.patient_email ||
        ""
      ),
      phone: text(
        patient?.phone ||
        patient?.phone_number ||
        row?.patient_phone ||
        row?.phone ||
        selectedReport?.patient_phone ||
        ""
      ),
    };
  };

  const openShare = (type) => {
    if (!selectedReport || !canPrint) {
      setError("Only an Authorized or Released report can be shared.");
      return;
    }

    const contact = getSelectedPatientContact();
    setShareType(type);
    setShareRecipient(type === "email" ? contact.email : contact.phone);
    setShareOpen(true);
    setError("");
  };

  const buildShareMessage = () => {
    const contact = getSelectedPatientContact();
    const lab = text(selectedReport?.lab_number || "");
    const title = text(selectedReport?.title || "Laboratory Result");
    return `Dear ${contact.name || "Patient"},\n\nYour PEFA Medical Diagnostic Services laboratory result is ready.\n\nLab Number: ${lab || "—"}\nReport: ${title}\n\nPlease contact PEFA Medical Diagnostic Services if you require assistance with accessing your report.\n\nPEFA Medical Diagnostic Services\nLeading the Way in Medical Excellence`;
  };

  const handleShareSubmit = () => {
    if (!selectedReport || !canPrint) {
      setError("Only an Authorized or Released report can be shared.");
      return;
    }

    const recipient = text(shareRecipient);
    if (!recipient) {
      setError(shareType === "email" ? "Enter the patient's email address." : "Enter the patient's WhatsApp number.");
      return;
    }

    const message = buildShareMessage();

    if (shareType === "email") {
      const subject = `PEFA Laboratory Result - ${text(selectedReport.lab_number || "")}`;
      window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
      setSuccess("Email compose window opened. Review the recipient and send the result from your email application.");
    } else {
      const digits = recipient.replace(/[^0-9]/g, "");
      if (digits.length < 10) {
        setError("Enter a valid WhatsApp number with country code, e.g. 2348012345678.");
        return;
      }
      window.open(`https://wa.me/${digits}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
      setSuccess("WhatsApp opened with the laboratory-result message ready to send.");
    }

    setShareOpen(false);
  };

  const openEntry = () => {
    if (!selectedReport) return;
    navigate(
      `/laboratory-result-entry?lab_number=${encodeURIComponent(
        selectedReport.lab_number || ""
      )}`
    );
  };

  return (
    <div className="pefa-result-dashboard">
      <header className="pefa-dashboard-header">
        <div className="pefa-brand">
          <div className="pefa-brand-mark"><FlaskConical size={22} /></div>
          <div>
            <div className="pefa-eyebrow">PEFA LABORATORY</div>
            <h1>Result Dashboard</h1>
            <p>Review, verify, authorize, release and print saved laboratory reports.</p>
          </div>
        </div>

        <button className="pefa-btn pefa-btn--ghost" type="button" onClick={handleRefresh} disabled={loading || !searchedLabNumber}>
          {loading ? <Loader2 size={17} className="pefa-spin" /> : <RefreshCw size={17} />}
          Refresh
        </button>
      </header>

      <form className="pefa-search-panel" onSubmit={handleSearch}>
        <div className="pefa-search-field pefa-search-field--lab">
          <label htmlFor="pefa-lab-number">Lab Number</label>
          <div className="pefa-input-wrap">
            <FlaskConical size={17} />
            <input
              id="pefa-lab-number"
              value={labNumberInput}
              onChange={(e) => setLabNumberInput(e.target.value)}
              placeholder="Enter Lab Number e.g. LAB260872"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="pefa-search-field pefa-search-field--wide">
          <label htmlFor="pefa-result-search">Search within reports</label>
          <div className="pefa-input-wrap">
            <Search size={17} />
            <input
              id="pefa-result-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Patient, test, panel, department..."
            />
          </div>
        </div>

        <button className="pefa-btn pefa-btn--primary" type="submit" disabled={loading}>
          {loading ? <Loader2 size={17} className="pefa-spin" /> : <Search size={17} />}
          Search
        </button>

        <button className="pefa-btn pefa-btn--ghost" type="button" onClick={handleReset} disabled={loading}>
          Reset
        </button>
      </form>

      {(error || success) && (
        <div className={`pefa-alert ${error ? "pefa-alert--error" : "pefa-alert--success"}`}>
          {error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{error || success}</span>
          <button type="button" onClick={() => { setError(""); setSuccess(""); }} aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      )}

      <section className="pefa-summary-grid">
        {[
          ["all", "Reports", summary.total, FileText],
          ["entered", "Entered", summary.entered, FileText],
          ["verified", "Verified", summary.verified, ShieldCheck],
          ["authorized", "Authorized", summary.authorized, LockKeyhole],
          ["released", "Released", summary.released, CheckCircle2],
        ].map(([value, label, count, Icon]) => (
          <button
            key={value}
            type="button"
            className={`pefa-summary-card ${statusFilter === value ? "is-active" : ""}`}
            onClick={() => setStatusFilter(value)}
          >
            <span className="pefa-summary-icon"><Icon size={17} /></span>
            <span className="pefa-summary-copy"><small>{label}</small><strong>{count}</strong></span>
          </button>
        ))}
      </section>

      <section className="pefa-results-shell">
        <div className="pefa-results-toolbar">
          <div>
            <div className="pefa-eyebrow">SAVED REPORTS</div>
            <h2>{searchedLabNumber ? `Laboratory Reports · ${searchedLabNumber}` : "Laboratory Reports"}</h2>
            <p>Panels and special reports stay independent. Single quantitative and qualitative tests are grouped by department.</p>
          </div>

          <div className="pefa-toolbar-filters">
            <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} aria-label="Department">
              <option value="all">All Departments</option>
              {departments.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>

            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label="Report type">
              <option value="all">All Report Types</option>
              <option value="panel">Panel</option>
              <option value="special">Special</option>
              <option value="quantitative">Quantitative Singles</option>
              <option value="qualitative">Qualitative Singles</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="pefa-empty-state">
            <Loader2 size={30} className="pefa-spin" />
            <h3>Loading saved reports</h3>
            <p>Preparing the report workspace...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="pefa-empty-state">
            <FileText size={34} />
            <h3>{searchedLabNumber ? "No saved reports found" : "Search a Lab Number"}</h3>
            <p>{searchedLabNumber ? "No saved result matches the current filters." : "Enter a Lab Number above to load its saved laboratory reports."}</p>
          </div>
        ) : (
          <div className="pefa-report-list">
            {filteredReports.map((report) => {
              const s = reportStatus(report);
              return (
                <article className="pefa-report-card" key={report.id}>
                  <div className="pefa-report-accent" />
                  <div className="pefa-report-main">
                    <div className="pefa-report-topline">
                      <div className="pefa-report-title-wrap">
                        <span className={`pefa-type-badge pefa-type-badge--${report.presentation}`}>
                          {pretty(report.presentation)}
                        </span>
                        <span className={`pefa-status pefa-status--${s}`}>
                          {s === "released" && <CheckCircle2 size={13} />}
                          {s === "verified" && <ShieldCheck size={13} />}
                          {s === "authorized" && <LockKeyhole size={13} />}
                          {statusLabel(s)}
                        </span>
                      </div>
                      <span className="pefa-report-date">{formatDateTime(timestamp(report.latest))}</span>
                    </div>

                    <h3>{report.title || `${report.department} ${pretty(report.presentation)} Results`}</h3>

                    <div className="pefa-report-meta">
                      <span><strong>{report.department}</strong></span>
                      <span>{report.resultCount} saved value{report.resultCount === 1 ? "" : "s"}</span>
                      <span>Lab: <strong>{report.lab_number || "—"}</strong></span>
                    </div>

                    <div className="pefa-patient-line">
                      <div className="pefa-mini-avatar"><Users size={15} /></div>
                      <div>
                        <strong>{report.patient_name}</strong>
                        <span>ID: {report.patient_id || "—"} · Registration: {report.registration_number || "—"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pefa-report-action">
                    <button type="button" className="pefa-view-btn" onClick={() => setSelectedReport(report)}>
                      <Eye size={16} />
                      View Report
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {selectedReport && typeof document !== "undefined" && createPortal(
        <div className="pefa-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <section className="pefa-modal" role="dialog" aria-modal="true" aria-labelledby="pefa-result-title">
            <header className="pefa-modal-header">
              <div>
                <div className="pefa-eyebrow">SAVED RESULT REVIEW</div>
                <h2 id="pefa-result-title">{selectedReport.title || `${selectedReport.department} ${pretty(selectedReport.presentation)} Results`}</h2>
                <p>{selectedReport.department} · {pretty(selectedReport.presentation)} report</p>
              </div>
              <button type="button" className="pefa-modal-close" onClick={closeModal}><X size={20} /></button>
            </header>

            <div className="pefa-modal-body">
              <PatientSummary report={selectedReport} />

              <div className="pefa-modal-status">
                <span className={`pefa-status pefa-status--${selectedStatus}`}>{statusLabel(selectedStatus)}</span>
                <span>Last updated {formatDateTime(timestamp(selectedReport.latest))}</span>
              </div>

              <section className="pefa-result-section">
                <div className="pefa-section-heading">
                  <FileCheck2 size={18} />
                  <div>
                    <small>SAVED LABORATORY REPORT</small>
                    <strong>{selectedReport.title || `${selectedReport.department} ${pretty(selectedReport.presentation)} Results`}</strong>
                  </div>
                </div>

                <div id="laboratory-result-report-preview" className="pefa-modal-report-preview">
                  <SavedReportPreview report={selectedReport} printMode="full" staffDirectory={staffDirectory} />
                </div>
              </section>

              <section className="pefa-workflow">
                <div className="pefa-section-heading">
                  <ShieldCheck size={18} />
                  <div><small>REPORTING WORKFLOW</small><strong>Verify → Authorize → Release</strong></div>
                </div>

                <div className="pefa-workflow-track">
                  {[
                    ["entered", "Entered"],
                    ["verified", "Verified"],
                    ["authorized", "Authorized"],
                    ["released", "Released"],
                  ].map(([stage, label], index) => (
                    <div key={stage} className={statusRank[selectedStatus] >= statusRank[stage] ? "is-complete" : ""}>
                      <span>{index + 1}</span>
                      <label>{label}</label>
                    </div>
                  ))}
                </div>
              </section>

              <div className="pefa-action-row">
                <button className="pefa-action pefa-action--verify" type="button" onClick={() => performStatusAction("verified")} disabled={actionLoading || !canVerify}>
                  {actionLoading ? <Loader2 size={16} className="pefa-spin" /> : <ShieldCheck size={16} />} Verify
                </button>
                <button className="pefa-action pefa-action--authorize" type="button" onClick={() => performStatusAction("authorized")} disabled={actionLoading || !canAuthorize}>
                  {actionLoading ? <Loader2 size={16} className="pefa-spin" /> : <LockKeyhole size={16} />} Authorize
                </button>
                <button className="pefa-action pefa-action--release" type="button" onClick={() => performStatusAction("released")} disabled={actionLoading || !canRelease}>
                  {actionLoading ? <Loader2 size={16} className="pefa-spin" /> : <UnlockKeyhole size={16} />} Release
                </button>
              </div>

              <section className="pefa-output-panel">
                <div>
                  <label htmlFor="pefa-print-mode">Report Format</label>
                  <select id="pefa-print-mode" value={printMode} onChange={(e) => setPrintMode(e.target.value)} disabled={printBusy}>
                    <option value="preprinted">Pre-printed Letterhead</option>
                    <option value="full">Full Digital Letterhead</option>
                  </select>
                  <small>
                    Pre-printed uses the physical PEFA letterhead. Full Digital renders the complete digital letterhead.
                  </small>
                </div>

                <div className="pefa-output-buttons">
                  <button type="button" className="pefa-btn pefa-btn--ghost" onClick={handleDownload} disabled={!canPrint || printBusy}>
                    <Download size={16} /> Download
                  </button>
                  <button type="button" className="pefa-btn pefa-btn--ghost" onClick={() => openShare("email")} disabled={!canPrint || printBusy}>
                    <Mail size={16} /> Email Result
                  </button>
                  <button type="button" className="pefa-btn pefa-btn--ghost" onClick={() => openShare("whatsapp")} disabled={!canPrint || printBusy}>
                    <MessageCircle size={16} /> WhatsApp
                  </button>
                  <button type="button" className="pefa-btn pefa-btn--primary" onClick={handlePrint} disabled={!canPrint || printBusy}>
                    {printBusy ? <Loader2 size={16} className="pefa-spin" /> : <Printer size={16} />}
                    Print Report
                  </button>
                </div>
              </section>

              {shareOpen && (
                <div className="pefa-share-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setShareOpen(false); }}>
                  <section className="pefa-share-modal" role="dialog" aria-modal="true" aria-labelledby="pefa-share-title">
                    <div className="pefa-share-modal-head">
                      <div>
                        <small>SEND LABORATORY RESULT</small>
                        <h3 id="pefa-share-title">{shareType === "email" ? "Email Result" : "WhatsApp Result"}</h3>
                      </div>
                      <button type="button" onClick={() => setShareOpen(false)} aria-label="Close"><X size={18} /></button>
                    </div>

                    <div className="pefa-share-summary">
                      <strong>{getSelectedPatientContact().name}</strong>
                      <span>Lab No: {selectedReport?.lab_number || "—"}</span>
                      <span>{selectedReport?.title || "Laboratory Result"}</span>
                    </div>

                    <label className="pefa-share-label" htmlFor="pefa-share-recipient">
                      {shareType === "email" ? "Patient Email Address" : "Patient WhatsApp Number"}
                    </label>
                    <input
                      id="pefa-share-recipient"
                      className="pefa-share-input"
                      value={shareRecipient}
                      onChange={(e) => setShareRecipient(e.target.value)}
                      placeholder={shareType === "email" ? "patient@example.com" : "2348012345678"}
                      type={shareType === "email" ? "email" : "tel"}
                      autoFocus
                    />

                    <div className="pefa-share-notice">
                      <strong>Secure sharing notice</strong>
                      <span>This action opens your email application or WhatsApp with a pre-filled message. The result PDF is not automatically attached in this first version.</span>
                    </div>

                    <div className="pefa-share-actions">
                      <button type="button" className="pefa-btn pefa-btn--ghost" onClick={() => setShareOpen(false)}>Cancel</button>
                      <button type="button" className="pefa-btn pefa-btn--primary" onClick={handleShareSubmit}>
                        {shareType === "email" ? <Mail size={16} /> : <MessageCircle size={16} />}
                        {shareType === "email" ? "Open Email" : "Open WhatsApp"}
                      </button>
                    </div>
                  </section>
                </div>
              )}

              <div className="pefa-entry-link">
                <button type="button" onClick={openEntry}>
                  <FileText size={15} /> Open Result Entry
                </button>
              </div>
            </div>
          </section>
        </div>,
        document.body
      )}

      {/*
        The print/download surface is mounted ONLY while an output
        operation is active. Keeping it out of the normal DOM prevents
        the complete report from appearing underneath the review modal
        as a duplicate.
      */}
      {selectedReport && printBusy && (
        <div id="pefa-result-print-area" className="pefa-print-surface" aria-hidden="true">
          <div className="pefa-print-a4">
            <PEFAReportShell
              report={selectedReport}
              printMode={printMode === "preprinted" ? "record" : "full"}
              staffDirectory={staffDirectory}
            />
          </div>
        </div>
      )}

      <footer className="pefa-dashboard-footer">
        <span>PEFA LABORATORY · RESULT DASHBOARD</span>
        <span>View → Verify → Authorize → Release → Print</span>
      </footer>
    </div>
  );
}


// Shared report renderer exports: Patient Result Portal uses the exact same report shell
// and report-building rules as the Result Dashboard.
export { PEFAReportShell, SavedReportPreview, buildReports };
