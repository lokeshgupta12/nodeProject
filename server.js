const express = require("express");
const hbs = require("hbs");
var fs = require("fs");
var app = express();
hbs.registerPartials(__dirname + "/views/partials")
app.use(express.static(__dirname + "/public")) // this is for static that we use that provide express
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
app.listen(8080, function() {
	console.log("start node")
})