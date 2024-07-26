const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    
    userID: {
        type: Number,
        auto: true
    },
    applicantId: {
        type: Number,
        required: true
    },
    candidateName: {
        type: String,
        required: true
    },
    jobPosition: {
        type: String,
        required: true
    },
    applicationDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        default: false
    },
    password: {
        type: String,
        required: true
    },
})

const User = mongoose.model('User', userSchema)
module.exports = User
