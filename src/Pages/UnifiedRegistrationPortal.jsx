import "../styles/unifiedRegistrationPortal.css";

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
  ScanLine,
  ClipboardList,
  User,
  Phone,
  Calendar,
  MapPin,
  Trash2,
  CreditCard,
} from "lucide-react";

import {
  supabase,
} from "../supabase";

import {
  logActivity,
} from "../utils/logActivity";

import {
  generateScanId,
} from "../utils/generateScanId";

import {
  generateAccessCode,
} from "../utils/accessCode";

import {
  generatePatientID,
} from "../utils/patientId";

import {
  generateVerificationToken,
} from "../utils/verificationToken";

import UltrasoundTemplateSelector
from "../components/ultrasound/templates/UltrasoundTemplateSelector";


export default function UnifiedRegistrationPortal() {

  const navigate = useNavigate();


  // =========================================================
  // LOADING
  // =========================================================

  const [
    loading,
    setLoading,
  ] = useState(false);


  // =========================================================
  // DATA
  // =========================================================

  const [
    referrals,
    setReferrals,
  ] = useState([]);

  const [
    masterTests,
    setMasterTests,
  ] = useState([]);

  const [
    ultrasoundServices,
    setUltrasoundServices,
  ] = useState([]);


  // =========================================================
  // SERVICE SELECTION
  // =========================================================

  const [
    services,
    setServices,
  ] = useState({
    laboratory: false,
    ultrasound: false,
  });


  // =========================================================
  // LAB SEARCH
  // =========================================================

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");


  const [
    selectedTests,
    setSelectedTests,
  ] = useState([]);


  // =========================================================
  // ULTRASOUND
  // =========================================================

  const [
    selectedUltrasound,
    setSelectedUltrasound,
  ] = useState(null);


  // =========================================================
  // PATIENT
  // =========================================================

  const [
    form,
    setForm,
  ] = useState({

    patient_name: "",

    patient_id: "",

    lab_number: "",

    scan_id: "",

    access_code: "",

    verification_code: "",

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

    lmp: "",

    radiologist: "",

    priority: "Routine",

    payment_type: "Patient",

  });


  // =========================================================
  // INITIALIZE
  // =========================================================

  useEffect(() => {

    initializeForm();

    loadReferrals();

    loadTests();

    loadUltrasoundServices();

  }, []);


  const initializeForm = async () => {

    const scanId =
      await generateScanId();

    setForm((prev) => ({

      ...prev,

      patient_id:
        generatePatientID(),

      scan_id:
        scanId,

      access_code:
        generateAccessCode(),

      verification_code:
        generateVerificationToken(),

    }));

  };


  // =========================================================
  // LOAD REFERRALS
  // =========================================================

  const loadReferrals = async () => {

    const {
      data,
      error,
    } = await supabase

      .from("referrals")

      .select("*")

      .order("name");


    if (error) {

      console.error(
        "Referral Error:",
        error
      );

      return;
    }


    setReferrals(
      data || []
    );

  };


  // =========================================================
  // LOAD LAB TESTS
  // =========================================================

  const loadTests = async () => {

    const {
      data,
      error,
    } = await supabase

      .from("master_tests")

      .select(`
        id,
        department,
        panel_name,
        test_name,
        test_type,
        template_type,
        result_category,
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
          ascending: true,
        }
      );


    if (error) {

      console.error(
        "Test Error:",
        error
      );

      return;
    }


    setMasterTests(
      data || []
    );

  };


  // =========================================================
  // LOAD ULTRASOUND SERVICES
  // =========================================================

  const loadUltrasoundServices =
    async () => {

      const {
        data,
        error,
      } = await supabase

        .from(
          "ultrasound_services"
        )

        .select("*")

        .eq(
          "active_status",
          "Active"
        )

        .order(
          "service_name"
        );


      if (error) {

        console.error(
          "Ultrasound Service Error:",
          error
        );

        return;
      }


      setUltrasoundServices(
        data || []
      );

    };


  // =========================================================
  // AGE
  // =========================================================

  const calculateAge = (
    dob
  ) => {

    if (!dob)
      return "";


    const birth =
      new Date(dob);

    const today =
      new Date();


    let age =
      today.getFullYear() -
      birth.getFullYear();


    const month =
      today.getMonth() -
      birth.getMonth();


    if (

      month < 0 ||

      (
        month === 0 &&
        today.getDate() <
        birth.getDate()
      )

    ) {

      age--;

    }


    return age >= 0
      ? age
      : "";

  };


  // =========================================================
  // INPUT
  // =========================================================

  const handleChange = (
    e
  ) => {

    const {
      name,
      value,
    } = e.target;


    if (
      name === "dob"
    ) {

      setForm(
        (prev) => ({

          ...prev,

          dob:
            value,

          age:
            calculateAge(
              value
            ),

        })
      );

      return;
    }


    setForm(
      (prev) => ({

        ...prev,

        [name]:
          value,

      })
    );

  };


  // =========================================================
  // REFERRAL
  // =========================================================

  const handleReferral =
    (e) => {

      const referral =
        referrals.find(
          (item) =>
            String(item.id) ===
            e.target.value
        );


      setForm(
        (prev) => ({

          ...prev,

          referral_id:
            referral?.id || "",

          referral_name:
            referral?.name || "",

        })
      );

    };


  // =========================================================
  // SERVICE TOGGLE
  // =========================================================

  const toggleService =
    (type) => {

      setServices(
        (prev) => ({

          ...prev,

          [type]:
            !prev[type],

        })
      );

    };


  // =========================================================
  // LAB PRICE
  // =========================================================

  const getTestPrice =
    (test) => {

      return Number(

        test.test_type ===
        "Panel"

          ? test.panel_price || 0

          : test.single_test_price || 0

      );

    };


  // =========================================================
  // LAB SEARCH
  // =========================================================

  const filteredTests =
    useMemo(() => {

      const term =
        searchTerm
          .toLowerCase()
          .trim();


      if (!term)
        return [];


      return masterTests.filter(
        (test) =>

          test.test_name
            ?.toLowerCase()
            .includes(term) ||

          test.panel_name
            ?.toLowerCase()
            .includes(term)

      );

    }, [
      masterTests,
      searchTerm,
    ]);


  // =========================================================
  // ADD LAB TEST
  // =========================================================

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


      setSelectedTests(
        (prev) => [

          ...prev,

          {

            ...test,

            selected_price:
              getTestPrice(
                test
              ),

          },

        ]
      );


      setSearchTerm("");

    };


  // =========================================================
  // REMOVE LAB TEST
  // =========================================================

  const removeTest =
    (id) => {

      setSelectedTests(
        (prev) =>
          prev.filter(
            (item) =>
              item.id !== id
          )
      );

    };


  // =========================================================
  // ULTRASOUND TEMPLATE
  // =========================================================

  const handleTemplate =
    (template) => {

      const service =
        ultrasoundServices.find(
          (item) =>

            item.service_code ===
            template ||

            item.service_name
              ?.toLowerCase()
              .replaceAll(
                " ",
                "_"
              ) ===
            template
      );


      if (service) {

        setSelectedUltrasound(
          service
        );

        return;

      }


      // Fallback if the template
      // selector returns the service name

      const byName =
        ultrasoundServices.find(
          (item) =>

            item.service_name
              ?.toLowerCase() ===
            template
              ?.toLowerCase()
      );


      setSelectedUltrasound(
        byName || {

          id: null,

          service_name:
            template
              ?.replaceAll(
                "_",
                " "
              )
              .toUpperCase(),

          price: 0,

        }
      );

    };


  // =========================================================
  // TOTALS
  // =========================================================

  const laboratoryTotal =
    selectedTests.reduce(
      (
        total,
        test
      ) =>

        total +
        Number(
          test.selected_price ||
          0
        ),

      0
    );


  const ultrasoundTotal =
    selectedUltrasound
      ? Number(
          selectedUltrasound.price ||
          0
        )
      : 0;


  const totalAmount =
    laboratoryTotal +
    ultrasoundTotal;


  // =========================================================
  // VALIDATE
  // =========================================================

  const validateForm = () => {

    if (
      !services.laboratory &&
      !services.ultrasound
    ) {

      alert(
        "Select Laboratory or Ultrasound."
      );

      return false;

    }


    if (
      !form.patient_name
    ) {

      alert(
        "Enter patient's full name."
      );

      return false;

    }


    if (!form.sex) {

      alert(
        "Select patient's sex."
      );

      return false;

    }


    if (!form.phone) {

      alert(
        "Enter patient's phone number."
      );

      return false;

    }


    if (
      services.laboratory &&
      selectedTests.length === 0
    ) {

      alert(
        "Select at least one laboratory test."
      );

      return false;

    }


    if (
      services.ultrasound &&
      !selectedUltrasound
    ) {

      alert(
        "Select an ultrasound service."
      );

      return false;

    }


    if (
      services.ultrasound &&
      Number(
        selectedUltrasound?.price || 0
      ) <= 0
    ) {

      alert(
        "The selected ultrasound does not have a valid price."
      );

      return false;

    }


    return true;

  };


  // =========================================================
  // GENERATE LAB NUMBER
  // =========================================================

  const generateLabNumber =
    async () => {

      const year =
        new Date()
          .getFullYear()
          .toString()
          .slice(-2);


      const {
        data,
        error,
      } = await supabase.rpc(
        "next_lab_number"
      );


      if (error) {

        console.error(
          error
        );

        throw error;

      }


      return (
        `PMDS/${year}/` +
        String(data)
          .padStart(
            3,
            "0"
          )
      );

    };


  // =========================================================
  // CREATE TRANSACTION
  // =========================================================

  const handleContinue =
    async (e) => {

      e.preventDefault();


      if (!validateForm())
        return;


      try {

        setLoading(true);


        // ---------------------------------------------------
        // GENERATE IDENTIFIERS
        // ---------------------------------------------------

        let labNumber =
          form.lab_number;


        if (
          services.laboratory
        ) {

          labNumber =
            await generateLabNumber();

        }


        const {
          data: transactionNumber,
          error:
            transactionNumberError,
        } = await supabase.rpc(
          "next_transaction_number"
        );


        if (
          transactionNumberError
        ) {

          throw transactionNumberError;

        }


        const {
          data: invoiceNumber,
          error:
            invoiceNumberError,
        } = await supabase.rpc(
          "next_invoice_number"
        );


        if (
          invoiceNumberError
        ) {

          throw invoiceNumberError;

        }


        // ---------------------------------------------------
        // TRANSACTION
        // ---------------------------------------------------

        const transactionPayload = {

          transaction_number:
            transactionNumber,

          invoice_number:
            invoiceNumber,

          patient_id:
            form.patient_id,

          lab_number:
            labNumber || null,

          patient_name:
            form.patient_name,

          full_name:
            form.patient_name,

          sex:
            form.sex,

          age:
            String(form.age || ""),

          dob:
            form.dob || null,

          phone:
            form.phone,

          address:
            form.address,

          branch:
            form.branch,

          referral_id:
            form.referral_id ||
            null,

          referral_name:
            form.referral_name,

          referring_doctor:
            form.referring_doctor,

          clinical_history:
            form.clinical_history,

          payment_type:
            form.payment_type,

          total_amount:
            totalAmount,

          amount_paid:
            0,

          balance:
            totalAmount,

          payment_status:
            "Pending",

          status:
            "Pending",

          access_code:
            form.access_code,

          verification_code:
            form.verification_code,

        };


        const {
          data: transaction,
          error:
            transactionError,
        } = await supabase

          .from(
            "patient_transactions"
          )

          .insert(
            transactionPayload
          )

          .select()
          .single();


        if (transactionError)
          throw transactionError;


        // ---------------------------------------------------
        // TRANSACTION ITEMS
        // ---------------------------------------------------

        const items = [];


        // LABORATORY ITEMS

        if (
          services.laboratory
        ) {

          selectedTests.forEach(
            (test) => {

              items.push({

                transaction_id:
                  transaction.id,

                service_type:
                  "Laboratory",

                service_id:
                  test.id,

                service_name:
                  test.test_name,

                department:
                  test.department,

                quantity:
                  1,

                unit_price:
                  Number(
                    test.selected_price ||
                    0
                  ),

                amount:
                  Number(
                    test.selected_price ||
                    0
                  ),

                metadata: {

                  test_type:
                    test.test_type,

                  panel_name:
                    test.panel_name,

                  template_type:
                    test.template_type,

                },

              });

            }
          );

        }


        // ULTRASOUND ITEM

        if (
          services.ultrasound &&
          selectedUltrasound
        ) {

          items.push({

            transaction_id:
              transaction.id,

            service_type:
              "Ultrasound",

            service_id:
              selectedUltrasound.id ||
              null,

            service_name:
              selectedUltrasound.service_name,

            department:
              "Radiology",

            quantity:
              1,

            unit_price:
              Number(
                selectedUltrasound.price
              ),

            amount:
              Number(
                selectedUltrasound.price
              ),

            metadata: {

              priority:
                form.priority,

              referring_doctor:
                form.referring_doctor,

              radiologist:
                form.radiologist,

              lmp:
                form.lmp,

              clinical_indication:
                form.clinical_history,

              scan_id:
                form.scan_id,

            },

          });

        }


        if (
          items.length === 0
        ) {

          throw new Error(
            "No transaction items were created."
          );

        }


        const {
          error:
            itemsError,
        } = await supabase

          .from(
            "transaction_items"
          )

          .insert(items);


        if (itemsError)
          throw itemsError;


        // ---------------------------------------------------
        // SAVE LABORATORY RECORD
        // ---------------------------------------------------

        if (
          services.laboratory
        ) {

          const {
            error:
              registrationError,
          } = await supabase

            .from(
              "registrations"
            )

            .insert({

              lab_number:
                labNumber,

              patient_name:
                form.patient_name,

              full_name:
                form.patient_name,

              sex:
                form.sex,

              age:
                form.age,

              dob:
                form.dob || null,

              phone:
                form.phone,

              address:
                form.address,

              branch:
                form.branch,

              referral_id:
                form.referral_id ||
                null,

              referral_name:
                form.referral_name,

              referring_doctor:
                form.referring_doctor,

              clinical_history:
                form.clinical_history,

              tests:
                selectedTests,

              total_amount:
                laboratoryTotal,

              payment_status:
                "Pending",

              amount_paid:
                0,

              balance:
                laboratoryTotal,

              access_code:
                form.access_code,

              payment_type:
                form.payment_type,

              status:
                "Pending",

            });


          if (
            registrationError
          ) {

            throw registrationError;

          }

        }


        // ---------------------------------------------------
        // SAVE ULTRASOUND RECORD
        // ---------------------------------------------------

        if (
          services.ultrasound &&
          selectedUltrasound
        ) {

          const {
            error:
              ultrasoundError,
          } = await supabase

            .from(
              "ultrasound_results"
            )

            .insert({

              patient_name:
                form.patient_name,

              patient_id:
                form.patient_id,

              sex:
                form.sex,

              age:
                form.age,

              dob:
                form.dob || null,

              phone:
                form.phone,

              branch:
                form.branch,

              referring_doctor:
                form.referring_doctor,

              clinical_history:
                form.clinical_history,

              test_type:
                selectedUltrasound
                  .service_name,

              price:
                selectedUltrasound.price,

              payment_status:
                "Pending",

              payment_method:
                null,

              amount_paid:
                0,

              balance:
                selectedUltrasound.price,

              referral_id:
                form.referral_id ||
                null,

              referral_name:
                form.referral_name,

              scan_id:
                form.scan_id,

              access_code:
                form.access_code,

              verification_code:
                form.verification_code,

              priority:
                form.priority,

              radiologist:
                form.radiologist,

              lmp:
                form.lmp,

              report_status:
                "Pending",

              release_status:
                "Pending",

              result:
                {},

            });


          if (
            ultrasoundError
          ) {

            throw ultrasoundError;

          }

        }


        // ---------------------------------------------------
        // REFERRAL INVOICE
        // ONE INVOICE FOR EVERYTHING
        // ---------------------------------------------------

        if (
          form.referral_id
        ) {

          const {
            error:
              referralInvoiceError,
          } = await supabase

            .from(
              "referral_invoices"
            )

            .insert({

              referral_id:
                form.referral_id,

              referral_name:
                form.referral_name,

              patient_name:
                form.patient_name,

              lab_number:
                labNumber || null,

              transaction_id:
                transaction.id,

              tests:
                items
                  .map(
                    (item) =>
                      item.service_name
                  )
                  .join(", "),

              total_amount:
                totalAmount,

              discount_amount:
                0,

              final_amount:
                totalAmount,

              amount_paid:
                0,

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

            });


          if (
            referralInvoiceError
          ) {

            console.error(
              "Referral invoice:",
              referralInvoiceError
            );

          }

        }


        // ---------------------------------------------------
        // ACTIVITY LOG
        // ---------------------------------------------------

        await logActivity({

          action:
            "Created Unified Patient Transaction",

          module:
            "Registration",

          patientName:
            form.patient_name,

          labNumber:
            labNumber ||
            transactionNumber,

        });


        // ---------------------------------------------------
        // LOCAL BACKUP
        // ---------------------------------------------------

        localStorage.setItem(

          "current_transaction",

          JSON.stringify({

            ...transaction,

            items,

          })

        );


        // ---------------------------------------------------
        // PAYMENT PORTAL
        // ---------------------------------------------------

        navigate(

          `/payment-portal?transaction=${transaction.id}`

        );


      } catch (error) {

        console.error(
          "Registration Error:",
          error
        );

        alert(
          error.message ||
          "Unable to create transaction."
        );

      } finally {

        setLoading(false);

      }

    };


  return (

    <div className="dashboard-layout">

      <div className="dashboard-content">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="registration-header">

          <div>

            <h1>
              PEFA Unified Registration
            </h1>

            <p>
              Laboratory • Ultrasound • Payment
            </p>

          </div>

        </div>


        {/* =================================================
            PATIENT
        ================================================= */}

        <div className="registration-card">

          <div className="section-title">

            <UserPlus size={20} />

            <h2>
              Patient Information
            </h2>

          </div>


          <div className="registration-grid">


            <div className="form-group">

              <label>
                Full Name *
              </label>

              <div className="input-box">

                <User size={18} />

                <input
                  type="text"
                  name="patient_name"
                  value={
                    form.patient_name
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
                Sex *
              </label>

              <select
                name="sex"
                value={
                  form.sex
                }
                onChange={
                  handleChange
                }
              >

                <option value="">
                  Select
                </option>

                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>

              </select>

            </div>


            <div className="form-group">

              <label>
                Date of Birth
              </label>

              <div className="input-box">

                <Calendar size={18} />

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
                value={
                  form.age
                }
                readOnly
              />

            </div>


            <div className="form-group">

              <label>
                Phone *
              </label>

              <div className="input-box">

                <Phone size={18} />

                <input
                  type="text"
                  name="phone"
                  value={
                    form.phone
                  }
                  onChange={
                    handleChange
                  }
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
              >

                <option value="">
                  Select Branch
                </option>

                <option value="Pakuro">
                  Pakuro
                </option>

                <option value="Mowe">
                  Mowe
                </option>

                <option value="Orimerunmu">
                  Orimerunmu
                </option>

                <option value="Private">
                  Private
                </option>

              </select>

            </div>


            <div className="form-group">

              <label>
                Hospital / Clinic
              </label>

              <select
                value={
                  form.referral_id
                }
                onChange={
                  handleReferral
                }
              >

                <option value="">
                  Select Referral
                </option>

                {
                  referrals.map(
                    (item) => (

                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.name}
                      </option>

                    )
                  )
                }

              </select>

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

                <option value="Patient">
                  Patient
                </option>

                <option value="Referral">
                  Referral
                </option>

                <option value="HMO">
                  HMO
                </option>

              </select>

            </div>

          </div>


          <div className="form-group full-width">

            <label>
              Address
            </label>

            <div className="input-box">

              <MapPin size={18} />

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


        {/* =================================================
            SERVICE SELECTION
        ================================================= */}

        <div className="registration-card">

          <div className="section-title">

            <ClipboardList
              size={20}
            />

            <h2>
              Select Services
            </h2>

          </div>


          <div className="service-selection">


            <button
              type="button"
              className={
                services.laboratory
                  ? "service-option active"
                  : "service-option"
              }
              onClick={() =>
                toggleService(
                  "laboratory"
                )
              }
            >

              <FlaskConical
                size={32}
              />

              <strong>
                Laboratory
              </strong>

              <span>
                Tests & Panels
              </span>

            </button>


            <button
              type="button"
              className={
                services.ultrasound
                  ? "service-option active"
                  : "service-option"
              }
              onClick={() =>
                toggleService(
                  "ultrasound"
                )
              }
            >

              <ScanLine
                size={32}
              />

              <strong>
                Ultrasound
              </strong>

              <span>
                Imaging Services
              </span>

            </button>


          </div>

        </div>


        {/* =================================================
            LABORATORY
        ================================================= */}

        {
          services.laboratory && (

            <div className="registration-card">

              <div className="section-title">

                <FlaskConical
                  size={20}
                />

                <h2>
                  Laboratory Tests
                </h2>

              </div>


              <div className="test-search">

                <Search size={18} />

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


              {
                searchTerm && (

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

                )
              }


              <div className="selected-tests">

                <h3>
                  Selected Laboratory Tests
                </h3>


                {
                  selectedTests.length ===
                  0 ? (

                    <p className="empty-text">
                      No laboratory test selected.
                    </p>

                  ) : (

                    selectedTests.map(
                      (test) => (

                        <div
                          className="selected-item"
                          key={
                            test.id
                          }
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

                              <Trash2
                                size={16}
                              />

                            </button>

                          </div>

                        </div>

                      )
                    )

                  )
                }


                {
                  services.laboratory &&
                  selectedTests.length > 0 && (

                    <div className="sub-total">

                      Laboratory Total

                      <strong>
                        ₦
                        {
                          laboratoryTotal
                            .toLocaleString()
                        }
                      </strong>

                    </div>

                  )
                }

              </div>

            </div>

          )
        }


        {/* =================================================
            ULTRASOUND
        ================================================= */}

        {
          services.ultrasound && (

            <div className="registration-card">

              <div className="section-title">

                <ScanLine
                  size={20}
                />

                <h2>
                  Ultrasound
                </h2>

              </div>


             <UltrasoundTemplateSelector
  value={selectedUltrasound?.service_code || ""}
  onChange={handleTemplate}
/>


              {
                selectedUltrasound && (

                  <div className="ultrasound-selected">

                    <div>

                      <strong>
                        {
                          selectedUltrasound
                            .service_name
                        }
                      </strong>

                    </div>

                    <strong>
                      ₦
                      {
                        Number(
                          selectedUltrasound.price ||
                          0
                        ).toLocaleString()
                      }
                    </strong>

                  </div>

                )
              }


              <div className="registration-grid">

                <div className="form-group">

                  <label>
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={
                      form.priority
                    }
                    onChange={
                      handleChange
                    }
                  >

                    <option value="Routine">
                      Routine
                    </option>

                    <option value="Urgent">
                      Urgent
                    </option>

                    <option value="Emergency">
                      Emergency
                    </option>

                  </select>

                </div>


                <div className="form-group">

                  <label>
                    Radiologist
                  </label>

                  <input
                    type="text"
                    name="radiologist"
                    value={
                      form.radiologist
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>


                {
                  form.sex ===
                  "Female" && (

                    <div className="form-group">

                      <label>
                        LMP
                      </label>

                      <input
                        type="date"
                        name="lmp"
                        value={
                          form.lmp
                        }
                        onChange={
                          handleChange
                        }
                      />

                    </div>

                  )
                }

              </div>

            </div>

          )
        }


        {/* =================================================
            SYSTEM INFORMATION
        ================================================= */}

        <div className="registration-card">

          <div className="section-title">

            <ClipboardList
              size={20}
            />

            <h2>
              System Information
            </h2>

          </div>


          <div className="registration-grid">

            <input
              value={
                form.patient_id
              }
              readOnly
              placeholder="Patient ID"
            />

            <input
              value={
                form.scan_id
              }
              readOnly
              placeholder="Scan ID"
            />

            <input
              value={
                form.access_code
              }
              readOnly
              placeholder="Access Code"
            />

            <input
              value={
                form.verification_code
              }
              readOnly
              placeholder="Verification Code"
            />

          </div>

        </div>


        {/* =================================================
            ORDER SUMMARY
        ================================================= */}

        <div className="registration-card">

          <div className="section-title">

            <CreditCard
              size={20}
            />

            <h2>
              Order Summary
            </h2>

          </div>


          {
            selectedTests.map(
              (test) => (

                <div
                  className="summary-item"
                  key={
                    `lab-${test.id}`
                  }
                >

                  <span>
                    Laboratory —{" "}
                    {
                      test.test_name
                    }
                  </span>

                  <strong>
                    ₦
                    {
                      Number(
                        test.selected_price
                      ).toLocaleString()
                    }
                  </strong>

                </div>

              )
            )
          }


          {
            selectedUltrasound && (

              <div
                className="summary-item"
              >

                <span>
                  Ultrasound —{" "}
                  {
                    selectedUltrasound
                      .service_name
                  }
                </span>

                <strong>
                  ₦
                  {
                    Number(
                      selectedUltrasound.price
                    ).toLocaleString()
                  }
                </strong>

              </div>

            )
          }


          <div className="total-box">

            <span>
              TOTAL
            </span>

            <h2>
              ₦
              {
                totalAmount
                  .toLocaleString()
              }
            </h2>

          </div>

        </div>


        {/* =================================================
            CONTINUE
        ================================================= */}

        <form
          onSubmit={
            handleContinue
          }
        >

          <button
            type="submit"
            className="registration-btn"
            disabled={
              loading
            }
          >

            {
              loading
                ? "Creating Transaction..."
                : "Continue To Payment"
            }

          </button>

        </form>


      </div>

    </div>

  );

}