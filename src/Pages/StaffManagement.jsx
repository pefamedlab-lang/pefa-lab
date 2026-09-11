import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase";
import "../styles/staffManagement.css";

/* =========================================================
   PEFA LAB — STAFF MANAGEMENT
   ---------------------------------------------------------
   FEATURES
   - Staff account management
   - Role and department management
   - Profile photo upload
   - Staff signature upload
   - Immediate media persistence for existing staff
   - Detailed upload diagnostics in browser console
   - Storage upload verification
   - Database persistence verification
   - Existing staff_users schema preserved
   - Existing signatures bucket supported
   - Existing staff-photos bucket supported
   - Stable unique Storage paths
   - Storage cleanup when staff is deleted
   ========================================================= */


/* =========================================================
   INITIAL FORM
   ========================================================= */

const INITIAL_FORM = {
  username: "",
  password: "",
  full_name: "",
  email: "",
  phone: "",
  role: "Scientist",
  department: "Laboratory",
  branch: "",
  profile_photo: "",
  signature_url: "",
  status: "Active",
};


/* =========================================================
   ROLES
   ========================================================= */

const ROLES = [
  "Admin",
  "Director",
  "Manager",
  "Scientist",
  "Receptionist",
  "Account Officer",
  "Radiologist",
  "Sonographer",
];


/* =========================================================
   ROLE → DEPARTMENT
   ========================================================= */

const DEPARTMENT_BY_ROLE = {
  Admin: "Administration",
  Director: "Administration",
  Manager: "Administration",
  Scientist: "Laboratory",
  Receptionist: "Reception",
  "Account Officer": "Accounts",
  Radiologist: "Radiology",
  Sonographer: "Ultrasound",
};


/* =========================================================
   FILE LIMIT
   ========================================================= */

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;


/* =========================================================
   CLEAN FILE NAME
   ========================================================= */

const cleanFileName = (name = "image") => {
  const lastDot = name.lastIndexOf(".");

  const extension =
    lastDot >= 0
      ? name.slice(lastDot).toLowerCase()
      : ".jpg";

  const base = (
    lastDot >= 0
      ? name.slice(0, lastDot)
      : name
  )
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

  return `${base || "image"}${extension}`;
};


/* =========================================================
   STORAGE PATH
   ========================================================= */

const makeStoragePath = (
  type,
  staffIdOrUsername,
  file
) => {
  const identity =
    String(staffIdOrUsername || "staff")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .slice(0, 60) || "staff";

  const stamp =
    `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

  return `${identity}/${type}-${stamp}-${cleanFileName(file.name)}`;
};


/* =========================================================
   IMAGE VALIDATION
   ========================================================= */

const validateImage = (file, label) => {
  if (!file) {
    return `${label} file was not selected.`;
  }

  if (!file.type?.startsWith("image/")) {
    return `${label} must be an image file.`;
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return `${label} must not exceed 5 MB.`;
  }

  return "";
};


/* =========================================================
   COMPONENT
   ========================================================= */

export default function StaffManagement() {
  /* =======================================================
     CURRENT USER
     ======================================================= */

  const currentUser = useMemo(() => {
    try {
      return (
        JSON.parse(
          localStorage.getItem("pefa_user") || "{}"
        ) || {}
      );
    } catch {
      return {};
    }
  }, []);


  /* =======================================================
     STATE
     ======================================================= */

  const [staff, setStaff] = useState([]);

  const [loading, setLoading] = useState(false);

  const [uploading, setUploading] = useState({
    photo: false,
    signature: false,
  });

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingStaff, setEditingStaff] =
    useState(null);

  const [formData, setFormData] =
    useState({ ...INITIAL_FORM });

  const [message, setMessage] = useState("");

  const [errorMessage, setErrorMessage] =
    useState("");


  /* =======================================================
     ACCESS CONTROL
     ======================================================= */

  const canManage = [
    "Admin",
    "Director",
  ].includes(currentUser.role);


  /* =======================================================
     INITIAL LOAD
     ======================================================= */

  useEffect(() => {
    loadStaff();
  }, []);


  /* =======================================================
     NOTIFICATIONS
     ======================================================= */

  const notify = (text) => {
    setMessage(text);
    setErrorMessage("");
  };


  const fail = (text) => {
    setErrorMessage(text);
    setMessage("");
  };


  /* =======================================================
     LOAD STAFF
     ======================================================= */

  const loadStaff = async () => {
    console.group(
      "%c[PEFA STAFF] Loading staff records",
      "color:#0b63ce;font-weight:bold;"
    );

    try {
      const { data, error } = await supabase
        .from("staff_users")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      console.log("Supabase staff response:", {
        data,
        error,
      });

      if (error) {
        console.error(
          "❌ Staff loading failed:",
          error
        );

        fail(
          error.message ||
            "Unable to load staff records."
        );

        return;
      }

      console.log(
        `✅ Loaded ${data?.length || 0} staff record(s).`
      );

      console.table(
        (data || []).map((item) => ({
          id: item.id,
          full_name: item.full_name,
          role: item.role,
          profile_photo:
            item.profile_photo || "",
          signature_url:
            item.signature_url || "",
        }))
      );

      setStaff(data || []);
    } catch (error) {
      console.error(
        "❌ loadStaff unexpected error:",
        error
      );

      fail(
        error?.message ||
          "Unable to load staff records."
      );
    } finally {
      console.groupEnd();
    }
  };


  /* =======================================================
     AUDIT LOG
     ======================================================= */

  const logActivity = async (
    action,
    description
  ) => {
    try {
      await supabase
        .from("audit_logs")
        .insert([
          {
            user_name:
              currentUser.full_name ||
              currentUser.username ||
              "Unknown",

            user_role:
              currentUser.role || "",

            action,

            module:
              "Staff Management",

            description,
          },
        ]);
    } catch (error) {
      console.warn(
        "[STAFF MANAGEMENT] audit log failed:",
        error
      );
    }
  };


  /* =========================================================
     UPLOAD PROFILE PHOTO / SIGNATURE
     ---------------------------------------------------------
     IMPORTANT:
     This function contains detailed diagnostics so the
     browser console tells us exactly where an upload fails.
     ========================================================= */

  const uploadAsset = async (
    file,
    type
  ) => {
    const label =
      type === "signature"
        ? "Signature"
        : "Profile photo";

    const bucket =
      type === "signature"
        ? "signatures"
        : "staff-photos";

    console.group(
      `%c[PEFA STAFF UPLOAD] ${label}`,
      "color:#0b63ce;font-weight:bold;"
    );

    console.log(
      "=================================================="
    );

    console.log(
      "STEP 1 — Upload process started"
    );

    console.log("Type:", type);
    console.log("Label:", label);
    console.log("Bucket:", bucket);

    console.log(
      "Current user:",
      currentUser
    );

    console.log(
      "Editing staff:",
      editingStaff
    );

    console.log(
      "Form staff ID:",
      formData.id || null
    );

    console.log(
      "=================================================="
    );


    /* -------------------------------------------------------
       FILE CHECK
       ------------------------------------------------------- */

    console.log(
      "STEP 2 — Checking selected file..."
    );

    if (!file) {
      console.error(
        "❌ No file was selected."
      );

      fail(
        `${label} file was not selected.`
      );

      console.groupEnd();

      return;
    }

    console.log(
      "Selected file:",
      file
    );

    console.log(
      "File name:",
      file.name
    );

    console.log(
      "File type:",
      file.type
    );

    console.log(
      "File size:",
      file.size
    );

    console.log(
      "File size MB:",
      (
        file.size /
        1024 /
        1024
      ).toFixed(2)
    );


    /* -------------------------------------------------------
       VALIDATION
       ------------------------------------------------------- */

    const validationError =
      validateImage(
        file,
        label
      );

    if (validationError) {
      console.error(
        "❌ FILE VALIDATION FAILED:",
        validationError
      );

      fail(validationError);

      console.groupEnd();

      return;
    }

    console.log(
      "✅ File validation passed."
    );


    /* -------------------------------------------------------
       STAFF ID / STORAGE IDENTITY
       ------------------------------------------------------- */

    const staffId =
      editingStaff?.id ||
      formData.id ||
      null;

    const identity =
      editingStaff?.id ||
      formData.username ||
      currentUser.id ||
      "staff";


    console.log(
      "STEP 3 — Preparing Storage path"
    );

    console.log(
      "Staff ID:",
      staffId
    );

    console.log(
      "Storage identity:",
      identity
    );


    const path =
      makeStoragePath(
        type,
        identity,
        file
      );

    console.log(
      "Generated Storage path:",
      path
    );

    console.log(
      "Bucket:",
      bucket
    );


    /* -------------------------------------------------------
       SET UPLOADING STATE
       ------------------------------------------------------- */

    setUploading((prev) => ({
      ...prev,

      [
        type === "signature"
          ? "signature"
          : "photo"
      ]: true,
    }));

    setMessage("");
    setErrorMessage("");


    try {
      /* =====================================================
         STORAGE UPLOAD
         ===================================================== */

      console.log(
        "=================================================="
      );

      console.log(
        "STEP 4 — Calling Supabase Storage.upload()"
      );

      console.log(
        "Bucket:",
        bucket
      );

      console.log(
        "Path:",
        path
      );

      console.log(
        "upsert:",
        false
      );

      console.log(
        "contentType:",
        file.type
      );

      console.log(
        "=================================================="
      );


      const {
        data: uploadData,
        error: uploadError,
      } =
        await supabase.storage
          .from(bucket)
          .upload(
            path,
            file,
            {
              cacheControl: "3600",

              /*
               * Every path is unique.
               * Therefore INSERT is enough.
               */
              upsert: false,

              contentType:
                file.type,
            }
          );


      console.log(
        "Storage upload response:",
        {
          uploadData,
          uploadError,
        }
      );


      if (uploadError) {
        console.error(
          "❌❌❌ STORAGE UPLOAD FAILED ❌❌❌"
        );

        console.error(
          "Full Storage error:",
          uploadError
        );

        console.error(
          "Error message:",
          uploadError?.message
        );

        console.error(
          "Error name:",
          uploadError?.name
        );

        console.error(
          "Error status:",
          uploadError?.status
        );

        console.error(
          "Error statusCode:",
          uploadError?.statusCode
        );

        console.error(
          "Bucket:",
          bucket
        );

        console.error(
          "Path:",
          path
        );

        throw uploadError;
      }


      console.log(
        "✅ STEP 4 SUCCESS — File uploaded to Storage."
      );

      console.log(
        "Storage upload data:",
        uploadData
      );


      /* =====================================================
         PUBLIC URL
         ===================================================== */

      console.log(
        "=================================================="
      );

      console.log(
        "STEP 5 — Generating public URL"
      );

      console.log(
        "Bucket:",
        bucket
      );

      console.log(
        "Path:",
        path
      );


      const {
        data: publicData,
      } =
        supabase.storage
          .from(bucket)
          .getPublicUrl(path);


      console.log(
        "getPublicUrl response:",
        publicData
      );


      const publicUrl =
        publicData?.publicUrl ||
        "";


      console.log(
        "Generated public URL:",
        publicUrl
      );


      if (!publicUrl) {
        console.error(
          "❌ Public URL was empty."
        );

        throw new Error(
          `Unable to generate a URL for the uploaded ${label.toLowerCase()}.`
        );
      }


      console.log(
        "✅ STEP 5 SUCCESS — Public URL generated."
      );


      /* =====================================================
         SIGNATURE
         ===================================================== */

      if (
        type === "signature" &&
        editingStaff?.id
      ) {
        console.log(
          "=================================================="
        );

        console.log(
          "STEP 6 — Saving SIGNATURE URL to staff_users"
        );

        console.log(
          "Staff ID:",
          editingStaff.id
        );

        console.log(
          "Database column:",
          "signature_url"
        );

        console.log(
          "URL:",
          publicUrl
        );


        const {
          data: savedSignature,
          error: signatureSaveError,
        } =
          await supabase
            .from("staff_users")
            .update({
              signature_url:
                publicUrl,
            })
            .eq(
              "id",
              editingStaff.id
            )
            .select(
              "id, full_name, signature_url"
            )
            .single();


        console.log(
          "Database signature update response:",
          {
            savedSignature,
            signatureSaveError,
          }
        );


        if (signatureSaveError) {
          console.error(
            "❌❌❌ SIGNATURE DATABASE UPDATE FAILED ❌❌❌"
          );

          console.error(
            "Full database error:",
            signatureSaveError
          );

          console.error(
            "Message:",
            signatureSaveError?.message
          );

          console.error(
            "Code:",
            signatureSaveError?.code
          );

          console.error(
            "Details:",
            signatureSaveError?.details
          );

          console.error(
            "Hint:",
            signatureSaveError?.hint
          );

          throw signatureSaveError;
        }


        console.log(
          "Returned signature URL:",
          savedSignature?.signature_url
        );


        if (
          !savedSignature?.signature_url
        ) {
          console.error(
            "❌ Database returned an empty signature_url."
          );

          throw new Error(
            "Signature uploaded, but the signature URL was not retained in staff_users."
          );
        }


        console.log(
          "✅ STEP 6 SUCCESS — Signature URL saved."
        );


        setFormData((prev) => ({
          ...prev,

          signature_url:
            savedSignature.signature_url,
        }));


        /* ---------------------------------------------------
           RELOAD STAFF
           --------------------------------------------------- */

        console.log(
          "STEP 7 — Reloading staff records..."
        );

        await loadStaff();

        console.log(
          "✅ STEP 7 SUCCESS — Staff records reloaded."
        );


        notify(
          "Signature uploaded and saved successfully."
        );


        console.log(
          "🎉🎉🎉 SIGNATURE PROCESS COMPLETED SUCCESSFULLY 🎉🎉🎉"
        );
      }


      /* =====================================================
         PROFILE PHOTO
         ===================================================== */

      else if (
        type === "photo" &&
        editingStaff?.id
      ) {
        console.log(
          "=================================================="
        );

        console.log(
          "STEP 6 — Saving PROFILE PHOTO URL to staff_users"
        );

        console.log(
          "Staff ID:",
          editingStaff.id
        );

        console.log(
          "Database column:",
          "profile_photo"
        );

        console.log(
          "URL:",
          publicUrl
        );


        const {
          data: savedPhoto,
          error: photoSaveError,
        } =
          await supabase
            .from("staff_users")
            .update({
              profile_photo:
                publicUrl,
            })
            .eq(
              "id",
              editingStaff.id
            )
            .select(
              "id, full_name, profile_photo"
            )
            .single();


        console.log(
          "Database profile photo update response:",
          {
            savedPhoto,
            photoSaveError,
          }
        );


        if (photoSaveError) {
          console.error(
            "❌❌❌ PROFILE PHOTO DATABASE UPDATE FAILED ❌❌❌"
          );

          console.error(
            photoSaveError
          );

          throw photoSaveError;
        }


        console.log(
          "Returned profile photo URL:",
          savedPhoto?.profile_photo
        );


        if (
          !savedPhoto?.profile_photo
        ) {
          throw new Error(
            "Profile photo uploaded, but the photo URL was not retained in staff_users."
          );
        }


        console.log(
          "✅ STEP 6 SUCCESS — Profile photo URL saved."
        );


        setFormData((prev) => ({
          ...prev,

          profile_photo:
            savedPhoto.profile_photo,
        }));


        console.log(
          "STEP 7 — Reloading staff records..."
        );

        await loadStaff();


        console.log(
          "✅ STEP 7 SUCCESS — Staff records reloaded."
        );


        notify(
          "Profile photo uploaded and saved successfully."
        );


        console.log(
          "🎉 PROFILE PHOTO PROCESS COMPLETED SUCCESSFULLY 🎉"
        );
      }


      /* =====================================================
         NEW STAFF
         ===================================================== */

      else {
        console.log(
          "=================================================="
        );

        console.log(
          "STEP 6 — New staff record"
        );

        console.log(
          "No existing staff ID is available yet."
        );

        console.log(
          "Saving uploaded URL temporarily in formData."
        );


        setFormData((prev) => ({
          ...prev,

          ...(type === "signature"
            ? {
                signature_url:
                  publicUrl,
              }
            : {
                profile_photo:
                  publicUrl,
              }),
        }));


        notify(
          `${label} uploaded successfully. Click ${
            editingStaff
              ? "Update Staff"
              : "Create Staff"
          } to retain it.`
        );


        console.log(
          `✅ ${label} URL stored in formData.`
        );

        console.log(
          "Current media URL:",
          publicUrl
        );
      }
    } catch (error) {
      console.error(
        "=================================================="
      );

      console.error(
        `❌❌❌ [PEFA STAFF UPLOAD] ${label.toUpperCase()} FAILED ❌❌❌`
      );

      console.error(
        "Full error:",
        error
      );

      console.error(
        "Error message:",
        error?.message
      );

      console.error(
        "Error name:",
        error?.name
      );

      console.error(
        "Error code:",
        error?.code
      );

      console.error(
        "Error status:",
        error?.status
      );

      console.error(
        "Error statusCode:",
        error?.statusCode
      );

      console.error(
        "Bucket:",
        bucket
      );

      console.error(
        "Path:",
        path
      );

      console.error(
        "Staff ID:",
        staffId
      );

      console.error(
        "Type:",
        type
      );

      console.error(
        "=================================================="
      );


      fail(
        error?.message ||
          `Unable to upload ${label.toLowerCase()}.`
      );
    } finally {
      console.log(
        "STEP 8 — Upload process finished."
      );


      setUploading((prev) => ({
        ...prev,

        [
          type === "signature"
            ? "signature"
            : "photo"
        ]: false,
      }));


      console.groupEnd();
    }
  };


  /* =========================================================
     REMOVE STORED ASSET
     ========================================================= */

  const removeStoredAsset = async (
    url,
    bucket
  ) => {
    if (!url) return;

    try {
      const marker =
        `/storage/v1/object/public/${bucket}/`;

      const index =
        url.indexOf(marker);

      if (index === -1) {
        console.warn(
          "[STAFF MANAGEMENT] Unable to determine Storage path:",
          {
            bucket,
            url,
          }
        );

        return;
      }

      const path =
        decodeURIComponent(
          url.slice(
            index + marker.length
          )
        );

      if (!path) return;

      console.log(
        "[STAFF MANAGEMENT] Removing Storage asset:",
        {
          bucket,
          path,
        }
      );

      const { error } =
        await supabase.storage
          .from(bucket)
          .remove([path]);

      if (error) {
        console.warn(
          "[STAFF MANAGEMENT] Storage cleanup error:",
          error
        );
      }
    } catch (error) {
      console.warn(
        "[STAFF MANAGEMENT] asset cleanup failed:",
        error
      );
    }
  };


  /* =========================================================
     CREATE
     ========================================================= */

  const openCreate = () => {
    setEditingStaff(null);

    setFormData({
      ...INITIAL_FORM,
    });

    setMessage("");
    setErrorMessage("");

    setShowModal(true);
  };


  /* =========================================================
     EDIT
     ========================================================= */

  const openEdit = (item) => {
    console.log(
      "[STAFF MANAGEMENT] Opening staff for edit:",
      item
    );

    setEditingStaff(item);

    setFormData({
      ...INITIAL_FORM,
      ...item,

      password: "",

      profile_photo:
        item.profile_photo || "",

      signature_url:
        item.signature_url || "",
    });

    setMessage("");
    setErrorMessage("");

    setShowModal(true);
  };


  /* =========================================================
     CLOSE MODAL
     ========================================================= */

  const closeModal = () => {
    if (
      loading ||
      uploading.photo ||
      uploading.signature
    ) {
      return;
    }

    setShowModal(false);

    setEditingStaff(null);

    setFormData({
      ...INITIAL_FORM,
    });

    setMessage("");
    setErrorMessage("");
  };


  /* =========================================================
     FIELD UPDATE
     ========================================================= */

  const updateField = (
    field,
    value
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };


  /* =========================================================
     ROLE CHANGE
     ========================================================= */

  const changeRole = (role) => {
    setFormData((prev) => ({
      ...prev,

      role,

      department:
        DEPARTMENT_BY_ROLE[role] ||
        "",
    }));
  };


  /* =========================================================
     SAVE STAFF
     ========================================================= */

  /* =========================================================
     STAFF AUTH FUNCTION HELPER
     ---------------------------------------------------------
     Authentication is provisioned server-side by the
     Supabase Edge Function. The service-role key never reaches
     the browser.
     ========================================================= */
  const invokeStaffAuth = async (action, payload = {}) => {
    const { data, error } = await supabase.functions.invoke(
      "staff-auth",
      {
        body: {
          action,
          ...payload,
        },
      }
    );

    if (error) {
      let detail = error.message || "Staff authentication request failed.";

      try {
        const context = error.context;
        if (context?.json) {
          const body = await context.json();
          detail = body?.error || body?.message || detail;
        }
      } catch {
        // Keep the original error message when no JSON body is available.
      }

      throw new Error(detail);
    }

    if (!data?.success) {
      throw new Error(
        data?.error ||
          "Staff authentication request was not completed."
      );
    }

    return data;
  };


  /* =========================================================
     SAVE STAFF
     ---------------------------------------------------------
     - CREATE provisions Supabase Auth + staff_users together.
     - UPDATE keeps the staff profile in staff_users and updates
       the linked Auth account when email/password changes.
     - No plaintext password is written by the browser.
     ========================================================= */
  const saveStaff = async () => {
    setMessage("");
    setErrorMessage("");

    if (!formData.full_name.trim()) {
      fail("Full name is required.");
      return;
    }

    if (!formData.username.trim()) {
      fail("Username is required.");
      return;
    }

    if (!formData.role) {
      fail("Staff role is required.");
      return;
    }

    if (!formData.email?.trim()) {
      fail("Email is required for the Supabase Authentication account.");
      return;
    }

    if (!editingStaff && !formData.password.trim()) {
      fail("Password is required when creating a staff account.");
      return;
    }

    if (formData.password && formData.password.length < 6) {
      fail("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    console.group(
      "%c[PEFA STAFF] Provisioning staff account",
      "color:#0b63ce;font-weight:bold;"
    );

    try {
      const payload = {
        staff_id: editingStaff?.id || null,
        username: formData.username.trim().toLowerCase(),
        full_name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone?.trim() || "",
        role: formData.role,
        department:
          formData.department ||
          DEPARTMENT_BY_ROLE[formData.role] ||
          "",
        branch: formData.branch || "",
        profile_photo: formData.profile_photo || "",
        signature_url: formData.signature_url || "",
        status: formData.status || "Active",
        ...(formData.password.trim()
          ? { password: formData.password.trim() }
          : {}),
      };

      console.log("Staff provisioning payload:", {
        ...payload,
        password: payload.password ? "********" : "",
      });

      const result = await invokeStaffAuth(
        editingStaff ? "update" : "create",
        payload
      );

      console.log("✅ Staff authentication response:", {
        success: result.success,
        staff_id: result.staff?.id,
        auth_user_id: result.staff?.auth_user_id,
      });

      const savedRow = result.staff;

      await logActivity(
        editingStaff ? "Staff Updated" : "Staff Created",
        `${editingStaff ? "Updated" : "Created"} ${payload.full_name}`
      );

      notify(
        editingStaff
          ? "Staff updated successfully. Authentication account synchronized."
          : "Staff created successfully. Supabase Authentication account created and linked."
      );

      if (savedRow) {
        console.log("Saved staff row:", savedRow);
      }

      await loadStaff();

      setShowModal(false);
      setEditingStaff(null);
      setFormData({ ...INITIAL_FORM });

      console.log("🎉 STAFF AUTHENTICATION PROVISIONING COMPLETED.");
    } catch (error) {
      console.error("❌ [STAFF MANAGEMENT] saveStaff:", error);
      console.error("Message:", error?.message);
      fail(error?.message || "Unable to save staff account.");
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };


  /* =========================================================
     DELETE STAFF
     ========================================================= */

  const deleteStaff = async (item) => {
    if (
      !window.confirm(
        `Delete ${
          item.full_name || item.username || "this staff account"
        }? This will remove the linked authentication account and staff record.`
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      await invokeStaffAuth("delete", {
        staff_id: item.id,
      });

      await Promise.all([
        removeStoredAsset(item.profile_photo, "staff-photos"),
        removeStoredAsset(item.signature_url, "signatures"),
      ]);

      await logActivity(
        "Staff Deleted",
        `Deleted ${item.full_name || item.username}`
      );

      notify("Staff account deleted successfully.");
      await loadStaff();
    } catch (error) {
      console.error("[STAFF MANAGEMENT] deleteStaff:", error);
      fail(error?.message || "Unable to delete staff account.");
    } finally {
      setLoading(false);
    }
  };


  /* =========================================================
     TOGGLE STATUS
     ========================================================= */

  const toggleStatus = async (item) => {
    const nextStatus =
      item.status === "Active" ? "Disabled" : "Active";

    try {
      setLoading(true);

      await invokeStaffAuth("set_status", {
        staff_id: item.id,
        status: nextStatus,
      });

      await logActivity(
        nextStatus === "Active"
          ? "Staff Activated"
          : "Staff Disabled",
        `${item.full_name || item.username} account ${nextStatus}`
      );

      notify(
        `${item.full_name || item.username} is now ${nextStatus}.`
      );

      await loadStaff();
    } catch (error) {
      console.error("[STAFF MANAGEMENT] toggleStatus:", error);
      fail(error?.message || "Unable to change staff status.");
    } finally {
      setLoading(false);
    }
  };


  /* =========================================================
     RESET PASSWORD
     ========================================================= */

  const resetPassword = async (item) => {
    const newPassword = window.prompt(
      `Enter a new password for ${
        item.full_name || item.username
      }:`
    );

    if (!newPassword) {
      return;
    }

    if (newPassword.length < 6) {
      fail("Password must contain at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      await invokeStaffAuth("reset_password", {
        staff_id: item.id,
        password: newPassword,
      });

      await logActivity(
        "Staff Password Reset",
        `Reset authentication password for ${
          item.full_name || item.username
        }`
      );

      notify("Password reset successfully in Supabase Authentication.");
    } catch (error) {
      console.error("[STAFF MANAGEMENT] resetPassword:", error);
      fail(error?.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };


  /* =========================================================
     FILTER
     ========================================================= */

  const filteredStaff =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();


      if (!term) {
        return staff;
      }


      return staff.filter(
        (item) =>
          [
            item.full_name,
            item.username,
            item.role,
            item.department,
            item.branch,
          ]
            .filter(Boolean)
            .some((value) =>
              String(value)
                .toLowerCase()
                .includes(term)
            )
      );
    }, [staff, search]);


  /* =========================================================
     STATISTICS
     ========================================================= */

  const activeCount =
    staff.filter(
      (s) =>
        s.status === "Active"
    ).length;


  const managerCount =
    staff.filter(
      (s) =>
        s.role === "Manager"
    ).length;


  const scientistCount =
    staff.filter(
      (s) =>
        s.role === "Scientist"
    ).length;


  const radiologyCount =
    staff.filter(
      (s) =>
        s.role === "Radiologist" ||
        s.role === "Sonographer"
    ).length;


  /* =========================================================
     ACCESS DENIED
     ========================================================= */

  if (!canManage) {
    return (
      <div className="staff-management">
        <h2>
          Access Denied
        </h2>

        <p>
          You do not have permission
          to access Staff Management.
        </p>
      </div>
    );
  }


  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="staff-management">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="staff-management-header">

        <div>
          <h1>
            Staff Management (
            {staff.length}
            )
          </h1>

          <p>
            Manage staff accounts,
            roles, access, profile
            photos and report
            signatures.
          </p>
        </div>


        <button
          className="staff-btn staff-btn-primary"
          onClick={openCreate}
          disabled={loading}
        >
          Create Staff
        </button>

      </div>


      {/* =====================================================
          MESSAGE
          ===================================================== */}

      {(message ||
        errorMessage) && (
        <div
          role="status"
          style={{
            margin:
              "12px 0",

            padding:
              "12px 14px",

            borderRadius:
              "10px",

            background:
              errorMessage
                ? "#fef2f2"
                : "#ecfdf5",

            color:
              errorMessage
                ? "#991b1b"
                : "#065f46",

            border:
              `1px solid ${
                errorMessage
                  ? "#fecaca"
                  : "#a7f3d0"
              }`,
          }}
        >
          {
            errorMessage ||
            message
          }
        </div>
      )}


      {/* =====================================================
          SEARCH
          ===================================================== */}

      <div className="staff-toolbar">
        <div className="staff-search-wrapper">
        <input
          type="text"
          className="staff-search"
          placeholder="Search staff by name, username, role, department or branch..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />
        </div>
      </div>


      {/* =====================================================
          STATISTICS
          ===================================================== */}

      <div className="staff-stat-grid">

        <div className="staff-stat-card">
          <h3>
            Total Staff
          </h3>

          <p>
            {staff.length}
          </p>
        </div>


        <div className="staff-stat-card">
          <h3>
            Active Staff
          </h3>

          <p>
            {activeCount}
          </p>
        </div>


        <div className="staff-stat-card">
          <h3>
            Managers
          </h3>

          <p>
            {managerCount}
          </p>
        </div>


        <div className="staff-stat-card">
          <h3>
            Scientists
          </h3>

          <p>
            {scientistCount}
          </p>
        </div>


        <div className="staff-stat-card">
          <h3>
            Radiology Team
          </h3>

          <p>
            {radiologyCount}
          </p>
        </div>

      </div>


      {/* =====================================================
          STAFF TABLE
          ===================================================== */}

      <div
        style={{
          overflowX:
            "auto",
        }}
      >

        <table className="staff-table">

          <thead>

            <tr>
              <th>
                Photo
              </th>

              <th>
                ID
              </th>

              <th>
                Name
              </th>

              <th>
                Username
              </th>

              <th>
                Role
              </th>

              <th>
                Department
              </th>

              <th>
                Signature
              </th>

              <th>
                Status
              </th>

              <th>
                Authentication
              </th>

              <th>
                Actions
              </th>
            </tr>

          </thead>


          <tbody>

            {filteredStaff.length ===
            0 ? (
              <tr>
                <td
                  colSpan="10"
                  style={{
                    textAlign:
                      "center",
                    padding:
                      "30px",
                  }}
                >
                  No staff
                  records found.
                </td>
              </tr>
            ) : (

              filteredStaff.map(
                (item) => (

                  <tr
                    key={item.id}
                  >

                    {/* PHOTO */}

                    <td>

                      {item.profile_photo ? (

                        <img
                          src={
                            item.profile_photo
                          }
                          alt={
                            item.full_name ||
                            "Staff"
                          }
                          style={{
                            width: 45,
                            height: 45,
                            borderRadius:
                              "50%",
                            objectFit:
                              "cover",
                          }}
                        />

                      ) : (
                        "N/A"
                      )}

                    </td>


                    {/* ID */}

                    <td>
                      {item.id}
                    </td>


                    {/* NAME */}

                    <td>
                      {
                        item.full_name ||
                        "—"
                      }
                    </td>


                    {/* USERNAME */}

                    <td>
                      {
                        item.username ||
                        "—"
                      }
                    </td>


                    {/* ROLE */}

                    <td>
                      {
                        item.role ||
                        "—"
                      }
                    </td>


                    {/* DEPARTMENT */}

                    <td>
                      {
                        item.department ||
                        "—"
                      }
                    </td>


                    {/* SIGNATURE */}

                    <td>

                      {item.signature_url ? (

                        <img
                          src={
                            item.signature_url
                          }
                          alt="Signature"
                          style={{
                            width: 120,
                            maxHeight: 45,
                            objectFit:
                              "contain",
                          }}
                        />

                      ) : (
                        "Not set"
                      )}

                    </td>


                    {/* STATUS */}

                    <td>
                      {
                        item.status ||
                        "—"
                      }
                    </td>


                    {/* AUTHENTICATION */}

                    <td data-label="Authentication">
                      {item.auth_user_id ? (
                        <span style={{ color: "#047857", fontWeight: 700 }}>
                          Linked
                        </span>
                      ) : (
                        <span style={{ color: "#b45309", fontWeight: 700 }}>
                          Not linked
                        </span>
                      )}
                    </td>


                    {/* ACTIONS */}

                    <td data-label="Actions">

                      <div className="staff-actions"
                        style={{
                          display:
                            "flex",
                          flexWrap:
                            "wrap",
                          gap: 6,
                        }}
                      >

                        <button
                          className="staff-action-btn"
                          onClick={() =>
                            openEdit(
                              item
                            )
                          }
                        >
                          Edit
                        </button>


                        <button
                          className="staff-action-btn"
                          onClick={() =>
                            toggleStatus(
                              item
                            )
                          }
                        >
                          {
                            item.status ===
                            "Active"
                              ? "Disable"
                              : "Activate"
                          }
                        </button>


                        <button
                          className="staff-action-btn"
                          onClick={() =>
                            resetPassword(
                              item
                            )
                          }
                        >
                          Reset Password
                        </button>


                        <button
                          className="staff-action-btn staff-action-btn-danger"
                          onClick={() =>
                            deleteStaff(
                              item
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                )
              )

            )}

          </tbody>

        </table>

      </div>


      {/* =====================================================
          MODAL
          ===================================================== */}

      {showModal && (

        <div className="staff-modal-overlay">

          <div
            className="staff-modal"
            style={{
              maxWidth: 980,
            }}
          >

            {/* =================================================
                MODAL HEADER
                ================================================= */}

            <div className="staff-modal-header">

              <div>

                <h2>
                  {
                    editingStaff
                      ? "Edit Staff"
                      : "Create Staff"
                  }
                </h2>

                <p
                  style={{
                    margin: 0,
                    opacity: 0.7,
                  }}
                >
                  Staff identity,
                  access, profile
                  photo and report
                  signature
                </p>

              </div>


              <button
                className="staff-modal-close"
                onClick={
                  closeModal
                }
                disabled={
                  loading ||
                  uploading.photo ||
                  uploading.signature
                }
              >
                ×
              </button>

            </div>


            {/* =================================================
                FORM
                ================================================= */}

            <div className="staff-form">

              {/* ROLE */}

              <select
                value={
                  formData.role
                }
                onChange={(e) =>
                  changeRole(
                    e.target.value
                  )
                }
              >

                {ROLES.map(
                  (role) => (
                    <option
                      key={role}
                      value={role}
                    >
                      {role}
                    </option>
                  )
                )}

              </select>


              {/* FULL NAME */}

              <input
                placeholder="Full Name"
                value={
                  formData.full_name
                }
                onChange={(e) =>
                  updateField(
                    "full_name",
                    e.target.value
                  )
                }
              />


              {/* USERNAME */}

              <input
                placeholder="Username"
                value={
                  formData.username
                }
                onChange={(e) =>
                  updateField(
                    "username",
                    e.target.value.toLowerCase()
                  )
                }
              />


              {/* PASSWORD */}

              <input
                placeholder={
                  editingStaff
                    ? "New Password (optional)"
                    : "Password (min. 6 characters)"
                }
                type="password"
                value={
                  formData.password
                }
                onChange={(e) =>
                  updateField(
                    "password",
                    e.target.value
                  )
                }
              />


              {/* EMAIL */}

              <input
                placeholder="Email"
                type="email"
                value={
                  formData.email
                }
                onChange={(e) =>
                  updateField(
                    "email",
                    e.target.value
                  )
                }
              />


              <small
                style={{
                  gridColumn: "1 / -1",
                  display: "block",
                  marginTop: -8,
                  opacity: 0.72,
                }}
              >
                Staff login is managed through Supabase Authentication. The password is never stored by this form as the authentication credential.
              </small>


              {/* PHONE */}

              <input
                placeholder="Phone"
                value={
                  formData.phone
                }
                onChange={(e) =>
                  updateField(
                    "phone",
                    e.target.value
                  )
                }
              />


              {/* BRANCH */}

              <select
                value={
                  formData.branch
                }
                onChange={(e) =>
                  updateField(
                    "branch",
                    e.target.value
                  )
                }
              >

                <option value="">
                  Select Branch
                </option>

                <option value="Redemption City">
                  Redemption City
                </option>

                <option value="Mowe">
                  Mowe
                </option>

                <option value="Head Office">
                  Head Office
                </option>

              </select>


              {/* DEPARTMENT */}

              <input
                placeholder="Department"
                value={
                  formData.department
                }
                readOnly
              />


              {/* STATUS */}

              <select
                value={
                  formData.status
                }
                onChange={(e) =>
                  updateField(
                    "status",
                    e.target.value
                  )
                }
              >

                <option value="Active">
                  Active
                </option>

                <option value="Disabled">
                  Disabled
                </option>

              </select>


              {/* =================================================
                  PROFILE PHOTO
                  ================================================= */}

              <div>

                <label>
                  Profile Photo
                </label>

                <input
                  type="file"
                  accept="image/*"
                  disabled={
                    uploading.photo
                  }
                  onChange={(e) =>
                    uploadAsset(
                      e.target.files?.[0],
                      "photo"
                    )
                  }
                />

                {uploading.photo && (
                  <small>
                    Uploading profile
                    photo…
                  </small>
                )}

              </div>


              {/* =================================================
                  SIGNATURE
                  ================================================= */}

              <div>

                <label>
                  Signature
                </label>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  disabled={
                    uploading.signature
                  }
                  onChange={(e) =>
                    uploadAsset(
                      e.target.files?.[0],
                      "signature"
                    )
                  }
                />

                {uploading.signature && (
                  <small>
                    Uploading
                    signature…
                  </small>
                )}

              </div>


              {/* =================================================
                  PROFILE PREVIEW
                  ================================================= */}

              {formData.profile_photo && (
                <div>

                  <p>
                    Profile Photo
                    Preview
                  </p>

                  <img
                    src={
                      formData.profile_photo
                    }
                    alt="Profile preview"
                    style={{
                      width: 110,
                      height: 110,
                      borderRadius:
                        "50%",
                      objectFit:
                        "cover",
                    }}
                  />

                </div>
              )}


              {/* =================================================
                  SIGNATURE PREVIEW
                  ================================================= */}

              {formData.signature_url && (
                <div>

                  <p>
                    Signature Preview
                  </p>

                  <div
                    style={{
                      background:
                        "#fff",
                      padding: 10,
                      borderRadius:
                        8,
                      display:
                        "inline-block",
                    }}
                  >

                    <img
                      src={
                        formData.signature_url
                      }
                      alt="Signature preview"
                      style={{
                        width: 220,
                        maxHeight: 90,
                        objectFit:
                          "contain",
                      }}
                    />

                  </div>

                </div>
              )}

            </div>


            {/* =================================================
                MODAL ACTIONS
                ================================================= */}

            <div className="staff-modal-footer"
              style={{
                display:
                  "flex",
                justifyContent:
                  "flex-end",
                gap: 10,
                marginTop: 18,
              }}
            >

              <button
                className="staff-modal-close"
                onClick={
                  closeModal
                }
                disabled={
                  loading ||
                  uploading.photo ||
                  uploading.signature
                }
              >
                Cancel
              </button>


              <button
  type="button"
  className="staff-btn staff-btn-primary"
  onClick={saveStaff}
  disabled={loading}
  aria-busy={loading}
>
  {loading
    ? "Saving…"
    : editingStaff
      ? "Update Staff"
      : "Create Staff"}
</button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}