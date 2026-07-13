import {

  Scan,

  Baby,

  Heart,

  Activity,

  Shield,

  Droplets,

  Circle,

  Brain,

  Stethoscope,

  User,

  Box,

} from "lucide-react";

const templates = [

  {
    label: "OBS Scan",
    value: "obs_scan",
    icon: Baby,
  },

  {
    label: "Pelvic Scan",
    value: "pelvic_scan",
    icon: User,
  },

  {
    label: "Abdominal Scan",
    value: "abdominal_scan",
    icon: Activity,
  },

  {
    label: "Abdomino-Pelvic Scan",
    value: "abdomino_pelvic_scan",
    icon: Scan,
  },

  {
    label: "Breast Scan",
    value: "breast_scan",
    icon: Heart,
  },

  {
    label: "Scrotal Scan",
    value: "scrotal_scan",
    icon: Shield,
  },

  {
    label: "Kidney Scan",
    value: "kidney_scan",
    icon: Droplets,
  },

  {
    label: "Liver Scan",
    value: "liver_scan",
    icon: Circle,
  },

  {
    label: "Thyroid Scan",
    value: "thyroid_scan",
    icon: Brain,
  },

  {
    label: "Prostate Scan",
    value: "prostate_scan",
    icon: Stethoscope,
  },

  {
    label: "Soft Tissue Scan",
    value: "soft_tissue_scan",
    icon: Box,
  },

];

export default function UltrasoundTemplateSelector({

  value,

  onChange,

}) {

  return (

    <div className="ultrasound-template-grid">

      {templates.map((item) => {

        const Icon = item.icon;

        return (

          <button

            key={item.value}

            type="button"

            className={`ultrasound-template-card ${
              value === item.value
                ? "active"
                : ""
            }`}

            onClick={() =>
              onChange(item.value)
            }

          >

            <Icon size={30} />

            <span>

              {item.label}

            </span>

          </button>

        );

      })}

    </div>

  );

}