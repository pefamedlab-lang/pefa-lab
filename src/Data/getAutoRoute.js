export function getAutoRoute(
  groupedDepartments
) {
  const departments =
    Object.keys(
      groupedDepartments
    );

  /* ========================= */
  /* SINGLE DEPARTMENT */
  /* ========================= */

  if (
    departments.length === 1
  ) {
    const dept =
      departments[0];

    /* HEMATOLOGY */

    if (
      dept ===
      "Hematology"
    ) {
      return "/hematology-report";
    }

    /* CHEMISTRY */

    if (
      dept ===
      "Chemistry"
    ) {
      return "/chemistry-report";
    }

    /* MICROBIOLOGY */

    if (
      dept ===
      "Microbiology"
    ) {
      return "/microbiology-report";
    }

    /* SEROLOGY */

    if (
      dept ===
      "Serology"
    ) {
      return "/qualitative-result";
    }

    /* HORMONAL */

    if (
      dept ===
      "Hormonal"
    ) {
      return "/quantitative-result";
    }

    /* BLOOD BANK */

    if (
      dept ===
      "Blood Bank"
    ) {
      return "/blood-banking";
    }
  }

  /* ========================= */
  /* MULTI DEPARTMENT */
  /* ========================= */

  return "/result-dashboard";
}