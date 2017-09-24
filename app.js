// Node Packages
var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var User = require("./models/user");
var MongoClient = require('mongodb').MongoClient,
  f = require('util').format,
  assert = require('assert');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
//Authentication
app.use(require("express-session")({
    secret: "This is a really interesting secret",
    resave: false,
    saveUninitialized: false,
}));
app.set("view engine", "ejs");
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//MiddleWare

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/");
}

function loginRedirect(req, res, next){
    if (req.isAuthenticated()){
        return res.redirect("/upload");
    }
    next();
}


//Mongoose
//mongoose.connect("mongodb://localhost/files");

var DATABASEURL = process.env.DATABASEURL || "mongodb://TestinPot:Ayylmao69@ds133104.mlab.com:33104/testingdatabase";
mongoose.connect(DATABASEURL, {useMongoClient: true});

var fileSchema =  new mongoose.Schema({
    name: String,
    URL: String,
    fileGroup: String,
    fileClass: String
});

var File = mongoose.model("File", fileSchema);

// Routes
app.get("/", function(req, res) {
    res.render("index");
});

app.post("/upload", function(req, res){
    var name = req.body.name;
    var URL = req.body.URL;
    var fileGroup = req.body.fileGroup;
    var fileClass = req.body.fileClass;
    var newFile = {name: name, URL: URL, fileGroup: fileGroup, fileClass: fileClass};
    File.create(newFile, function(err, createdFile){
        if(err){
            console.log(err);
        } else {
            res.redirect("/upload");
        }
    });
});

app.get("/login", loginRedirect, function(req, res){
    res.render("login");
});

app.post("/login", passport.authenticate("local", {
    sucessRedirect: "/upload",
    failureRedirect: "/login",
}) , function(req, res){
    res.redirect("/upload");
});

app.get("/upload", isLoggedIn, function(req, res){
    res.render("upload");
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

app.get("/:class/homework", function(req, res) {
    var classFile = String(req.params.class) + "homework";
    File.find({}, function(err, allFiles){
        if(err){
            console.log(err);
        } else {
            res.render(classFile, {File: allFiles});
        }
    });
});

app.get("/:class/classwork", function(req, res) {
    var classFile = String(req.params.class) + "classwork";
    File.find({}, function(err, allFiles){
        if(err){
            console.log(err);
        } else {
            res.render(classFile, {File: allFiles});
        }
    }); 
});


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server is up.");
}); 