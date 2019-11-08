// Dependencies
var express = require("express");
var exphbs = require("express-handlebars");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure Middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Handlebars
app.engine("handlebars", exphbs({
    defaultLayout: "main",
}));

app.set("view engine", "handlebars");

// Connect to the Mongo DB 
// mongoose.connect("mongodb://localhost/scraper", { useNewUrlParser: true });

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraper";

mongoose.connect(MONGODB_URI);

// Routes

app.get("/", function(req, res){
    res.render("index");
});

app.get("/scraped", function (req, res) {
    axios.get("http://www.adventure.com").then(function (response) {
        var $ = cheerio.load(response.data);

        $(".card").each(function (i, element) {
            var result = {};

            result.title = $(element).find("h3").find("a").text();
            result.link = "https://www.adventure.com" + $(element).find("h3").children("a").attr("href");
            result.image = $(element).find("a").find("img").attr("data-lazy-src");


            db.Article.create(result)
                .then(function (dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    console.log(err);
                });
        });
    });
    res.send("Scrape Complete");
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res){
    db.Article.find({})
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
});

// Route for grabbing specific article by id, populate with it's note. 
app.get("/articles/:id", function(req, res){
    //TODO: finish the route so that it uses req.params.id then responds with the article and note included.
});

// Route of saving/updating an Article's assciated comments
app.post("/articles/:id", function(req, res){
    // TODO 
    //===
    // save the new comment posted to the Comments Collection, then find an article from the req.params.id and update it's "comment" property with the _id of the new note. 
});

app.listen(PORT, function(){
    console.log("App running on port " + PORT + "!");
});



