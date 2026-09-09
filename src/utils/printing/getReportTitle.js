/* ==========================================================
   REPORT TITLE RESOLVER
   PEFA Medical Diagnostic Services
========================================================== */

import getTestName from "./getTestName";

/* ==========================================================
   PANEL TESTS
========================================================== */

const PANEL_TESTS = [

    "lft",
    "kft",
    "rft",

    "lipid profile",

    "electrolytes",

    "cbc",
    "fbc",
    "full blood count",

    "coagulation profile",

    "free tft",
    "total tft",

    "hormonal profile",

];

/* ==========================================================
   RESOLVE REPORT TITLE
========================================================== */

export default function getReportTitle(

    report = {},

    results = []

){

    const value = (

        report.test_type ||

        report.test_name ||

        ""

    )

    .toLowerCase()

    .replace(/[_-]/g," ")

    .replace(/\s+/g," ")

    .trim();

    const isPanel = PANEL_TESTS.includes(value);

    const isGroupedSingles =

        results.length > 1 &&

        !isPanel;

    return {

        isPanel,

        isGroupedSingles,

        showTestTitle: !isGroupedSingles,

        title: getTestName(report),

    };

}