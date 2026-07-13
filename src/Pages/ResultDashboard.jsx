import { useState } from "react";

import {
  logActivity
} from "../utils/logActivity";

import ResultTemplateRenderer
from "../components/results/ResultTemplateRenderer";

import {
  routeReports,
} from "../utils/reportRouter";

import {
  Search,
  FileText,
} from "lucide-react";

import {
  supabase,
} from "../supabase";

import {
  logAudit,
} from "../utils/auditLogger";

import "../styles/resultDashboard.css";

export default function ResultDashboard() {

const [
    labNumber,
    setLabNumber,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    patient,
    setPatient,
  ] = useState(null);

  const [
    tests,
    setTests,
  ] = useState([]);

const [
  existingResults,
  setExistingResults,
] = useState([]);

  const [
    reportInfo,
    setReportInfo,
  ] = useState(null);

const [
  selectedTest,
  setSelectedTest,
] = useState(null);

const [
  resultData,
  setResultData,
] = useState({});

const [
  saving,
  setSaving,
] = useState(false);

  const formatDateTime =
    (value) => {

      if (!value)
        return "Pending";

      return new Date(
        value
      ).toLocaleString();
    };

const user = JSON.parse(
  localStorage.getItem(
    "pefa_user"
  ) || "{}"
);

  const searchPatient =
    async () => {

      if (!labNumber) {

        alert(
          "Enter Lab Number"
        );

        return;
      }

      try {

        setLoading(true);

        setPatient(null);
        setTests([]);
        setReportInfo(null);

        const {
          data:
            registration,
          error:
            registrationError,
        } = await supabase

          .from(
            "registrations"
          )

          .select("*")

          .eq(
            "lab_number",
            labNumber
          )

          .single();

        if (
          registrationError
        ) {

          alert(
            "Patient not found"
          );

          setLoading(false);

          return;
        }

        setPatient(
          registration
        );

       const {
  data:
    patientResults,
} = await supabase

  .from(
    "patient_results"
  )

  .select("*")

  .eq(
    "lab_number",
    labNumber
  );

setExistingResults(
  patientResults || []
);

setReportInfo(
  patientResults?.[0] || null
);

        setReportInfo(
          resultData
        );

        let parsedTests =
          [];

        try {

          parsedTests =
            typeof registration.tests ===
            "string"

              ? JSON.parse(
                  registration.tests
                )

              : registration.tests ||
                [];

        } catch {

          parsedTests =
            [];
        }

        const testNames =
          parsedTests.map(
            (item) =>
              item.test_name
          );

        if (
          testNames.length ===
          0
        ) {

          setLoading(false);

          return;
        }

        const {
          data:
            masterTests,
        } = await supabase

          .from(
            "master_tests"
          )

          .select(
  `
  test_name,
  department,
  result_category,
  template_type,
  unit,
  male_range,
  female_range,
  child_range,
  elderly_range
`
)

          .in(
            "test_name",
            testNames
          );

        setTests(
          masterTests || []
        );

        setLoading(false);

      } catch (
        error
      ) {

        console.error(
          error
        );

        alert(
          "Error loading patient"
        );

        setLoading(false);
      }
    };

const hasResult =
(
  testName
) => {

  return existingResults.some(

    result =>

      result.test_type ===
      testName

  );

};

const groupedTests =

  routeReports(

    tests || []

  );

const saveResult =
  async () => {

    if (
      !selectedTest
    ) {

      alert(
        "Select a test"
      );

      return;
    }

console.log(
  JSON.stringify(
    resultData,
    null,
    2
  )
);
  if (

  Object.keys(
    resultData
  ).length === 0

) {

  alert(
    "Enter Result"
  );

  return;
}

    try {

      setSaving(
        true
      );

console.log(
  "PATIENT:",
  patient
);

const {

  data: existingResult,

} = await supabase

  .from(
    "patient_results"
  )

  .select("*")

  .eq(
    "verification_id",

    `${patient.lab_number}-${selectedTest.test_name}`
      .replace(/\s+/g, "")

  )

  .maybeSingle();

if (
  existingResult
) {

  const modify =
    window.confirm(

      "Result already exists.\n\nDo you want to modify it?"

    );

  if (!modify)
    return;

}

let amendmentReason =
  "";

if (
  existingResult
) {

  amendmentReason =
    prompt(
      "Reason for amendment:"
    ) || "";

}


      const payload = {

        lab_number:
          patient.lab_number,

        patient_name:
          patient.full_name,

        sex:
          patient.sex,

        age:
          patient.age,

department:
  selectedTest.department,

        test_type:
          selectedTest.test_name,

template_type:
  selectedTest.template_type,

verification_id:
  `${patient.lab_number}-${selectedTest.test_name}`
    .replace(/\s+/g, ""),

        result:
          resultData,

        reported_at:
          new Date()
            .toISOString(),

        release_status:
          "Pending",

        authorization_status:
          "Pending",

entered_by:
  user?.full_name ||
  user?.name ||
  "Unknown",

      };



 let error;

if (
  existingResult
) {

  const updateResponse =
    await supabase

      .from(
        "patient_results"
      )

     .update({

  ...payload,

  amended: true,

  amended_by:
    user?.full_name ||
    user?.name ||
    "Unknown",

  amended_at:
    new Date()
      .toISOString(),

  amendment_reason:
    amendmentReason,

})

      .eq(
        "id",
        existingResult.id
      );

  error =
    updateResponse.error;

} else {

  const insertResponse =
    await supabase

      .from(
        "patient_results"
      )

      .insert(
        payload
      );

  error =
    insertResponse.error;

}     

console.log(payload);

      if (error) {

        alert(
          error.message
        );

        return;

await logAudit({

  action:
    "SAVE RESULT",

  module:
    "Result Entry",

  description:
    `${patient.lab_number} - ${selectedTest.test_name}`,

});
      }

      alert(
        "Result Saved Successfully"
      );

setPatient(
  null
);

setSelectedTest(
  null
);

setResultData(
  {}
);

await searchPatient();

await logActivity(

  "Result Saved",

  patient.lab_number

);

setResultData({});

    } catch (
      error
    ) {

      console.error(
        error
      );

      alert(
        "Save Failed"
      );

    } finally {

      setSaving(
        false
      );
    }
  };




  return (

    <div className="page">

      {/* HEADER */}

      <div
        className="dashboard-header"
      >

        <h1>
          Result Dashboard
        </h1>

        <p>
          Enterprise Result
          Processing Portal
        </p>

      </div>

      {/* SEARCH */}

      <div
        className="dashboard-card"
      >

        <div
          className="search-row"
        >

          <input
            type="text"
            placeholder="Enter Lab Number"
            value={
              labNumber
            }
            onChange={(e) =>
              setLabNumber(
                e.target.value
              )
            }
          />

          <button
            onClick={
              searchPatient
            }
          >

            <Search
              size={18}
            />

            Search

          </button>

        </div>

      </div>

      {/* LOADING */}

      {loading && (

        <div
          className="dashboard-card"
        >

          Loading...

        </div>

      )}

      {/* PATIENT INFO */}

      {patient && (

        <div
          className="dashboard-card"
        >

          <h2>
            Patient Information
          </h2>

          <div
            className="patient-grid"
          >

            <div className="info-card">

  <strong>
    Lab Number
  </strong>

  <p>
    {patient.lab_number}
  </p>

</div>

            <div>
              <strong>
                Patient Name:
              </strong>

              <p>
                {
                  patient.full_name
                }
              </p>
            </div>

            <div>
              <strong>
                Age:
              </strong>

              <p>
                {
                  patient.age
                }
              </p>
            </div>

            <div>
              <strong>
                Sex:
              </strong>

              <p>
                {
                  patient.sex
                }
              </p>
            </div>

            <div>
              <strong>
                Phone:
              </strong>

              <p>
                {
                  patient.phone
                }
              </p>
            </div>

            <div>
              <strong>
                Hospital:
              </strong>

              <p>
                {
                  patient
                    .hospital_clinic ||
                  "Private"
                }
              </p>
            </div>

            <div>
              <strong>
                Doctor:
              </strong>

              <p>
                {
                  patient
                    .referring_doctor ||
                  "Private"
                }
              </p>
            </div>

            <div>
              <strong>
                Access Code:
              </strong>

              <p>
                {
                  patient
                    .access_code
                }
              </p>
            </div>

            <div>
              <strong>
                Entry Date/Time:
              </strong>

              <p>
                {formatDateTime(
                  patient.created_at
                )}
              </p>
            </div>

            <div>
              <strong>
                Report Date/Time:
              </strong>

              <p>
                {formatDateTime(
                  reportInfo?.reported_at
                )}
              </p>
            </div>

          <div className="clinical-history">

              <strong>
                Clinical
                History:
              </strong>

              <p>
                {
                  patient
                    .clinical_history
                }
              </p>

            </div>

          </div>

        </div>

      )}


   {/* TESTS */}

{tests.length > 0 && (

  <div className="dashboard-card">

    <h2>

      Registered Tests

    </h2>

    <table className="result-table">

      <thead>

        <tr>

          <th>

            Test Name

          </th>

          <th>

            Department

          </th>

          <th>

            Result Category

          </th>

          <th>

            Template Type

          </th>

          <th>

            Status

          </th>

          <th>

            Action

          </th>

        </tr>

      </thead>

      <tbody>

        {/* PANELS */}

        {groupedTests.panels.map(

          (test, index) => (

            <tr key={`panel-${index}`}>

              <td>

                {test.test_name}

              </td>

              <td>

                {test.department}

              </td>

              <td>

                {test.result_category}

              </td>

              <td>

                {test.template_type}

              </td>

              <td>

                {hasResult(
                  test.test_name
                )

                  ? "Reported"

                  : "Pending"}

              </td>

              <td>

                <button

                  className="action-btn"

                  onClick={() =>

                    setSelectedTest(
                      test
                    )

                  }

                >

                  Enter Result

                </button>

              </td>

            </tr>

          )

        )}

        {/* QUALITATIVE */}

        {groupedTests.qualitativeSingles.length > 0 && (

          <tr>

            <td>

              Qualitative Single Results

            </td>

            <td>

              Multiple

            </td>

            <td>

              Qualitative

            </td>

            <td>

              qualitative_group

            </td>

            <td>

              {

                groupedTests
                  .qualitativeSingles
                  .length

              }

              {" "}
              Tests

            </td>

            <td>

              <button

                className="action-btn"

                onClick={() =>

                  setSelectedTest({

                    test_name:

                      "Qualitative Single Results",

                    department:

                      "Multiple",

                    result_category:

                      "Qualitative",

                    template_type:

                      "qualitative_group",

                    tests:

                      groupedTests
                        .qualitativeSingles,

                  })

                }

              >

                Enter Result

              </button>

            </td>

          </tr>

        )}

        {/* HAEMATOLOGY */}

        {groupedTests.haematologySingles.length > 0 && (

          <tr>

            <td>

              Haematology Single Results

            </td>

            <td>

              Haematology

            </td>

            <td>

              Quantitative

            </td>

            <td>

              haematology_group

            </td>

            <td>

              {

                groupedTests
                  .haematologySingles
                  .length

              }

              {" "}
              Tests

            </td>

            <td>

              <button

                className="action-btn"

                onClick={() =>

                  setSelectedTest({

                    test_name:

                      "Haematology Single Results",

                    department:

                      "Haematology",

                    result_category:

                      "Quantitative",

                    template_type:

                      "haematology_group",

                    tests:

                      groupedTests
                        .haematologySingles,

                  })

                }

              >

                Enter Result

              </button>

            </td>

          </tr>

        )}

        {/* CHEMISTRY */}

        {groupedTests.chemistrySingles.length > 0 && (

          <tr>

            <td>

              Chemistry Single Results

            </td>

            <td>

              Chemistry

            </td>

            <td>

              Quantitative

            </td>

            <td>

              chemistry_group

            </td>

            <td>

              {

                groupedTests
                  .chemistrySingles
                  .length

              }

              {" "}
              Tests

            </td>

            <td>

              <button

                className="action-btn"

                onClick={() =>

                  setSelectedTest({

                    test_name:

                      "Chemistry Single Results",

                    department:

                      "Chemistry",

                    result_category:

                      "Quantitative",

                    template_type:

                      "chemistry_group",

                    tests:

                      groupedTests
                        .chemistrySingles,

                  })

                }

              >

                Enter Result

              </button>

            </td>

          </tr>

        )}

        {/* ENDOCRINOLOGY */}

        {groupedTests.endocrinologySingles.length > 0 && (

          <tr>

            <td>

              Endocrinology Single Results

            </td>

            <td>

              Endocrinology

            </td>

            <td>

              Quantitative

            </td>

            <td>

              endocrinology_group

            </td>

            <td>

              {

                groupedTests
                  .endocrinologySingles
                  .length

              }

              {" "}
              Tests

            </td>

            <td>

              <button

                className="action-btn"

                onClick={() =>

                  setSelectedTest({

                    test_name:

                      "Endocrinology Single Results",

                    department:

                      "Endocrinology",

                    result_category:

                      "Quantitative",

                    template_type:

                      "endocrinology_group",

                    tests:

                      groupedTests
                        .endocrinologySingles,

                  })

                }

              >

                Enter Result

              </button>

            </td>

          </tr>

        )}

        {/* SPECIAL */}

        {groupedTests.specialTests.length > 0 && (

          <tr>

            <td>

              Special Laboratory Tests

            </td>

            <td>

              Multiple Departments

            </td>

            <td>

              Special

            </td>

            <td>

              special_group

            </td>

            <td>

              {

                groupedTests
                  .specialTests
                  .length

              }

              {" "}
              Tests

            </td>

            <td>

              <button

                className="action-btn"

                onClick={() =>

                  setSelectedTest({

                    test_name:

                      "Special Laboratory Tests",

                    department:

                      "Multiple Departments",

                    result_category:

                      "Special",

                    template_type:

                      "special_group",

                    tests:

                      groupedTests
                        .specialTests,

                  })

                }

              >

                Enter Result

              </button>

            </td>

          </tr>

        )}

      </tbody>

    </table>

  </div>

)}

{/* =========================
    RESULT ENTRY MODAL
========================= */}

{selectedTest && (

  <div
    className="result-modal-overlay"
    onClick={() => {

      setSelectedTest(null);

      setResultData({});

    }}
  >

    <div
      className="result-modal"
      onClick={(e) =>
        e.stopPropagation()
      }
    >

      <button
        className="modal-close-btn"
        onClick={() => {

          setSelectedTest(null);

          setResultData({});

        }}
      >

        ×

      </button>

      <h2>

        Result Entry

      </h2>

      <div className="result-modal-info">

        <div>

          <strong>

            Test Name:

          </strong>

          <p>

            {selectedTest.test_name}

          </p>

        </div>

        <div>

          <strong>

            Department:

          </strong>

          <p>

            {selectedTest.department || "-"}

          </p>

        </div>

        <div>

          <strong>

            Result Category:

          </strong>

          <p>

            {selectedTest.result_category || "-"}

          </p>

        </div>

        <div>

          <strong>

            Template Type:

          </strong>

          <p>

            {selectedTest.template_type || "-"}

          </p>

        </div>

      </div>

      <div className="result-entry-container">

        <ResultTemplateRenderer
          test={selectedTest}
          patient={patient}
          resultData={resultData}
          setResultData={setResultData}
        />

      </div>

      <div className="result-modal-actions">

        <button
          className="save-btn"
          onClick={saveResult}
          disabled={saving}
        >

          {

            saving

              ? "Saving..."

              : "Save Result"

          }

        </button>

      </div>

    </div>

  </div>

)}

{/* =========================
    EMPTY STATE
========================= */}

{!loading && !patient && (

  <div className="dashboard-card empty-state">

    <FileText
      size={40}
    />

    <p>

      Search a patient using
      Lab Number

    </p>

  </div>

)}

</div>

);

}