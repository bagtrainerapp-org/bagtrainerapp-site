// Turns each [data-store] badge into a real store link once that store's
// public URL is set in site-config.js. Until then the badge stays a plain
// "Coming soon" label.
(function () {
  var config = window.BAGTRAINER_SITE || {};
  var links = config.storeLinks || {};

  var STORES = {
    "google-play": { url: links.googlePlay, live: "Get it on", name: "Google Play" },
    "app-store": { url: links.appStore, live: "Download on", name: "the App Store" },
  };

  var badges = document.querySelectorAll("[data-store]");

  for (var i = 0; i < badges.length; i++) {
    var badge = badges[i];
    var store = STORES[badge.getAttribute("data-store")];

    if (!store || !store.url || !/^https:\/\//.test(store.url)) continue;

    var link = document.createElement("a");
    link.className = badge.className.replace("is-soon", "is-live");
    link.href = store.url;
    link.rel = "noopener";
    link.innerHTML =
      '<span class="store-badge-kicker">' + store.live + "</span>" +
      '<span class="store-badge-name">' + store.name + "</span>";

    badge.parentNode.replaceChild(link, badge);
  }
})();
