const express = require("express")
const router = express.Router();
const viewContoller = require("../controllers/viewsController")

router.get("/", viewContoller.getOverview)

router.get("/tour/:slug", viewContoller.getTour)
router.get("/login", viewContoller.getLoginForm)

module.exports = router;

