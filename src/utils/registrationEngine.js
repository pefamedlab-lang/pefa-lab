export const generateLabNumber =
  () => {
    const year =
      new Date()
        .getFullYear()
        .toString()
        .slice(-2);

    const random =
      Math.floor(
        1000 +
          Math.random() *
            9000
      );

    return `PEFA-${year}-${random}`;
  };

export const generateInvoiceNumber =
  () => {
    const timestamp =
      Date.now()
        .toString()
        .slice(-6);

    return `INV-${timestamp}`;
  };

export const generateReceiptNumber =
  () => {
    const timestamp =
      Date.now()
        .toString()
        .slice(-6);

    return `RCPT-${timestamp}`;
  };

export const generateAccessCode =
  () => {
    return Math.floor(
      100000 +
        Math.random() *
          900000
    ).toString();
  };

export const calculateAge =
  (dob) => {
    if (!dob)
      return "";

    const birthDate =
      new Date(dob);

    const today =
      new Date();

    let age =
      today.getFullYear() -
      birthDate.getFullYear();

    const monthDiff =
      today.getMonth() -
      birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 &&
        today.getDate() <
          birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

export const calculateTotal =
  (tests) => {
    return tests.reduce(
      (
        total,
        test
      ) =>
        total +
        Number(
          test.price
        ),
      0
    );
  };

export const cleanPhoneNumber =
  (phone) => {
    if (!phone)
      return "";

    const cleaned =
      phone.replace(
        /\s+/g,
        ""
      );

    if (
      cleaned.startsWith(
        "0"
      )
    ) {
      return `234${cleaned.slice(
        1
      )}`;
    }

    return cleaned;
  };

export const generateWhatsAppMessage =
  ({
    patientName,
    labNumber,
    accessCode,
  }) => {
    return (
      `Hello ${patientName}, welcome to PEFA Medical Diagnostic Services.%0A%0A` +
      `Your laboratory registration has been completed successfully.%0A%0A` +
      `Lab ID: ${labNumber}%0A` +
      `Access Code: ${accessCode}%0A%0A` +
      `Use the details above to access your laboratory result online.%0A%0A` +
      `Result Portal:%0A` +
      `https://your-domain.com/result-checker%0A%0A` +
      `Thank you for choosing PEFA Medical Diagnostic Services.`
    );
  };