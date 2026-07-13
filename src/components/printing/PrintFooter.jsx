import companyProfile from "../../config/companyProfile";

export default function PrintFooter() {
  const {
    contact = {},
    branches = [],
    services = [],
  } = companyProfile;

  const {
    address,
    website,
    email,
    phones = [],
  } = contact;

  return (
    <footer className="enterprise-footer">
      {/* ======================================================
          INFORMATION PANEL
      ====================================================== */}

      <div className="footer-panel">

        {/* ==================================================
            SERVICES
        ================================================== */}

        <div className="footer-column">

          <h4>Our Services</h4>

          <ul>
            {services.map((service) => (
              <li key={service}>
                {service}
              </li>
            ))}
          </ul>

        </div>

        {/* ==================================================
            LOCATIONS
        ================================================== */}

        <div className="footer-column">

          <h4>Locations</h4>

          {address && (
            <p>
              <strong>Head Office:</strong>
              <br />
              {address}
            </p>
          )}

          {branches.map((branch) => (
            <p key={branch.id}>
              <strong>{branch.name}:</strong>
              <br />
              {Array.isArray(branch.address)
                ? branch.address.join(", ")
                : branch.address}
            </p>
          ))}

        </div>

        {/* ==================================================
            CONTACT
        ================================================== */}

        <div className="footer-column">

          <h4>Contact</h4>

          {phones.map((number) => (
            <p key={number}>
              {number}
            </p>
          ))}

          {email && (
            <p>{email}</p>
          )}

          {website && (
            <p>{website}</p>
          )}

        </div>

      </div>

      {/* ======================================================
          BRAND RIBBON
      ====================================================== */}

      <div className="footer-ribbon">

        <span className="footer-blue" />

        <span className="footer-red" />

        <span className="footer-green" />

      </div>

    </footer>
  );
}