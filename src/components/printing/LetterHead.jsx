import logo from "../../assets/logo.png";
import companyProfile from "../../config/companyProfile";

export default function LetterHead({
  compact = false,
  hidden = false,
}) {
  const {
    name,
    fullName,
    displayName,
    rcNumber,
    trustLine,
    tagline,
  } = companyProfile;

  const trustItems =
    trustLine
      ?.split("•")
      .map((item) => item.trim()) || [];

  /* ======================================================
     PRE-PRINTED LETTERHEAD MODE
  ====================================================== */

  if (hidden) {
    return (
      <div
        className="preprinted-letterhead-space"
        style={{
          minHeight: "145px",
          width: "100%",
        }}
      />
    );
  }

  /* ======================================================
     NORMAL LETTERHEAD
  ====================================================== */

  return (
    <header
      className={`enterprise-letterhead ${
        compact ? "compact" : ""
      }`}
    >
      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="eh-header">

        {/* LOGO */}

        <div className="eh-logo-wrapper">
          <img
            src={logo}
            alt={fullName}
            className="eh-logo"
          />
        </div>

        {/* COLOUR STRIP */}

        <div className="eh-identity">
          <span className="id-blue" />
          <span className="id-red" />
          <span className="id-green" />
        </div>

        {/* COMPANY DETAILS */}

        <div className="eh-brand">

          <h1 className="eh-name">
            {name}
          </h1>

          <div className="eh-subtitle">
            {displayName
              ? displayName.replace(
                  `${name} `,
                  ""
                )
              : "Medical Diagnostic Services"}
          </div>

          <div className="eh-company-line" />

          {rcNumber && (
            <div className="eh-registration">
              {rcNumber}
            </div>
          )}

          <div className="eh-trust">

            {trustItems.length ? (

              trustItems.map((item, index) => (

                <span key={item}>

                  <span
                    className={
                      index === 0
                        ? "trust-blue"
                        : index === 1
                        ? "trust-red"
                        : "trust-green"
                    }
                  >
                    {item}
                  </span>

                  {index <
                    trustItems.length - 1 && (
                    <span className="trust-dot">
                      &nbsp;•&nbsp;
                    </span>
                  )}

                </span>

              ))

            ) : (

              <span className="trust-blue">
                Reliable • Accurate • Trusted
              </span>

            )}

          </div>

        </div>

      </div>

      {/* ==================================================
          SEPARATOR
      ================================================== */}

      <div className="header-separator">

        <div className="separator-top" />

        <div className="separator-ribbon">
          <span className="divider-blue" />
          <span className="divider-red" />
          <span className="divider-green" />
        </div>

        {tagline && (
          <div className="separator-tagline">
            {tagline}
          </div>
        )}

        <div className="separator-bottom" />

      </div>

    </header>
  );
}