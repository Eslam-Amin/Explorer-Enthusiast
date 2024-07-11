const fs = require("fs");

const Tour = require("./../models/tourModel")
const factory = require("./handlerFactory")
const catchAsync = require("../utils/catchAsync");
const path = require("path");
const AppError = require("../utils/appError");

function getTourById(id) {
    const tours = JSON.parse(fs.readFileSync(`${__dirname}/../data/tours-simple.json`))
    const tour = tours.find(el => el.id === id);
    return tour;
}


const aliasTopTours = (req, res, next) => {
    req.query.limit = "5";
    req.query.sort = "price,-ratingsAverage";
    req.query.fields = "name,price,ratingsAverage,summary,difficulty";

    next();
}

const getToursWithin = catchAsync(async (req, res, next) => {
    //tours-within/233/center/34.111745,-118.113491/unit/mi
    const { distance, latlng, unit } = req.params;
    //this used in the geoSpatial in mongodb but in radians
    //you have to divide the distance / the raduis of the earth
    //check if the unit is mile or km
    const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

    const [lat, lng] = latlng.split(",");
    if (!lat || !lng)
        return next(new AppError("Please, provide latitude and longitude in the format of lat,lng"), 400)
    const tours = await Tour.find({
        startLocation: {
            $geoWithin: {
                $centerSphere: [[lng, lat], radius]
            }
        }
    });

    res.status(200).json({
        status: "success",
        results: tours.length,
        data: {
            tours
        }

    })
})

const getDistances = catchAsync(async (req, res, next) => {
    //tours-within/233/center/34.111745,-118.113491/unit/mi
    const { latlng, unit } = req.params;

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001
    const [lat, lng] = latlng.split(",");
    if (!lat || !lng)
        return next(new AppError("Please, provide latitude and longitude in the format of lat,lng"), 400)
    const distances = await Tour.aggregate([
        {
            //always need to be near
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: "distance",
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ])
    res.status(200).json({
        status: "success",
        data: {
            distances
        }
    })


})

const getAllTours = factory.getAll(Tour)
const getTour = factory.getOne(Tour, { path: "reviews" })//select)
const createTour = factory.createOne(Tour);
const updateTour = factory.updateOne(Tour);
const deleteTour = factory.deleteOne(Tour, "hard_delete")

const checkID = (req, res, next, val) => {
    if (val > tours.length - 1)
        // if (!tour)
        return res.status(404).json({
            status: "fail",
            message: "Invalid Id"
        });

    next();
}


const checkBody = (req, res, next) => {
    if (!req.body.name
        || !req.body.price)
        return res.status(400).json({
            status: "fail",
            message: "Missing Attributes (Name or Price)"
        });

    next();

}

const getTourStats = catchAsync(async (req, res, next) => {
    //arr of stages
    const stats = await Tour.aggregate([
        {
            $match: {
                ratingsAverage: { $gte: 4.5 }
            },
        },
        {
            $group: {
                //_id: null,
                _id: { $toUpper: "$difficulty" },
                // _id: "$ratingsAverage"
                numTours: { $sum: 1 },
                numOfRatings: { $sum: "$ratingsQuantity" },
                avgRating: { $avg: "$ratingsAverage" },
                avgPrice: { $avg: "$price" },
                minPrice: { $min: "$price" },
                maxPrice: { $max: "$price" },
            }
        },
        {
            $sort: { avgPrice: 1 }
        },
        // {
        //     $match: {
        //         _id: { $ne: "EASY" }
        //     }
        // }
    ]);
    res.status(200).json({
        status: "success",
        requestedAt: req.reqestTime,
        data: { stats }
    })

})


const getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
        {
            //spread any list with the name of startDates
            $unwind: "$startDates"
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: {
                    $month: "$startDates"
                },
                numTours: { $sum: 1 },
                tours: {
                    $push: "$name"
                }
            },

        },
        {
            $addFields: { month: "$_id" }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: {
                numTours: -1
            }
        }
    ])
    res.status(200).json({
        status: "success",
        result: plan.length,
        requestedAt: req.reqestTime,
        data: { plan }
    })
})

module.exports = {
    createTour,
    getAllTours,
    getTour,
    updateTour,
    deleteTour,
    aliasTopTours,
    getTourStats,
    getMonthlyPlan,
    getToursWithin,
    getDistances
}