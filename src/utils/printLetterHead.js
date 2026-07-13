export default function printLetterHead(
  elementId = "print-root",
  title = "PEFA Medical Diagnostic Services Letterhead"
) {
  const element = document.getElementById(elementId);

  if (!element) {
    alert("Letterhead not found.");
    return;
  }

  // Save current page title
  const originalTitle = document.title;
  document.title = title;

  // Enable enterprise print mode
  document.body.classList.add("print-mode");
  element.classList.add("print-active");

  // Wait for the browser to finish rendering
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.print();
    });
  });

  // Restore page after printing
  const restore = () => {
    document.body.classList.remove("print-mode");
    element.classList.remove("print-active");
    document.title = originalTitle;

    window.removeEventListener("afterprint", restore);
  };

  window.addEventListener("afterprint", restore);
}