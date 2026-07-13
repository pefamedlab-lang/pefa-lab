export async function sendSMS({

  patientName,

  phone,

  labNumber,
}) {

  try {

    const message =

`Dear ${patientName},

Your laboratory result is now ready.

Lab No: ${labNumber}

PEFA MEDICAL DIAGNOSTIC SERVICES`;

    console.log(
      "SMS SENT:",
      message
    );

    /* =====================================================
       TERMII API HERE
    ===================================================== */

    return true;

  } catch (error) {

    console.log(
      error
    );

    return false;
  }
}