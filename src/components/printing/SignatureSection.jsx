import { useEffect, useState } from "react";
import { supabase } from "../../supabase";

export default function SignatureSection({

  report = {},

  onLoaded,

}) {

  const [staffMap, setStaffMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    let mounted = true;

    async function loadSignatories() {

      setLoading(true);

      try {

        const enteredBy = report?.entered_by;

        const verifiedBy =
          report?.verified_by ||
          report?.authorized_by ||
          report?.checked_by;

        const values = [
          ...new Set(
            [enteredBy, verifiedBy].filter(Boolean)
          ),
        ];

        if (!values.length) {

          if (mounted) {

            setStaffMap({});
            setLoading(false);
            onLoaded?.(true);

          }

          return;

        }

        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

        const ids = values.filter((value) =>
          uuidRegex.test(String(value))
        );

        const names = values.filter(
          (value) => !uuidRegex.test(String(value))
        );

        let staff = [];

        if (ids.length) {

          const {
            data,
            error,
          } = await supabase
            .from("staff_users")
            .select(`
              id,
              full_name,
              signature_url
            `)
            .in("id", ids);

          if (error) {

            console.error(error);

          } else {

            staff.push(...data);

          }

        }

        if (names.length) {

          const {
            data,
            error,
          } = await supabase
            .from("staff_users")
            .select(`
              id,
              full_name,
              signature_url
            `)
            .in("full_name", names);

          if (error) {

            console.error(error);

          } else {

            staff.push(...data);

          }

        }

        const map = {};

        staff.forEach((person) => {

          map[person.id] = person;
          map[person.full_name] = person;

        });

        if (mounted) {

          setStaffMap(map);

        }

      } catch (error) {

        console.error(
          "Failed to load signatures:",
          error
        );

      } finally {

        if (mounted) {

          setLoading(false);
          onLoaded?.(true);

        }

      }

    }

    loadSignatories();

    return () => {

      mounted = false;

    };

  }, [report, onLoaded]);

  const signatories = [

    {

      value: report?.entered_by,

      title: "Entered By",

    },

    {

      value:
        report?.verified_by ||
        report?.authorized_by ||
        report?.checked_by,

      title: "Verified By",

    },

  ].filter((item) => item.value);

  if (!signatories.length) {

    return null;

  }

  

  return (

    <section className="signature-section">

      {signatories.map((item) => {

        const person = staffMap[item.value];

        return (

          <div
            key={item.title}
            className="signature-card"
          >

            <div className="signature-image">

              {person?.signature_url ? (

                <img
                  src={person.signature_url}
                  alt={person.full_name}
                  loading="eager"
                  crossOrigin="anonymous"
                  onError={(e) => {

                    e.currentTarget.style.display = "none";

                  }}
                />

              ) : (

                <div className="signature-placeholder">

                  No Signature

                </div>

              )}

            </div>

            <div className="signature-line" />

            <div className="signature-name">

              {person?.full_name || item.value}

            </div>

            <div className="signature-title">

              {item.title}

            </div>

          </div>

        );

      })}

    </section>

  );

}