import Barcode from "react-barcode";

export default function SpecimenLabel({
  patient,
}) {

  const tests =

    (patient.tests || [])

      .map(
        test =>
          test.test_name
      )

      .join(", ");

  return (

    <div className="barcode-label">

      <h2>
        PEFA MEDICAL
      </h2>

      <p>

        <strong>
          Lab No:
        </strong>

        {patient.lab_number}

      </p>

      <p>

        <strong>
          Patient:
        </strong>

        {patient.full_name}

      </p>

      <p>

        <strong>
          Tests:
        </strong>

        {tests}

      </p>

      <Barcode
        value={
          patient.lab_number
        }
        width={1.5}
        height={50}
      />

    </div>

  );
}