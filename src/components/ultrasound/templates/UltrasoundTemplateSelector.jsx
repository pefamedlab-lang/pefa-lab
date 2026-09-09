import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

export default function UltrasoundRegistrationPortal({
  form,
  setForm,
  selectedScan,
  setSelectedScan,
}) {
  const [scanServices, setScanServices] = useState([]);
  const [loadingScans, setLoadingScans] = useState(true);
  const [scanError, setScanError] = useState("");

  /* =====================================
      LOAD ULTRASOUND SERVICES
  ===================================== */

  useEffect(() => {
    let mounted = true;

    const loadScanServices = async () => {
      setLoadingScans(true);
      setScanError("");

      const { data, error } = await supabase
        .from("ultrasound_services")
        .select(
          "id, service_code, service_name, price, active_status"
        )
        .eq("active_status", "Active")
        .order("service_name", {
          ascending: true,
        });

      if (!mounted) return;

      if (error) {
        console.error(
          "Error loading ultrasound services:",
          error
        );

        setScanServices([]);
        setScanError(
          "Unable to load ultrasound scan types."
        );
      } else {
        setScanServices(data || []);
      }

      setLoadingScans(false);
    };

    loadScanServices();

    return () => {
      mounted = false;
    };
  }, []);

  /* =====================================
      GENERAL INPUT HANDLER
  ===================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =====================================
      SCAN TYPE HANDLER
  ===================================== */

  const handleScanChange = (e) => {
    const serviceId = e.target.value;

    const service = scanServices.find(
      (item) => item.id === serviceId
    );

    if (!service) {
      setSelectedScan(null);

      setForm((prev) => ({
        ...prev,
        template_type: "",
        scan_type: "",
        scan_code: "",
        amount: 0,
      }));

      return;
    }

    setSelectedScan(service);

    setForm((prev) => ({
      ...prev,

      /*
        Keep the database service ID
        as the template/service reference.
      */
      template_type: service.id,

      /*
        Actual scan name.
      */
      scan_type: service.service_name,

      /*
        Service code.
      */
      scan_code: service.service_code || "",

      /*
        Price from ultrasound_services.
      */
      amount: Number(service.price || 0),
    }));
  };

  /* =====================================
      DISPLAY SELECTED SCAN
  ===================================== */

  const displayedScan =
    selectedScan?.service_name ||
    form.scan_type ||
    "";

  const displayedAmount =
    selectedScan?.price ??
    form.amount ??
    0;

  return (
    <>
      {/* =====================================
          ULTRASOUND INFORMATION
      ===================================== */}

      <div className="registration-card">
        <div className="section-title">
          <h2>Ultrasound Request</h2>
        </div>

        <div className="registration-grid">
          <input
            type="text"
            value={
              form.registration_number || ""
            }
            readOnly
            placeholder="Registration Number"
          />

          <input
            type="text"
            value={form.scan_number || ""}
            readOnly
            placeholder="Scan Number"
          />

          <input
            type="text"
            value={form.scan_id || ""}
            readOnly
            placeholder="Scan ID"
          />

          <input
            type="text"
            value={form.access_code || ""}
            readOnly
            placeholder="Access Code"
          />

          <input
            type="text"
            value={
              form.verification_code || ""
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
          <h2>Scan Type</h2>
        </div>

        <div className="registration-grid">
          <select
            name="template_type"
            value={
              form.template_type || ""
            }
            onChange={handleScanChange}
            disabled={loadingScans}
          >
            <option value="">
              {loadingScans
                ? "Loading Scan Types..."
                : "Select Scan Type"}
            </option>

            {scanServices.map((service) => (
              <option
                key={service.id}
                value={service.id}
              >
                {service.service_name} — ₦
                {Number(
                  service.price || 0
                ).toLocaleString()}
              </option>
            ))}
          </select>
        </div>

        {scanError && (
          <div className="form-error">
            {scanError}
          </div>
        )}

        {/* =====================================
            SELECTED SCAN DETAILS
        ===================================== */}

        {selectedScan && (
          <div className="selected-service-box">
            <div>
              <span>Selected Scan</span>

              <strong>
                {selectedScan.service_name}
              </strong>
            </div>

            <div>
              <span>Service Code</span>

              <strong>
                {selectedScan.service_code ||
                  "—"}
              </strong>
            </div>

            <div>
              <span>Amount</span>

              <strong>
                ₦
                {Number(
                  selectedScan.price || 0
                ).toLocaleString()}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* =====================================
          CLINICAL INFORMATION
      ===================================== */}

      <div className="registration-card">
        <div className="section-title">
          <h2>Clinical Information</h2>
        </div>

        <div className="registration-grid">
          <input
            type="text"
            name="referring_doctor"
            value={
              form.referring_doctor || ""
            }
            onChange={handleChange}
            placeholder="Referring Doctor"
          />

          <input
            type="text"
            name="radiologist"
            value={
              form.radiologist || ""
            }
            onChange={handleChange}
            placeholder="Radiologist"
          />

          <select
            name="priority"
            value={
              form.priority || "Routine"
            }
            onChange={handleChange}
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
            form.clinical_indication || ""
          }
          onChange={handleChange}
          placeholder="Clinical Indication"
        />
      </div>

      {/* =====================================
          SUMMARY
      ===================================== */}

      <div className="registration-summary">
        <div>
          <strong>Total Scan</strong>

          <h3>
            {displayedScan ||
              "None Selected"}
          </h3>
        </div>

        <div>
          <strong>Scan Code</strong>

          <h3>
            {selectedScan?.service_code ||
              form.scan_code ||
              "—"}
          </h3>
        </div>

        <div>
          <strong>Ultrasound Amount</strong>

          <h2>
            ₦
            {Number(
              displayedAmount || 0
            ).toLocaleString()}
          </h2>
        </div>
      </div>
    </>
  );
}