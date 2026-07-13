import {
  useParams,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import {
  supabase,
} from "../supabase";

export default function VerifyResult() {

  const {
    verificationId,
  } = useParams();

  const [
    result,
    setResult,
  ] = useState(null);

  useEffect(() => {

    verifyResult();

  }, []);

  const verifyResult =
    async () => {

      const {
        data,
      } = await supabase

        .from(
          "patient_results"
        )

        .select("*")

        .eq(
          "verification_id",
          verificationId
        )

        .eq(
          "release_status",
          "Released"
        )

        .single();

      setResult(
        data
      );

    };

  return (

    <div>

      <h1>

        PEFA Result Verification

      </h1>

      {

        result

          ? (

            <div>

              <h2>

                ✓ Authentic Result

              </h2>

              <p>

                Patient:
                {" "}
                {
                  result.patient_name
                }

              </p>

              <p>

                Test:
                {" "}
                {
                  result.test_type
                }

              </p>

              <p>

                Verification ID:
                {" "}
                {
                  result.verification_id
                }

              </p>

            </div>

          )

          : (

            <h2>

              Invalid Result

            </h2>

          )

      }

    </div>

  );

}