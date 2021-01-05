const mongoose = require('mongoose');
MessagesSchema = new mongoose.Schema({
    first_user: {
        type: String,
        required: true
    },
    second_user: {
        type: String,
        required: true
    },
    total_message_count: {
        type: Number,
        default: 1
    },
    first_user_last_seen_message: {
        type: Number,
        default: 0
    },
    second_user_last_seen_message: {
        type: Number,
        default: 0
    },
    message: [{
        sender_id: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: false
        },
        media: {
            type: String,
            required: false
        },
        date: {
            type: String,
            default: Date.now
        }
    }]
})
const Messages = mongoose.model('Message',MessagesSchema);

module.exports = Messages;