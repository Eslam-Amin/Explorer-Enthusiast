const { promisify } = require("util");
const crypto = require("crypto")
const jwt = require("jsonwebtoken");

const User = require("./../models/userModel");
const catchAsync = require("../utils/catchAsync")
const AppError = require("./../utils/appError")
const sendEmail = require("./../utils/email")

const signToken = id => {
    return jwt.sign({
        id
    },
        //secret
        process.env.JWT_SEC,
        {
            //options
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    )

}


const createSendToken = (user, statusCode, res) => {
    const cookieOptions = {
        expires: new Date(Date.now() +
            process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        // secure: true,
        httpOnly: true
    }
    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

    const token = signToken(user._id);

    res.cookie("jwt", token, cookieOptions)



    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user
        }
    })
}
const signup = catchAsync(async (req, res, next) => {

    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
    });
    user.password = undefined
    createSendToken(user, 201, res);
})

const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    //check if email and password exist
    if (!email || !password)
        return next(new AppError("Please provide email and password!", 400))

    //check if the user exists && password is correct
    const user = await User.findOne({ email }).select("+password");

    if (!user || !await user.validPassword(password, user.password))
        return next(new AppError("incorrect email or password", 401));

    //if everything is ok, send token to client
    const token = signToken(user._id);
    res.status(200).json({
        status: "success",
        token
    })
})

const protect = catchAsync(async (req, res, next) => {
    let token = ""
    //getting token and check of it's there
    if (req.headers.authorization
        && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token)
        return next(new AppError(
            "You're not Logged in! Please Log in to get Access", 401
        ));
    //token verification
    //const decoded = await promisify()
    const decoded = jwt.verify(token, process.env.JWT_SEC)

    //check if the user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser)
        return next(new AppError("The user belonging to this token no longer exist", 404))

    //check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat))
        return next(new AppError("User Recently changed password! Please Login again.", 401));

    //GRANT access to protected route
    req.user = currentUser;
    next()
})


const restrictTo = (...roles) => {
    return (req, res, next) => {
        //roles ["admin", "lead-guide"] role="user"
        if (!roles.includes(req.user.role))
            return next(new AppError("you don't have premission to perform this action", 403))
        next();

    }
}

const forgotPassword = catchAsync(async (req, res, next) => {
    //get user based on POSTed  email
    const user = await User.findOne({ email: req.body.email })
    if (!user)
        return next(new AppError("there is no user with email address", 404))

    //generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    //send it to user's email
    const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/reset-password/${resetToken}`;


    const message = `forgot your password? submit a PATCH 
    reqtuest with your new password and passsword confirtm to: ${resetURL}
    \n and if you didn't forget your password, please ignore this email!`
    try {

        await sendEmail({
            email: user.email,
            subject: "reset your password token (valid for  10min)",
            message
        })

        res.status(200).json({
            status: "success",
            message: "token sent to email!"
        })
    }
    catch (err) {
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        await user.save({ validateBeforeSave: false });
        return next(new AppError("there was an error sending the mail, try again", 500));
    }


})

const resetPassword = catchAsync(async (req, res, next) => {
    //get user based on the token
    const hashedToken = crypto.createHash("sha256")
        .update(req.params.token)
        .digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {
            $gt:
                Date.now()
        }
    })

    //if the token not expired, and there is the user, set the new password
    if (!user)
        return next(new AppError("token invalid or has expired", 400))


    //update changePasswordAt property for the User
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetExpires = undefined
    user.passwordResetToken = undefined
    await user.save();

    // log the user in, send JWT to the client
    const token = signToken(user._id)

    res.status(200).json({
        status: "success",
        token
    })
})

module.exports = {
    signup, login,
    protect, restrictTo,
    forgotPassword, resetPassword
}