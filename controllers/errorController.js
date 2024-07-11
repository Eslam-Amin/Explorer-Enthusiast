const AppError = require("../utils/appError");

const sendErrorDev = (err, res, next) => {

    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    })
}

const sendErrorProd = (err, res) => {
    //Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        })
    }

    //Programming or other unknown error: don't leak error details
    else {
        //1) log error
        console.log("💥error", err);

        //2) send generic error
        res.status(500).json({
            status: "error",
            message: "Something Went very Wrong"
        })
    }
}

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`
    return new AppError(message, 400)
}

const handleDuplicatedFieldsDB = err => {
    let value = err.errmsg.match(/(["'])(\\?.)*?\1/);
    value = value[0].slice(1, value[0].length - 1)
    const message = `Dulicate Field Value: ${value}, Please use Another Value`
    return new AppError(message, 400);
}


const handleValidationError = err => {
    const errors = Object.values(err.errors).map(el => {
        return el.message
    })
    const message = `Invalid Input Data ${errors.join(". ")}`
    return new AppError(message, 400)
}

handleJwtError = () => new AppError("Invalid Token, Please Login Again.", 401)

handleExpiredJwtError = () => new AppError("Token Expired, Please Login Again.", 401)

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    if (process.env.NODE_ENV.trim() === "development") {
        sendErrorDev(err, res)
    } else if (process.env.NODE_ENV.trim() === "production") {
        let error = { ...err };
        if (err.name === "CastError")
            error = handleCastErrorDB(err)
        if (err.code === 11000)
            error = handleDuplicatedFieldsDB(err);
        if (err.name === "ValidationError")
            error = handleValidationError(err);
        if (err.name === "JsonWebTokenError")
            error = handleJwtError(err)
        if (err.name === "TokenExpiredError")
            error = handleExpiredJwtError()


        sendErrorProd(error, res);
    }
}


