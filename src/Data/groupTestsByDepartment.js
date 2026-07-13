import { testDepartments } from "../Data/testDepartments";

export function groupTestsByDepartment(
  selectedTests
) {
  const grouped = {};

  selectedTests.forEach(
    (test) => {
      const department =
        testDepartments[test] ||
        "Other";

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
