import { supabase } from "../supabase";

export async function checkPermission(
  role,
  module
) {

  const { data } =
    await supabase
      .from(
        "role_permissions"
      )
      .select("*")
      .eq("role", role)
      .eq("module", module)
      .single();

  return data;

}