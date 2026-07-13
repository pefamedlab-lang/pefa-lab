import { useMemo, useState } from "react";
import investigations from "../../config/investigations";

import "./InvestigationSelector.css";

export default function InvestigationSelector({
  selectedTests = [],
  setSelectedTests,
}) {

  const [search, setSearch] = useState("");

  const toggleTest = (test) => {

    const exists = selectedTests.some(
      (item) => item.code === test.code
    );

    if (exists) {

      setSelectedTests(
        selectedTests.filter(
          (item) => item.code !== test.code
        )
      );

    } else {

      setSelectedTests([
        ...selectedTests,
        test,
      ]);

    }

  };

  const filteredInvestigations = useMemo(() => {

    const keyword = search.toLowerCase();

    const output = {};

    Object.entries(investigations).forEach(

      ([category, tests]) => {

        const filtered = tests.filter((test) =>

          test.name
            .toLowerCase()
            .includes(keyword) ||

          test.code
            .toLowerCase()
            .includes(keyword)

        );

        if (filtered.length) {

          output[category] = filtered;

        }

      }

    );

    return output;

  }, [search]);

  const formatHeading = (text) =>

    text

      .replace(/([A-Z])/g, " $1")

      .replace(/^./, (letter) => letter.toUpperCase());

  return (

    <section className="referral-section">

      <div className="section-header">

        Requested Investigations

      </div>

      {/* =======================================
          SEARCH
      ======================================== */}

      <div className="investigation-search">

        <input

          type="text"

          placeholder="Search investigation..."

          value={search}

          onChange={(e) =>
            setSearch(e.target.value)
          }

        />

      </div>

      {/* =======================================
          CATEGORIES
      ======================================== */}

      {Object.entries(filteredInvestigations).map(

        ([category, tests]) => (

          <div
            key={category}
            className="investigation-category"
          >

            <h3>

              {formatHeading(category)}

            </h3>

            <div className="investigation-grid">

              {tests.map((test) => {

                const checked =
                  selectedTests.some(
                    (item) =>
                      item.code === test.code
                  );

                return (

                  <label
                    key={test.code}
                    className="investigation-item"
                  >

                    <input

                      type="checkbox"

                      checked={checked}

                      onChange={() =>
                        toggleTest(test)
                      }

                    />

                    <span>

                      {test.name}

                    </span>

                  </label>

                );

              })}

            </div>

          </div>

        )

      )}

      {/* =======================================
          SELECTED TESTS
      ======================================== */}

      <div className="selected-tests">

        <div className="selected-header">

          Selected Investigations

        </div>

        {

          selectedTests.length === 0 ? (

            <p>

              No investigation selected.

            </p>

          ) : (

            <ul>

              {

                selectedTests.map((test) => (

                  <li key={test.code}>

                    {test.name}

                  </li>

                ))

              }

            </ul>

          )

        }

      </div>

    </section>

  );

}