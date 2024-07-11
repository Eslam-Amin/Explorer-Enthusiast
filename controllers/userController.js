const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const User = require("./../models/userModel")
const factory = require("./handlerFactory")

const createUser = (req, res) => {
    res.status(500).json({
        status: "error",
        message: "This route is not Defined! use /signup instead, Please"
    })
}

const filterByObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el))
            newObj[el] = obj[el];
    })
    return newObj;
}

const updateMe = catchAsync(async (req, res, next) => {
    //create error if user POSTs password data
    if (req.body.password || req.body.confirmPassowrd)
        return next(new AppError("this route is not for password updates."
            , 400))

    //fitlered out unwanted fields 
    const filterBody = filterByObj(req.body, "name", "email")

    //update user document
    const user = await User.findByIdAndUpdate(req.user.id, filterBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: "success",
        user
    })
})
const getMe = (req, res, next) => {
    req.params.id = req.user.id
    next()
}

const getAllUsers = factory.getAll(User)

const getUser = factory.getOne(User)

//Don't Update Password with this
const updateUser = factory.updateOne(User);

//if a user deletes himself, he de-activates his account 
const deleteMe = factory.deleteOne(User)

//if admin deletes a user, the user is deleted permentaly
const deleteUser = factory.deleteOne(User, "hard_delete")


module.exports = {
    createUser,
    getAllUsers, getUser,
    updateUser, deleteUser,
    updateMe, deleteMe,
    getMe
}