const AppError = require("./../utils/appError");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const APIFeatures = require("./../utils/apiFeatures");


const isAdmin = async (Model, id, next) => {
    const user = await Model.findOne({ _id: id })
    if (!user)
        return next(new AppError(`No Document Found with That ID`, 404))
    if (user.role === "admin") return true;
}

const deleteOne = (Model, deleteType = "soft_delete") =>
    catchAsync(async (req, res, next) => {
        let document
        //Delete the entire document from the db
        if (deleteType === "hard_delete") {
            if (Model === User && await isAdmin(Model, req.params.id, next))
                return next(new AppError(`you don't have permission to delete another admin`, 401))
            document = await Model.findByIdAndDelete(req.params.id)
        }
        //de-activate the document in the db
        else
            document = await Model.findByIdAndUpdate(req.user.id, { active: false }, {
                new: true
            })

        if (!document) {
            return next(new AppError(`No Document Found with That ID`, 404))
        }
        res.status(204).json({
            status: "success",
            requestedAt: req.reqestTime,
            data: null
        })

    })

const updateOne = Model => catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body,
        {
            new: true,
            runValidators: true
        })
    if (!document) {
        return next(new AppError(`No Document Found with That ID`, 404))
    }
    res.status(201).json({
        status: "success",
        requestedAt: req.requestTime,
        data: document,

    })

})

const createOne = Model => catchAsync(async (req, res, next) => {
    const document = await Model.create(req.body);
    res.status(201).json({
        status: "success",
        requestedAt: req.requestTime,
        data: document
    })
})

const getOne = (Model, popualteOption) => catchAsync(async (req, res, next) => {
    const document = await Model.findById(req.params.id).populate(popualteOption);

    // if (Model === User) document.passwordChangedAt = undefined
    if (!document) {
        return next(new AppError(`No document Found with That ID`, 404))
    }
    res.status(200).json({
        status: "success",
        requestedAt: req.requestTime,
        data: document

    })
})

const getAll = Model => catchAsync(async (req, res, next) => {


    //To allow for nested GET reviews on tour(hack)
    let filter = {}
    if (req.params.tourId) filter = { tour: req.params.tourId }
    //Execute Query
    const features = new APIFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    //const docs = await features.query.explain();
    const docs = await features.query;

    //Send Response
    res.status(200).json({
        status: "success",
        requestedAt: req.requestTime,
        results: docs.length,
        data: docs
    })

})

module.exports = {
    deleteOne, updateOne,
    createOne, getOne, getAll
}