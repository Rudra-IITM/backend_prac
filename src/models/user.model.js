import mongoose, {Schema} from "mongoose";
import jwt from 'jsonwebtoken';
import brcypt from 'bcrypt';

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },    
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },    
    fullName: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
    },    
    avatar: {
        type: String,
        required: true,
    },    
    coverImage: {
        type: String,
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    refreshToken: {
        type: String,
    }
}, {
    timestamps: true,
})

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();

    this.password = await brcypt.hash(this.password, 10);
    next();
})

userSchema.methods.isPasswordCorrect = async function(password) {
    return await brcypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName,
    },
    process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY,
    })
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    })
}

const User = mongoose.model('User', userSchema);

export { User }