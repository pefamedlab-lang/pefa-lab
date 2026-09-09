import {
  FileText,
  Clock3,
  CheckCircle2,
  CalendarDays,
  AlertTriangle,
} from "lucide-react";

export default function UltrasoundStatsCards({
  records = [],
}) {
  /* =====================================
      TODAY
  ===================================== */

  const today = new Date().toDateString();

  /* =====================================
      TOTAL SCANS
  ===================================== */

  const totalScans = records.length;

  /* =====================================
      PENDING REPORTS
  ===================================== */

  const pendingScans = records.filter((item) => {
    return (
      item.release_status === "Pending" ||
      item.report_status === "Pending"
    );
  }).length;

  /* =====================================
      RELEASED REPORTS
  ===================================== */

  const releasedScans = records.filter((item) => {
    return (
      item.release_status === "Released" ||
      item.report_status === "Released"
    );
  }).length;

  /* =====================================
      TODAY'S SCANS
  ===================================== */

  const todayScans = records.filter((item) => {
    if (!item.created_at) {
      return false;
    }

    return (
      new Date(item.created_at).toDateString() === today
    );
  }).length;

  /* =====================================
      URGENT CASES
  ===================================== */

  const urgentCases = records.filter((item) => {
    return (
      String(item.priority || "").toLowerCase() ===
      "urgent"
    );
  }).length;

  /* =====================================
      KPI CARDS
  ===================================== */

  const cards = [
    {
      title: "Total Scans",
      value: totalScans,
      icon: FileText,
      className: "card-blue",
    },
    {
      title: "Pending Reports",
      value: pendingScans,
      icon: Clock3,
      className: "card-orange",
    },
    {
      title: "Released Reports",
      value: releasedScans,
      icon: CheckCircle2,
      className: "card-green",
    },
    {
      title: "Today's Scans",
      value: todayScans,
      icon: CalendarDays,
      className: "card-purple",
    },
    {
      title: "Urgent Cases",
      value: urgentCases,
      icon: AlertTriangle,
      className: "card-red",
    },
  ];

  /* =====================================
      RENDER
  ===================================== */

  return (
    <div className="ultrasound-kpi-grid">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className={`ultrasound-kpi-card ${card.className}`}
          >
            <div className="kpi-icon">
              <Icon size={28} />
            </div>

            <div className="kpi-content">
              <h2>{card.value}</h2>

              <p>{card.title}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}