export default function printReport(
  elementId = "print-root",
  title = document.title
) {
  const element = document.getElementById(elementId);

  if (!element) {
    alert("Nothing to print.");
    return;
  }

  // Save original title
  const originalTitle = document.title;
  document.title = title || originalTitle;

  // Enter print mode
  document.body.classList.add("print-mode");
  element.classList.add("print-active");

  // Allow browser to finish rendering
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.print();
    });
  });

  // Restore after printing
  const restore = () => {
    document.body.classList.remove("print-mode");
    element.classList.remove("print-active");
    document.title = originalTitle;

    window.removeEventListener("afterprint", restore);
  };

  window.addEventListener("afterprint", restore);
}