// Click to scrape
$(document).ready( function () {
  $.ajax({
    method: "GET",
    url: "/scraped",
  }).then(function (data) {
    console.log(data)
  })
});

// Click to save article
$(".save").on("click", function () {
  var thisId = $(this).attr("data-id");
  $.ajax({
    method: "POST",
    url: "/saved/" + thisId
  }).then(function (data) {
    location.reload();
  })
});

// Click to delete from saved list
$(".delete").on("click", function () {
  var thisId = $(this).attr("data-id");
  $.ajax({
    method: "POST",
    url: "/delete/" + thisId
  }).then(function (data) {
    location.reload();
  })
});

// Click to save note
$(".save-note").on("click", function () {
  var thisId = $(this).attr("data-id");
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      body: $("#noteText" + thisId).val()

    }
  }).then(function (data) {
    // Log the response
    console.log(data);
    // Empty the notes section
    $("#noteText" + thisId).val("");
    $(".modalNote").modal("hide");
    window.location = "/saved"
  });
});

// Click to delete a note
$(".deleteNote").on("click", function () {
  var thisId = $(this).attr("data-note-id");
  $.ajax({
    method: "POST",
    url: "/deleteNote/" + thisId,
  }).then(function (data) {
    // Log the response
    console.log(data);
    window.location = "/saved"
  })
})

