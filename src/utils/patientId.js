export function generatePatientID() {

  const year = new Date()
    .getFullYear()
    .toString()
    .slice(-2);

  const random = Math.floor(
    1000 + Math.random() * 9000
  );

  return `PT-${year}-${random}`;

}