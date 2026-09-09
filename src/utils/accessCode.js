export function generateAccessCode() {
  const year = new Date().getFullYear().toString().slice(-2);

  const random = Math.floor(
    100000 + Math.random() * 900000
  );

  return `USS-${year}-${random}`;
}