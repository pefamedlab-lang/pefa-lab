export function generateVerificationToken() {
  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()
  );
}