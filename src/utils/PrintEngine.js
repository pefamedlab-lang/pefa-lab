import html2pdf from "html2pdf.js";

/* ==========================================================
   HELPERS
========================================================== */

const wait = (ms) =>
  new Promise((resolve) =>
    setTimeout(resolve, ms)
  );


/* ==========================================================
   CLEAN PRINT STATE
========================================================== */

const clearPrintState = () => {

  document.body.classList.remove(
    "print-mode",
    "pdf-mode"
  );

  document
    .querySelectorAll(
      ".active-print-target"
    )
    .forEach((element) => {

      element.classList.remove(
        "active-print-target"
      );

    });

};


/* ==========================================================
   ACTIVATE TARGET
========================================================== */

const activateTarget = (
  element,
  mode = "print-mode"
) => {

  clearPrintState();

  element.classList.add(
    "active-print-target"
  );

  document.body.classList.add(
    mode
  );

};


/* ==========================================================
   WAIT FOR IMAGES
========================================================== */

const waitForImages = async (element) => {

  const images = [
    ...element.querySelectorAll("img")
  ];

  await Promise.all(

    images.map((img) => {

      if (
        img.complete &&
        img.naturalWidth > 0
      ) {

        return Promise.resolve();

      }

      return new Promise((resolve) => {

        img.onload = resolve;
        img.onerror = resolve;

      });

    })

  );

};


/* ==========================================================
   PREPARE ELEMENT
========================================================== */

const prepareElement = async (
  element,
  mode = "print-mode"
) => {

  activateTarget(
    element,
    mode
  );


  /* React repaint */

  await new Promise(
    requestAnimationFrame
  );


  /* Fonts */

  if (document.fonts) {

    await document.fonts.ready;

  }


  /* Images */

  await waitForImages(
    element
  );


  /* Browser layout */

  void element.offsetHeight;


  await new Promise(
    requestAnimationFrame
  );


  await wait(200);

};


/* ==========================================================
   PRINT ENGINE
========================================================== */

const PrintEngine = {


  /* ======================================================
     PRINT
  ====================================================== */

  async print(
    id = "print-root"
  ) {

    const element =
      document.getElementById(id);


    if (!element) {

      console.error(
        `Element "${id}" not found.`
      );

      return;

    }


    try {

      await prepareElement(
        element,
        "print-mode"
      );


      /* Force browser reflow */

      void document.body.offsetHeight;


      await new Promise(
        requestAnimationFrame
      );


      await wait(150);


      window.print();

    }

    catch (error) {

      console.error(
        "PrintEngine.print error:",
        error
      );

      alert(
        error.message ||
        "Unable to print document."
      );

      clearPrintState();

    }

    finally {

      const cleanup = () => {

        clearPrintState();

      };


      window.addEventListener(
        "afterprint",
        cleanup,
        { once:true }
      );


      /* Browser fallback */

      setTimeout(
        cleanup,
        1500
      );

    }

  },


  /* ======================================================
     PDF DOWNLOAD
  ====================================================== */

  async download(
    id = "print-root",
    filename = "Report.pdf"
  ) {

    const element =
      document.getElementById(id);


    if (!element) {

      console.error(
        `Element "${id}" not found.`
      );

      return;

    }


    try {

      await prepareElement(
        element,
        "pdf-mode"
      );


      await html2pdf()

        .set({

          margin:0,

          filename,

          image:{

            type:"jpeg",

            quality:1,

          },

          html2canvas:{

            scale:3,

            useCORS:true,

            allowTaint:true,

            backgroundColor:"#ffffff",

            logging:false,

            scrollX:0,

            scrollY:0,

            windowWidth:
              element.scrollWidth,

            windowHeight:
              element.scrollHeight,

          },

          jsPDF:{

            unit:"mm",

            format:"a4",

            orientation:"portrait",

          },

          pagebreak:{

            mode:[
              "css",
              "legacy"
            ],

          },

        })

        .from(element)

        .save();

    }

    catch (error) {

      console.error(
        "PrintEngine.download error:",
        error
      );

      alert(
        "Unable to generate PDF."
      );

    }

    finally {

      clearPrintState();

    }

  },

};


export default PrintEngine;