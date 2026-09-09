import {
  Loader2,
  Search,
  X,
} from "lucide-react";

/* ==========================================================
   SEARCH PANEL
   ----------------------------------------------------------
   Responsibilities:
   - Accept patient Lab Number
   - Trigger patient search
   - Show loading state
   - Allow clearing the search field
   - NO Supabase calls
   - NO patient loading logic
   - NO result logic
========================================================== */

export default function SearchPanel({
  labNumber = "",
  setLabNumber,
  onSearch,
  loading = false,
}) {
  /* ========================================================
     INPUT CHANGE
  ======================================================== */

  const handleChange = (event) => {
    if (
      typeof setLabNumber !== "function"
    ) {
      return;
    }

    setLabNumber(
      event.target.value
    );
  };

  /* ========================================================
     CLEAR
  ======================================================== */

  const handleClear = () => {
    if (
      loading ||
      typeof setLabNumber !== "function"
    ) {
      return;
    }

    setLabNumber("");
  };

  /* ========================================================
     SEARCH
  ======================================================== */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    if (
      typeof onSearch !== "function"
    ) {
      return;
    }

    await onSearch();
  };

  /* ========================================================
     RENDER
  ======================================================== */

  return (
    <section className="dashboard-card result-search-card">

      <div className="result-search-header">

        <div>
          <h2>
            Find Patient
          </h2>

          <p>
            Enter the patient's Lab Number
            to load registered laboratory tests.
          </p>
        </div>

      </div>

      <form
        className="result-search-form"
        onSubmit={handleSubmit}
      >

        <div className="result-search-input-wrapper">

          <Search
            className="result-search-input-icon"
            size={20}
          />

          <input
            type="text"
            value={labNumber}
            onChange={handleChange}
            placeholder="Enter Lab Number"
            autoComplete="off"
            disabled={loading}
            aria-label="Patient Lab Number"
          />

          {labNumber.trim() &&
            !loading && (
              <button
                type="button"
                className="result-search-clear"
                onClick={handleClear}
                aria-label="Clear Lab Number"
                title="Clear"
              >
                <X size={18} />
              </button>
            )}

        </div>

        <button
          type="submit"
          className="result-search-button"
          disabled={
            loading ||
            !labNumber.trim()
          }
        >

          {loading ? (
            <>
              <Loader2
                size={19}
                className="result-search-spinner"
              />

              <span>
                Searching...
              </span>
            </>
          ) : (
            <>
              <Search
                size={19}
              />

              <span>
                Search Patient
              </span>
            </>
          )}

        </button>

      </form>

      <div className="result-search-hint">
        Search using the exact Lab Number
        assigned during patient registration.
      </div>

    </section>
  );
}