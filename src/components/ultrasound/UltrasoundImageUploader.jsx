import {

  useState,

} from "react";

import {

  Upload,
  Trash2,
  Image as ImageIcon,

} from "lucide-react";

import {

  supabase,

} from "../../supabase";

export default function UltrasoundImageUploader({

  images = [],

  onChange,

}) {

  const [

    uploading,

    setUploading,

  ] = useState(false);

  /* ==========================
     UPLOAD IMAGES
  ========================== */

  const uploadImages = async (

    e

  ) => {

    const files =

      Array.from(

        e.target.files || []

      );

    if (

      files.length === 0

    ) return;

    setUploading(true);

    try {

      const uploaded = [];

      for (

        const file of files

      ) {

        const fileName =

          `ultrasound/${
            Date.now()
          }-${
            file.name
          }`;

        const {

          error,

        } = await supabase

          .storage

          .from(

            "radiology"

          )

          .upload(

            fileName,

            file,

            {

              upsert:true,

            }

          );

        if (error)

          throw error;

        const {

          data,

        } = supabase

          .storage

          .from(

            "radiology"

          )

          .getPublicUrl(

            fileName

          );

        uploaded.push(

          data.publicUrl

        );

      }

      onChange([

        ...images,

        ...uploaded,

      ]);

    }

    catch (error) {

      console.log(error);

      alert(

        error.message

      );

    }

    finally {

      setUploading(false);

    }

  };

  /* ==========================
     DELETE IMAGE
  ========================== */

  const removeImage = (

    index

  ) => {

    onChange(

      images.filter(

        (_,

        i) =>

          i !== index

      )

    );

  };

  return (

    <div className="ultrasound-image-section">

      {/* HEADER */}

      <div className="image-header">

        <ImageIcon size={22} />

        <h3>

          Ultrasound Images

        </h3>

      </div>

      {/* UPLOAD */}

      <label className="image-upload-box">

        <Upload size={30} />

        <span>

          {

            uploading

              ? "Uploading..."

              : "Upload Ultrasound Images"

          }

        </span>

        <input

          type="file"

          multiple

          accept="image/*"

          hidden

          onChange={

            uploadImages

          }

        />

      </label>

      {/* PREVIEW */}

      <div className="image-preview-grid">

        {images.map(

          (

            image,

            index

          ) => (

            <div

              key={index}

              className="preview-card"

            >

              <img

                src={image}

                alt={`scan-${index}`}

              />

              <button

                type="button"

                onClick={()=>

                  removeImage(

                    index

                  )

                }

              >

                <Trash2

                  size={16}

                />

              </button>

            </div>

          )

        )}

      </div>

    </div>

  );

}