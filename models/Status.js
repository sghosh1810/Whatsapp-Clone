const mongoose = require('mongoose');
StatusSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    status : {
        type: String,
        default: "Hey! there I'm using Chatvia"
    }
})
const Status = mongoose.model('Status',StatusSchema);

module.exports = Status;