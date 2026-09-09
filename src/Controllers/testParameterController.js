import pool from "../config/db.js";

export const getTestParameters = async (req, res) => {

    try {

        const { test } = req.params;

        const { rows } = await pool.query(

            `
            SELECT
                parameter_name,
                unit,
                reference_range,
                low_limit,
                high_limit,
                display_order
            FROM test_parameters
            WHERE test_name = $1
            AND status='Active'
            ORDER BY display_order
            `,
            [test]
        );

        res.json(rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to load parameters",
        });

    }

};