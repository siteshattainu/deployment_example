const { urlencoded } = require('express')
const express = require('express')
const cookieParser = require('cookie-parser')
//npm install jsonwebtoken@8.5.1
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const app = express()
const User = require('./database')
const verifyToken = require('./verifyToken')

app.use(express.json())
app.use(urlencoded({extended: true}))
app.use(cookieParser())
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.send("Hello")
})

app.get('/login', (req, res) => {
    res.sendFile(__dirname + "/login.html", (err) => {
        if(err){
            console.log("Error while loading login page", err)
        }
    })
})

app.get('/signup', (req, res) => {
    res.sendFile(__dirname + "/signup.html", (err) => {
        if(err){
            console.log("Error while loading signup page", err)
        }
    })
})

app.get('/home', verifyToken, (req, res) => {
    res.sendFile(__dirname + "/home.html", (err) => {
        if(err){
            console.log("Error while loading home page", err)
        }
    })
})

app.get('/landingpage', (req, res) => {
    res.sendFile(__dirname + "/index.html", (err) => {
        if(err){
            console.log("Error while loading landing page", err)
        }
    })
})

app.post('/userLogin', async (req, res) => {
    const data = req.body;
    let user_password = data.password;
    let user_email = data.email;
    const user_data = await User.findOne({email: user_email})
    // console.log(user_data);
    if(!user_data){
       res.status(400);
       res.send("User doesn't exist"); 
    }
    let db_password = user_data.password;
    //matching password
    const isValid = await bcrypt.compare(user_password.toString(), db_password);

    //taking action for incorrect password
    if(!isValid){
        res.status(400)
        return res.send("Incorrect Password")
    }
    
    //generate token
    const token_to_send = jwt.sign({id: user_data._id}, "mySecretKey", { expiresIn: '5s'})
    res.cookie('my_token', token_to_send);
    return res.redirect('/home')
})

app.post('/userSignup', async (req, res) => {
    const data = req.body;
    if(data.password !== data.cpassword){
        return res.send("Incorrect Password");
    }
    let user_name = data.name;
    let user_email = data.email;
    let user_password = data.password;
    if(!user_name || !user_email || !user_password){
        res.status(400)
        return res.send("Fields are empty")
    }
    const user_data = await User.findOne({email: user_email})
    if(user_data){
        res.status(400);
        return res.send("User already exists");
    }
    const salt = await bcrypt.genSalt(10)
    let hashed_password = await bcrypt.hash(user_password.toString(), salt)
    // hashed_password = hashed_password.toString()
    const data_to_store = new User({name: user_name, email: user_email, password: hashed_password})
    const result = await data_to_store.save()
    res.redirect('/login')
})

app.post('/add', verifyToken, (req, res) => {
    res.redirect('/home');
})

app.post('/logout', (req, res) => {
    // if(window.confirm("Do you want to logout?")){
        res.clearCookie('my_token')
        res.redirect('/landingpage')
    // }
    // res.redirect('/home')
})

app.listen(5000, () => {
    console.log("Listening on Port 5000")
})