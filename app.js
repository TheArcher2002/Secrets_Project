require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
// const encrypt = require("mongoose-encryption");
// const md5 = require('md5');
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
const app = express();
//console.log(process.env.API_KEY);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: true,
    //cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://127.0.0.1:27017/userDB');
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
// userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields: ['password']});
userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User",userSchema); // Do not change this order
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",function(req,res){
    res.render("home");
});

app.route("/login")
.get((req,res)=>{
    res.render("login");
})
.post((req,res)=>{
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user,function(err){
        if (err){
            console.log(err);
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }
    });
    // const username = req.body.username;
    // const password = req.body.password;
 
    // User.findOne({email : username })
    // .then((foundUser)=> {
    //     bcrypt.compare(req.body.password, foundUser.password, function(err, result) {
    //         if(result == true){
    //             res.render("secrets");
    //         }
    //     });
    // })
    // .catch((err)=> console.log(err));
});

app.get("/secrets",function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }
    else{
        res.redirect("/login");
    }
});

app.get("/logout", function (req, res) {
    req.logout(function (err) {
      if (err) {
        console.log(err);
      }
      res.redirect("/");
    });
});

app.route("/register")
.get((req,res)=>{
    res.render("register");
})
.post((req,res)=>{
    User.register({username:req.body.username},req.body.password,function(err,user){
        if (err){
            console.log(err);
            res.redirect("/register");
        }
        else {
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }
    });
    // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    //     const newUser = new User({
    //         email : req.body.username,
    //         password : hash
    //     });
    //     newUser.save()
    //     .then(()=> res.render("secrets"))
    //     .catch((err)=> console.log(err))
    // });
});

app.listen(3000, function() {
    console.log("Server started on port 3000");
});