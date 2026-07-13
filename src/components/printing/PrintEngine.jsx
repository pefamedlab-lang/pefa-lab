import { forwardRef } from "react";
import ReportWrapper from "./ReportWrapper";

const PrintEngine = forwardRef(({

    patient = {},

    results = [],

    printMode = "internal",

    children,

}, ref) => {

    return (

       <div
    ref={ref}
    id="print-root"
    className={`print-engine ${printMode}`}
>

           <ReportWrapper

    patient={patient}

    results={results}

    printMode={printMode ?? "internal"}

>

                {children}

            </ReportWrapper>

        </div>

    );

});

PrintEngine.displayName = "PrintEngine";

export default PrintEngine;