import {
  useEffect,
  useState,
} from "react";

import {
  Package,
  AlertTriangle,
  Plus,
} from "lucide-react";

import "../styles/inventory.css";

import {
  logAudit,
} from "../utils/auditLogger";

import {
  supabase,
} from "../supabase";

export default function InventoryDashboard() {
  /* =========================
     STATES
  ========================= */

  const [
    inventory,
    setInventory,
  ] = useState([]);

const [
  search,
  setSearch,
] = useState("");

  const [
    form,
    setForm,
  ] = useState({
    item_name: "",

    category: "",

    quantity: "",

    unit: "",

    expiry_date: "",

    minimum_stock: "",

    supplier: "",
  });



  /* =========================
     LOAD INVENTORY
  ========================= */

  useEffect(() => {
    loadInventory();
  }, []);


  /* =========================
     STATUS ENGINE
  ========================= */

  const evaluateInventoryStatus =
    (
      quantity,
      minimumStock,
      expiryDate
    ) => {
      const today =
        new Date();

      const expiry =
        new Date(
          expiryDate
        );

      /* EXPIRED */

      if (
        expiryDate &&
        expiry < today
      ) {
        return "Expired";
      }

      /* LOW STOCK */

      if (
        Number(
          quantity
        ) <=
        Number(
          minimumStock
        )
      ) {
        return "Low Stock";
      }

      /* EXPIRING SOON */

      if (expiryDate) {
        const diffDays =
          (
            expiry -
            today
          ) /
          (
            1000 *
            60 *
            60 *
            24
          );

        if (
          diffDays <= 30
        ) {
          return "Expiring Soon";
        }
      }

      return "Available";
    };

  /* =========================
     LOAD DATA
  ========================= */

  const loadInventory =
    async () => {
      try {
        const {
          data,
          error,
        } = await supabase
          .from(
            "inventory"
          )
          .select("*")
          .order(
            "created_at",
            {
              ascending:
                false,
            }
          );

        if (error) {
          console.log(
            error
          );

          return;
        }

        const updated =
          data?.map(
            (item) => ({
              ...item,

              status:
                evaluateInventoryStatus(
                  item.quantity,

                  item.minimum_stock,

                  item.expiry_date
                ),
            })
          ) || [];

        setInventory(
          updated
        );
      } catch (error) {
        console.log(
          error
        );
      }
    };

  /* =========================
     ADD INVENTORY
  ========================= */

  const addItem =
    async () => {
      try {
        if (
          !form.item_name ||
          !form.quantity
        ) {
          alert(
            "Complete required fields"
          );

          return;
        }

        const status =
          evaluateInventoryStatus(
            form.quantity,

            form.minimum_stock,

            form.expiry_date
          );

const query =

  form.id

    ? supabase

        .from(
          "inventory"
        )

        .update({

          item_name:
            form.item_name,

          category:
            form.category,

          lot_number:
            form.lot_number,

          quantity:
            form.quantity,

          unit:
            form.unit,

          expiry_date:
            form.expiry_date,

          minimum_stock:
            form.minimum_stock,

          supplier:
            form.supplier,

          status,

        })

        .eq(
          "id",
          form.id
        )

    : supabase

        .from(
          "inventory"
        )

        .insert([
          {

            item_name:
              form.item_name,

            category:
              form.category,

            lot_number:
              form.lot_number,

            quantity:
              form.quantity,

            unit:
              form.unit,

            expiry_date:
              form.expiry_date,

            minimum_stock:
              form.minimum_stock,

            supplier:
              form.supplier,

            status,

          },
        ]);

const {
  error,
} = await query;

        if (error) {

  console.error(
    "Inventory Error:",
    error
  );

  alert(
    error.message
  );

  return;
}

if (form.id) {

  await logAudit({

    action:
      "UPDATE INVENTORY",

    module:
      "Inventory",

    description:
      form.item_name,

  });

} else {

  await logAudit({

    action:
      "ADD INVENTORY",

    module:
      "Inventory",

    description:
      form.item_name,

  });

}

await logAudit({

  action:
    "ADD INVENTORY",

  module:
    "Inventory",

  description:
    form.item_name,

});

       alert(

  form.id

    ? "Inventory updated successfully"

    : "Inventory added successfully"

);

        /* RESET */

        setForm({
          item_name: "",

          category: "",

          quantity: "",

          unit: "",

          expiry_date: "",

lot_number: "",

          minimum_stock: "",

          supplier: "",
        });

await supabase

  .from(
    "inventory_transactions"
  )

  .insert([

    {

      inventory_id:
        item.id,

      transaction_type:
        "Stock Out",

      quantity,

      reason:
        "Laboratory Usage",

      performed_by:

        JSON.parse(

          localStorage.getItem(
            "pefa_user"
          )

        )?.full_name,

    },

  ]);

        loadInventory();
      } catch (error) {
        console.log(
          error
        );
      }
    };

const totalItems =
  inventory.length;

const lowStock =
  inventory.filter(
    item =>
      item.status ===
      "Low Stock"
  ).length;

const expiringSoon =
  inventory.filter(
    item =>
      item.status ===
      "Expiring Soon"
  ).length;

const expired =
  inventory.filter(
    item =>
      item.status ===
      "Expired"
  ).length;

const filteredInventory =

  inventory.filter(
    (item) =>

      item.item_name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )

      ||

      item.category
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )

      ||

      item.supplier
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )

  );

const deleteItem =
  async (id) => {

    if (
      !window.confirm(
        "Delete this item?"
      )
    ) {
      return;
    }

    const {
      error,
    } = await supabase

      .from(
        "inventory"
      )

      .delete()

      .eq(
        "id",
        id
      );

    if (error) {

      alert(
        error.message
      );

      return;

    }

    loadInventory();

await logAudit({

  action:
    "DELETE INVENTORY",

  module:
    "Inventory",

  description:
    `Inventory ID ${id}`,

});

    alert(
      "Item Deleted"
    );

  };

const editItem =
  (item) => {

    setForm({

      item_name:
        item.item_name,

      category:
        item.category,

      lot_number:
        item.lot_number,

      quantity:
        item.quantity,

      unit:
        item.unit,

      expiry_date:
        item.expiry_date,

      minimum_stock:
        item.minimum_stock,

      supplier:
        item.supplier,

      id:
        item.id,

    });

  };

const stockOut =
  async (item) => {

    const quantity =
      prompt(
        "Quantity Used"
      );

    if (
      !quantity
    ) {
      return;
    }

    const newQuantity =

      Number(
        item.quantity
      ) -

      Number(
        quantity
      );

    if (
      newQuantity < 0
    ) {

      alert(
        "Insufficient Stock"
      );

      return;

    }

    const {
      error,
    } = await supabase

      .from(
        "inventory"
      )

      .update({

        quantity:
          newQuantity,

      })

      .eq(
        "id",
        item.id
      );

    if (error) {

      alert(
        error.message
      );

      return;

    }

    loadInventory();

  };

const stockIn =
  async (item) => {

    const quantity =
      prompt(
        "Quantity Received"
      );

    if (
      !quantity
    ) {
      return;
    }

    const newQuantity =

      Number(
        item.quantity
      ) +

      Number(
        quantity
      );

    const {
      error,
    } = await supabase

      .from(
        "inventory"
      )

      .update({

        quantity:
          newQuantity,

      })

      .eq(
        "id",
        item.id
      );

    if (error) {

      alert(
        error.message
      );

      return;

    }

    await supabase

      .from(
        "inventory_transactions"
      )

      .insert([

        {

          inventory_id:
            item.id,

          transaction_type:
            "Stock In",

          quantity,

          reason:
            "New Supply",

          performed_by:

            JSON.parse(

              localStorage.getItem(
                "pefa_user"
              )

            )?.full_name,

        },

      ]);

    await logAudit({

      action:
        "STOCK IN",

      module:
        "Inventory",

      description:
        `${item.item_name} - ${quantity}`,

    });

    loadInventory();

    alert(
      "Stock Added"
    );

  };

  return (

    <div className="inventory-page">
      {/* HEADER */}

      <div className="inventory-header">
        <div>
          <h1>
            Inventory
            Dashboard
          </h1>

          <p>
            Enterprise
            Reagent &
            Consumables
            Management
          </p>
        </div>

        <div className="inventory-badge">
          PEFA LIS
        </div>
      </div>

<div className="inventory-summary">

  <div className="summary-card">

    <h3>
      Total Items
    </h3>

    <p>
      {totalItems}
    </p>

  </div>

  <div className="summary-card">

    <h3>
      Low Stock
    </h3>

    <p>
      {lowStock}
    </p>

  </div>

  <div className="summary-card">

    <h3>
      Expiring Soon
    </h3>

    <p>
      {expiringSoon}
    </p>

  </div>

  <div className="summary-card">

    <h3>
      Expired
    </h3>

    <p>
      {expired}
    </p>

  </div>

</div>

      {/* FORM */}

      <div className="inventory-card">
        <div className="inventory-grid">
          <input
            type="text"
            placeholder="Item Name"
            value={
              form.item_name
            }
            onChange={(e) =>
              setForm({
                ...form,

                item_name:
                  e.target
                    .value,
              })
            }
          />

          <select
  value={form.category}
  onChange={(e) =>
    setForm({
      ...form,
      category:
        e.target.value,
    })
  }
>

  <option value="">
    Select Category
  </option>

  <option>
    Reagent
  </option>

  <option>
    Test Kit
  </option>

  <option>
    Control
  </option>

  <option>
    Calibrator
  </option>

  <option>
    Consumable
  </option>

  <option>
    Equipment
  </option>

</select>

<input
  type="text"
  placeholder="Lot Number"
  value={
    form.lot_number
  }
  onChange={(e) =>
    setForm({
      ...form,
      lot_number:
        e.target.value,
    })
  }
/>

          <input
            type="number"
            placeholder="Quantity"
            value={
              form.quantity
            }
            onChange={(e) =>
              setForm({
                ...form,

                quantity:
                  e.target
                    .value,
              })
            }
          />

          <input
            type="text"
            placeholder="Unit"
            value={form.unit}
            onChange={(e) =>
              setForm({
                ...form,

                unit: e.target
                  .value,
              })
            }
          />

          <input
            type="date"
            value={
              form.expiry_date
            }
            onChange={(e) =>
              setForm({
                ...form,

                expiry_date:
                  e.target
                    .value,
              })
            }
          />

          <input
            type="number"
            placeholder="Minimum Stock"
            value={
              form.minimum_stock
            }
            onChange={(e) =>
              setForm({
                ...form,

                minimum_stock:
                  e.target
                    .value,
              })
            }
          />

          <input
            type="text"
            placeholder="Supplier"
            value={
              form.supplier
            }
            onChange={(e) =>
              setForm({
                ...form,

                supplier:
                  e.target
                    .value,
              })
            }
          />
        </div>

        {/* BUTTON */}

        <button
          className="inventory-btn"
          onClick={addItem}
        >
          <Plus size={18} />

         {
  form.id

    ? "Update Inventory"

    : "Add Inventory"
}
        </button>
      </div>

<div
  className="inventory-search"
>

  <input
    type="text"
    placeholder="Search Item, Category or Supplier..."
    value={search}
    onChange={(e) =>
      setSearch(
        e.target.value
      )
    }
  />

</div>

      {/* TABLE */}

      <div className="inventory-table">
        <table>
          <thead>
            <tr>
              <th>
                Item
              </th>

              <th>
                Category
              </th>

              <th>
                Quantity
              </th>

              <th>
                Expiry Date
              </th>

              <th>
                Supplier
              </th>

              <th>
                Status
              </th>
<th>
  Action
</th>
            </tr>
          </thead>

          <tbody>
           {filteredInventory.map(
              (item) => (
                <tr
                  key={
                    item.id
                  }
                >
                  <td>
                    {
                      item.item_name
                    }
                  </td>

                  <td>
                    {
                      item.category
                    }
                  </td>

                  <td>
                    {
                      item.quantity
                    }{" "}
                    {
                      item.unit
                    }
                  </td>

                  <td>
                    {
                      item.expiry_date
                    }
                  </td>

                  <td>
                    {
                      item.supplier
                    }
                  </td>

                  <td>
                    <span
                      className={`inventory-status ${
                        item.status ===
                        "Low Stock"
                          ? "low-stock"
                          : item.status ===
                              "Expiring Soon"
                            ? "expiring-stock"
                            : item.status ===
                                "Expired"
                              ? "expired-stock"
                              : "available-stock"
                      }`}
                    >
                      {item.status ===
                      "Available" ? (
                        <Package
                          size={14}
                        />
                      ) : (
                        <AlertTriangle
                          size={14}
                        />
                      )}

                      {
                        item.status
                      }
                    </span>
                  </td>
<td>

  <div
  className="action-buttons"
>

  <button
    className="edit-btn"
    onClick={() =>
      editItem(item)
    }
  >

    Edit

  </button>

  <button
    className="delete-btn"
    onClick={() =>
      deleteItem(
        item.id
      )
    }
  >

    Delete

  </button>

<button
  className="stock-btn"
  onClick={() =>
    stockOut(item)
  }
>

  Stock Out

</button>

<button
  className="stockin-btn"
  onClick={() =>
    stockIn(item)
  }
>

  Stock In

</button>

</div>

</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}