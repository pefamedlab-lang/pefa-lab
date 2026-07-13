import {

  useState,

} from "react";

import {

  supabase,

} from "../supabase";

import UltrasoundTemplateSelector
from "../components/ultrasound/UltrasoundTemplateSelector";

import "../styles/ultrasoundRegistration.css";

export default function UltrasoundRegistration() {

  const [

    form,

    setForm,

  ] = useState({

    patient_name: "",

    age: "",

    sex: "",

    phone: "",

    lab_number: "",

    template_type: "",

    clinical_indication: "",

    referring_doctor: "",

    radiologist: "",

    priority: "Routine",

  });

  /* ==========================
     HANDLE CHANGE
  ========================== */

  const handleChange = (

    e

  ) => {

    setForm({

      ...form,

      [e.target.name]:

        e.target.value,

    });

  };

  /* ==========================
     SAVE REQUEST
  ========================== */

  const saveRequest =

    async () => {

      if (

        !form.patient_name ||

        !form.template_type

      ) {

        alert(

          "Patient Name and Scan Type are required."

        );

        return;

      }

      const {

        error,

      } = await supabase

        .from(

          "ultrasound_results"

        )

        .insert([{

          ...form,

          test_type:

            form.template_type

              .replaceAll(

                "_",

                " "

              )

              .toUpperCase(),

          result: {},

          release_status:

            "Pending",

        }]);

      if (error) {

        console.log(

          error

        );

        alert(

          error.message

        );

        return;

      }

      alert(

        "Ultrasound request created successfully."

      );

      setForm({

        patient_name: "",

        age: "",

        sex: "",

        phone: "",

        lab_number: "",

        template_type: "",

        clinical_indication: "",

        referring_doctor: "",

        radiologist: "",

        priority: "Routine",

      });

    };

  return (

    <div className="ultrasound-registration">

      {/* =====================
          HEADER
      ===================== */}

      <div className="registration-header">

        <h1>

          Ultrasound Registration

        </h1>

        <p>

          Enterprise Radiology Request Portal

        </p>

      </div>

      {/* =====================
          PATIENT DETAILS
      ===================== */}

      <div className="registration-card">

        <h2>

          Patient Information

        </h2>

        <div className="registration-grid">

          <input
            name="patient_name"
            placeholder="Patient Name"
            value={form.patient_name}
            onChange={handleChange}
          />

          <input
            name="lab_number"
            placeholder="Lab Number"
            value={form.lab_number}
            onChange={handleChange}
          />

          <input
            name="age"
            placeholder="Age"
            value={form.age}
            onChange={handleChange}
          />

          <select
            name="sex"
            value={form.sex}
            onChange={handleChange}
          >

            <option value="">

              Gender

            </option>

            <option>

              Male

            </option>

            <option>

              Female

            </option>

          </select>

          <input
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
          />

        </div>

      </div>

      {/* =====================
          TEMPLATE
      ===================== */}

      <div className="registration-card">

        <h2>

          Scan Template

        </h2>

        <UltrasoundTemplateSelector

          value={form.template_type}

          onChange={(value)=>

            setForm({

              ...form,

              template_type:

                value,

            })

          }

        />

      </div>

      {/* =====================
          CLINICAL DETAILS
      ===================== */}

      <div className="registration-card">

        <h2>

          Clinical Information

        </h2>

        <div className="registration-grid">

          <input
            name="referring_doctor"
            placeholder="Referring Doctor"
            value={form.referring_doctor}
            onChange={handleChange}
          />

          <input
            name="radiologist"
            placeholder="Radiologist"
            value={form.radiologist}
            onChange={handleChange}
          />

          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
          >

            <option>

              Routine

            </option>

            <option>

              Urgent

            </option>

          </select>

        </div>

        <textarea

          rows={5}

          name="clinical_indication"

          placeholder="Clinical Indication / History"

          value={

            form.clinical_indication

          }

          onChange={

            handleChange

          }

        />

      </div>

      {/* =====================
          ACTION
      ===================== */}

      <button

        className="save-request-btn"

        onClick={

          saveRequest

        }

      >

        Create Ultrasound Request

      </button>

    </div>

  );

}