// src/utils/logActivity.js

import { supabase } from "../supabase";

export async function logActivity(
  action,
  module,
  description
) {

  const user =
    JSON.parse(
      localStorage.getItem(
        "pefa_user"
      )
    ) || {};

  await supabase
    .from("audit_logs")
    .insert([
      {
        user_name:
          user.full_name,

        user_role:
          user.role,

        action,

        module,

        description,
      },
    ]);

}