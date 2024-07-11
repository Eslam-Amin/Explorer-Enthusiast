const express = require("express");

//to merge params from another router to this router
const router = express.Router({ mergeParams: true });

const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController")


router.use(authController.protect)

router.route("/")
    .get(
        reviewController.getAllReviews
    )
    .post(
        authController.restrictTo("user"),
        reviewController.setTourAndUserIdsInReq,
        reviewController.createReview
    )

router.route("/:id")
    .get(
        reviewController.getReview
    )
    .delete(
        authController.restrictTo("admin", "user"),
        reviewController.deleteReview
    )
    .patch(
        authController.restrictTo("user", "admin"),
        reviewController.updateReview
    )
module.exports = router