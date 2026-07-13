export default function groupResultRecords(
  records = []
) {

  const grouped = new Map();

  const chemistrySingles = [
    "fbs",
    "rbs",
    "hba1c",
    "urea",
    "creatinine",
    "uric acid",
    "calcium",
    "magnesium",
    "phosphorus",
    "d-dimer",
    "psa",
    "total psa",
    "free psa",
  ];

  const haematologySingles = [
    "pcv",
    "haemoglobin",
    "hemoglobin",
    "wbc",
    "platelet count",
    "esr",
    "reticulocyte count",
  ];

  const serologySingles = [
    "hbsag",
    "hcv",
    "hiv",
    "hiv i & ii",
    "vdrl",
    "blood group",
    "genotype",
    "mp",
    "malaria parasite",
    "rf",
    "crp qualitative",
  ];

  const endocrinologySingles = [
    "tsh",
    "ft3",
    "ft4",
    "t3",
    "t4",
    "fsh",
    "lh",
    "prolactin",
    "progesterone",
    "testosterone",
    "estradiol",
    "amh",
    "beta hcg",
    "cortisol",
    "insulin",
    "d-dimer",
  ];

  records.forEach((item) => {

    const test = (
      item.test_type || ""
    )
      .toLowerCase()
      .trim();

    let label = item.test_type;

    if (
      chemistrySingles.includes(test)
    ) {
      label =
        "Chemistry Singles";
    }

    else if (
      haematologySingles.includes(test)
    ) {
      label =
        "Haematology Singles";
    }

    else if (
      serologySingles.includes(test)
    ) {
      label =
        "Serology Singles";
    }

    else if (
      endocrinologySingles.includes(test)
    ) {
      label =
        "Endocrinology Singles";
    }

    const key =

      `${item.lab_number}-${label}`;

    if (!grouped.has(key)) {

      grouped.set(key, {

        ...item,

        test_type: label,

      });

    }

  });

  return Array.from(
    grouped.values()
  );

}