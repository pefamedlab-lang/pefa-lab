export function getAutoRoute(
  groupedDepartments
) {
  const departments =
    Object.keys(
      groupedDepartments
    );

  /* SINGLE DEPARTMENT */

  if (
    departments.length === 1
  ) {
    const dept =
      departments[0];

    if (
      dept ===
      "Hematology"
    ) {
      return "/hematology-report";
    }

    if (
      dept ===
      "Chemistry"
    ) {
      return "/chemistry-report";
    }

    if (
      dept ===
      "Microbiology"
    ) {
      return "/microbiology-report";
    }

    if (
      dept ===
      "Serology"
    ) {
      return "/qualitative-result";
    }

    if (
      dept ===
      "Hormonal"
    ) {
      return "/quantitative-result";
    }

    if (
      dept ===
      "Blood Bank"
    ) {
      return "/blood-banking";
    }
  }

  /* MULTI DEPARTMENT */

  return "/result-dashboard";
}