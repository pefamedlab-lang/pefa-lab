import React from "react";
import "./printing.css";

/*
 * PEFA ENTERPRISE LIS
 * FORMAL RESULT RENDERER
 *
 * CONTENT ONLY — the dashboard owns the report shell.
 *
 * Universal quantitative / hematology / chemistry table:
 * PARAMETER / TEST | RESULT | UNIT | REFERENCE RANGE | FLAG
 *
 * Reference range rule:
 *   1. Patient age/sex is resolved from the report/row.
 *   2. Child range is used for patients < 18 when configured.
 *   3. Elderly range is used for patients >= 65 when configured.
 *   4. Adult female/male range is then selected.
 *   5. A combined registered reference string is parsed by sex/age.
 *   6. Generic reference_value/reference_range is only the final fallback.
 *
 * The renderer NEVER displays the entire laboratory_results row as JSON.
 */

const text = (value) => String(value ?? "").trim();
const normalize = (value) => text(value).replace(/[_-]+/g, " ").replace(/\s+/g, " ").toLowerCase();
const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

const first = (...values) => {
  for (const value of values) {
    if (value !== null && value !== undefined && text(value) !== "") return value;
  }
  return "";
};

const pretty = (value) => text(value).replace(/[_-]+/g, " ").replace(/\s+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const parseObject = (value) => {
  if (isObject(value)) return value;
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

const cellValue = (value) => {
  if (value === null || value === undefined || text(value) === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return text(value);
};

const hasResultValue = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (typeof value === "number" || typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.length > 0;
  if (isObject(value)) {
    return [value.value, value.result, value.result_value, value.resultValue, value.finding, value.organism]
      .some((item) => hasResultValue(item));
  }
  return text(value) !== "";
};

const flagClass = (flag) => {
  const f = normalize(flag);
  if (["high", "h", "critical high", "positive", "abnormal high"].includes(f)) return "pefa-result-flag pefa-result-flag--high";
  if (["low", "l", "critical low", "negative", "abnormal low"].includes(f)) return "pefa-result-flag pefa-result-flag--low";
  if (["critical", "panic", "critical value"].includes(f)) return "pefa-result-flag pefa-result-flag--critical";
  return "pefa-result-flag";
};

/* ---------------------------------------------------------
 * PATIENT DEMOGRAPHICS
 * --------------------------------------------------------- */

const getRawResult = (row) => first(
  row?.result,
  row?.result_value,
  row?.resultValue,
  row?.result_numeric,
  row?.value
);

const getDemographics = (report, rows) => {
  const firstRow = rows?.[0] || {};
  const reportPatient = report?.patient || {};
  const rowPatient = firstRow?.patient || {};

  const sex = first(
    report?.sex,
    report?.gender,
    reportPatient?.sex,
    reportPatient?.gender,
    firstRow?.sex,
    firstRow?.gender,
    rowPatient?.sex,
    rowPatient?.gender
  );

  const ageValue = first(
    report?.age,
    reportPatient?.age,
    firstRow?.age,
    firstRow?.age_years,
    rowPatient?.age,
    rowPatient?.age_years
  );

  const dob = first(
    report?.dob,
    report?.date_of_birth,
    reportPatient?.dob,
    reportPatient?.date_of_birth,
    firstRow?.dob,
    firstRow?.date_of_birth,
    rowPatient?.dob,
    rowPatient?.date_of_birth
  );

  const referenceDate = first(
    report?.report_date,
    report?.report_date_time,
    reportPatient?.report_date,
    firstRow?.report_date,
    firstRow?.released_at,
    firstRow?.updated_at,
    new Date().toISOString()
  );

  let age = Number(ageValue);
  if (!Number.isFinite(age) && dob) {
    const birth = new Date(dob);
    const ref = new Date(referenceDate);
    if (!Number.isNaN(birth.getTime()) && !Number.isNaN(ref.getTime())) {
      age = ref.getUTCFullYear() - birth.getUTCFullYear();
      const beforeBirthday =
        ref.getUTCMonth() < birth.getUTCMonth() ||
        (ref.getUTCMonth() === birth.getUTCMonth() && ref.getUTCDate() < birth.getUTCDate());
      if (beforeBirthday) age -= 1;
    }
  }

  return {
    sex: normalize(sex),
    age: Number.isFinite(age) ? age : null,
    dob,
  };
};

/* ---------------------------------------------------------
 * REFERENCE RANGE ENGINE
 * --------------------------------------------------------- */

const referenceFields = (source = {}) => ({
  male: first(source?.male_range, source?.maleRange, source?.male_reference_range, source?.maleReferenceRange),
  female: first(source?.female_range, source?.femaleRange, source?.female_reference_range, source?.femaleReferenceRange),
  child: first(source?.child_range, source?.childRange, source?.pediatric_range, source?.pediatricRange),
  elderly: first(source?.elderly_range, source?.elderlyRange, source?.geriatric_range, source?.geriatricRange),
  generic: first(source?.reference_value, source?.referenceValue, source?.reference_range, source?.referenceRange),
});

const cleanRangeLabel = (value) => text(value).replace(/^\s*[:\-–—]\s*/, "").trim();

const parseEmbeddedReference = (reference, { sex, age }) => {
  const raw = text(reference);
  if (!raw) return "";

  /* Common registered form: Male: 13 - 17; Female: 12 - 15 */
  const extract = (label) => {
    const expression = new RegExp(`${label}\\s*[:\\-]\\s*([^;|]+)`, "i");
    const match = raw.match(expression);
    return match ? cleanRangeLabel(match[1]) : "";
  };

  if (age !== null && age < 18) {
    const child = extract("(?:child|children|pediatric|paediatric)");
    if (child) return child;
  }

  if (age !== null && age >= 65) {
    const elderly = extract("(?:elderly|geriatric)");
    if (elderly) return elderly;
  }

  if (sex === "male" || sex === "m") {
    const male = extract("male");
    if (male) return male;
  }

  if (sex === "female" || sex === "f") {
    const female = extract("female");
    if (female) return female;
  }

  return "";
};

const resolveReferenceRange = (parameter, demographics) => {
  const fields = referenceFields(parameter);
  const { sex, age } = demographics || {};

  /* Age-specific ranges have priority over adult sex ranges. */
  if (age !== null && age !== undefined && age < 18 && fields.child) return fields.child;
  if (age !== null && age !== undefined && age >= 65 && fields.elderly) return fields.elderly;

  if ((sex === "female" || sex === "f") && fields.female) return fields.female;
  if ((sex === "male" || sex === "m") && fields.male) return fields.male;

  const embedded = parseEmbeddedReference(fields.generic, demographics);
  if (embedded) return embedded;

  return fields.generic;
};

const findMetadataMatch = (parameter, metadata = []) => {
  if (!Array.isArray(metadata) || !metadata.length) return null;

  const parameterName = normalize(first(
    parameter?.name,
    parameter?.parameter_name,
    parameter?.parameterName,
    parameter?.test_name,
    parameter?.testName,
    parameter?.key
  ));

  const parameterKey = normalize(first(parameter?.key, parameter?.code, parameter?.test_code));

  return metadata.find((item) => {
    const itemName = normalize(first(item?.name, item?.parameter_name, item?.parameterName, item?.test_name, item?.testName));
    const itemKey = normalize(first(item?.key, item?.code, item?.test_code));
    return (parameterKey && itemKey && parameterKey === itemKey) || (parameterName && itemName && parameterName === itemName);
  }) || null;
};

const getPanelMetadata = (source, report) => {
  const metadata = [];
  const pushArray = (value) => {
    if (Array.isArray(value)) metadata.push(...value.filter(Boolean));
  };

  pushArray(source?.panelParameters);
  pushArray(source?.panel_parameters);
  pushArray(source?.panelTests);
  pushArray(source?.panel_tests);
  pushArray(report?.panelParameters);
  pushArray(report?.panel_parameters);
  pushArray(report?.panelTests);
  pushArray(report?.panel_tests);
  pushArray(report?.masterTests);

  return metadata;
};

const getParameterContainer = (source) => {
  if (!source) return null;
  if (isObject(source?.parameters)) return source.parameters;
  if (isObject(source?.parameter_results)) return source.parameter_results;
  if (isObject(source?.parameterResults)) return source.parameterResults;

  const parsed = parseObject(getRawResult(source));
  if (parsed) {
    if (isObject(parsed.parameters)) return parsed.parameters;
    if (isObject(parsed.parameter_results)) return parsed.parameter_results;
    if (isObject(parsed.parameterResults)) return parsed.parameterResults;
  }
  return null;
};

const parameterRowsFromContainer = (container, metadata, demographics) => {
  if (!isObject(container)) return [];

  return Object.entries(container)
    .map(([key, parameter], index) => {
      const objectParameter = isObject(parameter) ? parameter : { value: parameter };
      const master = findMetadataMatch({ ...objectParameter, key }, metadata) || {};
      const merged = { ...master, ...objectParameter };

      const value = first(
        merged?.value,
        merged?.result,
        merged?.result_value,
        merged?.resultValue
      );

      const resolvedReference = resolveReferenceRange(merged, demographics);

      return {
        key: first(merged?.key, key),
        displayOrder: Number(merged?.display_order ?? merged?.displayOrder ?? master?.display_order ?? index + 1),
        name: first(merged?.name, merged?.parameter_name, merged?.parameterName, merged?.test_name, merged?.testName, master?.test_name, key),
        value,
        unit: first(merged?.unit, merged?.result_unit, merged?.resultUnit, master?.unit),
        reference: resolvedReference,
        flag: first(merged?.flag, merged?.result_flag, merged?.resultFlag),
        calculated: Boolean(merged?.calculated || merged?.isCalculated),
      };
    })
    .filter((row) => text(row.name) !== "" && hasResultValue(row.value))
    .sort((a, b) => a.displayOrder - b.displayOrder);
};

const collectPanelRows = (report, rows) => {
  const demographics = getDemographics(report, rows);
  const metadata = getPanelMetadata(rows?.[0], report);
  const candidates = [];

  for (const row of rows || []) {
    const extracted = parameterRowsFromContainer(getParameterContainer(row), metadata, demographics);
    if (extracted.length) candidates.push(...extracted);
  }

  if (!candidates.length) {
    const extracted = parameterRowsFromContainer(getParameterContainer(report), metadata, demographics);
    if (extracted.length) candidates.push(...extracted);
  }

  const seen = new Set();
  return candidates.filter((item) => {
    const key = normalize(item.key || item.name);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/* ---------------------------------------------------------
 * UNIVERSAL TABLE
 * --------------------------------------------------------- */

function UniversalResultTable({ rows }) {
  return (
    <div className="pefa-renderer-table-wrap">
      <table className="pefa-renderer-table">
        <thead>
          <tr>
            <th>PARAMETER / TEST</th>
            <th>RESULT</th>
            <th>UNIT</th>
            <th>REFERENCE RANGE</th>
            <th>FLAG</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.key || row.name}-${index}`}>
              <td><strong>{text(row.name) || "—"}</strong></td>
              <td><strong>{cellValue(row.value)}</strong></td>
              <td>{cellValue(row.unit)}</td>
              <td>{cellValue(row.reference)}</td>
              <td>{text(row.flag) ? <span className={flagClass(row.flag)}>{row.flag}</span> : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const scalarSingleRow = (row, report) => {
  const demographics = getDemographics(report, [row]);
  const metadata = getPanelMetadata(row, report);
  const master = findMetadataMatch(row, metadata) || row?.masterTest || row?.master_test || {};

  return {
    key: row?.id ?? "result",
    name: first(row?.test_name, row?.testName, master?.test_name, row?.test_code, "Laboratory Test"),
    value: getRawResult(row),
    unit: first(row?.unit, row?.result_unit, row?.resultUnit, master?.unit),
    reference: resolveReferenceRange({ ...master, ...row }, demographics),
    flag: first(row?.flag, row?.result_flag, row?.resultFlag),
  };
};

/* ---------------------------------------------------------
 * INTERPRETATION / IMPRESSION
 * --------------------------------------------------------- */

const normalizeFindingText = (value) => normalize(value).replace(/[^a-z0-9%+.\- ]/g, " ").replace(/\s+/g, " ").trim();

const generatedSpecialInterpretation = (kind, rows) => {
  if (kind === "malaria") return null;

  const values = [];
  for (const row of rows || []) {
    const parsed = parseObject(getRawResult(row));
    if (parsed) values.push(parsed);
  }
  if (!values.length) return null;

  if (kind === "urinalysis") {
    const flat = flattenSpecial(values[0]);
    const abnormal = flat.filter((item) => {
      const v = normalizeFindingText(item.value);
      return ["positive", "trace", "+", "++", "+++", "++++", "present", "many", "moderate", "numerous"].some((x) => v === x || v.includes(x));
    });
    const leukocyte = flat.find((x) => /leukocyte|pus cell|wbc/.test(normalizeFindingText(x.label)));
    const nitrite = flat.find((x) => /nitrite/.test(normalizeFindingText(x.label)));
    const blood = flat.find((x) => /blood|rbc|red cell/.test(normalizeFindingText(x.label)));
    const glucose = flat.find((x) => /glucose/.test(normalizeFindingText(x.label)));
    const protein = flat.find((x) => /protein/.test(normalizeFindingText(x.label)));
    const ketone = flat.find((x) => /ketone/.test(normalizeFindingText(x.label)));
    const clues = [];
    if (leukocyte && /positive|trace|present|[1-4]\+/.test(normalizeFindingText(leukocyte.value))) clues.push("pyuria/leukocytes detected");
    if (nitrite && /positive/.test(normalizeFindingText(nitrite.value))) clues.push("nitrite positive");
    if (blood && /positive|trace|present|[1-4]\+/.test(normalizeFindingText(blood.value))) clues.push("haematuria/blood detected");
    if (protein && /positive|trace|[1-4]\+/.test(normalizeFindingText(protein.value))) clues.push("proteinuria detected");
    if (glucose && /positive|trace|[1-4]\+/.test(normalizeFindingText(glucose.value))) clues.push("glycosuria detected");
    if (ketone && /positive|trace|[1-4]\+/.test(normalizeFindingText(ketone.value))) clues.push("ketonuria detected");

    if (clues.length) return {
      interpretation: `Urinalysis demonstrates ${clues.join(", ")}.`,
      impression: "Abnormal urinalysis findings; clinical correlation is advised.",
      clinicalCorrelation: "Correlate with urinary symptoms and other relevant laboratory findings. Consider urine culture where infection is suspected.",
      findings: abnormal.map((x) => `${x.label}: ${x.value}`),
    };

    return {
      interpretation: "No significant abnormality identified from the reported urinalysis parameters.",
      impression: "Urinalysis is essentially unremarkable.",
      clinicalCorrelation: "Interpret in conjunction with clinical findings.",
      findings: [],
    };
  }

  if (kind === "mcs") {
    const flat = flattenSpecial(values[0]);
    const organism = flat.find((x) => /organism|isolate|growth|culture/.test(normalizeFindingText(x.label)) && normalizeFindingText(x.value) !== "no growth");
    const noGrowth = flat.some((x) => /culture|growth/.test(normalizeFindingText(x.label)) && /no growth|no significant growth|sterile/.test(normalizeFindingText(x.value)));
    const sensitive = flat.filter((x) => /sensitive|susceptible/.test(normalizeFindingText(x.label))).map((x) => x.value);
    const resistant = flat.filter((x) => /resistant/.test(normalizeFindingText(x.label))).map((x) => x.value);

    if (noGrowth) return {
      interpretation: "No significant bacterial growth was reported on culture.",
      impression: "Culture negative for significant bacterial growth.",
      clinicalCorrelation: "Correlate with specimen quality, antimicrobial exposure and clinical findings where infection remains suspected.",
      findings: [],
    };

    if (organism) return {
      interpretation: `Growth of ${organism.value} was reported on culture.` + (sensitive.length ? ` Reported susceptible agents include ${sensitive.join(", ")}.` : "") + (resistant.length ? ` Resistance was reported to ${resistant.join(", ")}.` : ""),
      impression: "Significant organism isolated; antimicrobial susceptibility should guide therapy.",
      clinicalCorrelation: "Correlate with clinical findings and antimicrobial susceptibility results before treatment decisions.",
      findings: flat.filter((x) => /organism|isolate|growth|sensitive|susceptible|resistant/.test(normalizeFindingText(x.label))).map((x) => `${x.label}: ${x.value}`),
    };

    return {
      interpretation: "Culture and susceptibility findings are reported as documented.",
      impression: "Refer to the culture and susceptibility findings above.",
      clinicalCorrelation: "Clinical correlation is advised.",
      findings: [],
    };
  }

  return null;
};

const getInterpretationData = (report, rows, generated = null) => {
  const output = {
    interpretation: generated?.interpretation || "",
    impression: generated?.impression || "",
    clinicalCorrelation: generated?.clinicalCorrelation || "",
    findings: Array.isArray(generated?.findings) ? [...generated.findings] : [],
  };

  const consume = (source) => {
    if (!source) return;
    const parsed = parseObject(getRawResult(source)) || {};
    const candidates = [source, parsed, parsed?.interpretation];

    for (const item of candidates) {
      if (!item) continue;
      if (isObject(item?.interpretation)) {
        output.interpretation = first(output.interpretation, item.interpretation.interpretation, item.interpretation.text);
        output.impression = first(output.impression, item.interpretation.impression);
        output.clinicalCorrelation = first(output.clinicalCorrelation, item.interpretation.clinicalCorrelation, item.interpretation.clinical_correlation);
        if (Array.isArray(item.interpretation.findings)) output.findings.push(...item.interpretation.findings);
      } else {
        output.interpretation = first(output.interpretation, typeof item.interpretation === "string" ? item.interpretation : "");
        output.impression = first(output.impression, item.impression);
        output.clinicalCorrelation = first(output.clinicalCorrelation, item.clinicalCorrelation, item.clinical_correlation);
        if (Array.isArray(item.findings)) output.findings.push(...item.findings);
      }
    }
  };

  for (const row of rows || []) consume(row);
  consume(report);

  output.findings = output.findings.filter((item) => text(item) !== "");
  return output;
};

function InterpretationSection({ report, rows, kind = "" }) {
  const data = getInterpretationData(report, rows, generatedSpecialInterpretation(kind, rows));
  if (!data.interpretation && !data.impression && !data.clinicalCorrelation && !data.findings.length) return null;

  return (
    <section className="pefa-renderer-interpretation">
      <div className="pefa-renderer-interpretation-title">INTERPRETATION / IMPRESSION</div>
      {data.interpretation && <div><strong>Interpretation:</strong><span>{data.interpretation}</span></div>}
      {data.impression && <div><strong>Impression:</strong><span>{data.impression}</span></div>}
      {data.clinicalCorrelation && <div><strong>Clinical Correlation:</strong><span>{data.clinicalCorrelation}</span></div>}
      {data.findings.length > 0 && <div><strong>Findings:</strong><span>{data.findings.join(", ")}</span></div>}
    </section>
  );
}

/* ---------------------------------------------------------
 * SPECIAL RESULTS
 * --------------------------------------------------------- */

const hiddenKeys = new Set([
  "id", "registrationid", "registrationnumber", "patientid", "labnumber", "testid", "testcode",
  "testname", "category", "department", "resultstatus", "authorizationstatus", "releasestatus", "createdat",
  "updatedat", "patient", "registration", "tests", "_tests", "editmode", "metadata", "internal",
  "parameters", "parameterresults", "interpretation", "impression", "clinicalcorrelation", "clinicalcorrelation",
]);

function flattenSpecial(value, prefix = "") {
  if (value === null || value === undefined || text(value) === "") return [];
  if (!isObject(value) && !Array.isArray(value)) return [{ label: pretty(prefix || "Result"), value }];
  if (Array.isArray(value)) return value.flatMap((item, index) => flattenSpecial(item, prefix ? `${prefix} ${index + 1}` : `Result ${index + 1}`));

  return Object.entries(value).flatMap(([key, item]) => {
    const normalizedKey = normalize(key).replace(/\s+/g, "");
    if (hiddenKeys.has(normalizedKey)) return [];
    const next = prefix ? `${prefix}.${key}` : key;
    if (isObject(item) || Array.isArray(item)) return flattenSpecial(item, next);
    if (item === null || item === undefined || text(item) === "") return [];
    return [{ label: pretty(key), value: item }];
  });
}

const detectKind = (report, rows) => {
  const source = normalize([
    report?.test_name, report?.testName, report?.panel_name, report?.panelName, report?.title,
    report?.department, rows?.[0]?.test_name, rows?.[0]?.testName, rows?.[0]?.test_code, rows?.[0]?.testCode,
  ].join(" "));

  if (source.includes("malaria parasite") || source.includes("malaria microscopy")) return "malaria";
  if (source.includes("urinalysis") || source.includes("urine routine")) return "urinalysis";
  if (source.includes("widal")) return "widal";
  if (source.includes("blood culture")) return "bloodculture";
  if (source.includes("microscopy culture sensitivity") || source === "mcs" || source.includes("stool mcs")) return "mcs";
  if (source.includes("semen") || source.includes("seminal fluid") || source.includes("sfa")) return "sfa";
  if (source.includes("blood group") || source.includes("abo") || source.includes("rhesus")) return "abo";
  if (source.includes("donor screening")) return "donor";
  if (source.includes("drug screen")) return "drug";
  return "";
};

function SpecialResult({ rows, kind, report }) {
  const panelRows = collectPanelRows(report, rows);
  if (panelRows.length) {
    return (
      <>
        <UniversalResultTable rows={panelRows} />
        {kind !== "malaria" && <InterpretationSection report={report} rows={rows} kind={kind} />}
      </>
    );
  }

  const row = rows?.[0] || {};
  const parsed = parseObject(getRawResult(row));
  const entries = parsed ? flattenSpecial(parsed) : [];
  if (!entries.length) return <UniversalResultTable rows={rows.map((item) => scalarSingleRow(item, report))} />;

  const title = kind === "malaria" ? "MALARIA PARASITE EXAMINATION" :
    kind === "urinalysis" ? "ROUTINE URINALYSIS" :
    kind === "widal" ? "WIDAL TEST" :
    kind === "bloodculture" ? "BLOOD CULTURE" :
    kind === "mcs" ? "MICROSCOPY, CULTURE & SENSITIVITY" :
    kind === "sfa" ? "SEMEN ANALYSIS" :
    kind === "abo" ? "BLOOD GROUP & RHESUS TYPING" :
    kind === "donor" ? "DONOR SCREENING" :
    kind === "drug" ? "DRUG SCREENING" : "SPECIAL LABORATORY RESULT";

  return (
    <>
      <section className="pefa-renderer-special">
        <div className="pefa-renderer-special-title">{title}</div>
        <table className="pefa-renderer-table">
          <thead><tr><th>PARAMETER</th><th>RESULT</th></tr></thead>
          <tbody>{entries.map((entry, index) => <tr key={`${entry.label}-${index}`}><td><strong>{entry.label}</strong></td><td>{cellValue(entry.value)}</td></tr>)}</tbody>
        </table>
      </section>
      <InterpretationSection report={report} rows={rows} kind={kind} />
    </>
  );
}

const isPanelReport = (report, rows) => {
  const source = normalize([
    report?.title, report?.panel_name, report?.panelName, report?.test_name, report?.testName,
    report?.test_code, report?.testCode, report?.department, rows?.[0]?.test_name, rows?.[0]?.test_code,
  ].join(" "));

  return Boolean(getParameterContainer(report)) ||
    (rows || []).some((row) => Boolean(getParameterContainer(row))) ||
    ["lipid profile", "liver function", "lft", "renal function", "rft", "kidney function", "electrolyte",
      "thyroid function", "complete blood count", "cbc", "fbc", "iron profile", "coagulation profile", "hormonal profile"]
      .some((name) => source.includes(name));
};

function FormalResultRenderer({ report = {}, rows: suppliedRows }) {
  const rows = Array.isArray(suppliedRows) ? suppliedRows.filter(Boolean) : Array.isArray(report?.items) ? report.items.filter(Boolean) : [];

  if (!rows.length && !getParameterContainer(report)) {
    return <div className="pefa-results-empty">No saved result values are available for this report.</div>;
  }

  const kind = detectKind(report, rows);
  if (kind) return <SpecialResult rows={rows} kind={kind} report={report} />;

  if (isPanelReport(report, rows)) {
    const panelRows = collectPanelRows(report, rows);
    if (panelRows.length) {
      return (
        <>
          <UniversalResultTable rows={panelRows} />
          <InterpretationSection report={report} rows={rows} />
        </>
      );
    }
  }

  /* Ordinary singles are grouped by the dashboard. Each saved row becomes one table row. */
  const singleRows = rows.flatMap((row) => {
    const structured = parseObject(getRawResult(row));
    if (structured && (isObject(structured.parameters) || isObject(structured.parameter_results) || isObject(structured.parameterResults))) {
      return collectPanelRows(row, [row]);
    }
    const scalar = scalarSingleRow(row, report);
    return hasResultValue(scalar.value) ? [scalar] : [];
  });

  return (
    <>
      <UniversalResultTable rows={singleRows} />
      <InterpretationSection report={report} rows={rows} kind={kind} />
    </>
  );
}

export { FormalResultRenderer };
export default FormalResultRenderer;
