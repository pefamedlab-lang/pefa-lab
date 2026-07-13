import "../styles/homepage.css";

import {
  Link,
} from "react-router-dom";

import {
  Microscope,
  FlaskConical,
  Activity,
  ShieldCheck,
  Phone,
  MapPin,
  Mail,
  Droplets,
  ScanLine,
  HeartPulse,
  Brain,
  Stethoscope,
  HeartHandshake,
  Building2,
  Ambulance,
  CheckCircle2,
} from "lucide-react";

import HomeNavbar from "../components/HomeNavbar";

export default function HomePage() {
  const services = [
    {
      title: "Hematology",
      icon: (
        <Activity size={20} />
      ),
      color: "blue",
    },

    {
      title:
        "Clinical Chemistry",
      icon: (
        <FlaskConical size={20} />
      ),
      color: "green",
    },

    {
      title:
        "Microbiology",
      icon: (
        <Microscope size={20} />
      ),
      color: "red",
    },

    {
      title:
        "Hormonal Assay",
      icon: (
        <Brain size={20} />
      ),
      color: "blue",
    },

    {
      title:
        "Tumor Markers",
      icon: (
        <ShieldCheck size={20} />
      ),
      color: "green",
    },

    {
      title: "Serology",
      icon: (
        <HeartPulse size={20} />
      ),
      color: "red",
    },

    {
      title:
        "Blood Banking",
      icon: (
        <Droplets size={20} />
      ),
      color: "blue",
    },

    {
      title:
        "Ultrasound Scan",
      icon: (
        <ScanLine size={20} />
      ),
      color: "green",
    },


    {
      title: "ECG",
      icon: (
        <HeartPulse size={20} />      ),
      color: "red",
    },

    {
      title:
        "Wellness Screening",
      icon: (
        <Stethoscope size={20} />
      ),
      color: "blue",
    },

    {
      title:
        "Health Packages",
      icon: (
        <HeartHandshake size={20} />
      ),
      color: "green",
    },

    {
      title:
        "Medical Outreach",
      icon: (
        <Ambulance size={20} />
      ),
      color: "red",
    },

    {
      title:
        "Medical Research",
      icon: (
        <Building2 size={20} />
      ),
      color: "blue",
    },
  ];

  return (
    <div
      className="homepage"
      id="home"
    >
      {/* NAVBAR */}

      <HomeNavbar />

      {/* HERO */}

      <section className="hero">
        <div className="overlay" />

        <div className="hero-container">
          {/* TITLE */}

          <div className="hero-title">
            <h1 className="main-title">
              PEFA MEDICAL
              DIAGNOSTIC
            </h1>

            <h2 className="services-title">
              SERVICES
            </h2>

            <img
              src="/microscope.png"
              alt="Microscope"
              className="microscope"
            />

            <div className="title-line" />
          </div>

          {/* SUBTITLE */}

          <p className="subtitle">
            Leading the way in
            medical excellence
            through timely,
            accurate,
            affordable and
            precision testing.
          </p>

          {/* BUTTONS */}

          <div className="button-group">
            {/* DASHBOARD */}

           <Link
  to="/login"
  className="home-link"
>
  <button className="green-btn">
    Staff Login
  </button>
</Link>

            {/* RESULT CHECKER */}

         <Link
  to="/patient-results"
  className="home-link"
>
  <button className="red-btn">
    Check Result
  </button>
</Link>

            {/* WHATSAPP */}

            <a
              href="https://wa.me/2348086618621"
              className="home-link"
            >
              <button className="whatsapp-btn">
                WhatsApp
              </button>
            </a>
          </div>

          {/* FEATURES */}

          <div className="features">
            <div className="feature">
              <div className="icon blue">
                <Microscope size={22} />
              </div>

              <p>
                Smart
                Diagnostics
              </p>
            </div>

            <div className="feature">
              <div className="icon green">
                <FlaskConical size={22} />
              </div>

              <p>
                Advanced
                Chemistry
              </p>
            </div>

            <div className="feature">
              <div className="icon red">
                <Activity size={22} />
              </div>

              <p>
                Hematology
                Automation
              </p>
            </div>

            <div className="feature">
              <div className="icon blue">
                <ShieldCheck size={22} />
              </div>

              <p>
                Enterprise
                Security
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}

      <section
        className="about-section"
        id="about"
      >
        <div className="about-smart-card">
          {/* LEFT */}

          <div className="about-left">
            <div className="about-badge">
              About PEFA
            </div>

            <h2>
              Trusted
              Diagnostic
              Excellence
            </h2>

            <div className="small-line" />

            <p>
              Welcome to PEFA
              Medical
              Diagnostic
              Services — a
              trusted center
              for quality
              medical
              laboratory and
              diagnostic
              services
              committed to
              improving
              healthcare
              through
              accurate,
              timely and
              reliable
              results.
            </p>

            <p>
              Located in
              Mowe, PEFA
              Medical
              Diagnostic
              Services was
              established
              with a vision
              to provide
              accessible and
              professional
              diagnostic
              healthcare
              services to
              individuals,
              families,
              hospitals,
              clinics and
              corporate
              organizations.
            </p>

            <p>
              We combine
              modern
              laboratory
              practices with
              patient-centered
              care to support
              early
              detection,
              disease
              prevention and
              effective
              treatment
              monitoring.
            </p>
          </div>

          {/* RIGHT */}

          <div className="about-right">
            <div className="about-highlight">
              <CheckCircle2 size={18} />

              Accurate &
              Reliable
              Results
            </div>

            <div className="about-highlight">
              <CheckCircle2 size={18} />

              Professional
              Healthcare Team
            </div>

            <div className="about-highlight">
              <CheckCircle2 size={18} />

              Modern
              Diagnostic
              Equipment
            </div>

            <div className="about-highlight">
              <CheckCircle2 size={18} />

              Affordable
              Healthcare
              Packages
            </div>

            <div className="about-highlight">
              <CheckCircle2 size={18} />

              Confidential &
              Timely
              Reporting
            </div>
          </div>
        </div>

        {/* MISSION & VISION */}

        <div className="mission-vision-grid">
          {/* MISSION */}

          <div className="info-card mission-card">
            <div className="info-card-header">

  <div className="info-icon green">
    <ShieldCheck size={20} />
  </div>

  <h2>
    Mission
  </h2>

</div>

            <div className="small-line" />

            <p>
              To provide
              reliable,
              affordable and
              advanced
              diagnostic
              services powered
              by technology,
              professionalism
              and international
              laboratory
              standards.
            </p>
          </div>

          {/* VISION */}

          <div className="info-card vision-card">
            <div className="info-icon red">
              <Activity size={20} />
            </div>

            <h2>
              Vision
            </h2>

            <div className="small-line" />

            <p>
              To become one
              of the leading
              private
              healthcare
              providers in
              Nigeria through
              timely,
              high-quality and
              affordable
              diagnostic
              services.
            </p>
          </div>
        </div>
      </section>

      {/* SERVICES */}

      <section
        className="services-section"
        id="services"
      >
        <div className="section-header">
          <div className="line" />

          <h2>
            Our Services
          </h2>

          <div className="line" />
        </div>

        <div className="services-grid">
          {services.map(
            (
              service,
              index
            ) => (
              <div
                key={index}
                className="service-card"
              >
                <div
                  className={`service-icon ${service.color}`}
                >
                  {
                    service.icon
                  }
                </div>

                <h3>
                  {
                    service.title
                  }
                </h3>
              </div>
            )
          )}
        </div>
      </section>

      {/* CONTACT */}

      <section
        className="contact-section"
        id="contact"
      >
        <div className="smart-contact-card">
          {/* ADDRESS */}

          <div className="address-wrapper">
            <div className="branch-box">
              <h4>
                Branch 1
              </h4>

              <p>
                5, Olorombo
                Street,
                Imedu-Nla,
                Mowe,
                Ogun State
              </p>
            </div>

            <div className="head-office-box">
              <MapPin size={18} />

              <h3>
                Head Office
              </h3>

              <p>
                32,
                Ogunru-Ori,
                Pakuro Road,
                Mowe,
                Ogun State
              </p>
            </div>

            <div className="branch-box">
              <h4>
                Branch 2
              </h4>

              <p>
                Iya-Ijebu
                Junction,
                Vital Foam,
                Orimerunmu,
                Ogun State
              </p>
            </div>
          </div>

          {/* CONTACT INFO */}

          <div className="mini-contact-grid">
            <div className="mini-contact-item">
              <Phone size={16} />

              <span>
                08086618621
                <br />
                09052853701
              </span>
            </div>

            <div className="mini-contact-item">
              <Mail size={16} />

              <span>
                pefa.medlab@gmail.com
              </span>
            </div>

            <div className="mini-contact-item">
              <Phone size={16} />

              <span>
                WhatsApp:
                08086618621 /
                08088336440
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="footer">
        <div className="footer-content">
          <img
            src="/logo.png"
            alt="Logo"
            className="footer-logo"
          />

          <div className="footer-text">
            <h2>
              PEFA MEDICAL
              DIAGNOSTIC
              SERVICES
            </h2>

            <p>
              Enterprise
              Laboratory
              Information
              System
            </p>

            <span className="copyright">
              © 2026 PEFA
              Medical
              Diagnostic
              Services.
              All rights
              reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}