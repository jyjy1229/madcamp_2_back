const mongoose = require('mongoose')
var Schema = mongoose.Schema

var userSchema = new Schema({
    isFacebookUser: { type: Boolean, default: false },
    userId: { type: String, required: true },
    password: String,
    name: String,
    phoneNumber: String,
    followingIds: [String],
    posts: [String],
    signUpDate: { type: Date, default: Date.now() }
});

module.exports = mongoose.model("user", userSchema);