const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true
    },

    specialization:{
        type:String,
        required:true
    },

    department:{
        type:String,
        required:true
    },

    experience:{
        type:Number,
        default:0
    },

    phone:{
        type:String,
        default:""
    },

    availability:{
        type:String,
        default:"Available"
    },

    consultationFee:{
        type:Number,
        default:0
    }

},{
    timestamps:true
});

module.exports = mongoose.model("Doctor", doctorSchema);