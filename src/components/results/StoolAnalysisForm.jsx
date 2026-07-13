import { useState } from "react";

export default function StoolAnalysisForm({

  resultData,

  setResultData,

}) {
const [
  form,
  setForm,
] = useState({

  colour: "",

  consistency: "",

  mucus: "",

  blood: "",

  occultBlood: "",

  adultWorm: "",

  pusCells: "",

  rbcs: "",

  yeastCells: "",

  ova: "",

  cysts: "",

  parasites: "",

parasiteType: "",

  scientistRemark: "",

  showRemark: false,

});

const updateForm =
(
  field,
  value
) => {

  const updated = {

    ...form,

    [field]:
      value,

  };

  setForm(
    updated
  );

  if (
    setResultData
  ) {

    setResultData({

      ...updated,

      interpretation:
        autoComment,

    });

  }

};

let autoComment =

  "No ova, cysts or parasites seen.";

if (
  form.ova === "Seen"
) {

  autoComment =
    "Ova detected in stool specimen.";

}

if (
  form.cysts === "Seen"
) {

  autoComment =
    "Cysts detected in stool specimen.";

}

if (
  form.parasites === "Seen"
) {

  autoComment =

    form.parasiteType

      ?

      `Parasitic elements observed: ${form.parasiteType}.`

      :

      "Parasitic elements observed.";

}

if (
  form.occultBlood ===
  "Positive"
) {

  autoComment +=
    " Occult blood detected.";

}

if (
  form.adultWorm ===
  "Seen"
) {

  autoComment +=
    " Adult worm observed.";

}

 

  return (

    <div>

      <h3>
        Stool Analysis
      </h3>

<h4>
  Macroscopy
</h4>

<select
  value={
    form.colour
  }
  onChange={(e)=>

    updateForm(
      "colour",
      e.target.value
    )

  }
>

  <option>
    Brown
  </option>

  <option>
    Yellow
  </option>

  <option>
    Green
  </option>

  <option>
    Black
  </option>

</select>

<select
  value={
    form.consistency
  }
 onChange={(e)=>
  updateForm(
    "consistency",
    e.target.value
  )
}
>

  <option>
    Formed
  </option>

  <option>
    Soft
  </option>

  <option>
    Loose
  </option>

  <option>
    Watery
  </option>

</select>

<select

  value={
    form.mucus
  }

  onChange={(e)=>

    updateForm(
      "mucus",
      e.target.value
    )

  }

>

  <option value="">
    Mucus
  </option>

  <option>
    Nil
  </option>

  <option>
    Present
  </option>

</select>

<select

  value={
    form.blood
  }

  onChange={(e)=>

    updateForm(
      "blood",
      e.target.value
    )

  }

>

  <option value="">
    Blood
  </option>

  <option>
    Nil
  </option>

  <option>
    Present
  </option>

</select>

<select

  value={
    form.occultBlood
  }

  onChange={(e)=>

    updateForm(
      "occultBlood",
      e.target.value
    )

  }

>

  <option value="">
    Occult Blood
  </option>

  <option>
    Negative
  </option>

  <option>
    Positive
  </option>

</select>

<select

  value={
    form.adultWorm
  }

  onChange={(e)=>

    updateForm(
      "adultWorm",
      e.target.value
    )

  }

>

  <option value="">
    Adult Worm
  </option>

  <option>
    Not Seen
  </option>

  <option>
    Seen
  </option>

</select>



<h4>
  Microscopy
</h4>

<div className="micro-grid">

  <select

    value={
      form.pusCells
    }

    onChange={(e)=>

      updateForm(
        "pusCells",
        e.target.value
      )

    }

  >

    <option value="">
      Pus Cells
    </option>

    <option>
      Nil
    </option>

    <option>
      Few
    </option>

    <option>
      Moderate
    </option>

    <option>
      Numerous
    </option>

  </select>

  <select

    value={
      form.rbcs
    }

    onChange={(e)=>

      updateForm(
        "rbcs",
        e.target.value
      )

    }

  >

    <option value="">
      RBCs
    </option>

    <option>
      Nil
    </option>

    <option>
      Few
    </option>

    <option>
      Moderate
    </option>

    <option>
      Numerous
    </option>

  </select>

  <select

    value={
      form.yeastCells
    }

    onChange={(e)=>

      updateForm(
        "yeastCells",
        e.target.value
      )

    }

  >

    <option value="">
      Yeast Cells
    </option>

    <option>
      Not Seen
    </option>

    <option>
      Seen
    </option>

  </select>

  <select

    value={
      form.ova
    }

    onChange={(e)=>

      updateForm(
        "ova",
        e.target.value
      )

    }

  >

    <option value="">
      Ova
    </option>

    <option>
      Not Seen
    </option>

    <option>
      Seen
    </option>

  </select>

  <select

    value={
      form.cysts
    }

    onChange={(e)=>

      updateForm(
        "cysts",
        e.target.value
      )

    }

  >

    <option value="">
      Cysts
    </option>

    <option>
      Not Seen
    </option>

    <option>
      Seen
    </option>

  </select>

  <select

    value={
      form.parasites
    }

    onChange={(e)=>

      updateForm(
        "parasites",
        e.target.value
      )

    }

  >

    <option value="">
      Parasites
    </option>

    <option>
      Not Seen
    </option>

    <option>
      Seen
    </option>

  </select>

</div>
   
{
  form.parasites ===
  "Seen" && (

    <input

      placeholder="Specify Parasite (e.g. Ascaris lumbricoides)"

      value={
        form.parasiteType || ""
      }

      onChange={(e)=>

        updateForm(
          "parasiteType",
          e.target.value
        )

      }

    />

  )
}



<h4>
  Auto Interpretation
</h4>

<textarea

  className="comment-box"

  value={
    autoComment
  }

  readOnly

/>

<div
  className="remark-toggle"
>

  <label>

    <input

      type="checkbox"

      checked={
        form.showRemark
      }

      onChange={(e)=>

        updateForm(
          "showRemark",
          e.target.checked
        )

      }

    />

    Add Scientist Remark

  </label>

</div>

{
  form.showRemark && (

    <textarea

      className="comment-box"

      placeholder="Scientist Remark"

      value={
        form.scientistRemark
      }

      onChange={(e)=>

        updateForm(
          "scientistRemark",
          e.target.value
        )

      }

    />

  )
}


    </div>

  );

}