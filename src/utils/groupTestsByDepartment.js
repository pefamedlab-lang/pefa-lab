import { testDepartments } from "../Data/testDepartments";

export function groupTestsByDepartment(
  selectedTests = []
) {
  const grouped = {};

  /* =========================
     SAFETY CHECK
  ========================= */

  if (
    !Array.isArray(
      selectedTests
    )
  ) {
    return grouped;
  }

  /* =========================
     GROUPING ENGINE
  ========================= */

  selectedTests.forEach(
    (test) => {
      const department =
        testDepartments[test];

      if (!department) {
        return;
      }

      if (
        !grouped[department]
      ) {
        grouped[department] =
          [];
      }

      grouped[
        department
      ].push(test);
    }
  );

  return grouped;
}