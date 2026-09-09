/* ==========================================================
   GROUP RESULT RECORDS
   ----------------------------------------------------------
   PURPOSE

   Convert database result rows into REPORT-LEVEL records.

   CORE RULES

   1. EXPLICIT PANEL METADATA ALWAYS WINS.

   2. SINGLE TESTS REMAIN SINGLE TESTS.

      Creatinine  -> Creatinine
      GGT         -> GGT
      ALT         -> ALT
      Bicarbonate -> Bicarbonate

   3. SAME LAB NUMBER DOES NOT MEAN SAME REPORT.

   4. ANALYTE-NAME INFERENCE IS DISABLED.

   5. A PANEL REQUIRES REAL PANEL IDENTITY:

        panel_id
        OR
        panel_name
        OR
        an explicitly declared PANEL/PROFILE/GROUP row.

   6. is_panel = true BY ITSELF IS NOT ENOUGH TO INVENT
      A PANEL NAME FROM THE CHILD TEST NAME.

   7. CHILD TEST DATA IS NEVER MODIFIED.

   8. PANEL CHILDREN remain inside:

        group.items[]

   9. SINGLE TESTS ALSO receive:

        group.items[]

      containing exactly one child.

   ========================================================== */

export default function groupResultRecords(records = []) {
  /* ==========================================================
     SAFETY
  ========================================================== */

  if (!Array.isArray(records) || records.length === 0) {
    return [];
  }

  /* ==========================================================
     NORMALIZATION
  ========================================================== */

  const normalize = (value) =>
    String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ");

  /* ==========================================================
     FIRST NON-EMPTY VALUE
  ========================================================== */

  const firstValue = (...values) => {
    for (const value of values) {
      if (
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
      ) {
        return value;
      }
    }

    return null;
  };

  /* ==========================================================
     TEST NAME
  ========================================================== */

  const getTestName = (item = {}) =>
    String(
      firstValue(
        item?.test_name,
        item?.testName,
        item?.test,
        item?.analyte,
        item?.parameter,
        item?.parameter_name,
        item?.parameterName,
        item?.name,
        ""
      ) ?? ""
    ).trim();

  /* ==========================================================
     TEST TYPE
  ========================================================== */

  const getTestType = (item = {}) =>
    normalize(
      firstValue(
        item?.test_type,
        item?.testType,
        ""
      )
    );

  /* ==========================================================
     TEMPLATE TYPE
  ========================================================== */

  const getTemplateType = (item = {}) =>
    String(
      firstValue(
        item?.template_type,
        item?.templateType,
        item?.template,
        ""
      ) ?? ""
    ).trim();

  /* ==========================================================
     PANEL NAME

     IMPORTANT:
     Only actual panel-related database fields are considered.
     We do NOT use the child's test name as panel_name.
  ========================================================== */

  const getPanelName = (item = {}) =>
    String(
      firstValue(
        item?.panel_name,
        item?.panelName,
        item?.panel_type,
        item?.panelType,
        item?.profile_name,
        item?.profileName,
        item?.parent_panel_name,
        item?.parentPanelName,
        item?.parent_panel,
        item?.parentPanel,
        ""
      ) ?? ""
    ).trim();

  /* ==========================================================
     PANEL ID
  ========================================================== */

  const getPanelId = (item = {}) =>
    firstValue(
      item?.panel_id,
      item?.panelId,
      item?.parent_panel_id,
      item?.parentPanelId,
      item?.master_panel_id,
      item?.masterPanelId,
      null
    );

  /* ==========================================================
     MASTER TEST ID
  ========================================================== */

  const getMasterTestId = (item = {}) =>
    firstValue(
      item?.master_test_id,
      item?.masterTestId,
      item?.test_id,
      item?.testId,
      null
    );

  /* ==========================================================
     EXPLICIT PANEL FLAG

     Supports:
       true
       1
       "1"
       "true"
  ========================================================== */

  const isExplicitPanelFlag = (item = {}) => {
    const value =
      item?.is_panel ??
      item?.isPanel ??
      false;

    if (
      value === true ||
      value === 1 ||
      value === "1"
    ) {
      return true;
    }

    return (
      typeof value === "string" &&
      value.trim().toLowerCase() === "true"
    );
  };

  /* ==========================================================
     EXPLICIT PANEL TEST TYPE
  ========================================================== */

  const isPanelTestType = (item = {}) => {
    const type = getTestType(item);

    return (
      type === "panel" ||
      type === "profile" ||
      type === "group"
    );
  };

  /* ==========================================================
     REAL PANEL IDENTITY
     
     THIS IS THE CRITICAL FIX.

     is_panel = true alone does NOT create a panel.

     We only accept it when accompanied by actual panel
     identity, OR when the row itself is explicitly typed
     as Panel/Profile/Group.
  ========================================================== */

  const resolveExplicitPanelIdentity = (item = {}) => {
    const panelName = getPanelName(item);
    const panelId = getPanelId(item);

    /* --------------------------------------------------------
       1. REAL PANEL NAME
       -------------------------------------------------------- */

    if (panelName) {
      return {
        name: panelName,
        normalizedName: normalize(panelName),
        id: panelId,
        explicit: true,
      };
    }

    /* --------------------------------------------------------
       2. REAL PANEL ID
       -------------------------------------------------------- */

    if (
      panelId !== null &&
      panelId !== undefined &&
      String(panelId).trim() !== ""
    ) {
      return {
        name: "",
        normalizedName: "",
        id: panelId,
        explicit: true,
      };
    }

    /* --------------------------------------------------------
       3. EXPLICIT PANEL ROW
       
       A row whose test_type itself is Panel/Profile/Group
       can define its own report identity.

       IMPORTANT:

       is_panel=true alone does NOT reach this block.
       -------------------------------------------------------- */

    if (isPanelTestType(item)) {
      const testName = getTestName(item);

      if (testName) {
        return {
          name: testName,
          normalizedName: normalize(testName),
          id: null,
          explicit: true,
        };
      }
    }

    /*
     * IMPORTANT:
     *
     * Do NOT do this:
     *
     * if (isExplicitPanelFlag(item)) {
     *    return testName;
     * }
     *
     * because that converts child analytes into panels.
     */

    return null;
  };

  /* ==========================================================
     PANEL GROUP KEY
  ========================================================== */

  const getPanelGroupKey = (
    labNumber,
    panel
  ) => {
    const identity =
      panel?.id !== null &&
      panel?.id !== undefined &&
      String(panel.id).trim() !== ""
        ? `id:${String(panel.id)}`
        : panel?.normalizedName
        ? `name:${panel.normalizedName}`
        : "unknown";

    return [
      String(labNumber ?? ""),
      "PANEL",
      identity,
    ].join("::");
  };

  /* ==========================================================
     SINGLE GROUP KEY

     IMPORTANT:

     LAB NUMBER + MASTER TEST ID

     OR

     LAB NUMBER + TEST NAME
  ========================================================== */

  const getSingleGroupKey = (item = {}) => {
    const labNumber =
      String(getLabNumber(item) ?? "");

    const masterTestId =
      getMasterTestId(item);

    const testName =
      normalize(getTestName(item));

    const identity =
      masterTestId !== null &&
      masterTestId !== undefined &&
      String(masterTestId).trim() !== ""
        ? `id:${String(masterTestId)}`
        : `name:${testName || "unclassified"}`;

    return [
      labNumber,
      "SINGLE",
      identity,
    ].join("::");
  };

  /* ==========================================================
     DEPARTMENT
  ========================================================== */

  const getDepartment = (item = {}) =>
    String(
      firstValue(
        item?.department,
        item?.result_department,
        item?.resultDepartment,
        item?.dept,
        item?.resultDept,
        ""
      ) ?? ""
    ).trim();

  /* ==========================================================
     RESULT CATEGORY
  ========================================================== */

  const getResultCategory = (item = {}) =>
    String(
      firstValue(
        item?.result_category,
        item?.resultCategory,
        item?.category,
        ""
      ) ?? ""
    ).trim();

  /* ==========================================================
     LAB NUMBER
  ========================================================== */

  const getLabNumber = (item = {}) =>
    firstValue(
      item?.lab_number,
      item?.labNumber,
      item?.lab_no,
      item?.labNo,
      ""
    ) ?? "";

  /* ==========================================================
     PATIENT NAME
  ========================================================== */

  const getPatientName = (item = {}) =>
    firstValue(
      item?.patient_name,
      item?.full_name,
      ""
    ) ?? null;

  /* ==========================================================
     DISPLAY ORDER
  ========================================================== */

  const getDisplayOrder = (item = {}) =>
    Number(
      firstValue(
        item?.display_order,
        item?.displayOrder,
        0
      )
    ) || 0;

  /* ==========================================================
     REPORT DATE
  ========================================================== */

  const getReportDate = (item = {}) =>
    firstValue(
      item?.reported_at,
      item?.reportedAt,
      item?.created_at,
      item?.createdAt,
      null
    );

  /* ==========================================================
     FIND FIRST VALUE
  ========================================================== */

  const findFirstValueInItems = (
    items,
    getter
  ) => {
    for (const item of items) {
      const value = getter(item);

      if (
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
      ) {
        return value;
      }
    }

    return null;
  };

  /* ==========================================================
     CREATE REPORT GROUP
  ========================================================== */

  const createGroup = (
    items = [],
    panel = null
  ) => {
    const first = items[0] || {};

    const labNumber =
      firstValue(
        getLabNumber(first),
        findFirstValueInItems(
          items,
          getLabNumber
        )
      ) || null;

    const reportTestName =
      panel?.name ||
      getTestName(first) ||
      findFirstValueInItems(
        items,
        getTestName
      ) ||
      null;

    const department =
      findFirstValueInItems(
        items,
        getDepartment
      );

    const resultCategory =
      findFirstValueInItems(
        items,
        getResultCategory
      );

    const templateType =
      findFirstValueInItems(
        items,
        getTemplateType
      );

    const resultType =
      firstValue(
        first?.result_type,
        first?.resultType,
        findFirstValueInItems(
          items,
          (item) =>
            item?.result_type ??
            item?.resultType
        ),
        null
      );

    /* ========================================================
       REPORT OBJECT
    ======================================================== */

    const group = {
      /* ======================================================
         BASIC
      ====================================================== */

      id:
        first?.id ??
        null,

      lab_number:
        labNumber,

      labNumber:
        firstValue(
          first?.labNumber,
          first?.lab_number,
          labNumber,
          null
        ),

      access_code:
        firstValue(
          first?.access_code,
          first?.accessCode,
          null
        ),

      /* ======================================================
         PATIENT
      ====================================================== */

      full_name:
        firstValue(
          first?.full_name,
          first?.patient_name,
          findFirstValueInItems(
            items,
            getPatientName
          ),
          null
        ),

      patient_name:
        firstValue(
          first?.patient_name,
          first?.full_name,
          findFirstValueInItems(
            items,
            getPatientName
          ),
          null
        ),

      age:
        firstValue(
          first?.age,
          findFirstValueInItems(
            items,
            (item) => item?.age
          ),
          null
        ),

      sex:
        firstValue(
          first?.sex,
          findFirstValueInItems(
            items,
            (item) => item?.sex
          ),
          null
        ),

      dob:
        firstValue(
          first?.dob,
          findFirstValueInItems(
            items,
            (item) => item?.dob
          ),
          null
        ),

      phone:
        firstValue(
          first?.phone,
          findFirstValueInItems(
            items,
            (item) => item?.phone
          ),
          null
        ),

      address:
        firstValue(
          first?.address,
          findFirstValueInItems(
            items,
            (item) => item?.address
          ),
          null
        ),

      /* ======================================================
         REGISTRATION
      ====================================================== */

      branch:
        firstValue(
          first?.branch,
          findFirstValueInItems(
            items,
            (item) => item?.branch
          ),
          null
        ),

      referral_id:
        firstValue(
          first?.referral_id,
          findFirstValueInItems(
            items,
            (item) => item?.referral_id
          ),
          null
        ),

      referral_name:
        firstValue(
          first?.referral_name,
          findFirstValueInItems(
            items,
            (item) => item?.referral_name
          ),
          null
        ),

      referring_doctor:
        firstValue(
          first?.referring_doctor,
          findFirstValueInItems(
            items,
            (item) => item?.referring_doctor
          ),
          null
        ),

      clinical_history:
        firstValue(
          first?.clinical_history,
          findFirstValueInItems(
            items,
            (item) => item?.clinical_history
          ),
          null
        ),

      payment_type:
        firstValue(
          first?.payment_type,
          findFirstValueInItems(
            items,
            (item) => item?.payment_type
          ),
          null
        ),

      created_at:
        firstValue(
          first?.created_at,
          first?.createdAt,
          findFirstValueInItems(
            items,
            (item) =>
              item?.created_at ??
              item?.createdAt
          ),
          null
        ),

      /* ======================================================
         REPORT
      ====================================================== */

      department:
        department || null,

      result_category:
        resultCategory || null,

      /* ======================================================
         PANEL
      ====================================================== */

      panel_name:
        panel?.name ??
        null,

      panelName:
        panel?.name ??
        null,

      panel_id:
        panel?.id ??
        null,

      panelId:
        panel?.id ??
        null,

      is_panel:
        Boolean(panel),

      isPanel:
        Boolean(panel),

      /* ======================================================
         TEST TYPE
      ====================================================== */

      test_type:
        panel
          ? "Panel"
          : firstValue(
              first?.test_type,
              first?.testType,
              null
            ),

      testType:
        panel
          ? "Panel"
          : firstValue(
              first?.testType,
              first?.test_type,
              null
            ),

      /* ======================================================
         REPORT NAME
      ====================================================== */

      test_name:
        reportTestName,

      testName:
        reportTestName,

      /* ======================================================
         TEMPLATE
      ====================================================== */

      template_type:
        templateType || null,

      templateType:
        templateType || null,

      normalized_template_type:
        normalize(templateType) || null,

      result_type:
        resultType,

      /* ======================================================
         STATUS
      ====================================================== */

      authorization_status:
        firstValue(
          first?.authorization_status,
          findFirstValueInItems(
            items,
            (item) =>
              item?.authorization_status
          ),
          null
        ),

      authorized_by:
        firstValue(
          first?.authorized_by,
          findFirstValueInItems(
            items,
            (item) =>
              item?.authorized_by
          ),
          null
        ),

      authorized_at:
        firstValue(
          first?.authorized_at,
          findFirstValueInItems(
            items,
            (item) =>
              item?.authorized_at
          ),
          null
        ),

      release_status:
        firstValue(
          first?.release_status,
          findFirstValueInItems(
            items,
            (item) =>
              item?.release_status
          ),
          null
        ),

      released_by:
        firstValue(
          first?.released_by,
          findFirstValueInItems(
            items,
            (item) =>
              item?.released_by
          ),
          null
        ),

      released_at:
        firstValue(
          first?.released_at,
          findFirstValueInItems(
            items,
            (item) =>
              item?.released_at
          ),
          null
        ),

      verification_id:
        firstValue(
          first?.verification_id,
          findFirstValueInItems(
            items,
            (item) =>
              item?.verification_id
          ),
          null
        ),

      reported_at:
        firstValue(
          first?.reported_at,
          first?.reportedAt,
          findFirstValueInItems(
            items,
            getReportDate
          ),
          null
        ),

      print_count: 0,

      download_count: 0,

      /* ======================================================
         CHILD RESULTS
      ====================================================== */

      items: [],
    };

    /* ========================================================
       ADD ORIGINAL CHILD OBJECTS

       NEVER ALTER CHILD METADATA.
    ======================================================== */

    items.forEach((item) => {
      if (!item) {
        return;
      }

      group.items.push(item);

      /* ======================================================
         STATUS
      ====================================================== */

      if (
        item?.reported_at ||
        item?.reportedAt
      ) {
        group.reported_at =
          item?.reported_at ??
          item?.reportedAt;
      }

      if (item?.authorization_status) {
        group.authorization_status =
          item.authorization_status;
      }

      if (item?.authorized_by) {
        group.authorized_by =
          item.authorized_by;
      }

      if (item?.authorized_at) {
        group.authorized_at =
          item.authorized_at;
      }

      if (item?.release_status) {
        group.release_status =
          item.release_status;
      }

      if (item?.released_by) {
        group.released_by =
          item.released_by;
      }

      if (item?.released_at) {
        group.released_at =
          item.released_at;
      }

      if (item?.verification_id) {
        group.verification_id =
          item.verification_id;
      }

      /* ======================================================
         COUNTERS
      ====================================================== */

      group.print_count +=
        Number(item?.print_count || 0);

      group.download_count +=
        Number(item?.download_count || 0);
    });

    /* ========================================================
       SORT CHILDREN
    ======================================================== */

    group.items.sort(
      (a, b) =>
        getDisplayOrder(a) -
        getDisplayOrder(b)
    );

    return group;
  };

  /* ==========================================================
     GROUP MAP
  ========================================================== */

  const groups = new Map();

  /* ==========================================================
     PROCESS DATABASE RESULTS
  ========================================================== */

  records.forEach((item) => {
    if (!item) {
      return;
    }

    const labNumber =
      getLabNumber(item);

    /* ========================================================
       EXPLICIT PANEL

       Only actual panel identity can reach here.
    ======================================================== */

    const panel =
      resolveExplicitPanelIdentity(item);

    if (panel) {
      const key =
        getPanelGroupKey(
          labNumber,
          panel
        );

      if (!groups.has(key)) {
        groups.set(key, {
          type: "panel",
          panel,
          items: [],
        });
      }

      groups
        .get(key)
        .items
        .push(item);

      return;
    }

    /* ========================================================
       SINGLE TEST
       
       Every independent test receives its own group.
    ======================================================== */

    const key =
      getSingleGroupKey(item);

    if (!groups.has(key)) {
      groups.set(key, {
        type: "single",
        panel: null,
        items: [],
      });
    }

    groups
      .get(key)
      .items
      .push(item);
  });

  /* ==========================================================
     BUILD FINAL REPORTS
  ========================================================== */

  const groupedResults = [];

  groups.forEach((entry) => {
    if (
      !entry ||
      !Array.isArray(entry.items) ||
      entry.items.length === 0
    ) {
      return;
    }

    groupedResults.push(
      createGroup(
        entry.items,
        entry.panel
      )
    );
  });

  /* ==========================================================
     FINAL CLEANUP
  ========================================================== */

  groupedResults.forEach((group) => {
    if (!group) {
      return;
    }

    if (!Array.isArray(group.items)) {
      group.items = [];
    }

    /* --------------------------------------------------------
       Department
       -------------------------------------------------------- */

    if (!group.department) {
      const department =
        findFirstValueInItems(
          group.items,
          getDepartment
        );

      if (department) {
        group.department =
          department;
      }
    }

    /* --------------------------------------------------------
       Template
       -------------------------------------------------------- */

    if (!group.template_type) {
      const template =
        findFirstValueInItems(
          group.items,
          getTemplateType
        );

      if (template) {
        group.template_type =
          template;

        group.templateType =
          template;

        group.normalized_template_type =
          normalize(template);
      }
    }

    /* --------------------------------------------------------
       Report Name
       -------------------------------------------------------- */

    if (!group.test_name) {
      const name =
        findFirstValueInItems(
          group.items,
          getTestName
        );

      if (name) {
        group.test_name = name;
        group.testName = name;
      }
    }

    /* --------------------------------------------------------
       SINGLE REPORTS MUST NOT HAVE PANEL METADATA
       -------------------------------------------------------- */

    if (!group.is_panel) {
      group.panel_name = null;
      group.panelName = null;
      group.panel_id = null;
      group.panelId = null;
    }
  });

  /* ==========================================================
     SORT CHILDREN
  ========================================================== */

  groupedResults.forEach((group) => {
    group.items.sort(
      (a, b) =>
        getDisplayOrder(a) -
        getDisplayOrder(b)
    );
  });

  /* ==========================================================
     SORT REPORTS

     Most recently reported first.
  ========================================================== */

  groupedResults.sort((a, b) => {
    const dateA =
      new Date(
        a?.reported_at || 0
      ).getTime();

    const dateB =
      new Date(
        b?.reported_at || 0
      ).getTime();

    return dateB - dateA;
  });

  /* ==========================================================
     DEBUG
  ========================================================== */

  console.log(
    "[groupResultRecords] FINAL GROUPED REPORTS:",
    groupedResults.map((group) => ({
      REPORT_ID:
        group?.id,

      LAB_NUMBER:
        group?.lab_number,

      REPORT_NAME:
        group?.test_name,

      TEST_TYPE:
        group?.test_type,

      PANEL_NAME:
        group?.panel_name,

      PANEL_ID:
        group?.panel_id,

      IS_PANEL:
        group?.is_panel,

      DEPARTMENT:
        group?.department,

      TEMPLATE:
        group?.template_type,

      ITEM_COUNT:
        group?.items?.length || 0,

      ITEMS:
        group?.items?.map((item) => ({
          id:
            item?.id,

          master_test_id:
            item?.master_test_id ??
            item?.masterTestId,

          test_name:
            item?.test_name ??
            item?.testName,

          test_type:
            item?.test_type ??
            item?.testType,

          panel_name:
            item?.panel_name ??
            item?.panelName,

          panel_id:
            item?.panel_id ??
            item?.panelId,

          is_panel:
            item?.is_panel ??
            item?.isPanel,

          department:
            item?.department,

          template_type:
            item?.template_type ??
            item?.templateType,

          display_order:
            item?.display_order ??
            item?.displayOrder,
        })),
    }))
  );

  return groupedResults;
}