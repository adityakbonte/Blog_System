const mongoose = require("mongoose");
const {Schema,model} = mongoose;

const userSchema = new Schema({
    username:{
        type: String,
        min: 4,
        unique:true,
        required: true
    },
    password:{
        type:String,
        required:true
    }
})

const userModel = new model('User',userSchema);
module.exports = userModel;