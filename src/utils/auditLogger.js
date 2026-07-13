import {
  supabase,
} from "../supabase";

export const logAudit =
  async ({
    action,
    module,
    description,
  }) => {

    try {

      const user = JSON.parse(

        localStorage.getItem(
          "pefa_user"
        ) || "{}"

      );

      const {
        error,
      } = await supabase

        .from(
          "audit_logs"
        )

        .insert([

          {

            user_name:
              user?.full_name ||
              "Unknown User",

            user_role:
              user?.role ||
              "Unknown Role",

            action,

            module,

            description,

          },

        ]);

      if (error) {

        console.error(
          "Audit Log Error:",
          error.message
        );

      }

    } catch (
      error
    ) {

      console.error(
        "Audit Logger Exception:",
        error
      );

    }

  };