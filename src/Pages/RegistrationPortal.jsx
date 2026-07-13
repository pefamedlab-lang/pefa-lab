import "../styles/registrationPortal.css";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Search,
  UserPlus,
  FlaskConical,
  Phone,
  Calendar,
  User,
  MapPin,
  ClipboardList,
} from "lucide-react";

import {
  supabase,
} from "../supabase";

import {
  logActivity,
} from "../utils/logActivity";

export default function RegistrationPortal() {

  /* =====================================================
     NAVIGATION
  ===================================================== */

  const navigate =
    useNavigate();

  /* =====================================================
     STATES
  ===================================================== */

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    referrals,
    setReferrals,
  ] = useState([]);

  const [
    masterTests,
    setMasterTests,
  ] = useState([]);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    selectedTests,
    setSelectedTests,
  ] = useState([]);

  const [form, setForm] =
useState({

  full_name: "",

  sex: "",

  age: "",

  dob: "",

  phone: "",

  address: "",

  branch: "",

  referral_id: "",

  referral_name: "",

  referring_doctor: "",

  clinical_history: "",

  payment_type: "Patient",

});

  /* =====================================================
     LOAD DATA
  ===================================================== */

 useEffect(() => {

  loadTests();

  loadReferrals();

}, []);

useEffect(() => {

  if (referrals.length > 0) {

    const privateReferral =
      referrals.find(
        (r) => r.name === "Private"
      );

    if (privateReferral) {

      setForm((prev) => ({
        ...prev,
        referral_id:
          privateReferral.id,
        referral_name:
          privateReferral.name,
      }));

    }

  }

}, [referrals]);
  
  /* =====================================================
     LOAD TESTS
  ===================================================== */

  const loadTests =
    async () => {

      try {

        const {
          data,
          error,
        } = await supabase

          .from(
            "master_tests"
          )

          .select(`
            id,
            department,
            panel_name,
            test_name,
            test_type,
            panel_price,
            single_test_price,
            active_status
          `)

          .eq(
            "active_status",
            "Active"
          )

          .order(
            "test_name",
            {
              ascending:true,
            }
          );

        if (error) {

          console.log(
            error
          );

          return;
        }

        setMasterTests(
          data || []
        );

      } catch (error) {

        console.log(
          error
        );
      }
    };

const loadReferrals = async () => {

  try {

    const {
      data,
      error,
    } = await supabase
      .from("referrals")
      .select("*")
      .order("name");

    console.log(
      "Referrals Loaded:",
      data
    );

    if (error) {
      console.log(error);
      return;
    }

    setReferrals(data || []);

  } catch (error) {

    console.log(error);

  }
};

  /* =====================================================
     AUTO AGE
  ===================================================== */

  useEffect(() => {

    if (!form.dob)
      return;

    const birthDate =
      new Date(
        form.dob
      );

    const today =
      new Date();

    let age =
      today.getFullYear() -

      birthDate.getFullYear();

    const month =
      today.getMonth() -

      birthDate.getMonth();

    if (

      month < 0 ||

      (
        month === 0 &&

        today.getDate() <
        birthDate.getDate()
      )

    ) {

      age--;
    }

    setForm((prev) => ({

      ...prev,

      age:
        age > 0
          ? age
          : "",
    }));

  }, [
    form.dob,
  ]);

  /* =====================================================
     HANDLE CHANGE
  ===================================================== */

  const handleChange =
    (e) => {

      setForm({

        ...form,

        [e.target.name]:
          e.target.value,
      });
    };

  /* =====================================================
     FILTER TESTS
  ===================================================== */

  const filteredTests =
    useMemo(() => {

      return masterTests.filter(
        (test) =>

          test.test_name
            ?.toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            ) ||

          test.panel_name
            ?.toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            )
      );

    }, [
      masterTests,
      searchTerm,
    ]);

  /* =====================================================
     GET TEST PRICE
  ===================================================== */

  const getTestPrice =
    (test) => {

      return Number(

        test.test_type ===
        "Panel"

          ? test.panel_price || 0

          : test.single_test_price || 0
      );
    };

  /* =====================================================
     SELECT TEST
  ===================================================== */

  const selectTest =
    (test) => {

      const exists =
        selectedTests.find(
          (item) =>
            item.id ===
            test.id
        );

      if (exists)
        return;

      setSelectedTests([

        ...selectedTests,

        {
          ...test,

          selected_price:
            getTestPrice(
              test
            ),
        },
      ]);

      setSearchTerm("");
    };

  /* =====================================================
     REMOVE TEST
  ===================================================== */

  const removeTest =
    (id) => {

      setSelectedTests(

        selectedTests.filter(
          (item) =>
            item.id !== id
        )
      );
    };

  /* =====================================================
     TOTAL
  ===================================================== */

  const totalAmount =
    selectedTests.reduce(

      (
        acc,
        item
      ) =>

        acc +

        Number(
          item.selected_price || 0
        ),

      0
    );

  /* =====================================================
     GENERATE LAB NUMBER
  ===================================================== */

  const generateLabNumber =
    async () => {

      const year =
        new Date()
          .getFullYear()
          .toString()
          .slice(-2);

      const {
        count,
      } = await supabase

        .from(
          "registrations"
        )

        .select(
          "*",
          {
            count:"exact",
            head:true,
          }
        );

      const serial =
        String(
          (count || 0) + 1
        ).padStart(
          3,
          "0"
        );

      return `PMDS/${year}/${serial}`;
    };

  /* =====================================================
     ACCESS CODE
  ===================================================== */

  const generateAccessCode =
    () => {

      const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZ123456789";

      let code =
        "PEFA-";

      for (
        let i = 0;
        i < 4;
        i++
      ) {

        code +=
          chars.charAt(

            Math.floor(
              Math.random() *
              chars.length
            )
          );
      }

      return code;
    };

  /* =====================================================
     REGISTER
  ===================================================== */

  const handleRegistration =
    async (
      e
    ) => {

      e.preventDefault();

      try {

        setLoading(true);

        if (
          selectedTests.length === 0
        ) {

          alert(
            "Select at least one test"
          );

          return;
        }

        const labNumber =
          await generateLabNumber();

        const accessCode =
          generateAccessCode();

console.log(
  "SELECTED REFERRAL:",
  form.referral_name
);

        const payload = {

          ...form,

          lab_number:
            labNumber,

          access_code:
            accessCode,

          tests:
            selectedTests,

          total_amount:
            totalAmount,

          payment_status:
            "Pending",
        };

const {
  error,
} = await supabase

  .from(
    "registrations"
  )

  .insert([
    payload,
  ]);

if (error) {

  console.log(error);

  alert(error.message);

  return;
}

/* =====================================
   CREATE REFERRAL INVOICE
===================================== */

if (
  form.referral_name
) {

  await supabase

    .from(
      "referral_invoices"
    )

    .insert([{

      referral_name:
        form.referral_name,

      patient_name:
        form.full_name,

      lab_number:
        labNumber,

      tests:
        selectedTests

          .map(
            test =>
              test.test_name
          )

          .join(", "),

      total_amount:
        totalAmount,

      discount_amount: 0,

      final_amount:
        totalAmount,

      amount_paid: 0,

      balance:
        totalAmount,

      payment_status:
        "Outstanding",

      payment_plan:
        "Monthly",

      invoice_period:
        new Date()
          .toISOString()
          .split("T")[0],

      generated_by:
        "System",

    }]);

}

/* ===================================
   CONTINUE EXISTING CODE
=================================== */

alert(
  "Registration Successful"
);
        if (error) {

          console.log(
            error
          );

          alert(
            error.message
          );

          return;
        }

/* =====================================================
   SAVE LOCAL REGISTRATION
===================================================== */

const storedPatients =

  JSON.parse(
    localStorage.getItem(
      "pefa_registrations"
    )
  ) || [];

storedPatients.push({

  full_name:
    form.full_name,

  gender:
    form.sex,

  age:
    form.age,

  dob:
    form.dob,

  phone:
    form.phone,

  address:
    form.address,

  branch:
    form.branch,

  referral_name:
   form.referral_name,

  referring_doctor:
    form.referring_doctor,

  clinical_history:
    form.clinical_history,

  lab_number:
    labNumber,

  access_code:
    accessCode,

  tests:
    selectedTests,

});

localStorage.setItem(

  "pefa_registrations",

  JSON.stringify(
    storedPatients
  )
);

        await logActivity({

          action:
            "Registered Patient",

          module:
            "Registration",

          patientName:
            form.full_name,

          labNumber:
            labNumber,
        });

        alert(
          "Registration Successful"
        );

localStorage.setItem(
  "current_invoice",
  JSON.stringify(
    payload
  )
);

       localStorage.setItem(
  "current_invoice",
  JSON.stringify(
    payload
  )
);

navigate(
  "/payment-portal"
);

      } catch (error) {

        console.log(
          error
        );

      } finally {

        setLoading(false);
      }
    };

  return (

    <div className="dashboard-layout">

      <div className="dashboard-content">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="registration-header">

          <div>

            <h1>
              Registration Portal
            </h1>

            <p>
              Enterprise Laboratory Registration System
            </p>

          </div>

        </div>

        {/* =====================================================
            FORM
        ===================================================== */}

        <form
          onSubmit={
            handleRegistration
          }
        >

          {/* =====================================================
              PATIENT INFORMATION
          ===================================================== */}

          <div className="registration-card">

            <div className="section-title">

              <UserPlus
                size={20}
              />

              <h2>
                Patient Information
              </h2>

            </div>

            <div className="registration-grid">

              <div className="form-group">

                <label>
                  Full Name
                </label>

                <div className="input-box">

                  <User
                    size={18}
                  />

                  <input
                    type="text"
                    name="full_name"
                    value={
                      form.full_name
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

              </div>

              <div className="form-group">

                <label>
                  Sex
                </label>

                <select
                  name="sex"
                  value={
                    form.sex
                  }
                  onChange={
                    handleChange
                  }
                  required
                >

                  <option value="">
                    Select
                  </option>

                  <option>
                    Male
                  </option>

                  <option>
                    Female
                  </option>

                </select>

              </div>

              <div className="form-group">

                <label>
                  Date of Birth
                </label>

                <div className="input-box">

                  <Calendar
                    size={18}
                  />

                  <input
                    type="date"
                    name="dob"
                    value={
                      form.dob
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>

              </div>

              <div className="form-group">

                <label>
                  Age
                </label>

                <input
                  type="text"
                  value={
                    form.age
                  }
                  readOnly
                />

              </div>

              <div className="form-group">

                <label>
                  Phone
                </label>

                <div className="input-box">

                  <Phone
                    size={18}
                  />

                  <input
                    type="text"
                    name="phone"
                    value={
                      form.phone
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

              </div>

              <div className="form-group">

                <label>
                  Branch
                </label>

                <select
                  name="branch"
                  value={
                    form.branch
                  }
                  onChange={
                    handleChange
                  }
                  required
                >

                  <option value="">
                    Select Branch
                  </option>

                  <option>
                    Pakuro
                  </option>

                  <option>
                    Mowe
                  </option>

                  <option>
                    Orimerunmu
                  </option>

                  <option>
                    Private
                  </option>

                </select>

              </div>

              <div className="form-group">

                <label>
                  Hospital / Clinic
                </label>

<select
  name="referral_name"
  value={form.referral_name}
 onChange={(e) => {

  if (!e.target.value) {

    setForm({
      ...form,
      referral_id: "",
      referral_name: "",
    });

    return;
  }

  const referral =
    JSON.parse(
      e.target.value
    );

  setForm({
    ...form,
    referral_id:
      referral.id,
    referral_name:
      referral.name,
  });
}}
>

<option value="">
  Select Referral
</option>

{referrals.map((item) => (
  <option
    key={item.id}
    value={JSON.stringify({
      id: item.id,
      name: item.name,
    })}
  >
    {item.name}
  </option>
))}

</select>

<p>
  Selected:
  {form.referral_name}
</p>

              </div>

              <div className="form-group">

                <label>
                  Referring Doctor
                </label>

                <input
                  type="text"
                  name="referring_doctor"
                  value={
                    form.referring_doctor
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

              <div className="form-group">

                <label>
                  Payment Type
                </label>

                <select
                  name="payment_type"
                  value={
                    form.payment_type
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option>
                    Patient
                  </option>

                  <option>
                    Referral
                  </option>

                  <option>
                    HMO
                  </option>

                </select>

              </div>

            </div>

            {/* ADDRESS */}

            <div className="form-group full-width">

              <label>
                Address
              </label>

              <div className="input-box">

                <MapPin
                  size={18}
                />

                <input
                  type="text"
                  name="address"
                  value={
                    form.address
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

            </div>

            {/* CLINICAL HISTORY */}

            <div className="form-group full-width">

              <label>
                Clinical History
              </label>

              <textarea
                rows="4"
                name="clinical_history"
                value={
                  form.clinical_history
                }
                onChange={
                  handleChange
                }
              />

            </div>

          </div>

          {/* =====================================================
              TEST SELECTION
          ===================================================== */}

          <div className="registration-card">

            <div className="section-title">

              <FlaskConical
                size={20}
              />

              <h2>
                Test Selection
              </h2>

            </div>

            {/* SEARCH */}

            <div className="test-search">

              <Search
                size={18}
              />

              <input
                type="text"
                placeholder="Search CBC, LFT, EUCR..."
                value={
                  searchTerm
                }
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
              />

            </div>

            {/* SEARCH RESULTS */}

            {
              searchTerm ? (

                filteredTests.length > 0 ? (

                  <div className="test-grid">

                    {
                      filteredTests.map(
                        (test) => (

                          <div
                            key={
                              test.id
                            }
                            className="test-card"
                            onClick={() =>
                              selectTest(
                                test
                              )
                            }
                          >

                            <h4>
                              {
                                test.test_name
                              }
                            </h4>

                            <p>

                              ₦

                              {

                                getTestPrice(
                                  test
                                ).toLocaleString()

                              }

                            </p>

                          </div>
                        )
                      )
                    }

                  </div>

                ) : (

                  <div className="empty-text">

                    No matching
                    test found

                  </div>
                )

              ) : (

                <div className="empty-text">

                  Search for a
                  test to begin
                  selection

                </div>
              )
            }

            {/* SELECTED TESTS */}

            <div className="selected-tests">

              <div className="section-title small">

                <ClipboardList
                  size={18}
                />

                <h3>
                  Selected Tests
                </h3>

              </div>

              {
                selectedTests.length === 0 ? (

                  <p className="empty-text">
                    No test selected
                  </p>

                ) : (

                  selectedTests.map(
                    (test) => (

                      <div
                        key={
                          test.id
                        }
                        className="selected-item"
                      >

                        <span>

                          {
                            test.test_name
                          }

                        </span>

                        <div>

                          <strong>

                            ₦

                            {

                              Number(
                                test.selected_price
                              ).toLocaleString()

                            }

                          </strong>

                          <button
                            type="button"
                            onClick={() =>
                              removeTest(
                                test.id
                              )
                            }
                          >

                            ×

                          </button>

                        </div>

                      </div>
                    )
                  )
                )
              }

              {/* TOTAL */}

              <div className="total-box">

                <span>
                  Total Amount
                </span>

                <h2>

                  ₦

                  {
                    totalAmount.toLocaleString()
                  }

                </h2>

              </div>

            </div>

          </div>

          {/* =====================================================
              SUBMIT
          ===================================================== */}

          <button
            type="submit"
            className="registration-btn"
          >

            {
              loading
                ? "Registering..."
                : "Continue To Payment"
            }

          </button>

        </form>

      </div>

    </div>
  );
}