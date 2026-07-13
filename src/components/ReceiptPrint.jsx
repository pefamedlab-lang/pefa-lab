import "../styles/receipt.css";

import ResultQRCode from "./ResultQRCode";

export default function ReceiptPrint({
  receiptData,
}) {
  if (!receiptData)
    return null;

  return (
    <div className="receipt-paper">
      {/* HEADER */}

      <div className="receipt-header">
        <h1>
          PEFA Medical
          Diagnostic
          Services
        </h1>

        <p>
          Enterprise
          Laboratory
          Information
          System
        </p>
      </div>

      {/* INFO */}

      <div className="receipt-info">
        <div>
          <strong>
            Patient:
          </strong>

          <span>
            {
              receiptData.patient_name
            }
          </span>
        </div>

        <div>
          <strong>
            Lab No:
          </strong>

          <span>
            {
              receiptData.lab_number
            }
          </span>
        </div>

        <div>
          <strong>
            Payment:
          </strong>

          <span>
            {
              receiptData.payment_method
            }
          </span>
        </div>

        <div>
          <strong>
            Date:
          </strong>

          <span>
            {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* TESTS */}

      <div className="receipt-tests">
        <table>
          <thead>
            <tr>
              <th>
                Test
              </th>

              <th>
                Amount
              </th>
            </tr>
          </thead>

          <tbody>
            {receiptData.tests?.map(
              (
                test,
                index
              ) => (
                <tr
                  key={index}
                >
                  <td>
                    {
                      test.test_name
                    }
                  </td>

                  <td>
                    ₦
                    {Number(
                      test.price
                    ).toLocaleString()}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* TOTALS */}

      <div className="receipt-summary">
        <div>
          <strong>
            Total:
          </strong>

          <span>
            ₦
            {Number(
              receiptData.total
            ).toLocaleString()}
          </span>
        </div>

        <div>
          <strong>
            Paid:
          </strong>

          <span>
            ₦
            {Number(
              receiptData.paid
            ).toLocaleString()}
          </span>
        </div>

        <div>
          <strong>
            Balance:
          </strong>

          <span>
            ₦
            {Number(
              receiptData.balance
            ).toLocaleString()}
          </span>
        </div>
      </div>

      {/* FOOTER */}

      <div className="receipt-footer">
<ResultQRCode
  labNumber={
    receiptData.lab_number
  }
  accessCode={
    receiptData.access_code
  }
/>    

Thank you for
        choosing PEFA
        Medical Diagnostic
        Services.
      </div>
    </div>
  );
}