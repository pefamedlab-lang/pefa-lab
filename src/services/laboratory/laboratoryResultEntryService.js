/* ==========================================================
   PEFA LAB
   LABORATORY RESULT ENTRY LIFECYCLE SERVICE
   ----------------------------------------------------------
   PURPOSE
   ----------------------------------------------------------
   Handles the lifecycle of a dedicated laboratory result form.

   FIRST SAVE
   ----------
   Updates the already-created laboratory_results record.

   EDIT
   ----
   Requires:
     - existing result ID
     - new result
     - reason for editing
     - authenticated editor

   The edit operation is delegated to the database RPC:
       replace_laboratory_result

   IMPORTANT
   ----------
   - Does NOT resolve registrations.
   - Does NOT resolve master tests.
   - Does NOT query LaboratoryResultEntry.jsx.
   - Does NOT use .single() for normal REST UPDATE.
   - Does NOT create duplicate result rows on first save.
   ========================================================== */

import { supabase } from "../../supabase";

/* ==========================================================
   HELPERS
   ========================================================== */

const clean = (value) =>
  String(value ?? "").trim();

/* ----------------------------------------------------------
   EDITOR NAME
   ---------------------------------------------------------- */

async function getEditorName() {
  const { data, error } =
    await supabase.auth.getUser();

  if (error) {
    throw new Error(
      `Unable to identify the current laboratory user: ${error.message}`
    );
  }

  const user = data?.user;

  if (!user) {
    throw new Error(
      "No authenticated laboratory user was found."
    );
  }

  return (
    clean(user.user_metadata?.full_name) ||
    clean(user.user_metadata?.name) ||
    clean(user.user_metadata?.display_name) ||
    clean(user.email) ||
    clean(user.id)
  );
}

/* ----------------------------------------------------------
   RESULT ID
   ---------------------------------------------------------- */

function getResultId(result) {
  const id =
    result?.id ??
    result?.result_id ??
    result?.laboratory_result_id ??
    null;

  if (
    id === null ||
    id === undefined ||
    String(id).trim() === ""
  ) {
    throw new Error(
      "A valid laboratory result ID is required."
    );
  }

  return id;
}

/* ----------------------------------------------------------
   RESULT PAYLOAD
   ---------------------------------------------------------- */

function assertResultPayload(resultData) {
  if (
    !resultData ||
    typeof resultData !== "object" ||
    Array.isArray(resultData)
  ) {
    throw new Error(
      "A valid laboratory result payload is required."
    );
  }
}

/* ==========================================================
   FIRST SAVE
   ========================================================== */

export async function saveLaboratoryResultEntry({
  result,
  resultData,
}) {
  const resultId = getResultId(result);

  assertResultPayload(resultData);

  const editorName =
    await getEditorName();

  /*
   * IMPORTANT
   * --------------------------------------------------------
   * Do NOT use:
   *
   *     .select("*")
   *     .single()
   *
   * after UPDATE.
   *
   * The laboratory result already exists and its ID is known.
   * We only need to update it.
   */

  const { error } = await supabase
    .from("laboratory_results")
    .update({
      result: resultData,
      result_status: "Completed",
      entered_by: editorName,
    })
    .eq("id", resultId);

  if (error) {
    throw new Error(
      `Unable to save laboratory result: ${error.message}`
    );
  }

  /*
   * Return a local representation of the successfully saved
   * result instead of forcing PostgREST to return a single row.
   */

  return {
    ...result,
    id: resultId,
    result: resultData,
    result_status: "Completed",
    entered_by: editorName,
  };
}

/* ==========================================================
   EDIT EXISTING RESULT
   ========================================================== */

export async function replaceLaboratoryResult({
  result,
  resultData,
  editReason,
}) {
  const resultId = getResultId(result);

  assertResultPayload(resultData);

  const reason =
    clean(editReason);

  if (!reason) {
    throw new Error(
      "A reason for editing is required."
    );
  }

  const editorName =
    await getEditorName();

  /*
   * Database transaction:
   *
   * 1. Lock old result.
   * 2. Save old result into audit table.
   * 3. Create replacement result.
   * 4. Remove old result.
   * 5. Return new result.
   */

  const { data, error } =
    await supabase.rpc(
      "replace_laboratory_result",
      {
        p_result_id: Number(resultId),
        p_new_result: resultData,
        p_edit_reason: reason,
        p_editor_name: editorName,
      }
    );

  if (error) {
    throw new Error(
      `Unable to save edited laboratory result: ${error.message}`
    );
  }

  /*
   * RPC can return either:
   *
   * object
   * OR
   * array
   *
   * depending on the PostgREST representation.
   */

  const saved =
    Array.isArray(data)
      ? data[0]
      : data;

  if (
    !saved ||
    !saved.id
  ) {
    throw new Error(
      "The edited laboratory result was not returned by the database."
    );
  }

  return saved;
}

/* ==========================================================
   SAVE OR EDIT
   ========================================================== */

export async function saveOrEditLaboratoryResult({
  result,
  resultData,
  editing = false,
  editReason = "",
}) {
  if (editing) {
    return replaceLaboratoryResult({
      result,
      resultData,
      editReason,
    });
  }

  return saveLaboratoryResultEntry({
    result,
    resultData,
  });
}

/* ==========================================================
   OPTIONAL ALIASES
   ----------------------------------------------------------
   These make the service easier to consume from dedicated
   result-entry forms without changing LaboratoryResultEntry.
   ========================================================== */

export const saveLaboratoryResult =
  saveLaboratoryResultEntry;

export const editLaboratoryResult =
  replaceLaboratoryResult;