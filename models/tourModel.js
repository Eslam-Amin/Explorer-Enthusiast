const mongoose = require("mongoose");
const slugify = require("slugify");
// const user = require("./User")

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: [true, "A tour must have a name"],
        trim: true,
        maxLength: [40, "A tour name must have less or equal than 40 characters"],
        minLength: [10, "A tour name must have more or equal than 10 characters"],
        //validate: [validator.isAlpha, "Tour name MUST only contain characters"]
    },
    duration: {
        type: Number,
        required: [true, "A tour must have a duration"]
    },
    maxGroupSize: {
        type: Number,
        required: [true, "A tour must have a group Size"]
    },
    difficulty: {
        type: String,
        required: [true, "A tour must have a difficulty"],
        enum:
        {
            values: ["easy", "medium", "difficult"],
            message: "Difficulty is either: easy, medium, difficult"
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, "A Rating must be above 1.0"],
        max: [5, "A Rating must be below 5.0"],
        set: val => Math.round(val * 10) / 10 // 4.666666 => 46.6666 => 47 => 4.7 
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, "A tour must have a price"]
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                //this only points to current doc on document creation
                console.log(" this, ", this.price)
                return !this.price ?? this.price > val;
            },
            message: "A discount price ({VALUE}) must be less than the actual price"
        }
    },
    summary: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, "A tour must Have a cover Image"]
    },
    images: [String],
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },

    slug: String,
    startLocation: {
        //GeoJSON
        type: {
            type: String,
            default: "Point",
            enum: ["Point"]
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: "Point",
                enum: ["Point"]
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        },
    ],

},
    {
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

//sort price index on desc order
//tourSchema.index({ price: 1 })
tourSchema.index({ price: 1, ratingsAverage: -1 })
tourSchema.index({ slug: 1 })
tourSchema.index({ startLocation: '2dsphere' })

tourSchema.virtual("durationWeeks")
    .get(function () {
        return this.duration / 7;
    });

//Document Middleware
//pre save hook
//this will point to current document
//runs before .save() and .create()
tourSchema.pre("save", function (next) {
    this.slug = slugify(this.name, { lower: true });

    next();
})

//virtual Populate
tourSchema.virtual("reviews", {
    ref: "Review",
    foreignField: "tour",
    localField: "_id"
});

// tourSchema.pre("save", async function (next) {
//     const guidesPromises = this.guides.map(async (id) => {
//         await User.findById(id)
//     })
//     this.guides = await Promise.all(guidesPromises)
//     next()
// })



// tourSchema.pre("save", function (next) {
//     this.name = this.name.toLowerCase();
//     next();
// })

//Query Middleware
//this will point to the current query
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } })
    this.start = Date.now();
    next()
})

tourSchema.post(/^find/, function (docs, next) {
    console.log(`query Took ${Date.now() - this.start} MillieSeconds`)
    next();
})

tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: "guides",
        select: "-__v -passwordChangedAt"
    });
    next();
})


// tourSchema.pre("aggregate", function (next) {
//     this.pipeline().unshift({
//         $match: { secretTour: { $ne: true } }
//     })

//     next();
// })

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
