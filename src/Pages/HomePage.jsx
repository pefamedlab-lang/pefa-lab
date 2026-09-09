import "../styles/homepage.css";

import { Link } from "react-router-dom";

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
  Search,
  Target,
  Eye,
  Users,
  TestTube,
  Dna,
CheckCircle2,
  Building2,
  MessageCircle,
  FileText,
  UserRound,
} from "lucide-react";

import HomeNavbar from "../components/HomeNavbar";

export default function HomePage() {
  const services = [
    {
      title: "Hematology",
      icon: <TestTube size={22} />,
      color: "blue",
    },
    {
      title: "Clinical Chemistry",
      icon: <FlaskConical size={22} />,
      color: "green",
    },
    {
      title: "Microbiology",
      icon: <Microscope size={22} />,
      color: "red",
    },
    {
      title: "Serology",
      icon: <ShieldCheck size={22} />,
      color: "blue",
    },
    {
      title: "Hormonal Assay",
      icon: <Dna size={22} />,
      color: "green",
    },
    {
      title: "Parasitology",
      icon: <Microscope size={22} />,
      color: "red",
    },
    {
      title: "Blood Banking",
      icon: <Droplets size={22} />,
      color: "blue",
    },
    {
      title: "Ultrasound Scan",
      icon: <ScanLine size={22} />,
      color: "green",
    },
    {
      title: "Wellness Package",
      icon: <HeartPulse size={22} />,
      color: "red",
    },
    {
      title: "Research Services",
      icon: <Search size={22} />,
      color: "blue",
    },
  ];

  return (
    <div className="homepage" id="home">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <HomeNavbar />

   {/* =====================================================
    HERO
===================================================== */}

<section className="hero">

  {/* Laboratory background */}
  <div className="hero-background" />

  {/* Soft readability overlay */}
  <div className="hero-overlay" />

  {/* Right-side microscope */}
  <div className="hero-microscope-wrapper">

    <img
      src="/microscope.png"
      alt="Laboratory microscope"
      className="hero-microscope"
    />

  </div>

  <div className="hero-container">

    {/* =================================================
        MAIN TITLE
    ================================================= */}

    <div className="hero-title">

      <h1>
        PEFA MEDICAL{" "}
        <span>DIAGNOSTIC</span>
      </h1>

      <h2>
        SERVICES
      </h2>

      <div className="hero-title-line" />

    </div>


    {/* =================================================
        TAGLINE
    ================================================= */}

    <p className="hero-subtitle">
      Leading The Way In Medical Excellence
      <br />
      through timely, affordable, accurate and
      precision testing.
    </p>


    {/* =================================================
        ACTION BUTTONS
    ================================================= */}

    <div className="hero-actions">

      {/* CHECK RESULT */}

      <Link
        to="/patient-results"
        className="hero-action green"
      >

        <FileText size={25} />

        <span>
          Check Result
        </span>

      </Link>


      {/* PATIENT REGISTRATION */}

      <Link
        to="/registration"
        className="hero-action red"
      >

        <UserRound size={25} />

        <span>
          Patient Registration
        </span>

      </Link>


      {/* WHATSAPP */}

      <a
        href="https://wa.me/2348086618621"
        target="_blank"
        rel="noopener noreferrer"
        className="hero-action whatsapp"
      >

        <MessageCircle size={26} />

        <span>
          Book Via
          <small>WhatsApp</small>
        </span>

      </a>

    </div>


    {/* =================================================
        HERO FEATURES
    ================================================= */}

    <div className="hero-features">

      {/* ACCURATE */}

      <div className="hero-feature">

        <div className="feature-icon blue">
          <Target size={25} />
        </div>

        <div>
          <strong>
            Accurate
          </strong>

          <span>
            Results
          </span>
        </div>

      </div>


      <div className="feature-divider" />


      {/* FAST */}

      <div className="hero-feature">

        <div className="feature-icon green">
          <Activity size={25} />
        </div>

        <div>
          <strong>
            Fast
          </strong>

          <span>
            Turnaround
          </span>
        </div>

      </div>


      <div className="feature-divider" />


      {/* TECHNOLOGY */}

      <div className="hero-feature">

        <div className="feature-icon blue">
          <Microscope size={25} />
        </div>

        <div>
          <strong>
            Advanced
          </strong>

          <span>
            Technology
          </span>
        </div>

      </div>


      <div className="feature-divider" />


      {/* AFFORDABLE */}

      <div className="hero-feature">

        <div className="feature-icon green">
          <ShieldCheck size={25} />
        </div>

        <div>
          <strong>
            Affordable
          </strong>

          <span>
            Services
          </span>
        </div>

      </div>

    </div>

  </div>

</section>

      {/* =====================================================
          ABOUT / MISSION / VISION
      ===================================================== */}

      <section
        className="about-section"
        id="about"
      >

        <div className="information-grid">

          {/* ABOUT */}

          <div className="information-card about-card">

            <div className="information-heading">

              <div className="information-icon blue">
                <Users size={25} />
              </div>

              <div>
                <h2>ABOUT US</h2>
                <div className="heading-line blue-line" />
              </div>

            </div>

            <p>
              PEFA Medical Diagnostic Services is a
              modern and patient-focused diagnostic
              center committed to delivering timely,
              affordable, accurate and precision-based
              laboratory and diagnostic services using
              professional expertise, advanced medical
              technology and internationally accepted
              laboratory practices.
            </p>

          </div>

          {/* MISSION */}

          <div className="information-card mission-card">

            <div className="information-heading">

              <div className="information-icon green">
                <Target size={25} />
              </div>

              <div>
                <h2>OUR MISSION</h2>
                <div className="heading-line green-line" />
              </div>

            </div>

            <p>
              To provide timely, affordable, accurate
              and reliable diagnostic services using
              modern laboratory technology and
              professional expertise.
            </p>

          </div>

          {/* VISION */}

          <div className="information-card vision-card">

            <div className="information-heading">

              <div className="information-icon red">
                <Eye size={25} />
              </div>

              <div>
                <h2>OUR VISION</h2>
                <div className="heading-line red-line" />
              </div>

            </div>

            <p>
              To become one of the leading private
              healthcare providers in Nigeria through
              quality, precision and patient-focused
              diagnostic services.
            </p>

          </div>

        </div>

      </section>

      {/* =====================================================
          SERVICES
      ===================================================== */}

      <section
        className="services-section"
        id="services"
      >

        <div className="section-heading">

          <div className="section-line" />

          <h2>OUR SERVICES</h2>

          <div className="section-line" />

        </div>

        <div className="services-grid">

          {services.map((service, index) => (
            <div
              key={`${service.title}-${index}`}
              className="service-card"
            >

              <div
                className={`service-icon ${service.color}`}
              >
                {service.icon}
              </div>

              <h3>
                {service.title}
              </h3>

            </div>
          ))}

        </div>

      </section>

      {/* =====================================================
          CONTACT
      ===================================================== */}

      <section
        className="contact-section"
        id="contact"
      >

        <div className="contact-inner">

          <div className="section-heading contact-heading">

            <div className="section-line" />

            <h2>CONTACT INFORMATION</h2>

            <div className="section-line" />

          </div>

          <div className="contact-grid">

            {/* ADDRESS */}

            <div className="contact-card">

              <div className="contact-icon green">
                <MapPin size={25} />
              </div>

              <div>

                <h3>HEAD OFFICE</h3>

                <p>
                  32, Ogunru-Ori,
                  <br />
                  Pakuro Road,
                  <br />
                  beside Olaren Filling Station,
                  <br />
                  Mowe, Ogun State, Nigeria.
                </p>

              </div>

            </div>

            {/* PHONE */}

            <div className="contact-card">

              <div className="contact-icon red">
                <Phone size={25} />
              </div>

              <div>

                <h3>PHONE NUMBERS</h3>

                <p>
                  08086618621
                  <br />
                  09052853701
                </p>

              </div>

            </div>

            {/* WHATSAPP */}

            <div className="contact-card">

              <div className="contact-icon green">
                <MessageCircle size={25} />
              </div>

              <div>

                <h3>WHATSAPP</h3>

                <p>
                  08086618621
                  <br />
                  08088336440
                </p>

                <a
                  href="https://wa.me/2348086618621"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-whatsapp"
                >
                  <MessageCircle size={15} />
                  Chat on WhatsApp
                </a>

              </div>

            </div>

            {/* EMAIL */}

            <div className="contact-card">

              <div className="contact-icon blue">
                <Mail size={25} />
              </div>

              <div>

                <h3>EMAIL</h3>

                <p>
                  pefa.medlab@gmail.com
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="footer">

        <div className="footer-left">

          <img
            src="/logo.png"
            alt="PEFA Medical Diagnostic Services"
            className="footer-logo"
          />

          <div>

            <h2>
              PEFA MEDICAL{" "}
              <span>DIAGNOSTIC</span>{" "}
              SERVICES
            </h2>

            <p>
              Leading The Way In Medical Excellence
            </p>

          </div>

        </div>

        <div className="footer-right">

          © 2026 PEFA Medical Diagnostic Services.
          All Rights Reserved.

        </div>

      </footer>

    </div>
  );
}