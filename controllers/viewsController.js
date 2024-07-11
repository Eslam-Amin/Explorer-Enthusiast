const Tour = require("../models/tourModel")
const catchAsync = require("../utils/catchAsync")


const get = (req, res) => {
    res.status(200).render("base", {
        tour: "The Forest Hicker",
        user: "ECa"
    })
}

const getOverview = catchAsync(async (req, res, next) => {
    // 1) Get tour Data from collection 
    const tours = await Tour.find();

    // 2) Build Template
    //in pug


    //render That Template using the tour data from step 1
    res.status(200).render("overview", {
        title: "All Tours",
        tours
    })
})


const getTour = catchAsync(async (req, res) => {
    const tour = await Tour.findOne({ slug: req.params.slug })
        .populate({ path: "reviews", fields: "review rating user" })

    res.status(200).set(
        'Content-Security-Policy',
        "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    ).render("tour", {
        title: tour.name,
        tour
    })
})

const getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: "Log into your account"
    })
}


module.exports = { getOverview, getTour, getLoginForm }