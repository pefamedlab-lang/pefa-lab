import { useEffect, useState } from "react";
import antibiotics from "../../data/antibiotics";
const defaultAntibiotics = antibiotics.map((drug) => ({
    antibiotic: drug,
    result: ""
}));

export default function MCSForm({
    resultData,

    setResultData,

}) {

    const [form, setForm] = useState({

        /* ==========================
           SPECIMEN INFORMATION
        ========================== */

        specimenType: "",

        collectionDate: "",

        receivedDate: "",

        processedDate: "",

        specimenCondition: "",

        /* ==========================
           MACROSCOPY
        ========================== */

        colour: "",

        appearance: "",

        odour: "",

        volume: "",

        /* ==========================
           MICROSCOPY
        ========================== */

        pusCells: "",

        redBloodCells: "",

        epithelialCells: "",

        casts: "",

        crystals: "",

        yeastCells: "",

        parasites: "",

        bacteriaSeen: "",

        others: "",

        /* ==========================
           CULTURE
        ========================== */

        cultureGrowth: "",

        organismIsolated: "",

        colonyCount: "",

        /* ==========================
           ANTIBIOTIC SUSCEPTIBILITY
        ========================== */

        antibiotics: defaultAntibiotics,

        /* ==========================
           REPORT
        ========================== */

        impression: "",

        scientistRemark: ""

    });

const [open, setOpen] = useState({
  specimen: true,
  macroscopy: false,
  microscopy: false,
  culture: false,
  antibiotics: false,
  impression: false,
  summary: false,
});

const toggle = (section) => {
  setOpen((prev) => ({
    ...prev,
    [section]: !prev[section],
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

        const antibiotics = [

            ...form.antibiotics

        ];

        antibiotics[index] = {

    ...antibiotics[index],

    [field]: value

};

        updateField(

            "antibiotics",

            antibiotics

        );

    };

const generateImpression = () => {

    let impression = "";

    if (form.cultureGrowth === "No Growth") {

        impression =
            "No significant bacterial growth after incubation.";

    } else if (form.cultureGrowth === "Mixed Growth") {

        impression =
            "Mixed bacterial growth suggestive of specimen contamination. Repeat specimen collection is recommended if clinically indicated.";

    } else if (
        ["Scanty Growth", "Moderate Growth", "Heavy Growth"].includes(form.cultureGrowth)
    ) {

        impression =
            `Significant growth of ${form.organismIsolated || "organism"} isolated.`;

        const sensitive = form.antibiotics
            .filter(a => a.result === "Sensitive")
            .map(a =>
                a.antibiotic === "__CUSTOM__"
                    ? a.customAntibiotic
                    : a.antibiotic
            );

        const resistant = form.antibiotics
            .filter(a => a.result === "Resistant")
            .map(a =>
                a.antibiotic === "__CUSTOM__"
                    ? a.customAntibiotic
                    : a.antibiotic
            );

        if (sensitive.length) {

            impression +=
                ` Sensitive to ${sensitive.join(", ")}.`;

        }

        if (resistant.length) {

            impression +=
                ` Resistant to ${resistant.join(", ")}.`;

        }

    }

    updateField("impression", impression);

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

                (_, i) =>

                    i !== index

            )

        );

    };

/* ==========================
   TESTED ANTIBIOTICS
========================== */

const testedAntibiotics = form.antibiotics.filter(
    (drug) =>
        drug.result &&
        (
            drug.antibiotic ||
            drug.customAntibiotic
        )
);


    return (

       <div className="mcs-form">

    <h2>Culture & Sensitivity (M/C/S)</h2>

    {/* ==========================
        SPECIMEN INFORMATION
    ========================== */}

   <h3
  className="accordion-title"
  onClick={() => toggle("specimen")}
>
  {open.specimen ? "▼" : "▶"} Specimen Information
</h3>

{open.specimen && (
<>

    <table className="result-table">

        <tbody>

            <tr>

                <td>Specimen Type</td>

                <td>

                    <input
                        type="text"
                        value={form.specimenType}
                        placeholder="Urine / HVS / Wound Swab / ECS..."
                        onChange={(e)=>

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
                        onChange={(e)=>

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
                        onChange={(e)=>

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
                        onChange={(e)=>

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
                        placeholder="Fresh, Leaking, Contaminated..."
                        onChange={(e)=>

                            updateField(
                                "specimenCondition",
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



    {/* ==========================
        MACROSCOPY
    ========================== */}

   <h3
  className="accordion-title"
  onClick={() => toggle("macroscopy")}
>
  {open.macroscopy ? "▼" : "▶"} Macroscopy
</h3>

{open.macroscopy && (
<>

    <table className="result-table">

        <tbody>

            <tr>

                <td>Colour</td>

                <td>

                   <select
    value={form.colour}
    onChange={(e)=>
        updateField("colour", e.target.value)
    }
>
    <option value="">Select</option>
    <option>Colourless</option>
    <option>Straw</option>
    <option>Pale Yellow</option>
    <option>Yellow</option>
    <option>Dark Yellow</option>
    <option>Amber</option>
    <option>Red</option>
    <option>Brown</option>
</select>

                </td>

            </tr>

            <tr>

                <td>Appearance</td>

                <td>

                    <select
    value={form.appearance}
    onChange={(e)=>
        updateField("appearance", e.target.value)
    }
>
    <option value="">Select</option>
    <option>Clear</option>
    <option>Slightly Turbid</option>
    <option>Turbid</option>
    <option>Cloudy</option>
    <option>Bloody</option>
</select>

                </td>

            </tr>

            <tr>

                <td>Odour</td>

                <td>

                    <select
    value={form.odour}
    onChange={(e)=>
        updateField("odour", e.target.value)
    }
>
    <option value="">Select</option>
    <option>Normal</option>
    <option>Offensive</option>
    <option>Ammoniacal</option>
    <option>Foul</option>
</select>

                </td>

            </tr>

            <tr>

                <td>Volume</td>

                <td>

                    <input
                        type="text"
                        value={form.volume}
                        placeholder="mL"
                        onChange={(e)=>

                            updateField(
                                "volume",
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


{/* ==========================
    MICROSCOPY
========================== */}

<h3
  className="accordion-title"
  onClick={() => toggle("microscopy")}
>
  {open.microscopy ? "▼" : "▶"} Microscopy
</h3>

{open.microscopy && (
<>

<table className="result-table">

    <thead>

        <tr>

            <th>Parameter</th>

            <th>Result</th>

        </tr>

    </thead>

    <tbody>

        <tr>

            <td>Pus Cells</td>

            <td>

                <select
    value={form.pusCells}
    onChange={(e)=>
        updateField("pusCells", e.target.value)
    }
>
    <option value="">Select</option>
    <option>Nil</option>
    <option>0–2 /HPF</option>
    <option>3–5 /HPF</option>
    <option>6–10 /HPF</option>
    <option>10–20 /HPF</option>
    <option>Numerous</option>
</select>

            </td>

        </tr>

        <tr>

            <td>Red Blood Cells</td>

            <td>

               <select
    value={form.redBloodCells}
    onChange={(e)=>
        updateField("redBloodCells", e.target.value)
    }
>
    <option value="">Select</option>
    <option>Nil</option>
    <option>0–2 /HPF</option>
    <option>3–5 /HPF</option>
    <option>6–10 /HPF</option>
    <option>Numerous</option>
</select>

            </td>

        </tr>

        <tr>

            <td>Epithelial Cells</td>

            <td>

               <select
    value={form.epithelialCells}
    onChange={(e)=>
        updateField("epithelialCells", e.target.value)
    }
>
    <option value="">Select</option>
    <option>Nil</option>
    <option>Few</option>
    <option>Moderate</option>
    <option>Many</option>
</select>

            </td>

        </tr>

        <tr>

            <td>Casts</td>

            <td>

                <select
    value={form.casts}
    onChange={(e)=>
        updateField("casts", e.target.value)
    }
>
    <option value="">Select</option>
    <option>Nil</option>
    <option>Hyaline</option>
    <option>Granular</option>
    <option>RBC Casts</option>
    <option>WBC Casts</option>
</select>

            </td>

        </tr>

        <tr>

            <td>Crystals</td>

            <td>

                <select
    value={form.crystals}
    onChange={(e)=>
        updateField("crystals", e.target.value)
    }
>
    <option value="">Select</option>
    <option>Nil</option>
    <option>Calcium Oxalate</option>
    <option>Triple Phosphate</option>
    <option>Uric Acid</option>
    <option>Amorphous</option>
</select>

            </td>

        </tr>

        <tr>

            <td>Yeast Cells</td>

            <td>

               <select
    value={form.yeastCells}
    onChange={(e)=>
        updateField("yeastCells", e.target.value)
    }
>
    <option value="">Select</option>
    <option>Nil</option>
    <option>Few</option>
    <option>Moderate</option>
    <option>Many</option>
</select>

            </td>

        </tr>

        <tr>

            <td>Parasites</td>

            <td>

               <select
    value={form.parasites}
    onChange={(e)=>
        updateField("parasites", e.target.value)
    }
>
    <option value="">Select</option>
    <option>None Seen</option>
    <option>Trichomonas vaginalis</option>
    <option>Schistosoma haematobium</option>
    <option>Others</option>
</select>

            </td>

        </tr>

        <tr>

            <td>Bacteria Seen</td>

            <td>

                <select

                    value={form.bacteriaSeen}

                    onChange={(e)=>

                        updateField(
                            "bacteriaSeen",
                            e.target.value
                        )

                    }

                >

                    <option value="">Select</option>

                    <option value="None Seen">None Seen</option>

                    <option value="Few">Few</option>

                    <option value="Moderate">Moderate</option>

                    <option value="Many">Many</option>

                    <option value="Numerous">Numerous</option>

                </select>

            </td>

        </tr>

        <tr>

            <td>Others</td>

            <td>

                <textarea

                    rows={3}

                    value={form.others}

                    placeholder="Additional microscopy findings..."

                    onChange={(e)=>

                        updateField(
                            "others",
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


{/* ==========================
    CULTURE
========================== */}

<h3
  className="accordion-title"
  onClick={() => toggle("culture")}
>
  {open.culture ? "▼" : "▶"} Culture
</h3>

{open.culture && (
<>

<table className="result-table">

    <tbody>

        <tr>

            <td>Culture Growth</td>

            <td>

                <select
    value={form.cultureGrowth}
    onChange={(e)=>
        updateField("cultureGrowth", e.target.value)
    }
>
    <option value="">Select</option>
    <option>No Growth</option>
    <option>Scanty Growth</option>
    <option>Moderate Growth</option>
    <option>Heavy Growth</option>
    <option>Mixed Growth</option>
    <option>Contaminated</option>
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

                    onChange={(e)=>

                        updateField(
                            "organismIsolated",
                            e.target.value
                        )

                    }

                />

            </td>

        </tr>

        <tr>

            <td>Colony Count</td>

            <td>

                <input

                    type="text"

                    value={form.colonyCount}

                    placeholder="e.g. >100,000 CFU/mL"

                    onChange={(e)=>

                        updateField(
                            "colonyCount",
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


{/* ==========================
    ANTIBIOTIC SUSCEPTIBILITY
========================== */}

{form.cultureGrowth &&
 form.cultureGrowth !== "No Growth" && (

<>
    <h3>Antibiotic Susceptibility</h3>

    <table className="result-table">

        <thead>

            <tr>

                <th>Antibiotic</th>

                <th>Result</th>

            </tr>

        </thead>

        <tbody>

            {form.antibiotics.map((item, index) => (

                <tr key={index}>

                    <td>

                       <select
    value={item.antibiotic}
    onChange={(e) =>
        updateAntibiotic(
            index,
            "antibiotic",
            e.target.value
        )
    }
>

    <option value="">Select Antibiotic</option>

    {antibiotics.map((drug) => (

        <option
            key={drug}
            value={drug}
        >
            {drug}
        </option>

    ))}

    <option value="__CUSTOM__">
        Other (Specify)
    </option>

</select>

{item.antibiotic === "__CUSTOM__" && (

    <input
        type="text"
        placeholder="Enter antibiotic"

        value={item.customAntibiotic || ""}

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
                            onChange={(e)=>
                                updateAntibiotic(
                                    index,
                                    "result",
                                    e.target.value
                                )
                            }
                        >

                            <option value="">Select</option>
                            <option>Sensitive</option>
                            <option>Intermediate</option>
                            <option>Resistant</option>

                        </select>

                    </td>

                </tr>

            ))}

        </tbody>

    </table>

</>

)}


{/* ==========================
    IMPRESSION
========================== */}

<h3
  className="accordion-title"
  onClick={() => toggle("impression")}
>
  {open.impression ? "▼" : "▶"} Report
</h3>

{open.impression && (
<>

<div className="generate-container">

    <button

        type="button"

        className="generate-btn"

        onClick={generateImpression}

    >

        Generate Interpretation

    </button>

</div>

<textarea

    className="comment-box"

    rows={4}

    placeholder="Laboratory Impression..."

    value={form.impression}

    onChange={(e)=>

        updateField(
            "impression",
            e.target.value
        )

    }

/>



{/* ==========================
    SCIENTIST REMARK
========================== */}

<h3>Scientist Remark</h3>

<textarea

    className="comment-box"

    rows={4}

    placeholder="Additional laboratory remarks..."

    value={form.scientistRemark}

    onChange={(e)=>

        updateField(
            "scientistRemark",
            e.target.value
        )

    }

/>

</>
)}

{/* ==========================
    PREVIEW SUMMARY
========================== */}

<hr />

<h3
    className="accordion-title"
    onClick={() => toggle("summary")}
>
    {open.summary ? "▼" : "▶"} Result Summary
</h3>

{open.summary && (
<>
    <table className="result-table">
        <tbody>

            <tr>
                <td><strong>Culture</strong></td>
                <td>{form.cultureGrowth || "-"}</td>
            </tr>

            <tr>
                <td><strong>Organism</strong></td>
                <td>{form.organismIsolated || "-"}</td>
            </tr>

            <tr>
                <td><strong>Colony Count</strong></td>
                <td>{form.colonyCount || "-"}</td>
            </tr>

        </tbody>
    </table>

    {form.cultureGrowth !== "No Growth" &&
        testedAntibiotics.length > 0 && (

        <>
            <h4>Antibiotic Susceptibility</h4>

            <table className="result-table sensitivity-table">

                <thead>
                    <tr>
                        <th>Antibiotic</th>
                        <th>Result</th>
                    </tr>
                </thead>

                <tbody>

                    {testedAntibiotics.map((drug, index) => (

                        <tr key={index}>

                            <td>
                                {drug.antibiotic === "__CUSTOM__"
                                    ? drug.customAntibiotic
                                    : drug.antibiotic}
                            </td>

                            <td>{drug.result}</td>

                        </tr>

                    ))}

                </tbody>

            </table>
        </>
    )}

</>
)}

</div>

);

}