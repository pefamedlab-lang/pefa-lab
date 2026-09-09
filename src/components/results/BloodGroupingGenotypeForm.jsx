import { useState } from "react";

export default function BloodGroupingForm({

    test = {},

    resultData = {},

    setResultData,

}) {

    const groupedTests = test.groupedTests || [];

    const initialData = {

        blood_group: resultData?.blood_group || "",

        rhesus_factor: resultData?.rhesus_factor || "",

        genotype: resultData?.genotype || "",

        remark: resultData?.remark || "",

    };

    const [form, setForm] = useState(initialData);

    const bloodGroupOptions = [

        "",

        "A",

        "B",

        "AB",

        "O",

    ];

    const rhesusOptions = [

        "",

        "Positive",

        "Negative",

    ];

    const genotypeOptions = [

        "",

        "AA",

        "AS",

        "AC",

        "SS",

        "SC",

    ];

    const updateField = (field, value) => {

        const updated = {

            ...form,

            [field]: value,

        };

        setForm(updated);

        setResultData(updated);

    };

    const hasBloodGroup = groupedTests.some(item =>

        item.test_name.toLowerCase().includes("blood group") ||

        item.test_name.toLowerCase().includes("abo")

    );

    const hasGenotype = groupedTests.some(item =>

        item.test_name.toLowerCase().includes("genotype")

    );

    return (

        <div>

            <h3>

                Blood Group & Haemoglobin Genotype

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

                        hasBloodGroup &&

                        <>

                            <tr>

                                <td>

                                    ABO Blood Group

                                </td>

                                <td>

                                    <select

                                        value={form.blood_group}

                                        onChange={(e)=>

                                            updateField(

                                                "blood_group",

                                                e.target.value

                                            )

                                        }

                                    >

                                        {

                                            bloodGroupOptions.map(item=>

                                                <option

                                                    key={item}

                                                    value={item}

                                                >

                                                    {item || "Select"}

                                                </option>

                                            )

                                        }

                                    </select>

                                </td>

                            </tr>

                            <tr>

                                <td>

                                    Rhesus (Rh D)

                                </td>

                                <td>

                                    <select

                                        value={form.rhesus_factor}

                                        onChange={(e)=>

                                            updateField(

                                                "rhesus_factor",

                                                e.target.value

                                            )

                                        }

                                    >

                                        {

                                            rhesusOptions.map(item=>

                                                <option

                                                    key={item}

                                                    value={item}

                                                >

                                                    {item || "Select"}

                                                </option>

                                            )

                                        }

                                    </select>

                                </td>

                            </tr>

                        </>

                    }

                    {

                        hasGenotype &&

                        <tr>

                            <td>

                                Haemoglobin Genotype

                            </td>

                            <td>

                                <select

                                    value={form.genotype}

                                    onChange={(e)=>

                                        updateField(

                                            "genotype",

                                            e.target.value

                                        )

                                    }

                                >

                                    {

                                        genotypeOptions.map(item=>

                                            <option

                                                key={item}

                                                value={item}

                                            >

                                                {item || "Select"}

                                            </option>

                                        )

                                    }

                                </select>

                            </td>

                        </tr>

                    }

                </tbody>

            </table>

            <h4>

                Scientist Remark

            </h4>

            <textarea

                value={form.remark}

                onChange={(e)=>

                    updateField(

                        "remark",

                        e.target.value

                    )

                }

            />

        </div>

    );

}