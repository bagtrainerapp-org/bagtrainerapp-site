// Builds the "Contact Support" mail link when the page loads, so the support
// address is never shown as text on the page and isn't a plain mailto: link
// in the HTML for scrapers to pick up.
(function () {
  var links = document.querySelectorAll("[data-mail-user][data-mail-domain]");

  for (var i = 0; i < links.length; i++) {
    var link = links[i];
    var address = link.getAttribute("data-mail-user") + "@" + link.getAttribute("data-mail-domain");
    var subject = link.getAttribute("data-mail-subject") || "BagTrainer Support Request";
    var body =
      "Hi BagTrainer team,\n\n" +
      "[Describe the problem or question here]\n\n" +
      "Phone model:\n" +
      "Android or iPhone:\n";

    link.href =
      "mailto:" + address +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);
  }
})();
