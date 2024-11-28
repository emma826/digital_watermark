const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    public_key : {
        type : String,
        unique : true
    },
    private_key : {
        type : String,
    },
    signature: {
        type : String,
    }
}, {
    collection: "User",
    timeStamp: true
})

const model = mongoose.model("userSchema", userSchema)

module.exports = model