
class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {

        //hard Copy
        const queryObj = { ...this.queryString };
        const excludedFields = ["page", "sort", "limit", "fields"]

        //filtering
        excludedFields.forEach(el => delete queryObj[el]);

        //Advanced Fitlering
        let queryStr = JSON.stringify(queryObj)
        queryStr = JSON.parse(queryStr.replace(/\b(gte|gt|lte|lt)\b/g,
            matchStr => `$${matchStr}`));

        //Build Query
        this.query = this.query.find(queryStr);
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(",").join(" ");
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort("-createdAt")
        }
        return this;
    }

    limitFields() {
        //Fields Limiting
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(",").join(" ");
            this.query = this.query.select(fields);
        }
        else {
            this.query = this.query.select("-__v -createdAt -updatedAt")
        }
        return this;
    }

    paginate() {
        //Pagination, Limit
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 5;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        // if (req.query.page) {
        //     const numTours = await Tour.countDocuments();
        //     if (skip >= numTours)
        //         throw new Error("This page Doesn't Exist");
        // }
        return this;
    }
}


module.exports = APIFeatures;