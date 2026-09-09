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
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  UnlockKeyhole,
  Users,
  X,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  getLaboratoryResultWorkspace,
  updateLaboratoryResult,
} from "../../services/laboratory/laboratoryResultService";
import FormalResultRenderer from "../../components/printing/FormalResultRenderer";
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

    const value = firstValue(
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
  const explicitTestType = normalize(
    row?.test_type ||
      row?.testType ||
      row?.masterTest?.test_type ||
      row?.master_test?.test_type ||
      ""
  );
  const explicitIsPanel =
    row?.is_panel === true ||
    row?.isPanel === true ||
    explicitTestType === "panel" ||
    explicitTestType === "profile";
  const explicitIsSingle =
    explicitTestType === "single test" ||
    explicitTestType === "single" ||
    explicitTestType === "individual test";

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
    .filter(hasSavedResult)
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

function getReportPatient(row = {}, report = {}) {
  const first = row || {};
  const pick = (...values) => firstValue(...values) || "—";

  return {
    full_name: pick(first.patient_name, first.patientName, first.full_name, first.patient?.full_name, report.patient_name),
    patient_name: pick(first.patient_name, first.patientName, first.full_name, first.patient?.full_name, report.patient_name),
    patient_id: pick(first.patient_id, first.patientId, first.patient?.patient_id, report.patient_id),
    lab_number: pick(first.lab_number, first.labNumber, first.patient?.lab_number, report.lab_number),
    registration_number: pick(first.registration_number, first.registrationNumber, first.registration?.registration_number, report.registration_number),
    sex: pick(first.sex, first.gender, first.patient?.sex, first.patient?.gender),
    age: pick(
      first.age,
      first.age_years,
      first.patient?.age,
      first.patient?.age_years,
      (() => {
        const dob = firstValue(first.dob, first.date_of_birth, first.patient?.dob, first.patient?.date_of_birth);
        if (!dob) return null;
        const birth = new Date(dob);
        if (Number.isNaN(birth.getTime())) return null;
        const now = new Date();
        let years = now.getFullYear() - birth.getFullYear();
        const beforeBirthday = now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());
        if (beforeBirthday) years -= 1;
        return years >= 0 ? years : null;
      })()
    ),
    branch: pick(first.branch, first.branch_name, first.patient?.branch, first.registration?.branch),
    referring_hospital: pick(first.referring_hospital, first.referral_hospital, first.patient?.referring_hospital, first.registration?.referring_hospital),
    referring_doctor: pick(first.referring_doctor, first.referral_doctor, first.patient?.referring_doctor, first.registration?.referring_doctor),
    registration_date: pick(first.registration_date, first.registered_at, first.registration?.created_at, first.registration?.registration_date),
    sample_collection_date: pick(first.sample_collection_date, first.specimen_collected_at, first.sample_collected_at, first.collected_at),
    report_date: pick(first.report_date, first.released_at, first.updated_at, first.created_at),
    clinical_history: pick(first.clinical_history, first.clinicalHistory, first.patient?.clinical_history, first.registration?.clinical_history),
  };
}

const getSavedRendererInput = (report) => {
  if (!report) return [];

  // Fresh printing contract:
  // the renderer receives the actual saved result rows only.
  // No synthetic [group, ...children] array is created.
  return Array.isArray(report.items)
    ? report.items.filter(Boolean)
    : [];
};

function PEFAReportShell({ report, printMode = "full" }) {
  const rows = report?.items || [];
  const first = rows[0] || {};
  const patient = getReportPatient(first, report);
  const enteredBy = firstValue(first.entered_by, first.enteredBy, report.entered_by, "Laboratory Scientist");
  const authorizedBy = firstValue(first.authorized_by, first.authorizedBy, report.authorized_by, "Chief Medical Laboratory Scientist");
  const releasedBy = firstValue(first.released_by, first.releasedBy, report.released_by, authorizedBy);
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
          <div><label>Registration Date</label><strong>{patient.registration_date}</strong></div>
          <div><label>Sample Collection</label><strong>{patient.sample_collection_date}</strong></div>
          <div><label>Report Date</label><strong>{patient.report_date}</strong></div>
        </div>
        {patient.clinical_history !== "—" && (
          <div className="pefa-clinical-history"><label>Clinical History</label><span>{patient.clinical_history}</span></div>
        )}
      </section>

      <main className="pefa-report-body">
        <div className="pefa-report-heading">
          <span>LABORATORY REPORT</span>
          <h2>{report.title}</h2>
          <small>{report.department} · {pretty(report.presentation)}</small>
        </div>
        <div className="pefa-router-body pefa-formal-renderer-body">
          <FormalResultRenderer
            report={{
              ...report,
              items: getSavedRendererInput(report),
              patient,
              sex: patient.sex,
              age: patient.age,
              dob: patient.dob,
              masterTests: report.masterTests || [],
            }}
            printMode={printMode === "record" ? "preprinted" : "full"}
          />
        </div>
      </main>

      <section className="pefa-report-signatures">
        <div className="pefa-signature-card">
          <div className="pefa-signature-space" />
          <div className="pefa-signature-line" />
          <strong>{enteredBy}</strong>
          <span>RESULT ENTERED BY</span>
        </div>
        <div className="pefa-signature-card">
          <div className="pefa-signature-space" />
          <div className="pefa-signature-line" />
          <strong>{authorizedBy}</strong>
          <span>AUTHORIZED BY</span>
        </div>
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

function SavedReportPreview({ report, printMode = "full" }) {
  if (!report?.items?.length) {
    return (
      <div className="pefa-results-empty">
        <AlertCircle size={18} />
        No saved result values are available for this report.
      </div>
    );
  }

  return <PEFAReportShell report={report} printMode={printMode} />;
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
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [printBusy, setPrintBusy] = useState(false);
  const [printMode, setPrintMode] = useState("preprinted");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const allReports = useMemo(() => buildReports(workspace.results), [workspace.results]);

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

      const printArea = document.getElementById("pefa-result-print-area");
      if (!printArea) throw new Error("The report print surface is not ready.");

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
      /* Wait until the output-only report surface is actually mounted. */
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      const element = document.getElementById("pefa-result-print-area");
      if (!element) throw new Error("The report download area is not ready.");

      /* Give the browser one additional frame to finish QR/image layout. */
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const module = await import("html2pdf.js");
      const html2pdf = module?.default || module;
      if (typeof html2pdf !== "function") throw new Error("PDF engine could not be loaded. Install html2pdf.js.");

      const safeLab = text(selectedReport.lab_number) || "PEFA-Laboratory";
      const safeTitle = text(selectedReport.title || `${selectedReport.department}-${selectedReport.presentation}-Results`)
        .replace(/[^a-z0-9]+/gi, "_")
        .replace(/^_|_$/g, "") || "Report";

      await html2pdf()
        .set({
          margin: 0,
          filename: `${safeLab}-${safeTitle}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            backgroundColor: "#ffffff",
            logging: false,
            scrollX: 0,
            scrollY: 0,
            windowWidth: Math.max(element.scrollWidth || 794, 794),
            windowHeight: Math.max(element.scrollHeight || 1123, 1123),
          },
          pagebreak: { mode: ["css", "legacy"] },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait", compress: true },
        })
        .from(element)
        .save();

      setSuccess("Laboratory report PDF downloaded successfully.");
    } catch (err) {
      console.error("[LaboratoryResultDashboard] PDF ERROR:", err);
      setError(err?.message || "Unable to generate the laboratory report PDF.");
    } finally {
      document.body.classList.remove("pefa-printing-result");
      const element = document.getElementById("pefa-result-print-area");
      element?.classList.remove("pefa-active-result-print");
      setPrintBusy(false);
    }
  };

  const openEntry = () => {
    if (!selectedReport) return;
    navigate(
      `/laboratory/result-entry?lab_number=${encodeURIComponent(
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
                  <SavedReportPreview report={selectedReport} printMode="full" />
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
                  <button type="button" className="pefa-btn pefa-btn--primary" onClick={handlePrint} disabled={!canPrint || printBusy}>
                    {printBusy ? <Loader2 size={16} className="pefa-spin" /> : <Printer size={16} />}
                    Print Report
                  </button>
                </div>
              </section>

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
