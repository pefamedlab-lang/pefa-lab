import { useEffect, useState } from "react";
import antibiotics from "../../data/antibiotics";

const defaultAntibiotics = antibiotics.map((drug) => ({
    antibiotic: drug,
    result: ""
}));

export default function BloodCultureForm({
    resultData,
    setResultData,
}) {

    const [form, setForm] = useState({

        /* ==========================
           SPECIMEN INFORMATION
        ========================== */

        specimenType: "Blood",

        collectionDate: "",

        receivedDate: "",

        processedDate: "",

        specimenCondition: "",

        patientOnAntibiotics: "",

        antibioticDetails: "",


        /* ==========================
           BLOOD CULTURE BOTTLE
        ========================== */

        bottleType: "",

        bottleNumber: "",

        bloodVolume: "",

        bottleCondition: "",

        bottleAppearance: "",


        /* ==========================
           INCUBATION
        ========================== */

        incubationStartDate: "",

        incubationEndDate: "",

        incubationPeriod: "",

        incubationSystem: "",


        /* ==========================
           BOTTLE EXAMINATION
        ========================== */

        bottleGrowth: "",

        bottleAppearanceAfterIncubation: "",

        gasProduction: "",

        haemolysis: "",

        turbidity: "",


        /* ==========================
           GRAM STAIN / PRELIMINARY
        ========================== */

        gramStain: "",

        organismMorphology: "",

        gramReaction: "",

        preliminaryReport: "",


        /* ==========================
           CULTURE / IDENTIFICATION
        ========================== */

        cultureGrowth: "",

        subcultureGrowth: "",

        organismIsolated: "",

        organismIdentification: "",

        colonyMorphology: "",

        identificationMethod: "",

        otherOrganisms: "",


        /* ==========================
           ANTIBIOTIC SUSCEPTIBILITY
        ========================== */

        antibiotics: defaultAntibiotics,


        /* ==========================
           FINAL REPORT
        ========================== */

        finalInterpretation: "",

        scientistRemark: ""

    });


    const [open, setOpen] = useState({

        specimen: true,

        bottle: false,

        incubation: false,

        examination: false,

        gramStain: false,

        culture: false,

        antibiotics: false,

        interpretation: false,

        summary: false

    });


    const toggle = (section) => {

        setOpen((prev) => ({

            ...prev,

            [section]: !prev[section]

        }));

    };


    /* ==========================
       LOAD SAVED RESULT
    ========================== */

    useEffect(() => {

        if (
            resultData &&
            Object.keys(resultData).length
        ) {

            setForm(prev => ({

                ...prev,

                ...resultData

            }));

        }

    }, [resultData]);


    /* ==========================
       UPDATE SINGLE FIELD
    ========================== */

    const updateField = (
        field,
        value
    ) => {

        const updated = {

            ...form,

            [field]: value

        };

        setForm(updated);

        setResultData(updated);

    };


    /* ==========================
       UPDATE ANTIBIOTIC
    ========================== */

    const updateAntibiotic = (
        index,
        field,
        value
    ) => {

        const updatedAntibiotics = [
            ...form.antibiotics
        ];

        updatedAntibiotics[index] = {

            ...updatedAntibiotics[index],

            [field]: value

        };

        updateField(
            "antibiotics",
            updatedAntibiotics
        );

    };


    /* ==========================
       GENERATE INTERPRETATION
    ========================== */

    const generateInterpretation = () => {

        let interpretation = "";


        if (form.cultureGrowth === "No Growth") {

            interpretation =
                "No bacterial growth detected after the stated incubation period.";

        }


        else if (
            form.cultureGrowth === "Growth"
        ) {

            interpretation =
                `Bacterial growth detected. ${form.organismIsolated || "Organism identification pending"}.`;


            const sensitive = form.antibiotics
                .filter(
                    a => a.result === "Sensitive"
                )
                .map(a =>
                    a.antibiotic === "__CUSTOM__"
                        ? a.customAntibiotic
                        : a.antibiotic
                );


            const intermediate = form.antibiotics
                .filter(
                    a => a.result === "Intermediate"
                )
                .map(a =>
                    a.antibiotic === "__CUSTOM__"
                        ? a.customAntibiotic
                        : a.antibiotic
                );


            const resistant = form.antibiotics
                .filter(
                    a => a.result === "Resistant"
                )
                .map(a =>
                    a.antibiotic === "__CUSTOM__"
                        ? a.customAntibiotic
                        : a.antibiotic
                );


            if (sensitive.length) {

                interpretation +=
                    ` Sensitive to ${sensitive.join(", ")}.`;

            }


            if (intermediate.length) {

                interpretation +=
                    ` Intermediate susceptibility to ${intermediate.join(", ")}.`;

            }


            if (resistant.length) {

                interpretation +=
                    ` Resistant to ${resistant.join(", ")}.`;

            }

        }


        else if (
            form.cultureGrowth === "Contaminant Suspected"
        ) {

            interpretation =
                "Growth detected. Findings may represent contamination; clinical correlation and repeat blood culture may be considered where clinically indicated.";

        }


        else {

            interpretation =
                "Blood culture result requires further laboratory interpretation.";

        }


        updateField(
            "finalInterpretation",
            interpretation
        );

    };


    /* ==========================
       ADD ANTIBIOTIC
    ========================== */

    const addAntibiotic = () => {

        updateField(

            "antibiotics",

            [

                ...form.antibiotics,

                {

                    antibiotic: "",

                    result: ""

                }

            ]

        );

    };


    /* ==========================
       REMOVE ANTIBIOTIC
    ========================== */

    const removeAntibiotic = (
        index
    ) => {

        if (
            form.antibiotics.length === 1
        ) return;


        updateField(

            "antibiotics",

            form.antibiotics.filter(
                (_, i) => i !== index
            )

        );

    };


    /* ==========================
       TESTED ANTIBIOTICS
    ========================== */

    const testedAntibiotics =
        form.antibiotics.filter(

            (drug) =>

                drug.result &&
                (
                    drug.antibiotic ||
                    drug.customAntibiotic
                )

        );


    return (

        <div className="mcs-form">

            <h2>Blood Culture</h2>


            {/* ==========================
                SPECIMEN INFORMATION
            ========================== */}

            <div className="form-section">

                <div
                    className="section-header"
                    onClick={() => toggle("specimen")}
                >

                    <span>
                        Specimen Information
                    </span>

                    <span>
                        {open.specimen ? "−" : "+"}
                    </span>

                </div>


                {open.specimen && (

                    <table className="result-table">

                        <tbody>

                            <tr>

                                <td>Specimen Type</td>

                                <td>

                                    <input
                                        type="text"
                                        value={form.specimenType}
                                        onChange={(e) =>
                                            updateField(
                                                "specimenType",
                                                e.target.value
                                            )
                                        }
                                    />

                                </td>

                            </tr>


                            <tr>

                                <td>Collection Date / Time</td>

                                <td>

                                    <input
                                        type="datetime-local"
                                        value={form.collectionDate}
                                        onChange={(e) =>
                                            updateField(
                                                "collectionDate",
                                                e.target.value
                                            )
                                        }
                                    />

                                </td>

                            </tr>


                            <tr>

                                <td>Received Date / Time</td>

                                <td>

                                    <input
                                        type="datetime-local"
                                        value={form.receivedDate}
                                        onChange={(e) =>
                                            updateField(
                                                "receivedDate",
                                                e.target.value
                                            )
                                        }
                                    />

                                </td>

                            </tr>


                            <tr>

                                <td>Processed Date / Time</td>

                                <td>

                                    <input
                                        type="datetime-local"
                                        value={form.processedDate}
                                        onChange={(e) =>
                                            updateField(
                                                "processedDate",
                                                e.target.value
                                            )
                                        }
                                    />

                                </td>

                            </tr>


                            <tr>

                                <td>Specimen Condition</td>

                                <td>

                                    <input
                                        type="text"
                                        value={form.specimenCondition}
                                        placeholder="Adequate / Inadequate / Leaking..."
                                        onChange={(e) =>
                                            updateField(
                                                "specimenCondition",
                                                e.target.value
                                            )
                                        }
                                    />

                                </td>

                            </tr>


                            <tr>

                                <td>Patient on Antibiotics?</td>

                                <td>

                                    <select
                                        value={form.patientOnAntibiotics}
                                        onChange={(e) =>
                                            updateField(
                                                "patientOnAntibiotics",
                                                e.target.value
                                            )
                                        }
                                    >

                                        <option value="">
                                            Select
                                        </option>

                                        <option value="Yes">
                                            Yes
                                        </option>

                                        <option value="No">
                                            No
                                        </option>

                                        <option value="Unknown">
                                            Unknown
                                        </option>

                                    </select>

                                </td>

                            </tr>


                            {form.patientOnAntibiotics === "Yes" && (

                                <tr>

                                    <td>Antibiotic Details</td>

                                    <td>

                                        <textarea
                                            rows={2}
                                            value={form.antibioticDetails}
                                            placeholder="Enter antibiotic name / treatment details..."
                                            onChange={(e) =>
                                                updateField(
                                                    "antibioticDetails",
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                )}

            </div>


            {/* ==========================
                BLOOD CULTURE BOTTLE
            ========================== */}

            <div className="form-section">

                <div
                    className="section-header"
                    onClick={() => toggle("bottle")}
                >

                    <span>
                        Blood Culture Bottle Information
                    </span>

                    <span>
                        {open.bottle ? "−" : "+"}
                    </span>

                </div>


                {open.bottle && (

                    <table className="result-table">

                        <tbody>

                            <tr>

                                <td>Bottle Type</td>

                                <td>

                                    <select
                                        value={form.bottleType}
                                        onChange={(e) =>
                                            updateField(
                                                "bottleType",
                                                e.target.value
                                            )
                                        }
                                    >

                                        <option value="">
                                            Select
                                        </option>

                                        <option>
                                            Aerobic
                                        </option>

                                        <option>
                                            Anaerobic
                                        </option>

                                        <option>
                                            Paediatric
                                        </option>

                                        <option>
                                            Fungal
                                        </option>

                                        <option>
                                            Other
                                        </option>

                                    </select>

                                </td>

                            </tr>


                            <tr>

                                <td>Bottle Number / Set</td>

                                <td>

                                    <input
                                        type="text"
                                        value={form.bottleNumber}
                                        placeholder="e.g. Set 1 / Bottle A"
                                        onChange={(e) =>
                                            updateField(
                                                "bottleNumber",
                                                e.target.value
                                            )
                                        }
                                    />

                                </td>

                            </tr>


                            <tr>

                                <td>Blood Volume</td>

                                <td>

                                    <input
                                        type="text"
                                        value={form.bloodVolume}
                                        placeholder="e.g. 8 mL"
                                        onChange={(e) =>
                                            updateField(
                                                "bloodVolume",
                                                e.target.value
                                            )
                                        }
                                    />

                                </td>

                            </tr>


                            <tr>

                                <td>Bottle Condition</td>

                                <td>

                                    <select
                                        value={form.bottleCondition}
                                        onChange={(e) =>
                                            updateField(
                                                "bottleCondition",
                                                e.target.value
                                            )
                                        }
                                    >

                                        <option value="">
                                            Select
                                        </option>

                                        <option>
                                            Intact
                                        </option>

                                        <option>
                                            Leaking
                                        </option>

                                        <option>
                                            Broken
                                        </option>

                                        <option>
                                            Contaminated
                                        </option>

                                    </select>

                                </td>

                            </tr>


                            <tr>

                                <td>Initial Bottle Appearance</td>

                                <td>

                                    <select
                                        value={form.bottleAppearance}
                                        onChange={(e) =>
                                            updateField(
                                                "bottleAppearance",
                                                e.target.value
                                            )
                                        }
                                    >

                                        <option value="">
                                            Select
                                        </option>

                                        <option>
                                            Clear
                                        </option>

                                        <option>
                                            Turbid
                                        </option>

                                        <option>
                                            Haemolysed
                                        </option>

                                        <option>
                                            Bloody
                                        </option>

                                    </select>

                                </td>

                            </tr>

                        </tbody>

                    </table>

                )}

            </div>


            {/* ==========================
                INCUBATION
            ========================== */}

            <div className="form-section">

                <div
                    className="section-header"
                    onClick={() => toggle("incubation")}
                >

                    <span>
                        Incubation
                    </span>

                    <span>
                        {open.incubation ? "−" : "+"}
                    </span>

                </div>


                {open.incubation && (

                    <table className="result-table">

                        <tbody>

                            <tr>

                                <td>Incubation Start</td>

                                <td>

                                    <input
                                        type="datetime-local"
                                        value={form.incubationStartDate}
                                        onChange={(e) =>
                                            updateField(
                                                "incubationStartDate",
                                                e.target.value
                                            )
                                        }
                                    />

                                </td>

                            </tr>


                            <tr>

                                <td>Incubation End</td>

                                <td>

                                    <input
                                        type="datetime-local"
                                        value={form.incubationEndDate}
                                        onChange={(e) =>
                                            updateField(
                                                "incubationEndDate",
                                                e.target.value
                                            )
                                        }
                                    />

                                </td>

                            </tr>


                            <tr>

                                <td>Incubation Period</td>

                                <td>

                                    <input
                                        type="text"
                                        value={form.incubationPeriod}
                                        placeholder="e.g. 5 days"
                                        onChange={(e) =>
                                            updateField(
                                                "incubationPeriod",
                                                e.target.value
                                            )
                                        }
                                    />

                                </td>

                            </tr>


                            <tr>

                                <td>Incubation System</td>

                                <td>

                                    <input
                                        type="text"
                                        value={form.incubationSystem}
                                        placeholder="e.g. Automated blood culture system"
                                        onChange={(e) =>
                                            updateField(
                                                "incubationSystem",
                                                e.target.value
                                            )
                                        }
                                    />

                                </td>

                            </tr>

                        </tbody>

                    </table>

                )}

            </div>


            {/* ==========================
                BOTTLE EXAMINATION
            ========================== */}

            <div className="form-section">

                <div
                    className="section-header"
                    onClick={() => toggle("examination")}
                >

                    <span>
                        Bottle Examination
                    </span>

                    <span>
                        {open.examination ? "−" : "+"}
                    </span>

                </div>


                {open.examination && (

                    <table className="result-table">

                        <tbody>

                            <tr>

                                <td>Culture Growth</td>

                                <td>

                                    <select
                                        value={form.bottleGrowth}
                                        onChange={(e) =>
                                            updateField(
                                                "bottleGrowth",
                                                e.target.value
                                            )
                                        }
                                    >

                                        <option value="">
                                            Select
                                        </option>

                                        <option>
                                            No Growth
                                        </option>

                                        <option>
                                            Growth Detected
                                        </option>

                                        <option>
                                            Suspected Growth
                                        </option>

                                    </select>

                                </td>

                            </tr>


                            <tr>

                                <td>Appearance After Incubation</td>

                                <td>

                                    <select
                                        value={
                                            form.bottleAppearanceAfterIncubation
                                        }
                                        onChange={(e) =>
                                            updateField(
                                                "bottleAppearanceAfterIncubation",
                                                e.target.value
                                            )
                                        }
                                    >

                                        <option value="">
                                            Select
                                        </option>

                                        <option>
                                            Clear
                                        </option>

                                        <option>
                                            Turbid
                                        </option>

                                        <option>
                                            Haemolysed
                                        </option>

                                        <option>
                                            Pellicle Present
                                        </option>

                                        <option>
                                            Sediment Present
                                        </option>

                                    </select>

                                </td>

                            </tr>


                            <tr>

                                <td>Gas Production</td>

                                <td>

                                    <select
                                        value={form.gasProduction}
                                        onChange={(e) =>
                                            updateField(
                                                "gasProduction",
                                                e.target.value
                                            )
                                        }
                                    >

                                        <option value="">
                                            Select
                                        </option>

                                        <option>
                                            None
                                        </option>

                                        <option>
                                            Present
                                        </option>

                                    </select>

                                </td>

                            </tr>


                            <tr>

                                <td>Haemolysis</td>

                                <td>

                                    <select
                                        value={form.haemolysis}
                                        onChange={(e) =>
                                            updateField(
                                                "haemolysis",
                                                e.target.value
                                            )
                                        }
                                    >

                                        <option value="">
                                            Select
                                        </option>

                                        <option>
                                            None
                                        </option>

                                        <option>
                                            Alpha
                                        </option>

                                        <option>
                                            Beta
                                        </option>

                                        <option>
                                            Double Zone
                                        </option>

                                    </select>

                                </td>

                            </tr>


                            <tr>

                                <td>Turbidity</td>

                                <td>

                                    <select
                                        value={form.turbidity}
                                        onChange={(e) =>
                                            updateField(
                                                "turbidity",
                                                e.target.value
                                            )
                                        }
                                    >

                                        <option value="">
                                            Select
                                        </option>

                                        <option>
                                            Clear
                                        </option>

                                        <option>
                                            Slightly Turbid
                                        </option>

                                        <option>
                                            Turbid
                                        </option>

                                        <option>
                                            Heavily Turbid
                                        </option>

                                    </select>

                                </td>

                            </tr>

                        </tbody>

                    </table>

                )}

            </div>


            {/* ==========================
                GRAM STAIN
            ========================== */}

            <div className="form-section">

                <div
                    className="section-header"
                    onClick={() => toggle("gramStain")}
                >

                    <span>
                        Gram Stain / Preliminary Findings
                    </span>

                    <span>
                        {open.gramStain ? "−" : "+"}
                    </span>

                </div>


                {open.gramStain && (

                    <table className="result-table">

                        <tbody>

                            <tr>

                                <td>Gram Stain</td>

                                <td>

                                    <select
                                        value={form.gramStain}
                                        onChange={(e) =>
                                            updateField(
                                                "gramStain",
                                                e.target.value
                                            )
                                        }
                                    >

                                        <option value="">
                                            Select
                                        </option>

                                        <option>
                                            No Organisms Seen
                                        </option>

                                        <option>
                                            Gram Positive Cocci
                                        </option>

                                        <option>
                                            Gram Positive Bacilli
                                        </option>

                                        <option>
                                            Gram Negative Cocci
                                        </option>

                                        <option>
                                            Gram Negative Bacilli
                                        </option>

                                        <option>
                                            Yeast Cells
                                        </option>

                                        <option>
                                            Mixed Organisms
                                        </option>

                                    </select>

                                </td>

                            </tr>


                            <tr>

                                <td>Gram Reaction</td>

                                <td>

                                    <select
                                        value={form.gramReaction}
                                        onChange={(e) =>
                                            updateField(
                                                "gramReaction",
                                                e.target.value
                                            )
                                        }
                                    >

                                        <option value="">
                                            Select
                                        </option>

                                        <option>
                                            Gram Positive
                                        </option>

                                        <option>
                                            Gram Negative
                                        </option>

                                        <option>
                                            Mixed
                                        </option>

                                        <option>
                                            Not Seen
                                        </option>

                                    </select>

                                </td>

                            </tr>


                            <tr>

                                <td>Organism Morphology</td>

                                <td>

                                    <input
                                        type="text"
                                        value={form.organismMorphology}
                                        placeholder="e.g. Cocci in clusters"
                                        onChange={(e) =>
                                            updateField(
                                                "organismMorphology",
                                                e.target.value
                                            )
                                        }
                                    />

                                </td>

                            </tr>


                            <tr>

                                <td>Preliminary Report</td>

                                <td>

                                    <textarea
                                        rows={4}
                                        value={form.preliminaryReport}
                                        placeholder="Enter preliminary blood culture report..."
                                        onChange={(e) =>
                                            updateField(
                                                "preliminaryReport",
                                                e.target.value
                                            )
                                        }
                                    />

                                </td>

                            </tr>

                        </tbody>

                    </table>

                )}

            </div>


            {/* ==========================
                CULTURE / IDENTIFICATION
            ========================== */}

            <div className="form-section">

                <div
                    className="section-header"
                    onClick={() => toggle("culture")}
                >

                    <span>
                        Culture & Organism Identification
                    </span>

                    <span>
                        {open.culture ? "−" : "+"}
                    </span>

                </div>


                {open.culture && (

                    <table className="result-table">

                        <tbody>

                            <tr>

                                <td>Culture Growth</td>

                                <td>

                                    <select
                                        value={form.cultureGrowth}
                                        onChange={(e) =>
                                            updateField(
                                                "cultureGrowth",
                                                e.target.value
                                            )
                                        }
                                    >

                                        <option value="">
                                            Select
                                        </option>

                                        <option>
                                            No Growth
                                        </option>

                                        <option>
                                            Growth
                                        </option>

                                        <option>
                                            Mixed Growth
                                        </option>

                                        <option>
                                            Contaminant Suspected
                                        </option>

                                    </select>

                                </td>

                            </tr>


                            <tr>

                                <td>Subculture Growth</td>

                                <td>

                                    <select
                                        value={form.subcultureGrowth}
                                        onChange={(e) =>
                                            updateField(
                                                "subcultureGrowth",
                                                e.target.value
                                            )
                                        }
                                    >

                                        <option value="">
                                            Select
                                        </option>

                                        <option>
                                            No Growth
                                        </option>

                                        <option>
                                            Growth
                                        </option>

                                        <option>
                                            Mixed Growth
                                        </option>

                                    </select>

                                </td>

                            </tr>


                            <tr>

                                <td>Organism Isolated</td>

                                <td>

                                    <input
                                        type="text"
                                        value={form.organismIsolated}
                                        placeholder="e.g. Escherichia coli"
                                        onChange={(e) =>
                                            updateField(
                                                "organismIsolated",
                                                e.target.value
                                            )
                                        }
                                    />

                                </td>

                            </tr>


                            <tr>

                                <td>Organism Identification</td>

                                <td>

                                    <input
                                        type="text"
                                        value={form.organismIdentification}
                                        placeholder="Final organism identification"
                                        onChange={(e) =>
                                            updateField(
                                                "organismIdentification",
                                                e.target.value
                                            )
                                        }
                                    />

                                </td>

                            </tr>


                            <tr>

                                <td>Colony Morphology</td>

                                <td>

                                    <textarea
                                        rows={3}
                                        value={form.colonyMorphology}
                                        placeholder="Size, colour, shape, haemolysis, etc."
                                        onChange={(e) =>
                                            updateField(
                                                "colonyMorphology",
                                                e.target.value
                                            )
                                        }
                                    />

                                </td>

                            </tr>


                            <tr>

                                <td>Identification Method</td>

                                <td>

                                    <select
                                        value={form.identificationMethod}
                                        onChange={(e) =>
                                            updateField(
                                                "identificationMethod",
                                                e.target.value
                                            )
                                        }
                                    >

                                        <option value="">
                                            Select
                                        </option>

                                        <option>
                                            Conventional Biochemical Tests
                                        </option>

                                        <option>
                                            Automated Identification
                                        </option>

                                        <option>
                                            MALDI-TOF
                                        </option>

                                        <option>
                                            Molecular Method
                                        </option>

                                        <option>
                                            Other
                                        </option>

                                    </select>

                                </td>

                            </tr>


                            <tr>

                                <td>Other Organisms</td>

                                <td>

                                    <textarea
                                        rows={3}
                                        value={form.otherOrganisms}
                                        placeholder="Additional organisms identified..."
                                        onChange={(e) =>
                                            updateField(
                                                "otherOrganisms",
                                                e.target.value
                                            )
                                        }
                                    />

                                </td>

                            </tr>

                        </tbody>

                    </table>

                )}

            </div>


            {/* ==========================
                ANTIBIOTIC SUSCEPTIBILITY
            ========================== */}

            {form.cultureGrowth === "Growth" && (

                <div className="form-section">

                    <div
                        className="section-header"
                        onClick={() => toggle("antibiotics")}
                    >

                        <span>
                            Antibiotic Susceptibility
                        </span>

                        <span>
                            {open.antibiotics ? "−" : "+"}
                        </span>

                    </div>


                    {open.antibiotics && (

                        <>

                            <table className="result-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Antibiotic
                                        </th>

                                        <th>
                                            Result
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {form.antibiotics.map(
                                        (item, index) => (

                                            <tr key={index}>

                                                <td>

                                                    <select
                                                        value={
                                                            item.antibiotic
                                                        }
                                                        onChange={(e) =>
                                                            updateAntibiotic(
                                                                index,
                                                                "antibiotic",
                                                                e.target.value
                                                            )
                                                        }
                                                    >

                                                        <option value="">
                                                            Select Antibiotic
                                                        </option>


                                                        {antibiotics.map(
                                                            (drug) => (

                                                                <option
                                                                    key={drug}
                                                                    value={drug}
                                                                >
                                                                    {drug}
                                                                </option>

                                                            )
                                                        )}


                                                        <option value="__CUSTOM__">
                                                            Other (Specify)
                                                        </option>

                                                    </select>


                                                    {item.antibiotic === "__CUSTOM__" && (

                                                        <input
                                                            type="text"
                                                            placeholder="Enter antibiotic"
                                                            value={
                                                                item.customAntibiotic ||
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                updateAntibiotic(
                                                                    index,
                                                                    "customAntibiotic",
                                                                    e.target.value
                                                                )
                                                            }
                                                        />

                                                    )}

                                                </td>


                                                <td>

                                                    <select
                                                        value={item.result}
                                                        onChange={(e) =>
                                                            updateAntibiotic(
                                                                index,
                                                                "result",
                                                                e.target.value
                                                            )
                                                        }
                                                    >

                                                        <option value="">
                                                            Select
                                                        </option>

                                                        <option>
                                                            Sensitive
                                                        </option>

                                                        <option>
                                                            Intermediate
                                                        </option>

                                                        <option>
                                                            Resistant
                                                        </option>

                                                    </select>

                                                </td>


                                                <td>

                                                    <button
                                                        type="button"
                                                        className="remove-btn"
                                                        onClick={() =>
                                                            removeAntibiotic(
                                                                index
                                                            )
                                                        }
                                                    >
                                                        Remove
                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>


                            <button
                                type="button"
                                className="add-btn"
                                onClick={addAntibiotic}
                            >
                                + Add Antibiotic
                            </button>

                        </>

                    )}

                </div>

            )}


            {/* ==========================
                INTERPRETATION
            ========================== */}

            <div className="form-section">

                <div
                    className="section-header"
                    onClick={() => toggle("interpretation")}
                >

                    <span>
                        Final Interpretation
                    </span>

                    <span>
                        {open.interpretation ? "−" : "+"}
                    </span>

                </div>


                {open.interpretation && (

                    <>

                        <button
                            type="button"
                            className="generate-btn"
                            onClick={
                                generateInterpretation
                            }
                        >
                            Generate Interpretation
                        </button>


                        <table className="result-table">

                            <tbody>

                                <tr>

                                    <td>
                                        Final Interpretation
                                    </td>

                                    <td>

                                        <textarea
                                            rows={5}
                                            value={
                                                form.finalInterpretation
                                            }
                                            placeholder="Final blood culture interpretation..."
                                            onChange={(e) =>
                                                updateField(
                                                    "finalInterpretation",
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </td>

                                </tr>


                                <tr>

                                    <td>
                                        Scientist Remark
                                    </td>

                                    <td>

                                        <textarea
                                            rows={4}
                                            value={
                                                form.scientistRemark
                                            }
                                            placeholder="Additional laboratory comment..."
                                            onChange={(e) =>
                                                updateField(
                                                    "scientistRemark",
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </td>

                                </tr>

                            </tbody>

                        </table>

                    </>

                )}

            </div>


            {/* ==========================
                REPORT SUMMARY
            ========================== */}

            <div className="form-section">

                <div
                    className="section-header"
                    onClick={() => toggle("summary")}
                >

                    <span>
                        Report Summary
                    </span>

                    <span>
                        {open.summary ? "−" : "+"}
                    </span>

                </div>


                {open.summary && (

                    <table className="result-table">

                        <tbody>

                            <tr>

                                <td>
                                    Culture Result
                                </td>

                                <td>
                                    {form.cultureGrowth || "—"}
                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Organism
                                </td>

                                <td>
                                    {form.organismIdentification ||
                                        form.organismIsolated ||
                                        "—"}
                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Gram Stain
                                </td>

                                <td>
                                    {form.gramStain || "—"}
                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Antibiotics Tested
                                </td>

                                <td>

                                    {testedAntibiotics.length
                                        ? testedAntibiotics
                                            .map((drug) =>
                                                drug.antibiotic ===
                                                "__CUSTOM__"
                                                    ? drug.customAntibiotic
                                                    : drug.antibiotic
                                            )
                                            .join(", ")
                                        : "—"}

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Final Interpretation
                                </td>

                                <td>
                                    {form.finalInterpretation ||
                                        "—"}
                                </td>

                            </tr>

                        </tbody>

                    </table>

                )}

            </div>

        </div>

    );

}