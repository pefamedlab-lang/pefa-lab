import "../styles/invoicePrint.css";

import {
  useEffect,
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import {
  supabase,
} from "../supabase";


export default function InvoicePrint() {

  const [
    searchParams,
  ] = useSearchParams();

  const orderId =
    searchParams.get(
      "order_id"
    );

  const receiptNumber =
    searchParams.get(
      "receipt"
    );


  const [
    order,
    setOrder,
  ] = useState(null);

  const [
    items,
    setItems,
  ] = useState([]);

  const [
    payment,
    setPayment,
  ] = useState(null);


  useEffect(() => {

    loadInvoice();

  }, [
    orderId,
    receiptNumber,
  ]);


  const loadInvoice =
    async () => {

      const {
        data: orderData,
        error: orderError,
      } = await supabase
        .from(
          "service_orders"
        )
        .select("*")
        .eq(
          "id",
          orderId
        )
        .single();


      if (orderError) {

        console.error(
          orderError
        );

        return;
      }


      const {
        data: itemData,
      } = await supabase
        .from(
          "service_order_items"
        )
        .select("*")
        .eq(
          "order_id",
          orderId
        )
        .order(
          "created_at"
        );


      let paymentData =
        null;


      if (receiptNumber) {

        const {
          data,
        } = await supabase
          .from(
            "service_payments"
          )
          .select("*")
          .eq(
            "receipt_number",
            receiptNumber
          )
          .single();

        paymentData =
          data;

      }


      setOrder(
        orderData
      );

      setItems(
        itemData || []
      );

      setPayment(
        paymentData
      );

    };


  if (!order) {

    return (
      <div className="invoice-loading">
        Loading invoice...
      </div>
    );

  }


  return (

    <div className="invoice-page">

      <div className="invoice-actions">

        <button
          type="button"
          onClick={() =>
            window.print()
          }
        >
          Print
        </button>

      </div>


      <div className="invoice-paper">


        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="invoice-header">

          <div>

            <h1>
              PEFA MEDICAL DIAGNOSTIC SERVICES
            </h1>

            <p>
              Laboratory & Ultrasound Services
            </p>

            <p>
              Diagnostic Services Centre
            </p>

          </div>


          <div className="invoice-title">

            <h2>
              {
                payment
                  ? "RECEIPT"
                  : "INVOICE"
              }
            </h2>

            {
              payment && (

                <p>
                  Receipt No:
                  {" "}
                  {
                    payment.receipt_number
                  }
                </p>

              )
            }

          </div>

        </div>


        {/* =====================================================
            PATIENT DETAILS
        ===================================================== */}

        <div className="invoice-details">

          <div>

            <span>
              Patient
            </span>

            <strong>
              {
                order.patient_name
              }
            </strong>

          </div>


          <div>

            <span>
              Patient ID
            </span>

            <strong>
              {
                order.patient_id
              }
            </strong>

          </div>


          <div>

            <span>
              Order No
            </span>

            <strong>
              {
                order.order_number
              }
            </strong>

          </div>


          <div>

            <span>
              Date
            </span>

            <strong>
              {
                new Date(
                  order.created_at
                ).toLocaleDateString()
              }
            </strong>

          </div>


          <div>

            <span>
              Branch
            </span>

            <strong>
              {
                order.branch
              }
            </strong>

          </div>


          <div>

            <span>
              Referral
            </span>

            <strong>
              {
                order.referral_name ||
                "Private"
              }
            </strong>

          </div>

        </div>


        {/* =====================================================
            ITEMS
        ===================================================== */}

        <table>

          <thead>

            <tr>

              <th>
                #
              </th>

              <th>
                Service
              </th>

              <th>
                Category
              </th>

              <th>
                Amount
              </th>

            </tr>

          </thead>


          <tbody>

            {
              items.map(
                (
                  item,
                  index
                ) => (

                  <tr
                    key={
                      item.id
                    }
                  >

                    <td>
                      {
                        index + 1
                      }
                    </td>

                    <td>
                      {
                        item.service_name
                      }
                    </td>

                    <td>
                      {
                        item.service_category
                      }
                    </td>

                    <td>
                      ₦
                      {
                        Number(
                          item.total_price
                        ).toLocaleString()
                      }
                    </td>

                  </tr>

                )
              )
            }

          </tbody>

        </table>


        {/* =====================================================
            TOTALS
        ===================================================== */}

        <div className="invoice-summary">

          <div>

            <span>
              Subtotal
            </span>

            <strong>
              ₦
              {
                Number(
                  order.subtotal
                ).toLocaleString()
              }
            </strong>

          </div>


          <div>

            <span>
              Discount
            </span>

            <strong>
              ₦
              {
                Number(
                  order.discount_amount
                ).toLocaleString()
              }
            </strong>

          </div>


          <div className="grand-total">

            <span>
              Total
            </span>

            <strong>
              ₦
              {
                Number(
                  order.total_amount
                ).toLocaleString()
              }
            </strong>

          </div>


          <div>

            <span>
              Amount Paid
            </span>

            <strong>
              ₦
              {
                Number(
                  order.amount_paid
                ).toLocaleString()
              }
            </strong>

          </div>


          <div className="balance">

            <span>
              Balance
            </span>

            <strong>
              ₦
              {
                Number(
                  order.balance
                ).toLocaleString()
              }
            </strong>

          </div>

        </div>


        {/* =====================================================
            PAYMENT
        ===================================================== */}

        {
          payment && (

            <div className="payment-information">

              <h3>
                Payment Information
              </h3>

              <p>
                Payment Method:
                {" "}
                <strong>
                  {
                    payment.payment_method
                  }
                </strong>
              </p>

              {
                payment.payment_reference && (

                  <p>
                    Reference:
                    {" "}
                    <strong>
                      {
                        payment.payment_reference
                      }
                    </strong>
                  </p>

                )
              }

              <p>
                Payment Date:
                {" "}
                <strong>
                  {
                    new Date(
                      payment.payment_date
                    ).toLocaleString()
                  }
                </strong>
              </p>

            </div>

          )
        }


        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div className="invoice-footer">

          <p>
            Thank you for choosing PEFA Medical Diagnostic Services.
          </p>

          <p>
            This document is system generated.
          </p>

        </div>

      </div>

    </div>

  );

}