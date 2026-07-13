// src/data/packages.js

const packages = [
  {
    id: "standard",
    code: "PKG001",
    name: "Standard Wellness Package",
    price: 65000,
    description:
      "Comprehensive routine health screening for adults.",
    investigations: [
      "cbc",
      "esr",
      "fbs",
      "hba1c",
      "lipid_profile",
      "liver_function",
      "renal_function",
      "urinalysis",
      "stool_mcs",
      "hepatitis_b",
      "hepatitis_c",
      "hiv",
      "ecg"
    ],
    active: true
  },

  {
    id: "premium",
    code: "PKG002",
    name: "Premium Wellness Package",
    price: 100000,
    description:
      "Advanced executive medical screening with additional specialized investigations.",
    investigations: [
      "cbc",
      "esr",
      "fbs",
      "hba1c",
      "lipid_profile",
      "liver_function",
      "renal_function",
      "electrolytes",
      "urinalysis",
      "stool_mcs",
      "hepatitis_b",
      "hepatitis_c",
      "hiv",
      "psa",
      "thyroid_profile",
      "vitamin_d",
      "ecg",
      "abdominal_ultrasound"
    ],
    active: true
  }
];

export default packages;