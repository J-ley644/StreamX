const express = require("express");

const controller = require("./admin.controller");

const {
    requireAuth,
    requireAdmin
} = require("../../middleware/auth.middleware");

const router = express.Router();

router.get(
    "/dashboard",
    requireAuth,
    requireAdmin,
    controller.getDashboard
);

module.exports = router;