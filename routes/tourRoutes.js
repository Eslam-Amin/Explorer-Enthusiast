const express = require("express");
const router = express.Router();

const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController")
const reviewRouter = require("../routes/reviewRoutes")

// router.param("id", tourController.checkID)



router.route("/tour-stats")
    .get(tourController.getTourStats)

router.route("/monthly-plan/:year")
    .get(
        authController.protect,
        authController.restrictTo("admin", "guide", "lead-guide"),
        tourController.getMonthlyPlan
    )


router.route("/tours-within/:distance/center/:latlng/unit/:unit")
    .get(
        tourController.getToursWithin
    )

router.route("/distances/:latlng/unit/:unit")
    .get(
        tourController.getDistances
    )

router.route("/top-5-cheap")
    .get(
        //injects limit to 5 in query params, and sort them by price
        tourController.aliasTopTours,
        tourController.getAllTours
    )

router.route("/")
    .get(
        tourController.getAllTours
    )
    .post(
        authController.protect,
        authController.restrictTo("admin", "lead-guide"),
        tourController.createTour
    );

router.route("/:id")
    .get(tourController.getTour)
    .patch(
        authController.protect,
        authController.restrictTo("admin", "lead-guide"),
        tourController.updateTour
    )
    .delete(
        authController.protect,
        authController.restrictTo("admin", "lead-guide"),
        tourController.deleteTour);


//this was wrong because reviews belongs to review router to we used mergeParams
// router.route("/:tourId/reviews")
//     .post(
//         authController.protect,
//         authController.restrictTo("user"),
//         reviewController.createReview
//     )
//     .get(
//         authController.protect,
//         authController.restrictTo("user"),
//         reviewController.createReview
//     )

router.use('/:tourId/reviews', reviewRouter)


module.exports = router;