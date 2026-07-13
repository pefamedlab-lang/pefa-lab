// ===========================================================
// PEFA MEDICAL DIAGNOSTIC SERVICES
// Enterprise Company Profile
// ===========================================================

const companyProfile = {

  /* =======================================================
     COMPANY
  ======================================================= */

  name: "PEFA",

  fullName: "PEFA Medical Diagnostic Services",

  shortName: "PEFA",

displayName: "PEFA Medical Diagnostic Services",

  rcNumber: "RC: 3450274",

  trustLine: "Reliable • Accurate • Trusted",

  tagline:
  "Leading the way in Medical Excellence through Timely, Affordable & Precision Laboratory Services",

slogan:
  "Leading the way in Medical Excellence through Timely, Affordable & Precision Laboratory Services",

  /* =======================================================
     BRAND
  ======================================================= */

  brand: {

    primary: "#005B96",      // Toques Blue

    secondary: "#8DC63F",    // Lemon Green

    accent: "#E31B23",       // Red

    white: "#FFFFFF",

    dark: "#1F2937",

    light: "#F8FAFC",

  },

  /* =======================================================
     CONTACT
  ======================================================= */

 contact: {

  address:
    "32, Ogunru-Ori, Pakuro Road, Mowe, Ogun State",

  website: "www.pefamedlab.com",

  email: "pefa.medlab@gmail.com",

  phones: [

    "+234 808 661 8621",

    "+234 808 568 1720",

    "+234 808 833 6440",

  ],

},

  /* =======================================================
     SERVICES
  ======================================================= */

  services: [

    "Laboratory",

    "Ultrasound",

    "Blood Bank",

    "ECG",

    "Medical Research",

  ],

  /* =======================================================
     BRANCHES
  ======================================================= */

  branches: [

    {

      id: 1,

      code: "HO",

      name: "Head Office",

      address: [

        "32, Ogunru-Ori",

        "Pakuro Road",

        "Mowe",

        "Ogun State",

      ],

    },

    {

      id: 2,

      code: "MB",

      name: "Mowe Branch",

      address: [

        "5, Olorombo Street",

        "Imedu-Nla",

        "Mowe",

        "Ogun State",

      ],

    },

    {

      id: 3,

      code: "OR",

      name: "Orimerunmu Branch",

      address: [

        "Iya-Ijebu Junction",

        "Orimerunmu Road",

        "Ogun State",

      ],

    },

  ],

  /* =======================================================
     PRINT SETTINGS
  ======================================================= */

  printing: {

    paper: "A4",

    orientation: "Portrait",

    showQRCode: true,

    showRibbon: true,

    showBranches: true,

    showServices: true,

    showFooterTagline: true,

    showTrustLine: true,

  },

  /* =======================================================
     VERIFICATION
  ======================================================= */

  verification: {

    verifyURL:

      "https://www.pefamedlab.com/verify/",

    qrHome:

      "https://www.pefamedlab.com",

  },

};

export default companyProfile;