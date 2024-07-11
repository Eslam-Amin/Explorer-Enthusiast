const mongoose = require("mongoose");
const Tour = require("./tourModel");
const AppError = require("../utils/appError");

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, "Review Cannot be empty"],
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: "Tour",
        required: [true, "Review must belong to a tour."]
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "Review must belong to a user."]
    }
}, {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
},
    {
        timestamps: true,
    }
);

//this index to prevent users to review the same tour twice
reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

reviewSchema.pre(/^find/, function (next) {

    this.populate({
        path: "user",
        select: "name photo"
    })

    next();
})

reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: "$tour",
                numOfRatings: { $sum: 1 },
                avgRating: { $avg: "$rating" }
            }
        }
    ])
    if (stats.length > 0)
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].numOfRatings,
            ratingsAverage: stats[0].avgRating//.toFixed(2)
        })
    else
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        })
}

reviewSchema.post("save", function () {
    //this points to current review
    //we're using this.constructor instead of Review 
    //because we haven't initialize it yet

    this.constructor.calcAverageRatings(this.tour._id)
})

reviewSchema.pre(/^findOneAnd/, async function (next) {
    //query middleware
    this.review = await this.findOne()
    if (!this.review)
        return next(new AppError("No Review Found With this id"), 404)
    next()
})

reviewSchema.post(/^findOneAnd/, async function () {

    await this.review.constructor.calcAverageRatings(this.review.tour)

})

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;

