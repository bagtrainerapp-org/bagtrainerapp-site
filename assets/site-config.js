// Public site settings. Everything in this file is visible to visitors, so
// it must never contain an email address, password, API key or other secret.
window.BAGTRAINER_SITE = {
  // Formspree form endpoint for the support and account-deletion forms,
  // for example "https://formspree.io/f/abcdwxyz". The form ID is public by
  // design. The inbox that receives the messages is set inside the
  // Formspree dashboard and is never written into this website.
  supportFormEndpoint: "",

  // Public store listing URLs. Leave a value empty while that store is not
  // live yet: its badge then shows "Coming soon" and is not a link. Never
  // put closed-testing, internal-testing or TestFlight links here.
  storeLinks: {
    googlePlay: "",
    appStore: "",
  },
};
