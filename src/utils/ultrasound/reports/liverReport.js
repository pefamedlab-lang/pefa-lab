/* ===========================================================
   LIVER ULTRASOUND REPORT GENERATOR
=========================================================== */

function add(report, text) {
  if (text && text.trim()) {
    report.push(text.trim());
  }
}

export function generateLiverReport(data = {}) {
  const report = [];

  /* =====================
     LIVER
  ===================== */

  if (data.liverSize) {
    add(report, `The liver ${data.liverSize}.`);
  } else {
    add(report, "The liver is normal in size.");
  }

  if (data.liverEchotexture) {
    add(
      report,
      `The hepatic echotexture is ${data.liverEchotexture.toLowerCase()}.`
    );
  }

  if (data.liverMargins) {
    add(
      report,
      `The liver margins are ${data.liverMargins.toLowerCase()}.`
    );
  }

  if (data.focalLesions) {
    add(report, `Focal hepatic lesion(s): ${data.focalLesions}.`);
  } else {
    add(report, "No focal hepatic lesion is identified.");
  }

  /* =====================
     BILIARY SYSTEM
  ===================== */

  if (data.intrahepaticBileDucts) {
    add(
      report,
      `The intrahepatic bile ducts are ${data.intrahepaticBileDucts.toLowerCase()}.`
    );
  }

  if (data.gallBladder) {
    add(report, `Gall bladder: ${data.gallBladder}.`);
  }

  if (data.commonBileDuct) {
    add(report, `Common bile duct: ${data.commonBileDuct}.`);
  }

  /* =====================
     VASCULAR STRUCTURES
  ===================== */

  if (data.portalVein) {
    add(report, `Portal vein: ${data.portalVein}.`);
  }

  if (data.hepaticVeins) {
    add(report, `Hepatic veins: ${data.hepaticVeins}.`);
  }

  /* =====================
     ASSOCIATED FINDINGS
  ===================== */

  if (data.ascites) {
    add(report, `Ascites: ${data.ascites}.`);
  }

  if (data.additional_findings) {
    add(report, data.additional_findings);
  }

  return report.join("\n");
}