import { useState } from "react";

export default function QualitativeForm({
    test = {},
    resultData = {},
    setResultData,
}) {

    /* =====================================================
       GROUP INFORMATION
    ===================================================== */

    const groupedTests = test.groupedTests || [];
    const isGrouped = groupedTests.length > 0;

    const testName = test.test_name || "Qualitative Test";

    /* =====================================================
       INITIAL STATE
    ===================================================== */

    const [form, setForm] = useState(() => ({
        ...resultData,
        parameter: resultData.parameter || testName,
        result: resultData.result || "",
        rhesus_factor: resultData.rhesus_factor || "",
        interpretation: resultData.interpretation || "",
        impression: resultData.impression || "",
        remark: resultData.remark || "",
    }));

    /* =====================================================
       OPTIONS
    ===================================================== */

    const bloodGroupOptions = [
        "",
        "A",
        "B",
        "AB",
        "O",
    ];

    const rhesusOptions = [
        "",
        "Positive (+)",
        "Negative (-)",
    ];

    const genotypeOptions = [
        "",
        "AA",
        "AS",
        "AC",
        "SS",
        "SC",
    ];

    const qualitativeOptions = [
        "",
        "Negative",
        "Positive",
        "Non Reactive",
        "Reactive",
        "Seen",
        "Not Seen",
    ];

    const lowerName = testName.toLowerCase();

    const isBloodGroup =
        lowerName.includes("blood group") ||
        lowerName.includes("abo");

    const isGenotype =
        lowerName.includes("genotype");

    let options = qualitativeOptions;

    if (isBloodGroup)
        options = bloodGroupOptions;

    if (isGenotype)
        options = genotypeOptions;

    /* =====================================================
       SINGLE RESULT
    ===================================================== */

    const updateSingleResult = (value) => {

        let interpretation = "";
        let impression = "";

        const result = value.toLowerCase();

        if (
            result.includes("negative") ||
            result.includes("non reactive") ||
            result === "not seen"
        ) {

            interpretation =
                `${testName} is negative.`;

            impression =
                "No significant abnormality detected.";

        }

        else if (
            result.includes("positive") ||
            result.includes("reactive") ||
            result === "seen"
        ) {

            interpretation =
                `${testName} is positive.`;

            impression =
                "Clinical correlation is advised.";

        }

        const updated = {

            ...form,

            result: value,

            interpretation,

            impression,

        };

        setForm(updated);

        setResultData(updated);

    };

    /* =====================================================
       GROUPED RESULT
    ===================================================== */

    const updateGroupedResult = (
        parameter,
        value
    ) => {

        const updated = {

            ...form,

            [parameter]: value,

        };

        setForm(updated);

        setResultData(updated);

    };

    /* =====================================================
       RHESUS
    ===================================================== */

    const updateRhesus = (value) => {

        const updated = {

            ...form,

            rhesus_factor: value,

        };

        setForm(updated);

        setResultData(updated);

    };

    /* =====================================================
       REMARK
    ===================================================== */

    const updateRemark = (value) => {

        const updated = {

            ...form,

            remark: value,

        };

        setForm(updated);

        setResultData(updated);

    };

    return (

        <div>

            <h3>

                {isGrouped
                    ? "Serology Result Entry"
                    : testName}

            </h3>

            <table className="result-table">

                <thead>

                    <tr>

                        <th>Parameter</th>

                        <th>Result</th>

                    </tr>

                </thead>

                <tbody>

                    {

                        isGrouped

                            ?

                            groupedTests.map((item) => (

                                <tr key={item.id || item.test_name}>

                                    <td>

                                        {item.test_name}

                                    </td>

                                    <td>

                                        <select

                                            value={
                                                form[item.test_name] || ""
                                            }

                                            onChange={(e) =>
                                                updateGroupedResult(
                                                    item.test_name,
                                                    e.target.value
                                                )
                                            }

                                        >

                                            {

                                                qualitativeOptions.map(option => (

                                                    <option
                                                        key={option}
                                                        value={option}
                                                    >

                                                        {option || "Select"}

                                                    </option>

                                                ))

                                            }

                                        </select>

                                    </td>

                                </tr>

                            ))

                            :

                            <>

                                <tr>

                                    <td>

                                        {testName}

                                    </td>

                                    <td>

                                        <select

                                            value={form.result}

                                            onChange={(e) =>
                                                updateSingleResult(
                                                    e.target.value
                                                )
                                            }

                                        >

                                            {

                                                options.map(option => (

                                                    <option
                                                        key={option}
                                                        value={option}
                                                    >

                                                        {option || "Select"}

                                                    </option>

                                                ))

                                            }

                                        </select>

                                    </td>

                                </tr>

                                {

                                    isBloodGroup &&
                                    form.result &&

                                    <tr>

                                        <td>

                                            Rhesus Factor

                                        </td>

                                        <td>

                                            <select

                                                value={
                                                    form.rhesus_factor
                                                }

                                                onChange={(e) =>
                                                    updateRhesus(
                                                        e.target.value
                                                    )
                                                }

                                            >

                                                {

                                                    rhesusOptions.map(option => (

                                                        <option
                                                            key={option}
                                                            value={option}
                                                        >

                                                            {option || "Select"}

                                                        </option>

                                                    ))

                                                }

                                            </select>

                                        </td>

                                    </tr>

                                }

                            </>

                    }

                </tbody>

            </table>

            {

                !isGrouped &&

                <>

                    <h4>

                        Interpretation

                    </h4>

                    <textarea
                        readOnly
                        value={form.interpretation}
                    />

                    <h4>

                        Impression

                    </h4>

                    <textarea
                        readOnly
                        value={form.impression}
                    />

                </>

            }

            <h4>

                Scientist Remark

            </h4>

            <textarea

                value={form.remark}

                onChange={(e) =>
                    updateRemark(
                        e.target.value
                    )
                }

            />

        </div>

    );

}