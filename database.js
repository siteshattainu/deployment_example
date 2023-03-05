const express = require('express')
const app = express()
const mongoose = require('mongoose')

mongoose.connect("mongodb://localhost:27017/backend_project", {useNewUrlParser: true, useUnifiedTopology: true}, 
    (err) => {
        if(err){
            console.log("Connection Failed", err)
        }
        else{
            console.log("Connection Success");
        }
    }
)

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
})

const User = new mongoose.model("user_collection", userSchema);

app.listen(5010, () => {
    console.log("Listening to MongoDB on port 5010")
})

module.exports = User;