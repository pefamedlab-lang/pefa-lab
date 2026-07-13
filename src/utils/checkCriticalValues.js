import {
  supabase,
} from "../supabase";

export async function checkCriticalValues({

  patient,

  results,
}) {

  try {

    const criticalRules = [

      {
        parameter:
          "Potassium",

        type:
          "high",

        value:6.5,
      },

      {
        parameter:
          "Glucose",

        type:
          "low",

        value:40,
      },

      {
        parameter:
          "Hemoglobin",

        type:
          "low",

        value:5,
      },

      {
        parameter:
          "Platelets",

        type:
          "low",

        value:20,
      },

      {
        parameter:
          "Sodium",

        type:
          "low",

        value:120,
      },
    ];

    for (
      const key in results
    ) {

      const item =
        results[key];

      const numeric =
        parseFloat(
          item.value
        );

      const rule =
        criticalRules.find(
          (r) =>
            r.parameter
              .toLowerCase() ===
            key.toLowerCase()
        );

      if (!rule) continue;

      let isCritical =
        false;

      if (

        rule.type ===
        "high" &&

        numeric >
        rule.value

      ) {

        isCritical =
          true;
      }

      if (

        rule.type ===
        "low" &&

        numeric <
        rule.value

      ) {

        isCritical =
          true;
      }

      if (isCritical) {

        await supabase

          .from(
            "critical_alerts"
          )

          .insert([{

            patient_name:
              patient.full_name,

            lab_number:
              patient.lab_number,

            parameter:
              key,

            result_value:
              item.value,

            critical_level:
              `${rule.type.toUpperCase()} CRITICAL`,
          }]);

        alert(

          `CRITICAL ALERT:\n\n${key} = ${item.value}`
        );
      }
    }

  } catch (error) {

    console.log(
      error
    );
  }
}