import "./reportPreview.css";

export default function ReportPreview({
    patient,
    report,
    impression,
    recommendation
}) {

    if (!patient) return null;

    return (

        <div className="report-preview">

            <h1>
                ULTRASOUND REPORT
            </h1>

            <div className="preview-block">

                <h3>Patient Information</h3>

                <table>

                    <tbody>

                        <tr>
                            <td>Name</td>
                            <td>{patient.patient_name}</td>
                        </tr>

                        <tr>
                            <td>Age</td>
                            <td>{patient.age}</td>
                        </tr>

                        <tr>
                            <td>Sex</td>
                            <td>{patient.sex}</td>
                        </tr>

                        <tr>
                            <td>Lab Number</td>
                            <td>{patient.lab_number}</td>
                        </tr>

                    </tbody>

                </table>

            </div>

            <div className="preview-block">

                <h3>Clinical Indication</h3>

                <p>

                    {patient.clinical_indication || "-"}

                </p>

            </div>

            <div className="preview-block">

                <h3>Examination</h3>

                <p>

                    {patient.test_type}

                </p>

            </div>

            <div className="preview-block">

                <h3>Findings</h3>

                <pre>

                    {report}

                </pre>

            </div>

            <div className="preview-block">

                <h3>Impression</h3>

                <ul>

                    {Array.isArray(impression)

                        ? impression.map((item, index) => (

                              <li key={index}>

                                  {item}

                              </li>

                          ))

                        : <li>{impression}</li>}

                </ul>

            </div>

            <div className="preview-block">

                <h3>Recommendation</h3>

                <p>

                    {recommendation || "-"}

                </p>

            </div>

        </div>

    );

}