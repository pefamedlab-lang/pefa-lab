import express from "express";

import {
    getTestParameters,
} from "../controllers/testParameterController.js";

const router = express.Router();

router.get(
    "/:test",
    getTestParameters
);

export default router;