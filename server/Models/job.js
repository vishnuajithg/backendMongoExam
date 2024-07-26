const mongoose = require('mongoose')
const jobSchema = new mongoose.Schema({
    jobId: {
        type: Number,
        required: true,
        auto: true
    },
    jobTitle: {
        type: String,
        required: true
    },
    jobDescription: {
        type: String,
        required: true
    },
})

const Job = mongoose.model('Job', jobSchema)
module.exports = Job
