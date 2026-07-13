import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function downloadResultPDF(
  elementId = "print-root",
  fileName = "PEFA-Report.pdf"
) {
  const element = document.getElementById(elementId);

  if (!element) {
    alert("Unable to find printable content.");
    return;
  }

  try {
    document.body.classList.add("pdf-mode");

    // Allow layout to settle
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const canvas = await html2canvas(element, {
      scale: 4,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      scrollX: 0,
      scrollY: -window.scrollY,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    document.body.classList.remove("pdf-mode");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = 210;
    const pageHeight = 297;

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const imgData = canvas.toDataURL("image/png", 1.0);

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(
      imgData,
      "PNG",
      0,
      position,
      imgWidth,
      imgHeight,
      "",
      "FAST"
    );

    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;

      pdf.addPage();

      pdf.addImage(
        imgData,
        "PNG",
        0,
        position,
        imgWidth,
        imgHeight,
        "",
        "FAST"
      );

      heightLeft -= pageHeight;
    }

    pdf.save(fileName);
  } catch (error) {
    document.body.classList.remove("pdf-mode");

    console.error(error);

    alert("Failed to generate PDF.");
  }
}