export default function MicrobiologyDashboard() {
  const microbiologyTemplates = [
    {
      category: "URINE M/C/S",
      sections: [
        {
          title: "Macroscopy",
          fields: [
            "Colour",
            "Appearance",
            "Volume",
            "Specific Gravity",
            "pH",
          ],
        },
        {
          title: "Microscopy",
          fields: [
            "Pus Cells",
            "Red Blood Cells",
            "Epithelial Cells",
            "Yeast Cells",
            "Bacteria",
            "Casts",
            "Crystals",
            "Parasites",
          ],
        },
        {
          title: "Culture",
          fields: [
            "Culture Report",
            "Isolated Organism",
            "Colony Count",
          ],
        },
        {
          title: "Sensitivity Pattern",
          fields: [
            "Ciprofloxacin",
            "Levofloxacin",
            "Gentamicin",
            "Ceftriaxone",
            "Nitrofurantoin",
            "Augmentin",
            "Ofloxacin",
            "Ceftazidime",
          ],
        },
      ],
    },

    {
      category: "HVS M/C/S",
      sections: [
        {
          title: "Macroscopy",
          fields: [
            "Appearance",
            "Colour",
            "Consistency",
            "Odour",
          ],
        },
        {
          title: "Microscopy",
          fields: [
            "Pus Cells",
            "Epithelial Cells",
            "Yeast Cells",
            "Clue Cells",
            "Trichomonas Vaginalis",
            "Gram Positive Cocci",
            "Gram Negative Bacilli",
          ],
        },
        {
          title: "Culture",
          fields: [
            "Culture Report",
            "Isolated Organism",
          ],
        },
        {
          title: "Sensitivity Pattern",
          fields: [
            "Ciprofloxacin",
            "Gentamicin",
            "Ceftriaxone",
            "Azithromycin",
            "Erythromycin",
            "Ofloxacin",
          ],
        },
      ],
    },

    {
      category: "SEMINAL FLUID ANALYSIS (SFA)",
      sections: [
        {
          title: "Physical Examination",
          fields: [
            "Volume",
            "Colour",
            "Appearance",
            "Liquefaction Time",
            "Viscosity",
            "pH",
          ],
        },
        {
          title: "Microscopy",
          fields: [
            "Sperm Count",
            "Total Motility",
            "Active Motility",
            "Sluggish Motility",
            "Non-Motile",
            "Normal Morphology",
            "Abnormal Forms",
            "Pus Cells",
            "Red Blood Cells",
            "Epithelial Cells",
          ],
        },
        {
          title: "Comment",
          fields: ["Laboratory Comment"],
        },
      ],
    },

    {
      category: "STOOL M/C/S",
      sections: [
        {
          title: "Macroscopy",
          fields: [
            "Colour",
            "Consistency",
            "Mucus",
            "Blood",
            "Adult Worm",
          ],
        },
        {
          title: "Microscopy",
          fields: [
            "Pus Cells",
            "Red Blood Cells",
            "Ova",
            "Cysts",
            "Trophozoites",
            "Yeast Cells",
            "Fat Globules",
          ],
        },
        {
          title: "Culture",
          fields: [
            "Culture Report",
            "Isolated Organism",
          ],
        },
        {
          title: "Sensitivity Pattern",
          fields: [
            "Ciprofloxacin",
            "Ceftriaxone",
            "Gentamicin",
            "Ofloxacin",
            "Augmentin",
          ],
        },
      ],
    },

    {
      category: "SPUTUM M/C/S",
      sections: [
        {
          title: "Macroscopy",
          fields: [
            "Colour",
            "Appearance",
            "Consistency",
            "Blood Stain",
          ],
        },
        {
          title: "Microscopy",
          fields: [
            "Pus Cells",
            "Epithelial Cells",
            "Yeast Cells",
            "Gram Positive Cocci",
            "Gram Negative Bacilli",
          ],
        },
        {
          title: "Culture",
          fields: [
            "Culture Report",
            "Isolated Organism",
          ],
        },
      ],
    },

    {
      category: "EAR SWAB M/C/S",
      sections: [
        {
          title: "Microscopy",
          fields: [
            "Pus Cells",
            "Yeast Cells",
            "Gram Positive Cocci",
            "Gram Negative Bacilli",
          ],
        },
        {
          title: "Culture",
          fields: [
            "Culture Report",
            "Isolated Organism",
          ],
        },
      ],
    },

    {
      category: "WOUND SWAB M/C/S",
      sections: [
        {
          title: "Microscopy",
          fields: [
            "Pus Cells",
            "Necrotic Cells",
            "Gram Positive Cocci",
            "Gram Negative Bacilli",
          ],
        },
        {
          title: "Culture",
          fields: [
            "Culture Report",
            "Isolated Organism",
          ],
        },
        {
          title: "Sensitivity Pattern",
          fields: [
            "Gentamicin",
            "Ceftriaxone",
            "Ciprofloxacin",
            "Augmentin",
            "Ofloxacin",
          ],
        },
      ],
    },

    {
      category: "AFB",
      sections: [
        {
          title: "Ziehl Neelsen Stain",
          fields: [
            "AFB Result",
            "Grading",
            "Comment",
          ],
        },
      ],
    },

    {
      category: "MALARIA PARASITE",
      sections: [
        {
          title: "Microscopy",
          fields: [
            "Malaria Parasite",
            "Parasite Density",
            "Species",
          ],
        },
      ],
    },

    {
      category: "WIDAL TEST",
      sections: [
        {
          title: "Serology",
          fields: [
            "Salmonella typhi O",
            "Salmonella typhi H",
            "Salmonella paratyphi A",
            "Salmonella paratyphi B",
            "Comment",
          ],
        },
      ],
    },

    {
      category: "STOOL ANALYSIS",
      sections: [
        {
          title: "Macroscopy",
          fields: [
            "Colour",
            "Consistency",
            "Mucus",
            "Blood",
          ],
        },
        {
          title: "Microscopy",
          fields: [
            "Ova",
            "Cysts",
            "Trophozoites",
            "Pus Cells",
            "Red Blood Cells",
            "Yeast Cells",
          ],
        },
      ],
    },
  ];

  return (
    <div
      style={{
        padding: "30px",
        background: "#f8fafc",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          marginBottom: "35px",
        }}
      >
        <h1
          style={{
            fontSize: "36px",
            color: "#0f172a",
            marginBottom: "10px",
          }}
        >
          Microbiology Dashboard
        </h1>

        <p
          style={{
            color: "#64748b",
            fontSize: "16px",
          }}
        >
          Enterprise Microbiology Reporting Templates
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gap: "25px",
        }}
      >
        {microbiologyTemplates.map(
          (template, index) => (
            <div
              key={index}
              style={{
                background: "white",
                borderRadius: "18px",
                padding: "25px",
                border: "1px solid #e2e8f0",
              }}
            >
              <h2
                style={{
                  color: "#2563eb",
                  marginBottom: "20px",
                }}
              >
                {template.category}
              </h2>

              {template.sections.map(
                (section, sectionIndex) => (
                  <div
                    key={sectionIndex}
                    style={{
                      marginBottom: "25px",
                    }}
                  >
                    <div
                      style={{
                        background: "#eff6ff",
                        padding: "12px 16px",
                        borderRadius: "10px",
                        marginBottom: "15px",
                        fontWeight: "bold",
                        color: "#1e3a8a",
                      }}
                    >
                      {section.title}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "15px",
                      }}
                    >
                      {section.fields.map(
                        (field, fieldIndex) => (
                          <div
                            key={fieldIndex}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                            }}
                          >
                            <label
                              style={{
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#334155",
                              }}
                            >
                              {field}
                            </label>

                            <input
                              type="text"
                              placeholder={`Enter ${field}`}
                              style={{
                                padding: "12px",
                                borderRadius: "10px",
                                border:
                                  "1px solid #cbd5e1",
                                outline: "none",
                              }}
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )
              )}

              {template.category.includes(
                "M/C/S"
              ) && (
                <div
                  style={{
                    background: "#fef2f2",
                    color: "#991b1b",
                    padding: "14px",
                    borderRadius: "10px",
                    fontSize: "14px",
                    marginTop: "15px",
                  }}
                >
                  NOTE: If there is no growth after incubation,
                  report should state: “No significant bacterial
                  growth after 24–48 hours incubation.” Sensitivity
                  section may be omitted.
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
