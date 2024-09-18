//firstly we get mongoose package
const mongoose =require("mongoose");
mongoose.set('strictQuery', false); //for removing deprication warning

//Create a connection to database ;
// syntax --> mongoose.connect('mongodb://' + config.host + ':' + config.port + configdb )
// basically mongose.connect function returns a promise (either reject or fulfilled)

mongoose.connect("mongodb://127.0.0.1/1000", {
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(() =>{
    // if promise gets accepted or successed...
    console.log("Connection Successful");
}).catch((error) =>{
    // if promise get denied or rejected;
    console.log(error);
})