const crypto = require("crypto")
const mongoose = require("mongoose");
const validator = require("validator")

const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please tell us your name"],

    },
    email: {
        type: String,
        required: [true, "Please Provide your email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide a valid email"]
    },
    role: {
        type: String,
        enum: ["user", "guide", "lead-guid", "admin"],
        default: "user"
    },
    password: {
        type: String,
        required: [true, "Please Provide a password"],
        min: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, "Please confirm your Password"],
        validate: {
            //this only works on SAVE!! and CREATE!! 
            validator: function (el) {
                return this.password === el
            },
            message: "Passwords aren't the same!!"
        },
    },
    passwordChangedAt: {
        type: Date,
        default: Date.now(),
    },
    photo: {
        type: String
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }

})

userSchema.pre("save", function (next) {
    if (!this.isModified("password") || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
})

userSchema.pre("save", async function (next) {
    //only run this function if the password was actullay modified
    if (!this.isModified("password")) return next();

    //hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12) //cost parameter

    //reset passwordConfirm Field
    this.passwordConfirm = undefined;

    next();
})

userSchema.methods.validPassword =
    async function (candidatePassword, userPassword) {
        return await bcrypt.compare(candidatePassword, userPassword);
    }

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    if (this.passwordChangedAt) {
        return JWTTimestamp < changedTimestamp
    }
    //means not changed
    return false;
}

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.passwordResetToken = crypto.createHash("sha256")
        .update(resetToken).digest("hex");
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000

    return resetToken;
}

userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
})

const User = mongoose.model("User", userSchema);

module.exports = User