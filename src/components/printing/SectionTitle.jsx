export default function SectionTitle({

  title,

  color = "primary",

  uppercase = true,

}) {

  return (

    <div className={`section-title ${color}`}>

      <span className="section-title-dot" />

      <span className="section-title-text">

        {uppercase

          ? title.toUpperCase()

          : title}

      </span>

      <div className="section-title-line" />

    </div>

  );

}