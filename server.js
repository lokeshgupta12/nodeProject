const express = require("express");
const hbs = require("hbs");
var bodyParser     = require('body-parser');
var compression = require('compression');
var mongoose = require('mongoose');
var mongodb = require("mongodb");
mongoose.connect("mongodb://localhost:27017/imageScrape")
var keyWordList = mongoose.model('keywordList', { word: {type: String} });
var Scraper = require ('images-scraper')
  , google = new Scraper.Google();
var fs = require("fs");
var Jimp = require("jimp")
var app = express();
const port = process.env.PORT || 8080;
hbs.registerPartials(__dirname + "/views/partials")
app.use(express.static(__dirname + "/public")) // this is for static that we use that provide express
app.use(bodyParser.json());
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true })); 
app.set("view engine", "hbs") // rendering template through handlebars
hbs.registerHelper("getCurrentYear", () => {
	return new Date().getFullYear();
})
app.use((req, res, next) => {
	var log = req.method + req.url + "\n"
    fs.appendFile("server.log", log, (err) => {
    	if(err) {
    		console.log(err, "err")
    	}
    })
	next();
})
app.get("/", function(req, res) {
	res.render("home.hbs")
})
app.get("/about", function(req, res) {
    res.render("about.hbs", {
    	pageTitle : "About page",
    	//currentYear : new Date().getFullYear() In this we use registerHelper from hbs 
    })
})
app.get("/keyword", function(req, res) {
  keyWordList.find({}, function(err, result) {
    if(err) {
      res.send({"status": "fail"})
    } else {
        res.render("keyword.hbs", {
      pageTitle : "About page",
      results : result 
    })
    }
  })
    
})
app.get('/dashboard/:keyword',function(req, res) {
   res.render("dashboard.hbs", {
     word: req.params.keyword
   })
});
app.post("/submit", function(req, response) {
     
    google.list({
    keyword: req.body.search,
    num: 15,
    detail: true,
    // nightmare: {
    //     show: true
    // }
})
 
.then(function (res) {
    var keywordList = new keyWordList({
        word: req.body.search
    });
     keywordList.save(function(err, keyword) {
        response.send({"status" : "ok", value: keyword})
     })
    for(let url in res){
      Jimp.read(res[url].url).then(function (lenna) {
        lenna.resize(500, 500)            // resize
             .quality(90)                 // set JPEG quality
             .greyscale()                 // set greyscale
             .write("public/images/"+req.body.search+[url]+".jpg"); // save
    }).catch(function (err) {
        console.error(err);
    });

  }
}).catch(function(err) {
    console.log('err', err);
});
})
app.listen(port, function() {
	console.log("start node"+ port)
})