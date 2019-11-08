// Grab the articles as a json
$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#articles").append(
        "<div class='card col-lg-5 col-md-12 mt-3 p-0'><a href='" + data[i].link + "' target='_blank'><img class='img-fluid p-0' src='" + data[i].image + "' class='card-img-top'><div class='card-body'><h5 class='card-title'>" + data[i].title + "</h5></div></div></a>"
    );

  }
});
