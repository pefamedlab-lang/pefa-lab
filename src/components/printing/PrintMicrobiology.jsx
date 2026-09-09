import SensitivityPrintTable from "./SensitivityPrintTable";

export default function PrintMicrobiology({
    results = [],
}) {

    /* ======================================================
       NO RESULT
    ====================================================== */

    if (!results.length) {
        return null;
    }

    const report = results[0];

    /* ======================================================
       PARSE RESULT DATA SAFELY
    ====================================================== */

    let data = {};

    try {

        if (typeof report?.result === "string") {

            data = JSON.parse(report.result);

        } else {

            data =
                report?.result ||
                report?.result_data ||
                {};

        }

    } catch {

        data =
            report?.result_data ||
            {};

    }

    /* ======================================================
       PREMIUM REPORT STYLES
       12PX BASE FONT
    ====================================================== */

    const styles = {

        container: {
            width: "100%",
            boxSizing: "border-box",
            fontFamily:
                '"Segoe UI", Arial, Helvetica, sans-serif',
            fontSize: "12px",
            lineHeight: 1.45,
            color: "#1f2937",
            background: "#ffffff",
        },

        section: {
            width: "100%",
            marginBottom: "10px",
            border: "1px solid #d9dee7",
            borderRadius: "5px",
            overflow: "hidden",
            background: "#ffffff",
            boxSizing: "border-box",
        },

        sectionTitle: {
            padding: "6px 10px",
            background: "#f1f4f8",
            borderBottom: "1px solid #d9dee7",
            color: "#26364a",
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.25px",
        },

        table: {
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
            fontSize: "12px",
        },

        labelCell: {
            width: "20%",
            padding: "5px 8px",
            background: "#fafbfc",
            borderRight: "1px solid #e1e5eb",
            borderBottom: "1px solid #e5e7eb",
            color: "#374151",
            fontWeight: 600,
            verticalAlign: "middle",
        },

        valueCell: {
            width: "30%",
            padding: "5px 8px",
            borderRight: "1px solid #e5e7eb",
            borderBottom: "1px solid #e5e7eb",
            color: "#111827",
            fontWeight: 500,
            verticalAlign: "middle",
            wordBreak: "break-word",
        },

        lastValueCell: {
            width: "30%",
            padding: "5px 8px",
            borderBottom: "1px solid #e5e7eb",
            color: "#111827",
            fontWeight: 500,
            verticalAlign: "middle",
            wordBreak: "break-word",
        },

        reportLine: {
            display: "flex",
            alignItems: "flex-start",
            width: "100%",
            padding: "6px 9px",
            borderBottom: "1px solid #e5e7eb",
            boxSizing: "border-box",
        },

        reportLineLast: {
            display: "flex",
            alignItems: "flex-start",
            width: "100%",
            padding: "6px 9px",
            boxSizing: "border-box",
        },

        reportLabel: {
            width: "145px",
            minWidth: "145px",
            paddingRight: "12px",
            color: "#374151",
            fontWeight: 700,
            flexShrink: 0,
            boxSizing: "border-box",
        },

        reportValue: {
            flex: 1,
            color: "#111827",
            fontWeight: 500,
            wordBreak: "break-word",
        },

        organismValue: {
            flex: 1,
            color: "#111827",
            fontWeight: 700,
            wordBreak: "break-word",
        },

        sensitivityContainer: {
            padding: "8px",
            background: "#ffffff",
        },

    };

    /* ======================================================
       HELPER
       GET FIRST AVAILABLE VALUE
    ====================================================== */

    const getValue = (...values) => {

        for (const value of values) {

            if (
                value !== undefined &&
                value !== null &&
                value !== ""
            ) {
                return value;
            }

        }

        return "";

    };

    /* ======================================================
       FOUR-COLUMN RESULT TABLE
    ====================================================== */

    const renderFourColumnTable = (rows = []) => {

        if (!rows.length) {
            return null;
        }

        const pairedRows = [];

        for (let i = 0; i < rows.length; i += 2) {

            pairedRows.push([
                rows[i],
                rows[i + 1] || ["", ""],
            ]);

        }

        return (

            <table style={styles.table}>

                <tbody>

                    {pairedRows.map(
                        ([left, right], index) => (

                            <tr key={index}>

                                <td style={styles.labelCell}>
                                    {left?.[0] || ""}
                                </td>

                                <td style={styles.valueCell}>
                                    {left?.[1] || "-"}
                                </td>

                                <td style={styles.labelCell}>
                                    {right?.[0] || ""}
                                </td>

                                <td style={styles.lastValueCell}>
                                    {right?.[1] || ""}
                                </td>

                            </tr>

                        )
                    )}

                </tbody>

            </table>

        );

    };

    /* ======================================================
       MACROSCOPY
    ====================================================== */

    const macroscopyRows = [

        [
            "Colour",
            getValue(data.colour),
        ],

        [
            "Appearance",
            getValue(data.appearance),
        ],

        [
            "Odour",
            getValue(data.odour),
        ],

        [
            "Volume",
            getValue(data.volume),
        ],

    ].filter(([, value]) => value);

    /* ======================================================
       MICROSCOPY
    ====================================================== */

    const microscopyRows = [

        [
            "Pus Cells",
            getValue(data.pusCells),
        ],

        [
            "Red Blood Cells",
            getValue(
                data.redBloodCells,
                data.rbcs,
                data.rbc
            ),
        ],

        [
            "Epithelial Cells",
            getValue(data.epithelialCells),
        ],

        [
            "Casts",
            getValue(data.casts),
        ],

        [
            "Crystals",
            getValue(data.crystals),
        ],

        [
            "Yeast Cells",
            getValue(data.yeastCells),
        ],

        [
            "Parasites",
            getValue(data.parasites),
        ],

        [
            "Bacteria Seen",
            getValue(
                data.bacteriaSeen,
                data.bacteria
            ),
        ],

        [
            "Others",
            getValue(data.others),
        ],

    ].filter(([, value]) => value);

    /* ======================================================
       SPECIMEN INFORMATION
    ====================================================== */

    const specimenRows = [

        [
            "Specimen Type",
            getValue(data.specimenType),
        ],

        [
            "Specimen Condition",
            getValue(data.specimenCondition),
        ],

        [
            "Collection Date / Time",
            getValue(data.collectionDate),
        ],

        [
            "Received Date / Time",
            getValue(data.receivedDate),
        ],

        [
            "Processed Date / Time",
            getValue(data.processedDate),
        ],

    ].filter(([, value]) => value);

    /* ======================================================
       CULTURE VALUES
    ====================================================== */

    const cultureGrowth = getValue(
        data.cultureGrowth,
        data.culture
    );

    const organism = getValue(
        data.organismIsolated,
        data.organism
    );

    const colonyCount = getValue(
        data.colonyCount
    );

    /* ======================================================
       OTHER REPORT VALUES
    ====================================================== */

    const afbResult = getValue(
        data.afb,
        data.afbResult
    );

    const comment = getValue(
        data.comment
    );

    const impression = getValue(
        data.impression
    );

    const scientistRemark = getValue(
        data.scientistRemark,
        data.remark
    );

    /* ======================================================
       SENSITIVITY VISIBILITY
    ====================================================== */

    const hideSensitivity =
        !data.sensitivity ||
        data.sensitivity.length === 0 ||
        cultureGrowth === "No Growth" ||
        organism === "Candida spp" ||
        organism === "Candida Species";

    /* ======================================================
       RENDER
    ====================================================== */

    return (

        <div style={styles.container}>

            {/* ==================================================
                SPECIMEN INFORMATION
            ================================================== */}

            {specimenRows.length > 0 && (

                <div style={styles.section}>

                    <div style={styles.sectionTitle}>
                        Specimen Information
                    </div>

                    {renderFourColumnTable(specimenRows)}

                </div>

            )}

            {/* ==================================================
                MACROSCOPIC EXAMINATION
            ================================================== */}

            {macroscopyRows.length > 0 && (

                <div style={styles.section}>

                    <div style={styles.sectionTitle}>
                        Macroscopic Examination
                    </div>

                    {renderFourColumnTable(macroscopyRows)}

                </div>

            )}

            {/* ==================================================
                MICROSCOPIC EXAMINATION
            ================================================== */}

            {microscopyRows.length > 0 && (

                <div style={styles.section}>

                    <div style={styles.sectionTitle}>
                        Microscopic Examination
                    </div>

                    {renderFourColumnTable(microscopyRows)}

                </div>

            )}

            {/* ==================================================
                CULTURE
            ================================================== */}

            {(
                cultureGrowth ||
                colonyCount
            ) && (

                <div style={styles.section}>

                    <div style={styles.sectionTitle}>
                        Culture
                    </div>

                    {cultureGrowth && (

                        <div style={styles.reportLine}>

                            <span style={styles.reportLabel}>
                                Culture Growth
                            </span>

                            <span style={styles.reportValue}>
                                {cultureGrowth}
                            </span>

                        </div>

                    )}

                    {colonyCount && (

                        <div style={styles.reportLineLast}>

                            <span style={styles.reportLabel}>
                                Colony Count
                            </span>

                            <span style={styles.reportValue}>
                                {colonyCount}
                            </span>

                        </div>

                    )}

                </div>

            )}

            {/* ==================================================
                ISOLATED ORGANISM
            ================================================== */}

            {organism && (

                <div style={styles.section}>

                    <div style={styles.reportLineLast}>

                        <span style={styles.reportLabel}>
                            Isolated Organism
                        </span>

                        <span style={styles.organismValue}>
                            {organism}
                        </span>

                    </div>

                </div>

            )}

            {/* ==================================================
                AFB RESULT
            ================================================== */}

            {afbResult && (

                <div style={styles.section}>

                    <div style={styles.reportLineLast}>

                        <span style={styles.reportLabel}>
                            AFB Result
                        </span>

                        <span style={styles.reportValue}>
                            {afbResult}
                        </span>

                    </div>

                </div>

            )}

            {/* ==================================================
                ANTIMICROBIAL SUSCEPTIBILITY
            ================================================== */}

            {!hideSensitivity && (

                <div style={styles.section}>

                    <div style={styles.sectionTitle}>
                        Antimicrobial Susceptibility
                    </div>

                    <div style={styles.sensitivityContainer}>

                        <SensitivityPrintTable
                            data={data.sensitivity}
                        />

                    </div>

                </div>

            )}

            {/* ==================================================
                COMMENT
            ================================================== */}

            {comment && (

                <div style={styles.section}>

                    <div style={styles.reportLineLast}>

                        <span style={styles.reportLabel}>
                            Comment
                        </span>

                        <span style={styles.reportValue}>
                            {comment}
                        </span>

                    </div>

                </div>

            )}

            {/* ==================================================
                IMPRESSION
            ================================================== */}

            {impression && (

                <div style={styles.section}>

                    <div style={styles.reportLineLast}>

                        <span style={styles.reportLabel}>
                            Impression
                        </span>

                        <span style={styles.reportValue}>
                            {impression}
                        </span>

                    </div>

                </div>

            )}

            {/* ==================================================
                SCIENTIST REMARK
            ================================================== */}

            {scientistRemark && (

                <div style={styles.section}>

                    <div style={styles.reportLineLast}>

                        <span style={styles.reportLabel}>
                            Scientist Remark
                        </span>

                        <span style={styles.reportValue}>
                            {scientistRemark}
                        </span>

                    </div>

                </div>

            )}

        </div>

    );

}
