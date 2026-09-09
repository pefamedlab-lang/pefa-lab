import getReportTitle from "../../utils/printing/getReportTitle";

/* ==========================================================
   TABLE REPORT HEADER
   PEFA Medical Diagnostic Services
========================================================== */

export default function TableReportHeader({

    report = {},

    results = [],

    department = "",

    columns = [],

}) {

    const reportTitle = getReportTitle(

        report,

        results

    );

    return (

        <thead>

            {/* ==========================================
                REPORT TITLE
            ========================================== */}

            <tr className="report-title-row">

                <th
                    className="report-title-cell"
                    colSpan={columns.length}
                >

                    <div className="table-department-title">

                        {department}

                    </div>

                    {reportTitle.showTestTitle && (

                        <div className="table-test-title">

                            {reportTitle.title}

                        </div>

                    )}

                </th>

            </tr>

            {/* ==========================================
                COLUMN HEADERS
            ========================================== */}

            <tr>

                {columns.map((column) => (

                    <th key={column}>

                        {column}

                    </th>

                ))}

            </tr>

        </thead>

    );

}