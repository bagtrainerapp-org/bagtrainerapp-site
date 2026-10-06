// Sends the support and account-deletion forms through the form service set
// in site-config.js (Formspree). The destination inbox lives only in that
// service's dashboard, so it never appears in this page or its scripts.
(function () {
  var config = window.BAGTRAINER_SITE || {};
  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  // Real people take longer than this to fill in a form; most bots don't.
  var MIN_FILL_MS = 3000;

  var forms = document.querySelectorAll("form[data-support-form]");

  for (var i = 0; i < forms.length; i++) {
    setUpForm(forms[i]);
  }

  function setUpForm(form) {
    var loadedAt = Date.now();
    var isSending = false;
    var button = form.querySelector("button[type=submit]");
    var buttonLabel = button.textContent;
    var status = form.querySelector("[data-form-status]");
    var success = document.getElementById(form.getAttribute("data-success-panel"));

    form.setAttribute("novalidate", "");

    form.addEventListener("input", function (event) {
      clearFieldError(event.target);
    });

    form.addEventListener("change", function (event) {
      clearFieldError(event.target);
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (isSending) return;

      hideStatus();

      if (!validate(form)) {
        showStatus("Please fix the highlighted fields.", true);
        return;
      }

      // Honeypot: hidden from people, so only bots fill it in. Pretend it
      // worked and send nothing.
      var trap = form.querySelector("[name=_gotcha]");
      if (trap && trap.value) {
        showSuccess();
        return;
      }

      if (Date.now() - loadedAt < MIN_FILL_MS) {
        showStatus("That was quick. Please check your details and press send again.", true);
        loadedAt = 0;
        return;
      }

      var endpoint = config.supportFormEndpoint;

      if (!endpoint || !/^https?:\/\//.test(endpoint)) {
        showStatus("Requests can't be sent right now. Please try again later.", true);
        return;
      }

      setSending(true);

      fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(form)),
      })
        .then(function (response) {
          if (!response.ok) throw new Error("HTTP " + response.status);
          showSuccess();
        })
        .catch(function () {
          setSending(false);
          showStatus("Your request wasn't sent. Please check your connection and try again.", true);
        });
    });

    var again = success && success.querySelector("[data-send-another]");
    if (again) {
      again.addEventListener("click", function () {
        form.reset();
        success.hidden = true;
        form.hidden = false;
        setSending(false);
        loadedAt = Date.now();
        var first = form.querySelector("input:not([tabindex='-1']), select, textarea");
        if (first) first.focus();
      });
    }

    function setSending(sending) {
      isSending = sending;
      button.disabled = sending;
      button.textContent = sending ? "Sending…" : buttonLabel;
      form.setAttribute("aria-busy", sending ? "true" : "false");
    }

    function showSuccess() {
      setSending(false);
      if (success) {
        form.hidden = true;
        success.hidden = false;
        success.focus();
      } else {
        form.reset();
        showStatus("Thanks, your request was sent.", false);
      }
    }

    function showStatus(message, isError) {
      status.textContent = message;
      status.className = "form-status " + (isError ? "is-error" : "is-success");
      status.hidden = false;
    }

    function hideStatus() {
      status.hidden = true;
      status.textContent = "";
    }
  }

  function validate(form) {
    var fields = form.querySelectorAll("[data-validate]");
    var firstInvalid = null;

    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      var value = field.value.trim();
      var label = field.getAttribute("data-label") || "This field";
      var min = parseInt(field.getAttribute("data-min") || "0", 10);
      var max = parseInt(field.getAttribute("data-max") || "0", 10);
      var message = "";

      if (!value) {
        message = field.tagName === "SELECT" ? "Please choose an option." : label + " is required.";
      } else if (field.type === "email" && !EMAIL_PATTERN.test(value)) {
        message = "Enter a valid email address.";
      } else if (min && value.length < min) {
        message = label + " needs at least " + min + " characters.";
      } else if (max && value.length > max) {
        message = label + " can be at most " + max + " characters.";
      }

      setFieldError(field, message);
      if (message && !firstInvalid) firstInvalid = field;
    }

    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  function setFieldError(field, message) {
    var error = document.getElementById(field.id + "-error");
    field.setAttribute("aria-invalid", message ? "true" : "false");
    if (error) {
      error.textContent = message;
      error.hidden = !message;
    }
  }

  function clearFieldError(field) {
    if (field && field.getAttribute && field.getAttribute("aria-invalid") === "true") {
      setFieldError(field, "");
    }
  }

  function buildPayload(form) {
    var get = function (name) {
      var el = form.querySelector("[name=" + name + "]");
      return el ? el.value.trim() : "";
    };

    var email = get("email");
    var category = get("category");
    var name = get("name");

    return {
      name: name || "(not given)",
      email: email,
      _replyto: email,
      category: category,
      message: get("message"),
      _subject: "BagTrainer support: " + category + (name ? " from " + name : ""),
      page: window.location.pathname,
    };
  }
})();
