const express = require("express");

const router = express.Router();

const userController = require("../controllers/userController")
const authController = require("../controllers/authController")

router.post("/signup", authController.signup)
router.post("/login", authController.login)

router.post("/forgot-password", authController.forgotPassword)
router.patch("/reset-password/:token", authController.resetPassword)

//protect all routes that come after this middleware
router.use(authController.protect)

router.patch("/update-me",
    userController.updateMe
)

router.delete("/delete-me",
    authController.restrictTo("user"),
    userController.deleteMe
)

router.get("/me",
    //this middleware injects user id into the params
    userController.getMe,
    userController.getUser

)

//RestrictTo("admin") all routes that come after this middleware
router.use(authController.restrictTo("admin"))

router.route("/")
    .get(userController.getAllUsers)
    .post(userController.createUser);

router.route("/:id")
    .get(
        // authController.restrictTo("admin"),
        userController.getUser,
    )
    .patch(
        userController.updateUser
    )
    .delete(
        userController.deleteUser
    )



module.exports = router;
