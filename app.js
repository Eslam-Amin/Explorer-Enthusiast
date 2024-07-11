const path = require("path")
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit")
const helmet = require("helmet")
const mongoSanitize = require("express-mongo-sanitize")
const xss = require("xss-clean")
const hpp = require("hpp")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const app = express()
app.use(cors())
app.set("view engine", "pug")
app.set("views", path.join(__dirname, 'views'))


//body parser
//MiddleWare to handle body req.
app.use(express.json({
    limit: "10kb"
}));
app.use(cookieParser())


//Data Sanitization against noSql Query injection
app.use(mongoSanitize());

//Data Sanitization against XSS
app.use(xss())

//Prevent parameter pollution
app.use(hpp({
    whitelist: [
        "duration",
        "ratingsAverage",
        "ratingsQuantity",
        "maxGroupSize",
        "difficulty",
        "price"
    ]
}))

app.use(express.urlencoded({ extended: true }))


const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController")

const tourRouter = require("./routes/tourRoutes")
const userRouter = require("./routes/userRoutes")
const reviewRouter = require("./routes/reviewRoutes")
const viewRouter = require("./routes/viewRoutes")

//set Security HTTP headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", 'http://127.0.0.1:8000']
        }
    }
}));

//middleware to use overview.html
//serving static files
app.use(express.static(path.join(__dirname, 'public')))

//logging Middleware
if (process.env.NODE_ENV === "development")
    app.use(morgan("dev"))


const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests fromt this IP, please try again in an hour!"
})
//Limit Request from same API
app.use("/api", limiter);

//My own Middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toLocaleTimeString();
    //go on to the next middleware
    console.log(req.cookies)
    next();
})

//Routes
app.use("/", viewRouter)
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);


app.all("*", (req, res, next) => {
    next(new AppError(`Can't Find ${req.originalUrl} on this server`, 404));
})

app.use(globalErrorHandler)

module.exports = app