import "../styles/homepage.css";

import { Link } from "react-router-dom";

import {
  Activity,
  ArrowRight,
  Award,
  Beaker,
  Brain,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Dna,
  Droplets,
  FileText,
  FlaskConical,
  HeartHandshake,
  HeartPulse,
  Mail,
  MapPin,
  MessageCircle,
  Microscope,
  Phone,
  ScanLine,
  Search,
  ShieldCheck,
  Stethoscope,
  Target,
  TestTube,
  Users,
} from "lucide-react";

import HomeNavbar from "../components/HomeNavbar";

const services = [
  {
    title: "Hematology",
    description: "Comprehensive blood and haematological investigations.",
    icon: <TestTube size={24} />,
    color: "blue",
  },
  {
    title: "Clinical Chemistry",
    description: "Biochemical testing supporting diagnosis and monitoring.",
    icon: <FlaskConical size={24} />,
    color: "green",
  },
  {
    title: "Microbiology",
    description: "Laboratory investigation of infectious conditions.",
    icon: <Microscope size={24} />,
    color: "red",
  },
  {
    title: "Serology & Immunology",
    description: "Serological and immune-related diagnostic testing.",
    icon: <ShieldCheck size={24} />,
    color: "blue",
  },
  {
    title: "Hormonal Assay",
    description: "Hormonal and endocrine laboratory investigations.",
    icon: <Dna size={24} />,
    color: "green",
  },
  {
    title: "Parasitology",
    description: "Laboratory examination for parasitic infections.",
    icon: <Search size={24} />,
    color: "red",
  },
  {
    title: "Blood Banking",
    description: "Blood grouping, compatibility and blood bank services.",
    icon: <Droplets size={24} />,
    color: "blue",
  },
  {
    title: "Ultrasound Scan",
    description: "Diagnostic ultrasound imaging services.",
    icon: <ScanLine size={24} />,
    color: "green",
  },
  {
    title: "Wellness Packages",
    description: "Convenient preventive health screening packages.",
    icon: <HeartPulse size={24} />,
    color: "red",
    link: "/wellness-packages",
  },
  {
    title: "Research Services",
    description: "Laboratory support for medical and scientific research.",
    icon: <Brain size={24} />,
    color: "blue",
  },
];

const standards = [
  {
    icon: <Target size={21} />,
    title: "Precision",
    text: "Focused on dependable diagnostic information for informed clinical decisions.",
  },
  {
    icon: <Clock3 size={21} />,
    title: "Timely Service",
    text: "Efficient workflows designed around practical turnaround expectations.",
  },
  {
    icon: <Award size={21} />,
    title: "Professional Expertise",
    text: "Laboratory and diagnostic services delivered with professional care.",
  },
  {
    icon: <HeartHandshake size={21} />,
    title: "Patient Focus",
    text: "A patient-centred approach from request to result delivery.",
  },
];

export default function HomePage() {
  return (
    <div className="homepage">
      <HomeNavbar />

      <main>
        {/* =========================================================
            HERO
        ========================================================= */}
        <section className="premium-hero" id="home">
          <div className="hero-grid-glow" />
          <div className="hero-orb hero-orb-one" />
          <div className="hero-orb hero-orb-two" />

          <div className="hero-container">
            <div className="hero-content">
              <div className="hero-eyebrow">
                <span className="eyebrow-dot" />
                PEFA MEDICAL DIAGNOSTIC SERVICES
              </div>

              <h1>
                Diagnostic excellence
                <span>you can trust.</span>
              </h1>

              <p className="hero-lead">
                Accurate laboratory diagnostics, ultrasound imaging,
                blood banking, wellness screening and research support —
                delivered with professionalism, precision and patient care.
              </p>

              <div className="hero-cta-row">
                <Link to="/test-request" className="primary-cta">
                  Submit Test Request
                  <ArrowRight size={18} />
                </Link>

                <Link to="/patient-results" className="secondary-cta">
                  <FileText size={18} />
                  Patient Result Portal
                </Link>
              </div>

              <div className="hero-support-row">
                <a
                  href="https://wa.me/2348086618621"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-whatsapp"
                >
                  <MessageCircle size={18} />
                  Book via WhatsApp
                </a>

                <span className="hero-support-divider" />

                <span>
                  <ShieldCheck size={17} />
                  Patient-focused diagnostic care
                </span>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-panel">
                <div className="hero-panel-top">
                  <div>
                    <span className="panel-kicker">DIAGNOSTIC SERVICES</span>
                    <h2>Precision at every step.</h2>
                  </div>

                  <div className="panel-status">
                    <span />
                    Professional Care
                  </div>
                </div>

                <div className="hero-visual-core">
                  <div className="core-ring core-ring-one" />
                  <div className="core-ring core-ring-two" />

                  <div className="diagnostic-emblem">
                    <div className="emblem-cross">
                      <span />
                      <span />
                    </div>
                    <ShieldCheck size={30} />
                  </div>

                  <div className="floating-card floating-card-one">
                    <div className="floating-icon blue">
                      <FlaskConical size={18} />
                    </div>
                    <div>
                      <strong>Laboratory</strong>
                      <span>Advanced testing</span>
                    </div>
                  </div>

                  <div className="floating-card floating-card-two">
                    <div className="floating-icon green">
                      <ScanLine size={18} />
                    </div>
                    <div>
                      <strong>Ultrasound</strong>
                      <span>Diagnostic imaging</span>
                    </div>
                  </div>

                  <div className="floating-card floating-card-three">
                    <div className="floating-icon red">
                      <HeartPulse size={18} />
                    </div>
                    <div>
                      <strong>Wellness</strong>
                      <span>Health screening</span>
                    </div>
                  </div>
                </div>

                <div className="hero-panel-bottom">
                  <div>
                    <strong>Laboratory</strong>
                    <span>Hematology · Chemistry · Microbiology</span>
                  </div>
                  <div>
                    <strong>Imaging</strong>
                    <span>Ultrasound Scan</span>
                  </div>
                  <div>
                    <strong>Wellness</strong>
                    <span>Preventive screening</span>
                  </div>
                </div>
              </div>

              <div className="hero-accent-line" />
            </div>
          </div>
        </section>

        {/* =========================================================
            TRUST STRIP
        ========================================================= */}
        <section className="trust-strip">
          <div className="page-container trust-strip-inner">
            <div className="trust-intro">
              <span>OUR COMMITMENT</span>
              <strong>Medical diagnostics built around quality.</strong>
            </div>

            {standards.map((item) => (
              <div className="trust-item" key={item.title}>
                <div className="trust-item-icon">{item.icon}</div>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================
            ABOUT
        ========================================================= */}
        <section className="about-premium section-light" id="about">
          <div className="page-container about-layout">
            <div className="section-intro">
              <span className="section-label">ABOUT PEFA</span>
              <h2>
                A modern diagnostic partner for
                <span>patients, clinicians and organisations.</span>
              </h2>
            </div>

            <div className="about-copy">
              <p className="lead-copy">
                PEFA Medical Diagnostic Services is a modern, patient-focused
                diagnostic centre committed to timely, affordable, accurate
                and precision-based laboratory and diagnostic services.
              </p>

              <p>
                Our service model combines professional expertise, modern
                medical technology and carefully structured diagnostic
                workflows to support patients and healthcare professionals
                with dependable laboratory information.
              </p>

              <div className="about-checks">
                <div>
                  <CheckCircle2 size={18} />
                  Professional diagnostic services
                </div>
                <div>
                  <CheckCircle2 size={18} />
                  Patient-focused experience
                </div>
                <div>
                  <CheckCircle2 size={18} />
                  Laboratory and imaging services
                </div>
                <div>
                  <CheckCircle2 size={18} />
                  Medical research support
                </div>
              </div>

              <a href="#services" className="text-link">
                Explore our services
                <ChevronRight size={17} />
              </a>
            </div>
          </div>
        </section>

        {/* =========================================================
            SERVICE CATEGORIES
        ========================================================= */}
        <section className="services-premium section-light" id="services">
          <div className="page-container">
            <div className="section-heading-premium">
              <div>
                <span className="section-label">WHAT WE OFFER</span>
                <h2>Comprehensive diagnostic services</h2>
                <p>
                  From routine investigations to specialised diagnostic
                  support, PEFA brings key services together in one
                  professional environment.
                </p>
              </div>

              <Link to="/test-request" className="outline-cta">
                Request a Test
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="service-premium-grid">
              {services.map((service) => {
                const card = (
                  <>
                    <div className={`service-premium-icon ${service.color}`}>
                      {service.icon}
                    </div>

                    <div className="service-card-content">
                      <span className="service-index">
                        {String(services.indexOf(service) + 1).padStart(2, "0")}
                      </span>

                      <h3>{service.title}</h3>
                      <p>{service.description}</p>

                      {service.link && (
                        <span className="service-card-link">
                          Explore package options
                          <ArrowRight size={15} />
                        </span>
                      )}
                    </div>
                  </>
                );

                return service.link ? (
                  <Link
                    key={service.title}
                    to={service.link}
                    className="service-premium-card service-link-card"
                  >
                    {card}
                  </Link>
                ) : (
                  <div key={service.title} className="service-premium-card">
                    {card}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================
            WELLNESS FEATURE
        ========================================================= */}
        <section className="wellness-feature">
          <div className="wellness-pattern" />

          <div className="page-container wellness-layout">
            <div className="wellness-content">
              <span className="section-label light-label">
                PEFA WELLNESS PACKAGES
              </span>

              <h2>
                Make preventive health
                <span>part of your routine.</span>
              </h2>

              <p>
                Explore our wellness screening packages, view the tests
                included in each package and place your request online.
              </p>

              <div className="wellness-points">
                <div>
                  <CheckCircle2 size={18} />
                  Package-based health screening
                </div>
                <div>
                  <CheckCircle2 size={18} />
                  Clear list of included tests
                </div>
                <div>
                  <CheckCircle2 size={18} />
                  Simple online ordering
                </div>
              </div>

              <Link to="/wellness-packages" className="wellness-cta">
                View Wellness Packages
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="wellness-visual">
              <div className="wellness-circle wellness-circle-large" />
              <div className="wellness-circle wellness-circle-small" />

              <div className="wellness-glass-card">
                <div className="wellness-card-icon">
                  <HeartPulse size={27} />
                </div>
                <span>PREVENTIVE CARE</span>
                <strong>Know your numbers.</strong>
                <p>Screen. Understand. Act early.</p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            HOW IT WORKS
        ========================================================= */}
        <section className="process-section section-light">
          <div className="page-container">
            <div className="section-heading-centre">
              <span className="section-label">A SIMPLE EXPERIENCE</span>
              <h2>From request to result</h2>
              <p>
                PEFA keeps the patient journey straightforward and
                professionally organised.
              </p>
            </div>

            <div className="process-grid">
              <div className="process-step">
                <span>01</span>
                <div className="process-icon">
                  <ClipboardListIcon />
                </div>
                <h3>Send your request</h3>
                <p>
                  Submit a test request online or contact us directly.
                </p>
              </div>

              <div className="process-connector" />

              <div className="process-step">
                <span>02</span>
                <div className="process-icon green">
                  <Stethoscope size={23} />
                </div>
                <h3>Receive professional service</h3>
                <p>
                  Our team reviews your request and guides the next step.
                </p>
              </div>

              <div className="process-connector" />

              <div className="process-step">
                <span>03</span>
                <div className="process-icon red">
                  <FileText size={23} />
                </div>
                <h3>Access your result</h3>
                <p>
                  Use the patient result portal when your report is ready.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            CTA
        ========================================================= */}
        <section className="final-cta">
          <div className="page-container final-cta-inner">
            <div>
              <span className="section-label light-label">READY WHEN YOU ARE</span>
              <h2>Quality diagnostics. Professional service.</h2>
              <p>
                Start your request today or speak with our team through
                WhatsApp.
              </p>
            </div>

            <div className="final-cta-actions">
              <Link to="/test-request" className="final-primary">
                Submit Test Request
                <ArrowRight size={18} />
              </Link>

              <a
                href="https://wa.me/2348086618621"
                target="_blank"
                rel="noopener noreferrer"
                className="final-secondary"
              >
                <MessageCircle size={18} />
                Book via WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* =========================================================
            CONTACT
        ========================================================= */}
        <section className="contact-premium section-light" id="contact">
          <div className="page-container">
            <div className="section-heading-premium contact-title">
              <div>
                <span className="section-label">CONTACT PEFA</span>
                <h2>We are here to help.</h2>
                <p>
                  Reach our team for diagnostic enquiries, test requests,
                  wellness screening and general service information.
                </p>
              </div>
            </div>

            <div className="contact-premium-grid">
              <div className="contact-premium-card">
                <div className="contact-premium-icon blue">
                  <MapPin size={21} />
                </div>
                <span>HEAD OFFICE</span>
                <strong>32, Ogunru-Ori, Pakuro Road</strong>
                <p>Beside Olaren Filling Station, Mowe, Ogun State, Nigeria.</p>
              </div>

              <div className="contact-premium-card">
                <div className="contact-premium-icon red">
                  <Phone size={21} />
                </div>
                <span>PHONE</span>
                <strong>08086618621</strong>
                <p>09052853701</p>
              </div>

              <div className="contact-premium-card">
                <div className="contact-premium-icon green">
                  <MessageCircle size={21} />
                </div>
                <span>WHATSAPP</span>
                <strong>08086618621</strong>
                <a
                  href="https://wa.me/2348086618621"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Start a conversation <ArrowRight size={15} />
                </a>
              </div>

              <div className="contact-premium-card">
                <div className="contact-premium-icon blue">
                  <Mail size={21} />
                </div>
                <span>EMAIL</span>
                <strong>pefa.medlab@gmail.com</strong>
                <p>General enquiries and service information.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="premium-footer">
        <div className="page-container footer-main">
          <div className="footer-brand">
            <img
              src="/logo.png"
              alt="PEFA Medical Diagnostic Services"
            />

            <div>
              <strong>PEFA MEDICAL DIAGNOSTIC SERVICES</strong>
              <span>Leading The Way In Medical Excellence</span>
            </div>
          </div>

          <div className="footer-links">
            <div>
              <span>QUICK LINKS</span>
              <Link to="/patient-results">Patient Result Portal</Link>
              <Link to="/test-request">Test Request</Link>
              <Link to="/wellness-packages">Wellness Packages</Link>
              <Link to="/login">Staff Login</Link>
            </div>

            <div>
              <span>SERVICES</span>
              <a href="#services">Laboratory Diagnostics</a>
              <a href="#services">Ultrasound Scan</a>
              <a href="#services">Blood Banking</a>
              <a href="#services">Research Services</a>
            </div>
          </div>
        </div>

        <div className="page-container footer-bottom">
          <span>© 2026 PEFA Medical Diagnostic Services. All Rights Reserved.</span>
          <span>Leading The Way In Medical Excellence</span>
        </div>
      </footer>
    </div>
  );
}

function ClipboardListIcon() {
  return <FileText size={23} />;
}
