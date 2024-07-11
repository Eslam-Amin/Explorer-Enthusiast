//catch async error
module.exports =
    fn => {
        return (req, res, next) => {
            fn(req, res, next).catch(next);
            //the line above is equivelant to the next line
            //fn(req, res, next).catch(err=>next(err));
        };
    }