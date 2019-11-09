// Dependencies
var express = require("express");
var exphbs = require("express-handlebars");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var path = require("path");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

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
    partialsDir: path.join(__dirname, "/views/layouts/partials") 
}));

app.set("view engine", "handlebars");

// Connect to the Mongo DB 
// mongoose.connect("mongodb://localhost/scraper", { useNewUrlParser: true });

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraper";

mongoose.connect(MONGODB_URI);

// Routes

app.get("/", function(req, res){
    db.Article.find({"saved": false}).then(function(result){
        var hbsObject = { articles: result };
        res.render("index", hbsObject);
    }).catch(function(err){
        res.json(err)
    });
});

// Displays saved articles
app.get("/saved", function (req, res) {
    db.Article.find({"saved": true})
        .populate("notes")
        .then(function(result){
            var hbsObject = {articles: result}; 
            res.render("saved", hbsObject);
        }).catch(function(err){
            res.json(err)
        });
});

// Save Article
app.post("/saved/:id", function (req, res) {
    db.Article.findOneAndUpdate({ "_id": req.params.id }, { "$set": { "saved": true } })
        .then(function (result) {
            res.json(result);
        }).catch(function (err) { res.json(err) });
});

// Puts article back in unsaved list
app.post("/delete/:id", function (req, res) {
    db.Article.findOneAndUpdate({ "_id": req.params.id }, { "$set": { "saved": false } })
        .then(function (result) {
            res.json(result);
        }).catch(function (err) { res.json(err) });
});

// Scrape Articles
app.get("/scraped", function (req, res) {
    axios.get("http://www.adventure.com").then(function (response) {
        var $ = cheerio.load(response.data);

        $(".card").each(function (i, element) {
            var result = {};

            result.title = $(element).find("h3").find("a").text();
            result.link = "https://www.adventure.com" + $(element).find("h3").children("a").attr("href");
            result.image = $(element).find("a").find("img").attr("data-lazy-src");
            result.saved = false;


            db.Article.create(result)
                .then(function (dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    console.log(err);
                });
        });
        res.send("Scrape Complete");
    });
    
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

// Route to create a note
app.post("/articles/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
        .then(function (dbNote) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
           // return db.Article.findOneAndUpdate({ "_id": req.params.id }, { "notes": dbNote._id }, { new: true });
            return db.Article.findOneAndUpdate({ "_id": req.params.articleId }, { $push: { "notes": dbNote._id } }, { new: true });
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route to poulate article with it's notes
app.get("/articles/:id", function (req, res) {
    db.Article.findOne({ "_id": req.params.id })
        .populate("notes")
        .then(function (result) {
            res.json(result);
        }).catch(function (err) { res.json(err); });
});

// Deletes a note
app.post("/deleteNote/:id", function (req, res) {
    db.Note.remove({ "_id": req.params.id })
        .then(function (result) {
            res.json(result);
        })
        .catch(function (err) {
            res.json(err)
        });
});

//Clears all articles
app.get("/clearall", function(req, res) {
    db.Article.remove({})
    .then(function(result) {
        res.json(result);
      })
      .catch(function(err) {
        res.json(err);
      });
})

app.listen(PORT, function(){
    console.log("App running on port " + PORT + "!");
});



