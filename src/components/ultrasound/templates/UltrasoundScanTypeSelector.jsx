import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

export default function UltrasoundTemplateSelector({
  value,
  onChange,
}) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadServices = async () => {
      setLoading(true);
      setError("");

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
          "Failed to load ultrasound services:",
          error
        );

        setServices([]);
        setError("Unable to load ultrasound services.");
      } else {
        setServices(data || []);
      }

      setLoading(false);
    };

    loadServices();

    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (event) => {
    const selectedId = event.target.value;

    const selectedService = services.find(
      (service) => service.id === selectedId
    );

    if (!selectedService) {
      onChange(null);
      return;
    }

    onChange(selectedService);
  };

  return (
    <div className="form-group ultrasound-service-selector">
      <label htmlFor="ultrasound-service">
        Select Scan Type
      </label>

      <select
        id="ultrasound-service"
        value={value || ""}
        onChange={handleChange}
        disabled={loading}
      >
        <option value="">
          {loading
            ? "Loading scan types..."
            : "Select Scan Type"}
        </option>

        {!loading &&
          services.map((service) => (
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

      {error && (
        <small className="form-error">
          {error}
        </small>
      )}

      {!loading &&
        !error &&
        services.length === 0 && (
          <small className="form-error">
            No active ultrasound services found.
          </small>
        )}
    </div>
  );
}