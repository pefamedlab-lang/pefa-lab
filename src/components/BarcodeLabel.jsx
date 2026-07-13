import Barcode from "react-barcode";

export default function BarcodeLabel({

  value,

  title,

}) {

  return (

    <div
      className="barcode-label"
    >

      <h4>
        {title}
      </h4>

      <Barcode
        value={value}
        width={2}
        height={50}
        fontSize={14}
      />

    </div>

  );

}