export default function App() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", background: "#f5f9fc" }}>

      <section
        style={{
          background: "#0097b2",
          color: "white",
          padding: "80px 20px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "48px" }}>
          PEFA Medical Diagnostic Services
        </h1>

        <p style={{ fontSize: "20px" }}>
          Leading the Way in Medical Excellences
        </p>

        <button
          style={{
            padding: "15px 25px",
            marginTop: "20px",
            border: "none",
            borderRadius: "8px",
            background: "#32cd32",
            color: "white",
          }}
        >
          Book Appointment
        </button>
      </section>

      <section style={{ padding: "50px 20px", textAlign: "center" }}>
        <h2>Our Services</h2>

        <p>Blood Tests</p>
        <p>Hormonal Assay</p>
        <p>Ultrasound Scan</p>
        <p>Diabetes Screening</p>
      </section>

      <section
        style={{
          background: "#0097b2",
          color: "white",
          padding: "40px 20px",
          textAlign: "center",
        }}
      >
{/* APPOINTMENT FORM */}
<section
  style={{
    padding: "60px 20px",
    background: "#ffffff",
    textAlign: "center",
  }}
>
  <h2>Book Appointment</h2>

  <form
    onSubmit={(e) => {
      e.preventDefault();

      const name = e.target.name.value;
      const phone = e.target.phone.value;
      const test = e.target.test.value;

      const message = `Hello PEFA Medical Diagnostic Services.%0A%0AName: ${name}%0APhone: ${phone}%0ATest Needed: ${test}`;

      window.open(
        `https://wa.me/2348086618221?text=${message}`,
        "_blank"
      );
    }}
    style={{
      maxWidth: "500px",
      margin: "auto",
      display: "flex",
      flexDirection: "column",
      gap: "15px",
    }}
  >
    <input
      type="text"
      name="name"
      placeholder="Full Name"
      required
      style={{
        padding: "15px",
        borderRadius: "8px",
        border: "1px solid #ccc",
      }}
    />

    <input
      type="text"
      name="phone"
      placeholder="Phone Number"
      required
      style={{
        padding: "15px",
        borderRadius: "8px",
        border: "1px solid #ccc",
      }}
    />

    <input
      type="text"
      name="test"
      placeholder="Test Needed"
      required
      style={{
        padding: "15px",
        borderRadius: "8px",
        border: "1px solid #ccc",
      }}
    />

    <button
      type="submit"
      style={{
        padding: "15px",
        background: "#25D366",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "16px",
        cursor: "pointer",
      }}
    >
      Book via WhatsApp
    </button>
  </form>
</section>
        <h2>Contact Us</h2>

        <p>32 Ogunru-Ori, Pakuro Road, Mowe, Ogun State</p>

        <p>08086618221 | 09052853701</p>
      </section>

    </div>
  );
}