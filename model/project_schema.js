const mongoose = require("mongoose")

const project_schema = mongoose.Schema({
    user_id : {
        type : String,
    },
    project_name : {
        type : String,
    },
    file_name : {
        required : true,
        type : String,
    },
    modified_filename : {
        type : String,
    },
    date : {
        required : true,
        type : String
    }
}, {
    collection : "Project",
    timeStamps: true
})

const model = mongoose.model("projectSchema", project_schema)

module.exports = model