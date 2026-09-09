import companyProfile from "../../config/companyProfile";

export default function PrintFooter() {
  const {
    contact = {},
    branches = [],
  } = companyProfile;

  const {
    address,
    website,
    email,
    phones = [],
  } = contact;

  return (
    <div className="print-footer">

      <footer className="enterprise-footer">

        {/* =====================================================
            INFORMATION PANEL
        ===================================================== */}

        <div className="footer-panel">

          {/* =================================================
              LOCATIONS
          ================================================= */}

          <div className="footer-column footer-address">

            <div className="footer-title">

              <span>Locations</span>

              <div className="footer-title-line" />

            </div>

            {address && (
              <p>
                <strong>Head Office:</strong>{" "}
                {address}
              </p>
            )}

            {branches.map((branch) => (
              <p key={branch.id}>
                <strong>{branch.name}:</strong>{" "}
                {Array.isArray(branch.address)
                  ? branch.address.join(", ")
                  : branch.address}
              </p>
            ))}

          </div>

          {/* =================================================
              TELEPHONE
          ================================================= */}

          <div className="footer-column footer-phone">

            <div className="footer-title">

              <span>Telephone</span>

              <div className="footer-title-line" />

            </div>

            {phones.length ? (
              phones.map((phone) => (
                <p key={phone}>{phone}</p>
              ))
            ) : (
              <p>N/A</p>
            )}

          </div>

          {/* =================================================
              ONLINE
          ================================================= */}

          <div className="footer-column footer-contact">

            <div className="footer-title">

              <span>Online</span>

              <div className="footer-title-line" />

            </div>

            {email && (
              <p>{email}</p>
            )}

            {website && (
              <p>{website}</p>
            )}

          </div>

        </div>

        {/* =====================================================
            BRAND RIBBON
        ===================================================== */}

        <div className="footer-ribbon">

          <span className="footer-blue" />

          <span className="footer-red" />

          <span className="footer-green" />

        </div>

      </footer>

    </div>
  );
}