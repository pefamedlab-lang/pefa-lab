export default function PatientInfoSection({

  patient = {},

  report = {},

}) {

  const safe = (value) =>

    value === null ||

    value === undefined ||

    value === ""

      ? "N/A"

      : value;

  const formatDate = (date) => {

    if (!date) return "Pending";

    const d = new Date(date);

    if (isNaN(d.getTime())) return date;

    return d.toLocaleString(

      "en-GB",

      {

        day: "2-digit",

        month: "short",

        year: "numeric",

        hour: "2-digit",

        minute: "2-digit",

      }

    );

  };

  return (

    <div className="patient-info-container">

      <div className="patient-info-title">

        PATIENT INFORMATION

      </div>

      <table className="patient-info-table">

        <tbody>

          <tr>

            <td>

              <strong>Patient:</strong>

              <span className="patient-highlight">

                {safe(

                  patient.full_name ||

                  patient.patient_name ||

                  patient.name

                )}

              </span>

            </td>

            <td>

              <strong>Laboratory No:</strong>

              {safe(

                patient.lab_number ||

                report.lab_number

              )}

            </td>

          </tr>

          <tr>

            <td>

              <strong>Age / Sex:</strong>

              {safe(patient.age)} /

              {" "}

              {safe(

                patient.sex ||

                patient.gender

              )}

            </td>

            <td>

              <strong>Report ID:</strong>

              {safe(

                report.report_number ||

                report.verification_id ||

                report.id

              )}

            </td>

          </tr>

          <tr>

            <td>

              <strong>Hospital:</strong>

              {safe(

                patient.hospital ||

                patient.referral_name ||

                "Private"

              )}

            </td>

            <td>

              <strong>Doctor:</strong>

              {safe(

                patient.referring_doctor ||

                "Self Referral"

              )}

            </td>

          </tr>

          <tr>

            <td>

              <strong>Requested Test:</strong>

              {safe(

                report.test_name ||

                report.test_type

              )}

            </td>

            <td>

              <strong>Specimen:</strong>

              {safe(

                report.specimen ||

                patient.specimen

              )}

            </td>

          </tr>

          <tr>

            <td>

              <strong>Collected:</strong>

              {formatDate(

                report.sample_collected_at ||

                report.sample_collected ||

                report.collected_at ||

                patient.created_at

              )}

            </td>

            <td>

              <strong>Reported:</strong>

              {formatDate(

                report.reported_at ||

                report.released_at ||

                report.created_at

              )}

            </td>

          </tr>

          <tr>

            <td colSpan={2}>

              <strong>Clinical History:</strong>

              {" "}

              {safe(

                patient.clinical_history ||

                report.clinical_history ||

                "Routine"

              )}

            </td>

          </tr>

        </tbody>

      </table>

    </div>

  );

}