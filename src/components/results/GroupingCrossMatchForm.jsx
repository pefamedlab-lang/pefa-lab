import React from "react";

const emptyUnit = () => ({
    unitNumber: "",
    donorGroup: "",
    donorRh: "",
    collectionDate: "",
    expiryDate: "",
    donorHb: "",
    hiv: "",
    hbsag: "",
    hcv: "",
    vdrl: "",
    crossMatch: "",
});

export default function GroupingCrossMatchForm({
    resultData = {},
    setResultData,
}) {

    const units =
        Array.isArray(resultData.units) &&
        resultData.units.length
            ? resultData.units
            : [emptyUnit()];

    /* ==========================================
       UPDATE GENERAL FIELD
    ========================================== */

    const updateField = (field, value) => {

        setResultData(prev => ({
            ...prev,
            [field]: value,
        }));

    };

    /* ==========================================
       UPDATE BLOOD UNIT
    ========================================== */

    const updateUnitField = (
        index,
        field,
        value
    ) => {

        const updatedUnits = [...units];

        updatedUnits[index] = {
            ...updatedUnits[index],
            [field]: value,
        };

        /* Auto Interpretation */

        const compatible = updatedUnits.filter(
            u => u.crossMatch === "Compatible"
        ).length;

        const incompatible = updatedUnits.filter(
            u => u.crossMatch === "Incompatible"
        ).length;

        let interpretation = "";
        let impression = "";

        if (compatible > 0) {

            interpretation =
                `${compatible} blood unit(s) compatible with recipient serum.`;

            impression =
                "Compatible blood unit(s) available for transfusion.";

        }

        if (incompatible > 0 && compatible === 0) {

            interpretation =
                "No compatible blood unit identified.";

            impression =
                "Do not transfuse incompatible blood.";

        }

        setResultData(prev => ({
            ...prev,
            units: updatedUnits,
            interpretation,
            impression,
        }));

    };

    /* ==========================================
       ADD UNIT
    ========================================== */

    const addUnit = () => {

        if (units.length >= 4) return;

        setResultData(prev => ({
            ...prev,
            units: [
                ...units,
                emptyUnit(),
            ],
        }));

    };

    /* ==========================================
       REMOVE LAST UNIT
    ========================================== */

    const removeLastUnit = () => {

        if (units.length <= 1) return;

        setResultData(prev => ({
            ...prev,
            units: units.slice(
                0,
                units.length - 1
            ),
        }));

    };

    const bloodGroups = [
        "",
        "A",
        "B",
        "AB",
        "O",
    ];

    const rhOptions = [
        "",
        "Positive",
        "Negative",
    ];

    const screeningOptions = [
        "",
        "Reactive",
        "Non-Reactive",
    ];

    const crossMatchOptions = [
        "",
        "Compatible",
        "Incompatible",
    ];

    return (

        <div className="dashboard-card">

            <h3>
                Blood Grouping & Crossmatching
            </h3>

            {/* =======================================
                RECIPIENT INFORMATION
            ======================================== */}

            <table className="result-table">

                <tbody>

                    <tr>

                        <td>
                            Recipient Blood Group
                        </td>

                        <td>

                            <select
                                value={
                                    resultData.recipientGroup || ""
                                }
                                onChange={(e) =>
                                    updateField(
                                        "recipientGroup",
                                        e.target.value
                                    )
                                }
                            >

                                <option value="">
                                    Select Blood Group
                                </option>

                                {bloodGroups
                                    .filter(Boolean)
                                    .map(group => (

                                        <option
                                            key={group}
                                            value={group}
                                        >
                                            {group}
                                        </option>

                                    ))}

                            </select>

                        </td>

                    </tr>

                    <tr>

                        <td>
                            Recipient Rh(D)
                        </td>

                        <td>

                            <select
                                value={
                                    resultData.recipientRh || ""
                                }
                                onChange={(e) =>
                                    updateField(
                                        "recipientRh",
                                        e.target.value
                                    )
                                }
                            >

                                <option value="">
                                    Select Rh(D)
                                </option>

                                {rhOptions
                                    .filter(Boolean)
                                    .map(item => (

                                        <option
                                            key={item}
                                            value={item}
                                        >
                                            {item}
                                        </option>

                                    ))}

                            </select>

                        </td>

                    </tr>

                    <tr>

                        <td>
                            Recipient RVS Status
                        </td>

                        <td>

                            <select
                                value={
                                    resultData.recipientRVS || ""
                                }
                                onChange={(e) =>
                                    updateField(
                                        "recipientRVS",
                                        e.target.value
                                    )
                                }
                            >

                                <option value="">
                                    Select Status
                                </option>

                                {screeningOptions
                                    .filter(Boolean)
                                    .map(item => (

                                        <option
                                            key={item}
                                            value={item}
                                        >
                                            {item}
                                        </option>

                                    ))}

                            </select>

                        </td>

                    </tr>

                </tbody>

            </table>

            <h4
                style={{
                    marginTop: 30,
                    marginBottom: 10,
                }}
            >
                Compatible Blood Units
            </h4>

            <table className="result-table">

                <thead>

                    <tr>

                        <th
                            style={{
                                width: "220px",
                            }}
                        >
                            Parameter
                        </th>

                        {units.map((_, index) => (

                            <th key={index}>
                                Unit {index + 1}
                            </th>

                        ))}

                    </tr>

                </thead>

                <tbody>

{/* Blood Bag Number */}

<tr>

    <td>Blood Bag Number</td>

    {units.map((unit, index) => (

        <td key={index}>

            <input
                value={unit.unitNumber}
                onChange={(e) =>
                    updateUnitField(
                        index,
                        "unitNumber",
                        e.target.value
                    )
                }
            />

        </td>

    ))}

</tr>

{/* Donor Blood Group */}

<tr>

    <td>Donor Blood Group</td>

    {units.map((unit, index) => (

        <td key={index}>

            <select
                value={unit.donorGroup}
                onChange={(e) =>
                    updateUnitField(
                        index,
                        "donorGroup",
                        e.target.value
                    )
                }
            >

                <option value="">Select</option>

                {bloodGroups
                    .filter(Boolean)
                    .map(group => (

                        <option
                            key={group}
                            value={group}
                        >
                            {group}
                        </option>

                    ))}

            </select>

        </td>

    ))}

</tr>

{/* Donor Rh */}

<tr>

    <td>Donor Rh(D)</td>

    {units.map((unit, index) => (

        <td key={index}>

            <select
                value={unit.donorRh}
                onChange={(e) =>
                    updateUnitField(
                        index,
                        "donorRh",
                        e.target.value
                    )
                }
            >

                <option value="">Select</option>

                {rhOptions
                    .filter(Boolean)
                    .map(item => (

                        <option
                            key={item}
                            value={item}
                        >
                            {item}
                        </option>

                    ))}

            </select>

        </td>

    ))}

</tr>

{/* Collection Date */}

<tr>

    <td>Collection Date</td>

    {units.map((unit, index) => (

        <td key={index}>

            <input
                type="date"
                value={unit.collectionDate}
                onChange={(e) =>
                    updateUnitField(
                        index,
                        "collectionDate",
                        e.target.value
                    )
                }
            />

        </td>

    ))}

</tr>

{/* Expiry Date */}

<tr>

    <td>Expiry Date</td>

    {units.map((unit, index) => (

        <td key={index}>

            <input
                type="date"
                value={unit.expiryDate}
                onChange={(e) =>
                    updateUnitField(
                        index,
                        "expiryDate",
                        e.target.value
                    )
                }
            />

        </td>

    ))}

</tr>

{/* Donor Hb */}

<tr>

    <td>Donor Hb (g/dL)</td>

    {units.map((unit, index) => (

        <td key={index}>

            <input
                value={unit.donorHb}
                onChange={(e) =>
                    updateUnitField(
                        index,
                        "donorHb",
                        e.target.value
                    )
                }
            />

        </td>

    ))}

</tr>

{/* HIV */}

<tr>

    <td>HIV I & II</td>

    {units.map((unit, index) => (

        <td key={index}>

            <select
                value={unit.hiv}
                onChange={(e) =>
                    updateUnitField(
                        index,
                        "hiv",
                        e.target.value
                    )
                }
            >

                <option value="">Select</option>

                {screeningOptions
                    .filter(Boolean)
                    .map(item => (

                        <option
                            key={item}
                            value={item}
                        >
                            {item}
                        </option>

                    ))}

            </select>

        </td>

    ))}

</tr>

{/* HBsAg */}

<tr>

    <td>HBsAg</td>

    {units.map((unit, index) => (

        <td key={index}>

            <select
                value={unit.hbsag}
                onChange={(e) =>
                    updateUnitField(
                        index,
                        "hbsag",
                        e.target.value
                    )
                }
            >

                <option value="">Select</option>

                {screeningOptions
                    .filter(Boolean)
                    .map(item => (

                        <option
                            key={item}
                            value={item}
                        >
                            {item}
                        </option>

                    ))}

            </select>

        </td>

    ))}

</tr>

{/* HCV */}

<tr>

    <td>HCV</td>

    {units.map((unit, index) => (

        <td key={index}>

            <select
                value={unit.hcv}
                onChange={(e) =>
                    updateUnitField(
                        index,
                        "hcv",
                        e.target.value
                    )
                }
            >

                <option value="">Select</option>

                {screeningOptions
                    .filter(Boolean)
                    .map(item => (

                        <option
                            key={item}
                            value={item}
                        >
                            {item}
                        </option>

                    ))}

            </select>

        </td>

    ))}

</tr>

{/* VDRL */}

<tr>

    <td>VDRL</td>

    {units.map((unit, index) => (

        <td key={index}>

            <select
                value={unit.vdrl}
                onChange={(e) =>
                    updateUnitField(
                        index,
                        "vdrl",
                        e.target.value
                    )
                }
            >

                <option value="">Select</option>

                {screeningOptions
                    .filter(Boolean)
                    .map(item => (

                        <option
                            key={item}
                            value={item}
                        >
                            {item}
                        </option>

                    ))}

            </select>

        </td>

    ))}

</tr>

{/* Cross Match */}

<tr>

    <td>Cross Match Result</td>

    {units.map((unit, index) => (

        <td key={index}>

            <select
                value={unit.crossMatch}
                onChange={(e) =>
                    updateUnitField(
                        index,
                        "crossMatch",
                        e.target.value
                    )
                }
            >

                <option value="">Select</option>

                {crossMatchOptions
                    .filter(Boolean)
                    .map(item => (

                        <option
                            key={item}
                            value={item}
                        >
                            {item}
                        </option>

                    ))}

            </select>

        </td>

    ))}

</tr>

</tbody>

</table>

<div
    style={{
        marginTop: 20,
        display: "flex",
        gap: 10,
    }}
>

    {units.length < 4 && (

        <button
            type="button"
            className="secondary-btn"
            onClick={addUnit}
        >

            + Add Blood Unit

        </button>

    )}

    {units.length > 1 && (

        <button
            type="button"
            className="danger-btn"
            onClick={() =>
                removeUnit(units.length - 1)
            }
        >

            Remove Last Unit

        </button>

    )}

</div>

<div style={{ marginTop: 25 }}>

    <h4>Interpretation</h4>

    <textarea
        rows={4}
        readOnly
        value={resultData.interpretation || ""}
    />

</div>

<div style={{ marginTop: 20 }}>

    <h4>Impression</h4>

    <textarea
        rows={3}
        readOnly
        value={resultData.impression || ""}
    />

</div>

<div style={{ marginTop: 20 }}>

    <h4>Scientist Remark</h4>

    <textarea
        rows={4}
        value={resultData.remark || ""}
        onChange={(e) =>
            updateField(
                "remark",
                e.target.value
            )
        }
    />

</div>

</div>

);

}