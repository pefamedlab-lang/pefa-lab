export default function PrintGroupingCrossMatch({
    results = [],
}) {

    if (!results.length) return null;

    const report = results[0];

    let data =
        report.result ||
        report.result_data ||
        {};

    if (typeof data === "string") {

        try {

            data = JSON.parse(data);

        } catch {

            data = {};

        }

    }

    const units = Array.isArray(data.units)
        ? data.units
        : [];

  /* =====================================
   INLINE STYLES
===================================== */

const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
    fontSize: "12px",
    marginBottom: "14px",
};

const thStyle = {
    fontSize: "12px",
    padding: "6px",
    textAlign: "center",
    fontWeight: "bold",
};

const tdStyle = {
    fontSize: "12px",
    padding: "5px 6px",
    textAlign: "center",
    verticalAlign: "middle",
    lineHeight: 1.4,
};

const labelStyle = {
    ...tdStyle,
    fontWeight: "600",
    textAlign: "left",
    whiteSpace: "nowrap",
};

const titleStyle = {
    fontSize: "14px",
    fontWeight: "bold",
    margin: "10px 0 8px",
};

const commentTitleStyle = {
    fontSize: "12px",
    fontWeight: "bold",
    marginBottom: "4px",
};

const commentTextStyle = {
    fontSize: "12px",
    lineHeight: 1.5,
    margin: 0,
};

    return (

        <div className="crossmatch-report">

            {/* ===================================== */}
            {/* Recipient Information                 */}
            {/* ===================================== */}

            <div
                className="sub-test-title"
                style={titleStyle}
            >
                Recipient Information
            </div>

            <table
                className="premium-table"
                style={tableStyle}
            >

                <tbody>

                    <tr>

                        <td
                            className="label-cell"
                            style={labelStyle}
                        >
                            Recipient Blood Group
                        </td>

                        <td style={tdStyle}>
                            {data.recipientGroup || "-"}
                        </td>

                        <td
                            className="label-cell"
                            style={labelStyle}
                        >
                            Rh(D)
                        </td>

                        <td style={tdStyle}>
                            {data.recipientRh || "-"}
                        </td>

                    </tr>

                    <tr>

                        <td
                            className="label-cell"
                            style={labelStyle}
                        >
                            RVS Status
                        </td>

                        <td
                            colSpan={3}
                            style={{
                                ...tdStyle,
                                textAlign: "left",
                            }}
                        >
                            {data.recipientRVS || "-"}
                        </td>

                    </tr>

                </tbody>

            </table>

            {/* ===================================== */}
            {/* Compatible Blood Units                */}
            {/* ===================================== */}

            <div
                className="sub-test-title"
                style={titleStyle}
            >
                Compatible Blood Units
            </div>

            {units.length === 0 ? (

                <p style={commentTextStyle}>
                    No blood unit added.
                </p>

            ) : (

                <table
                    className="premium-table"
                    style={tableStyle}
                >

                    <thead>

                        <tr>

                            <th
                                style={{
                                    ...thStyle,
                                    width: "22%",
                                }}
                            >
                                Parameter
                            </th>

                            {units.map((_, index) => (

                                <th
                                    key={index}
                                    style={thStyle}
                                >
                                    Unit {index + 1}
                                </th>

                            ))}

                        </tr>

                    </thead>

                    <tbody>

                        <tr>

                            <td
                                className="label-cell"
                                style={labelStyle}
                            >
                                Blood Bag Number
                            </td>

                            {units.map((unit, index) => (

                                <td
                                    key={index}
                                    style={tdStyle}
                                >
                                    {unit.unitNumber || "-"}
                                </td>

                            ))}

                        </tr>

                        <tr>

                            <td
                                className="label-cell"
                                style={labelStyle}
                            >
                                Donor Blood Group
                            </td>

                            {units.map((unit, index) => (

                                <td
                                    key={index}
                                    style={tdStyle}
                                >
                                    {unit.donorGroup || "-"}
                                </td>

                            ))}

                        </tr>

                        <tr>

                            <td
                                className="label-cell"
                                style={labelStyle}
                            >
                                Donor Rh(D)
                            </td>

                            {units.map((unit, index) => (

                                <td
                                    key={index}
                                    style={tdStyle}
                                >
                                    {unit.donorRh || "-"}
                                </td>

                            ))}

                        </tr>

                        <tr>

                            <td
                                className="label-cell"
                                style={labelStyle}
                            >
                                Collection Date
                            </td>

                            {units.map((unit, index) => (

                                <td
                                    key={index}
                                    style={tdStyle}
                                >
                                    {unit.collectionDate || "-"}
                                </td>

                            ))}

                        </tr>

                        <tr>

                            <td
                                className="label-cell"
                                style={labelStyle}
                            >
                                Expiry Date
                            </td>

                            {units.map((unit, index) => (

                                <td
                                    key={index}
                                    style={tdStyle}
                                >
                                    {unit.expiryDate || "-"}
                                </td>

                            ))}

                        </tr>

                        <tr>

                            <td
                                className="label-cell"
                                style={labelStyle}
                            >
                                Donor Hb (g/dL)
                            </td>

                            {units.map((unit, index) => (

                                <td
                                    key={index}
                                    style={tdStyle}
                                >
                                    {unit.donorHb || "-"}
                                </td>

                            ))}

                        </tr>

                        <tr>

                            <td
                                className="label-cell"
                                style={labelStyle}
                            >
                                HIV I & II
                            </td>

                            {units.map((unit, index) => (

                                <td
                                    key={index}
                                    style={tdStyle}
                                >
                                    {unit.hiv || "-"}
                                </td>

                            ))}

                        </tr>

                        <tr>

                            <td
                                className="label-cell"
                                style={labelStyle}
                            >
                                HBsAg
                            </td>

                            {units.map((unit, index) => (

                                <td
                                    key={index}
                                    style={tdStyle}
                                >
                                    {unit.hbsag || "-"}
                                </td>

                            ))}

                        </tr>

                        <tr>

                            <td
                                className="label-cell"
                                style={labelStyle}
                            >
                                HCV
                            </td>

                            {units.map((unit, index) => (

                                <td
                                    key={index}
                                    style={tdStyle}
                                >
                                    {unit.hcv || "-"}
                                </td>

                            ))}

                        </tr>

                        <tr>

                            <td
                                className="label-cell"
                                style={labelStyle}
                            >
                                VDRL
                            </td>

                            {units.map((unit, index) => (

                                <td
                                    key={index}
                                    style={tdStyle}
                                >
                                    {unit.vdrl || "-"}
                                </td>

                            ))}

                        </tr>

                        <tr>

                            <td
                                className="label-cell"
                                style={labelStyle}
                            >
                                Cross Match
                            </td>

                            {units.map((unit, index) => (

                                <td
                                    key={index}
                                    style={{
                                        ...tdStyle,
                                        fontWeight: "bold",
                                        color:
                                            unit.crossMatch === "Compatible"
                                                ? "#0b7d2b"
                                                : unit.crossMatch === "Incompatible"
                                                ? "#b00020"
                                                : "inherit",
                                    }}
                                >
                                    {unit.crossMatch || "-"}
                                </td>

                            ))}

                        </tr>

                    </tbody>

                </table>

            )}

            {/* ===================================== */}
            {/* Interpretation                        */}
            {/* ===================================== */}

            {data.interpretation && (

                <div className="report-comment">

                    <h4 style={commentTitleStyle}>
                        Interpretation
                    </h4>

                    <p style={commentTextStyle}>
                        {data.interpretation}
                    </p>

                </div>

            )}

            {/* ===================================== */}
            {/* Impression                            */}
            {/* ===================================== */}

            {data.impression && (

                <div className="report-comment">

                    <h4 style={commentTitleStyle}>
                        Impression
                    </h4>

                    <p style={commentTextStyle}>
                        {data.impression}
                    </p>

                </div>

            )}

            {/* ===================================== */}
            {/* Scientist Remark                      */}
            {/* ===================================== */}

            {data.remark && (

                <div className="report-comment">

                    <h4 style={commentTitleStyle}>
                        Scientist Remark
                    </h4>

                    <p style={commentTextStyle}>
                        {data.remark}
                    </p>

                </div>

            )}

        </div>

    );

}