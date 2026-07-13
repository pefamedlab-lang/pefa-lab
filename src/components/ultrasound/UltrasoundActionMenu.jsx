import {

  MoreVertical,
  Eye,
  Pencil,
  Printer,
  Download,
  CheckCircle,
  Trash2,

} from "lucide-react";

import {

  useState,
  useRef,
  useEffect,

} from "react";

export default function UltrasoundActionMenu({

  onView,

  onEdit,

  onPrint,

  onDownload,

  onRelease,

  onDelete,

  canDelete = false,

}) {

  const [

    open,

    setOpen,

  ] = useState(false);

  const menuRef =

    useRef(null);

  /* ==========================
     OUTSIDE CLICK
  ========================== */

  useEffect(() => {

    const handleClick = (

      e

    ) => {

      if (

        menuRef.current &&

        !menuRef.current.contains(

          e.target

        )

      ) {

        setOpen(false);

      }

    };

    document.addEventListener(

      "mousedown",

      handleClick

    );

    return () =>

      document.removeEventListener(

        "mousedown",

        handleClick

      );

  }, []);

  return (

    <div

      className="ultrasound-action-menu"

      ref={menuRef}

    >

      <button

        className="action-trigger"

        onClick={()=>

          setOpen(

            !open

          )

        }

      >

        <MoreVertical size={18} />

      </button>

      {open && (

        <div className="action-dropdown">

          <button

            onClick={() => {

              onView?.();

              setOpen(false);

            }}

          >

            <Eye size={16} />

            View Report

          </button>

          <button

            onClick={() => {

              onEdit?.();

              setOpen(false);

            }}

          >

            <Pencil size={16} />

            Edit Report

          </button>

          <button

            onClick={() => {

              onPrint?.();

              setOpen(false);

            }}

          >

            <Printer size={16} />

            Print Report

          </button>

          <button

            onClick={() => {

              onDownload?.();

              setOpen(false);

            }}

          >

            <Download size={16} />

            Download PDF

          </button>

          <button

            onClick={() => {

              onRelease?.();

              setOpen(false);

            }}

          >

            <CheckCircle size={16} />

            Release Report

          </button>

          {canDelete && (

            <button

              className="delete-action"

              onClick={() => {

                onDelete?.();

                setOpen(false);

              }}

            >

              <Trash2 size={16} />

              Delete Report

            </button>

          )}

        </div>

      )}

    </div>

  );

}