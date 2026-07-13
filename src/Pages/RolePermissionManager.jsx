
import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function RolePermissionManager() {

  const user =
    JSON.parse(
      localStorage.getItem(
        "pefa_user"
      )
    ) || {};

  const [permissions, setPermissions] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {

    loadPermissions();

  }, []);

  const loadPermissions =
    async () => {

      const { data, error } =
        await supabase

          .from(
            "role_permissions"
          )

          .select("*")

          .order(
            "role",
            {
              ascending: true,
            }
          );

      if (error) {

        console.log(error);

        return;

      }

      setPermissions(
        data || []
      );

    };

  const updatePermission =
    async (
      id,
      field,
      value
    ) => {

      setLoading(true);

      const { error } =
        await supabase

          .from(
            "role_permissions"
          )

          .update({
            [field]: value,
          })

          .eq(
            "id",
            id
          );

      if (error) {

        alert(
          error.message
        );

      }

      loadPermissions();

      setLoading(false);

    };

  if (
    ![
      "Admin",
      "Director",
    ].includes(
      user.role
    )
  ) {

    return (

      <div className="page">

        <h2>
          Access Denied
        </h2>

        <p>
          Only Admin and Director
          can manage permissions.
        </p>

      </div>

    );

  }

  return (

    <div className="page">

      <div className="test-header">

        <div>

          <h1>
            Role Permission Manager
          </h1>

          <p>
            Manage system access
            by role.
          </p>

        </div>

      </div>

      <table
        className="staff-table"
      >

        <thead>

          <tr>

            <th>
              Role
            </th>

            <th>
              Module
            </th>

            <th>
              View
            </th>

            <th>
              Create
            </th>

            <th>
              Edit
            </th>

            <th>
              Delete
            </th>

          </tr>

        </thead>

        <tbody>

          {permissions.map(
            (item) => (

              <tr
                key={item.id}
              >

                <td>
                  {item.role}
                </td>

                <td>
                  {item.module}
                </td>

                <td>

                  <input
                    type="checkbox"
                    checked={
                      item.can_view
                    }
                    onChange={(e) =>
                      updatePermission(
                        item.id,
                        "can_view",
                        e.target.checked
                      )
                    }
                  />

                </td>

                <td>

                  <input
                    type="checkbox"
                    checked={
                      item.can_create
                    }
                    onChange={(e) =>
                      updatePermission(
                        item.id,
                        "can_create",
                        e.target.checked
                      )
                    }
                  />

                </td>

                <td>

                  <input
                    type="checkbox"
                    checked={
                      item.can_edit
                    }
                    onChange={(e) =>
                      updatePermission(
                        item.id,
                        "can_edit",
                        e.target.checked
                      )
                    }
                  />

                </td>

                <td>

                  <input
                    type="checkbox"
                    checked={
                      item.can_delete
                    }
                    onChange={(e) =>
                      updatePermission(
                        item.id,
                        "can_delete",
                        e.target.checked
                      )
                    }
                  />

                </td>

              </tr>

            )
          )}

        </tbody>

      </table>

      {loading && (

        <p>
          Updating...
        </p>

      )}

    </div>

  );

}
