// required moongose
const mongoose =require ("mongoose");

//required a validator
const validator= require("validator")

//here we define a schema so that user cannot feed wrong data ...
const userSchema =mongoose.Schema({
    name:{
        type:String,    //type of input data accepted by client/user.. 
        require:true,    // it is must required without it form not filled.
        minlength:3
    },
    email:{
        type:String,    //type of input data accepted by client/user.. 
        require:true,    // it is must required without it form not filled.
        validate(value){
            if(!validator.isEmail(value))
            {
                throw new Error("Invalid Email Id") //check whether email is valid or not ..if not throws error..
            }
        }
    },
    phone:{
        type:Number,
        require:true,
        min:10,
    },
    message:{
        type:String,
        require:true,
        minlength:40
    }
})

//afer creating schema we had to create a model

const User = mongoose.model("User",userSchema);
module.exports= User; //export user