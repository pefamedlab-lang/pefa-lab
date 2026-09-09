import { supabase } from "../supabase";

export async function getTestParameters(
    department,
    testName
) {

    const { data, error } = await supabase
        .from("test_parameters")
        .select("*")
        .eq("department", department)
        .eq("test_name", testName)
        .eq("status", "Active")
        .order("display_order");

    if (error) {
        console.error(error);
        return [];
    }

    console.log("TEST PARAMETERS:", data);

    return data;
}