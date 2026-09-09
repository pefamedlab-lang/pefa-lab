/* ==========================================================
   PEFA LAB
   TEST UTILS
   ----------------------------------------------------------
   FILE:
      src/services/test/testUtils.js

   PURPOSE
   ----------------------------------------------------------
   Shared LOW-LEVEL utilities for the test-service architecture.

   IMPORTANT ARCHITECTURAL RULES
   ----------------------------------------------------------
   1. NO Supabase access.
   2. NO React.
   3. NO panel inference.
   4. NO child -> panel promotion.
   5. NO database resolution.
   6. NO result grouping.
   7. NO business-specific test resolution.

   This file contains GENERIC utilities only.

   Higher-level responsibilities belong in:

      testNormalization.js
      testIdentity.js
      masterTestService.js
      panelParameterService.js
      registeredTestNormalizer.js
      registeredTestEnrichment.js
      testService.js

   ----------------------------------------------------------
   COMPATIBILITY API
   ----------------------------------------------------------

   Older code may request:

      isNumericId
      toNumericId
      safeArray
      safeObject

   These are provided here as compatibility helpers.

   IMPORTANT:

      isNumericId()
      toNumericId()

   only deal with numeric ID syntax/value conversion.

   They DO NOT determine:

      - panel identity
      - child identity
      - master test identity
      - registered test identity

   ========================================================== */


/* ==========================================================
   SAFE OBJECT
   ========================================================== */

export function asObject(value) {

    if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
    ) {
        return value;
    }

    return {};
}


/* ==========================================================
   SAFE OBJECT — COMPATIBILITY ALIAS
   ----------------------------------------------------------
   Older services may use:

      safeObject()

   while newer code uses:

      asObject()

   Both intentionally have identical behavior.
   ========================================================== */

export const safeObject = asObject;


/* ==========================================================
   SAFE ARRAY
   ========================================================== */

export function asArray(value) {

    return Array.isArray(value)
        ? value
        : [];
}


/* ==========================================================
   SAFE ARRAY — COMPATIBILITY ALIAS
   ----------------------------------------------------------
   Older services may use:

      safeArray()

   while newer code uses:

      asArray()
   ========================================================== */

export const safeArray = asArray;


/* ==========================================================
   SAFE STRING
   ========================================================== */

export function asString(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value).trim();
}


/* ==========================================================
   NORMALIZE WHITESPACE
   ========================================================== */

export function normalizeWhitespace(value) {

    return asString(value)
        .replace(/\s+/g, " ")
        .trim();
}


/* ==========================================================
   NORMALIZE TEXT
   ----------------------------------------------------------
   Generic text normalization only.

   This function does NOT determine whether something is:

      - a panel
      - a child
      - a master test
      - a registered test

   Those decisions belong elsewhere.
   ========================================================== */

export function normalizeText(value) {

    return normalizeWhitespace(value)
        .toLowerCase();
}


/* ==========================================================
   NORMALIZE COMPARISON TEXT
   ----------------------------------------------------------
   Used for safe generic name comparison.

   Examples:

      "Liver Function Test"

      " liver   function   test "

   become equivalent.

   Punctuation is intentionally preserved because test names
   can contain clinically meaningful symbols.
   ========================================================== */

export function normalizeComparisonText(value) {

    return normalizeText(value);
}


/* ==========================================================
   NORMALIZE CODE
   ========================================================== */

export function normalizeCode(value) {

    return normalizeWhitespace(value)
        .toUpperCase();
}


/* ==========================================================
   NORMALIZE ID
   ----------------------------------------------------------
   Converts an ID to a trimmed string representation.

   Examples:

      98      -> "98"
      "98"    -> "98"
      null    -> null
      ""      -> null
      " ABC " -> "ABC"

   IMPORTANT:

   normalizeId() does NOT require the ID to be numeric.

   That allows this utility to remain generic.
   ========================================================== */

export function normalizeId(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    const text =
        String(value).trim();

    return text
        ? text
        : null;
}


/* ==========================================================
   IS NUMERIC ID
   ----------------------------------------------------------
   Determines whether a value represents a valid integer ID.

   Accepted:

      0
      1
      98
      "0"
      "1"
      "98"

   Rejected:

      null
      undefined
      ""
      "ABC"
      "12ABC"
      "12.5"
      12.5
      NaN
      Infinity

   IMPORTANT:

   This is a GENERIC numeric validation helper.

   It does NOT determine what the ID represents.
   ========================================================== */

export function isNumericId(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return false;
    }


    /* ------------------------------------------------------
       Numeric values
       ------------------------------------------------------ */

    if (
        typeof value === "number"
    ) {
        return (
            Number.isSafeInteger(value) &&
            value >= 0
        );
    }


    /* ------------------------------------------------------
       String values
       ------------------------------------------------------ */

    if (
        typeof value === "string"
    ) {
        const text =
            value.trim();

        if (!text) {
            return false;
        }

        return /^\d+$/.test(text);
    }


    return false;
}


/* ==========================================================
   TO NUMERIC ID
   ----------------------------------------------------------
   Converts a valid numeric ID into a JavaScript number.

   Examples:

      98       -> 98
      "98"     -> 98
      " 98 "   -> 98
      null     -> null
      "ABC"    -> null
      "12.5"   -> null

   This intentionally accepts INTEGER IDs only.
   ========================================================== */

export function toNumericId(value) {

    if (
        !isNumericId(value)
    ) {
        return null;
    }

    const numeric =
        typeof value === "number"
            ? value
            : Number(
                String(value).trim()
            );

    if (
        !Number.isSafeInteger(numeric) ||
        numeric < 0
    ) {
        return null;
    }

    return numeric;
}


/* ==========================================================
   HAS VALUE
   ========================================================== */

export function hasValue(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return false;
    }


    if (
        typeof value === "string"
    ) {
        return value.trim() !== "";
    }


    return true;
}


/* ==========================================================
   FIRST NON-EMPTY VALUE
   ----------------------------------------------------------
   Returns the first meaningful value.

   This is only a generic value-selection helper.

   It does NOT apply clinical/business priority rules.
   ========================================================== */

export function firstValue(...values) {

    for (
        const value
        of values
    ) {

        if (
            hasValue(value)
        ) {
            return value;
        }
    }


    return null;
}


/* ==========================================================
   FIRST NON-EMPTY STRING
   ========================================================== */

export function firstString(...values) {

    for (
        const value
        of values
    ) {

        const text =
            asString(value);

        if (text) {
            return text;
        }
    }


    return "";
}


/* ==========================================================
   FIRST NON-NULL ID
   ----------------------------------------------------------
   Uses normalizeId(), therefore this remains a GENERIC ID
   selector and does not require numeric IDs.
   ========================================================== */

export function firstId(...values) {

    for (
        const value
        of values
    ) {

        const id =
            normalizeId(value);

        if (
            id !== null
        ) {
            return id;
        }
    }


    return null;
}


/* ==========================================================
   FIRST NUMERIC ID
   ----------------------------------------------------------
   Compatibility/helper variant for code that specifically
   needs a numeric identifier.
   ========================================================== */

export function firstNumericId(...values) {

    for (
        const value
        of values
    ) {

        const id =
            toNumericId(value);

        if (
            id !== null
        ) {
            return id;
        }
    }


    return null;
}


/* ==========================================================
   BOOLEAN NORMALIZATION
   ----------------------------------------------------------
   Handles common database/UI representations:

      true
      false
      "true"
      "false"
      "TRUE"
      "FALSE"
      1
      0
      "yes"
      "no"
      "active"
      "inactive"
      "enabled"
      "disabled"
   ========================================================== */

export function toBoolean(
    value,
    fallback = false
) {

    if (
        typeof value === "boolean"
    ) {
        return value;
    }


    if (
        typeof value === "number"
    ) {

        if (value === 1) {
            return true;
        }

        if (value === 0) {
            return false;
        }
    }


    if (
        typeof value === "string"
    ) {

        const normalized =
            value
                .trim()
                .toLowerCase();


        if (
            [
                "true",
                "1",
                "yes",
                "y",
                "active",
                "enabled",
            ].includes(normalized)
        ) {
            return true;
        }


        if (
            [
                "false",
                "0",
                "no",
                "n",
                "inactive",
                "disabled",
            ].includes(normalized)
        ) {
            return false;
        }
    }


    return fallback;
}


/* ==========================================================
   NUMBER NORMALIZATION
   ----------------------------------------------------------
   Generic numeric conversion.

   Unlike toNumericId():

      toNumber("12.5") -> 12.5

   This is appropriate for general numeric values.
   ========================================================== */

export function toNumber(
    value,
    fallback = null
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return fallback;
    }


    const number =
        Number(value);


    return Number.isFinite(number)
        ? number
        : fallback;
}


/* ==========================================================
   INTEGER NORMALIZATION
   ========================================================== */

export function toInteger(
    value,
    fallback = null
) {

    const number =
        toNumber(
            value,
            fallback
        );


    if (
        number === fallback
    ) {
        return fallback;
    }


    return Number.isInteger(number)
        ? number
        : Math.trunc(number);
}


/* ==========================================================
   ARRAY UNIQUE
   ----------------------------------------------------------
   Generic primitive/value uniqueness helper.

   Does not perform test-specific identity resolution.
   ========================================================== */

export function uniqueArray(
    values = []
) {

    if (
        !Array.isArray(values)
    ) {
        return [];
    }


    return [
        ...new Set(values),
    ];
}


/* ==========================================================
   UNIQUE BY KEY
   ----------------------------------------------------------
   Generic object deduplication helper.
   ========================================================== */

export function uniqueByKey(
    items = [],
    getKey
) {

    if (
        !Array.isArray(items)
    ) {
        return [];
    }


    if (
        typeof getKey !== "function"
    ) {
        return [
            ...items,
        ];
    }


    const seen =
        new Set();

    const result =
        [];


    for (
        const item
        of items
    ) {

        const key =
            getKey(item);


        if (
            seen.has(key)
        ) {
            continue;
        }


        seen.add(key);

        result.push(item);
    }


    return result;
}


/* ==========================================================
   SORT BY DISPLAY ORDER
   ----------------------------------------------------------
   Generic ordering helper.

   Missing display order goes to the end.
   ========================================================== */

export function sortByDisplayOrder(
    items = []
) {

    if (
        !Array.isArray(items)
    ) {
        return [];
    }


    return [
        ...items,
    ].sort(
        (a, b) => {

            const aOrder =
                toNumber(
                    a?.display_order ??
                    a?.displayOrder,
                    Number.MAX_SAFE_INTEGER
                );


            const bOrder =
                toNumber(
                    b?.display_order ??
                    b?.displayOrder,
                    Number.MAX_SAFE_INTEGER
                );


            return (
                aOrder -
                bOrder
            );
        }
    );
}


/* ==========================================================
   SAFE PROPERTY GETTER
   ----------------------------------------------------------
   Example:

      getFirstProperty(
          test,
          "master_test_id",
          "masterTestId",
          "test_id"
      )
   ========================================================== */

export function getFirstProperty(
    object,
    ...keys
) {

    const source =
        asObject(object);


    for (
        const key
        of keys
    ) {

        if (
            Object.prototype.hasOwnProperty.call(
                source,
                key
            )
        ) {

            const value =
                source[key];


            if (
                hasValue(value)
            ) {
                return value;
            }
        }
    }


    return null;
}


/* ==========================================================
   GET FIRST STRING PROPERTY
   ========================================================== */

export function getFirstStringProperty(
    object,
    ...keys
) {

    const source =
        asObject(object);


    for (
        const key
        of keys
    ) {

        const value =
            asString(
                source[key]
            );


        if (value) {
            return value;
        }
    }


    return "";
}


/* ==========================================================
   GET FIRST ID PROPERTY
   ----------------------------------------------------------
   Generic ID getter.

   Returns normalized string IDs.

   Example:

      "123" -> "123"
      123   -> "123"
   ========================================================== */

export function getFirstIdProperty(
    object,
    ...keys
) {

    const source =
        asObject(object);


    for (
        const key
        of keys
    ) {

        const id =
            normalizeId(
                source[key]
            );


        if (
            id !== null
        ) {
            return id;
        }
    }


    return null;
}


/* ==========================================================
   GET FIRST NUMERIC ID PROPERTY
   ----------------------------------------------------------
   Numeric-only compatibility/helper variant.
   ========================================================== */

export function getFirstNumericIdProperty(
    object,
    ...keys
) {

    const source =
        asObject(object);


    for (
        const key
        of keys
    ) {

        const id =
            toNumericId(
                source[key]
            );


        if (
            id !== null
        ) {
            return id;
        }
    }


    return null;
}


/* ==========================================================
   CLONE ARRAY
   ========================================================== */

export function cloneArray(value) {

    return Array.isArray(value)
        ? [
            ...value,
        ]
        : [];
}


/* ==========================================================
   CLONE OBJECT
   ----------------------------------------------------------
   Shallow clone only.
   ========================================================== */

export function cloneObject(value) {

    if (
        !value ||
        typeof value !== "object" ||
        Array.isArray(value)
    ) {
        return {};
    }


    return {
        ...value,
    };
}


/* ==========================================================
   DEBUG LABEL
   ----------------------------------------------------------
   Small helper for consistent service logging.
   ========================================================== */

export function debugLabel(
    label,
    value
) {

    return {

        label:
            asString(label),

        value,
    };
}


/* ==========================================================
   NO-OP ASYNC
   ----------------------------------------------------------
   Safe generic fallback.

   No business logic.
   ========================================================== */

export async function resolveEmpty() {

    return null;
}


/* ==========================================================
   DEFAULT EXPORT
   ========================================================== */

const testUtils = {

    /* --------------------------------------------------------
       SAFE VALUES
       -------------------------------------------------------- */

    asObject,
    safeObject,

    asArray,
    safeArray,

    asString,


    /* --------------------------------------------------------
       TEXT
       -------------------------------------------------------- */

    normalizeWhitespace,
    normalizeText,
    normalizeComparisonText,
    normalizeCode,


    /* --------------------------------------------------------
       IDs
       -------------------------------------------------------- */

    normalizeId,

    isNumericId,
    toNumericId,

    firstId,
    firstNumericId,

    getFirstIdProperty,
    getFirstNumericIdProperty,


    /* --------------------------------------------------------
       GENERIC VALUE HELPERS
       -------------------------------------------------------- */

    hasValue,
    firstValue,
    firstString,


    /* --------------------------------------------------------
       TYPE CONVERSION
       -------------------------------------------------------- */

    toBoolean,
    toNumber,
    toInteger,


    /* --------------------------------------------------------
       COLLECTION HELPERS
       -------------------------------------------------------- */

    uniqueArray,
    uniqueByKey,
    sortByDisplayOrder,


    /* --------------------------------------------------------
       PROPERTY HELPERS
       -------------------------------------------------------- */

    getFirstProperty,
    getFirstStringProperty,


    /* --------------------------------------------------------
       CLONING
       -------------------------------------------------------- */

    cloneArray,
    cloneObject,


    /* --------------------------------------------------------
       DEBUG / FALLBACK
       -------------------------------------------------------- */

    debugLabel,
    resolveEmpty,
};


/* ==========================================================
   DEFAULT EXPORT
   ========================================================== */

export default testUtils;