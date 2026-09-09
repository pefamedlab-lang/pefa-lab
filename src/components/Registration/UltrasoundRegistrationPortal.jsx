import { useEffect, useState } from "react";
import { supabase } from "../../supabase";

export default function UltrasoundRegistrationPortal({
  form,
  setForm,
  selectedScan,
  setSelectedScan,
}) {
  const [scanTypes, setScanTypes] = useState([]);
  const [loadingScanTypes, setLoadingScanTypes] =
    useState(true);
  const [scanTypeError, setScanTypeError] =
    useState("");

  /* =====================================
      LOAD ULTRASOUND SERVICES
  ===================================== */

  useEffect(() => {
    let mounted = true;

    const loadScanTypes = async () => {
      setLoadingScanTypes(true);
      setScanTypeError("");

      console.log(
        "Loading ultrasound services..."
      );

      const { data, error } = await supabase
        .from("ultrasound_services")
        .select(
          "id, service_code, service_name, price, active_status"
        )
        .order("service_name", {
          ascending: true,
        });

      console.log(
        "Ultrasound services:",
        data
      );

      console.log(
        "Ultrasound service error:",
        error
      );

      if (!mounted) return;

      if (error) {
        setScanTypes([]);

        setScanTypeError(
          error.message ||
            "Unable to load ultrasound services."
        );

        setLoadingScanTypes(false);

        return;
      }

      setScanTypes(data || []);
      setLoadingScanTypes(false);
    };

    loadScanTypes();

    return () => {
      mounted = false;
    };
  }, []);

  /* =====================================
      INPUT CHANGE
  ===================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =====================================
      SCAN TYPE CHANGE
  ===================================== */

  const handleScanTypeChange = (e) => {
    const serviceId = e.target.value;

    const service = scanTypes.find(
      (item) => item.id === serviceId
    );

    if (!service) {
      setSelectedScan?.("");

      setForm((prev) => ({
        ...prev,
        scan_type: "",
        template_type: "",
        scan_service_id: "",
        scan_service_code: "",
        scan_amount: 0,
      }));

      return;
    }

    console.log(
      "Selected ultrasound service:",
      service
    );

    setSelectedScan?.(
      service.service_name
    );

    setForm((prev) => ({
      ...prev,

      scan_type:
        service.service_name,

      template_type:
        service.service_code,

      scan_service_id:
        service.id,

      scan_service_code:
        service.service_code,

      scan_amount:
        Number(service.price) || 0,
    }));
  };

  /* =====================================
      CURRENT SELECTED SERVICE
  ===================================== */

  const selectedService =
    scanTypes.find(
      (item) =>
        item.id ===
        form?.scan_service_id
    ) || null;

  /* =====================================
      FORMAT MONEY
  ===================================== */

  const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString(
      "en-NG"
    );

  return (
    <>
      {/* =====================================
          ULTRASOUND INFORMATION
      ===================================== */}

      <div className="registration-card">
        <div className="section-title">
          <h2>
            Ultrasound Request
          </h2>
        </div>

        <div className="registration-grid">
          <input
            type="text"
            value={
              form?.registration_number ||
              ""
            }
            readOnly
            placeholder="Registration Number"
          />

          <input
            type="text"
            value={
              form?.scan_number || ""
            }
            readOnly
            placeholder="Scan Number"
          />

          <input
            type="text"
            value={
              form?.scan_id || ""
            }
            readOnly
            placeholder="Scan ID"
          />

          <input
            type="text"
            value={
              form?.access_code || ""
            }
            readOnly
            placeholder="Access Code"
          />

          <input
            type="text"
            value={
              form?.verification_code ||
              ""
            }
            readOnly
            placeholder="Verification Code"
          />
        </div>
      </div>

      {/* =====================================
          SCAN TYPE
      ===================================== */}

      <div className="registration-card">
        <div className="section-title">
          <h2>
            Scan Type
          </h2>
        </div>

        <div className="registration-grid">
          <div
            className="form-group"
            style={{
              gridColumn:
                "1 / -1",
            }}
          >
            <label htmlFor="ultrasound_scan_type">
              Select Scan Type
            </label>

            <select
              id="ultrasound_scan_type"
              value={
                form?.scan_service_id ||
                ""
              }
              onChange={
                handleScanTypeChange
              }
              disabled={
                loadingScanTypes
              }
            >
              <option value="">
                {loadingScanTypes
                  ? "Loading scan types..."
                  : "Select Scan Type"}
              </option>

              {scanTypes.map(
                (service) => (
                  <option
                    key={service.id}
                    value={service.id}
                  >
                    {service.service_name}
                    {" — ₦"}
                    {formatAmount(
                      service.price
                    )}
                  </option>
                )
              )}
            </select>

            {/* DATABASE ERROR */}

            {scanTypeError && (
              <div
                style={{
                  marginTop: "10px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background:
                    "#fef2f2",
                  color:
                    "#b91c1c",
                  fontSize: "13px",
                }}
              >
                <strong>
                  Scan Type Error:
                </strong>{" "}
                {scanTypeError}
              </div>
            )}

            {/* NO RECORDS */}

            {!loadingScanTypes &&
              !scanTypeError &&
              scanTypes.length === 0 && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "10px 12px",
                    borderRadius:
                      "8px",
                    background:
                      "#fff7ed",
                    color:
                      "#c2410c",
                    fontSize:
                      "13px",
                  }}
                >
                  No ultrasound
                  services were
                  returned from
                  Supabase.
                </div>
              )}
          </div>
        </div>

        {/* =====================================
            SELECTED SERVICE
        ===================================== */}

        {selectedService && (
          <div
            style={{
              marginTop: "18px",
              padding: "16px",
              borderRadius:
                "12px",
              background:
                "#f0fdfa",
              border:
                "1px solid #99f6e4",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "16px",
              }}
            >
              <div>
                <small>
                  Selected Scan
                </small>

                <strong
                  style={{
                    display:
                      "block",
                    marginTop:
                      "4px",
                  }}
                >
                  {
                    selectedService.service_name
                  }
                </strong>
              </div>

              <div>
                <small>
                  Service Code
                </small>

                <strong
                  style={{
                    display:
                      "block",
                    marginTop:
                      "4px",
                  }}
                >
                  {
                    selectedService.service_code
                  }
                </strong>
              </div>

              <div>
                <small>
                  Amount
                </small>

                <strong
                  style={{
                    display:
                      "block",
                    marginTop:
                      "4px",
                  }}
                >
                  ₦
                  {formatAmount(
                    selectedService.price
                  )}
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =====================================
          CLINICAL INFORMATION
      ===================================== */}

      <div className="registration-card">
        <div className="section-title">
          <h2>
            Clinical Information
          </h2>
        </div>

        <div className="registration-grid">
          <input
            type="text"
            name="referring_doctor"
            value={
              form?.referring_doctor ||
              ""
            }
            onChange={
              handleChange
            }
            placeholder="Referring Doctor"
          />

          <input
            type="text"
            name="radiologist"
            value={
              form?.radiologist || ""
            }
            onChange={
              handleChange
            }
            placeholder="Radiologist"
          />

          <select
            name="priority"
            value={
              form?.priority ||
              "Routine"
            }
            onChange={
              handleChange
            }
          >
            <option value="Routine">
              Routine
            </option>

            <option value="Urgent">
              Urgent
            </option>

            <option value="Emergency">
              Emergency
            </option>
          </select>
        </div>

        <textarea
          rows={5}
          name="clinical_indication"
          value={
            form?.clinical_indication ||
            ""
          }
          onChange={
            handleChange
          }
          placeholder="Clinical Indication"
        />
      </div>

      {/* =====================================
          SUMMARY
      ===================================== */}

      <div className="registration-summary">
        <div>
          <strong>
            Selected Scan
          </strong>

          <h3>
            {selectedService
              ? selectedService.service_name
              : "None Selected"}
          </h3>
        </div>

        <div>
          <strong>
            Scan Amount
          </strong>

          <h2>
            ₦
            {formatAmount(
              selectedService?.price ||
                0
            )}
          </h2>
        </div>
      </div>
    </>
  );
}