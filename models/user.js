const mongoose = require('mongoose');
const post = require('./post');

mongoose.connect("mongodb://127.0.0.1:27017/fullauthsystem");

let userSchema = mongoose.Schema({
    username : String ,
    email : String ,
    password : String ,
    profilePic : {
        type : String ,
        default : "profile.jpg"
    }, 
    posts : [
        {
            type : mongoose.Schema.Types.ObjectId ,
            ref : "post"
        }
    ]
})


module.exports = mongoose.model("user" , userSchema )




