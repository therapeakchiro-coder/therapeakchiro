/* ==========================================================================
   Therapeak Chiropractic — site.js
   Progressive enhancement only: the page works fully without it.
   1. Mobile navigation
   2. Header shadow on scroll
   3. Appointment request form (mailto draft + copy to clipboard)
   4. Footer year
   ========================================================================== */
(function () {
  "use strict";

  var CLINIC_EMAIL = "therapeakchiro@gmail.com";

  /* ---------------------------------------------------- Mobile navigation */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");

  function setNav(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    nav.classList.toggle("is-open", open);
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setNav(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setNav(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setNav(false);
        toggle.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 960) setNav(false);
    });
  }

  /* ----------------------------------------------------- Header on scroll */
  var header = document.querySelector(".site-header");
  if (header) {
    var updateHeader = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  /* -------------------------------------------------------- Footer year */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ------------------------------------------------- Appointment request */
  var form = document.getElementById("appointment-form");
  var status = document.getElementById("form-status");
  var copyBtn = document.getElementById("copy-details");

  function fieldValue(id) {
    var el = document.getElementById(id);
    return el ? String(el.value || "").trim() : "";
  }

  function buildRequest() {
    var name = fieldValue("name");
    var phone = fieldValue("phone");
    var email = fieldValue("email");
    var reason = fieldValue("reason");
    var pip = fieldValue("pip");
    var preferred = fieldValue("preferred");
    var notes = fieldValue("message");

    var subject = (name ? "Appointment request — " + name : "Appointment request");

    var lines = [
      "Hello Therapeak Chiropractic,",
      "",
      "I would like to request an appointment.",
      "",
      "Name: " + (name || "—"),
      "Phone: " + (phone || "—"),
      "Email: " + (email || "—"),
      "Reason for visit: " + (reason || "—"),
      "Auto claim / PIP: " + (pip || "—"),
      "Preferred days or times: " + (preferred || "—"),
      "",
      "Notes:",
      (notes || "—"),
      "",
      "Thank you."
    ];

    var body = lines.join("\r\n");

    return {
      subject: subject,
      body: body,
      mailto: "mailto:" + CLINIC_EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body),
      text: subject + "\r\n\r\n" + body + "\r\n\r\nSend to: " + CLINIC_EMAIL
    };
  }

  function setStatus(message, isError) {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("is-error", !!isError);
  }

  function clearInvalid() {
    Array.prototype.forEach.call(
      form.querySelectorAll("[aria-invalid='true']"),
      function (el) { el.removeAttribute("aria-invalid"); }
    );
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      clearInvalid();

      if (!form.checkValidity()) {
        var invalid = form.querySelector(":invalid");
        if (invalid) {
          invalid.setAttribute("aria-invalid", "true");
          invalid.focus();
        }
        setStatus("Please add your name, a phone number and an email address so we can reply.", true);
        return;
      }

      var request = buildRequest();
      setStatus("Opening your email app with the request filled in — press send there to reach the clinic. If nothing opens, use Copy details below.");

      try {
        window.location.href = request.mailto;
      } catch (err) {
        setStatus("Your email app did not open. Use Copy details and send the message to " + CLINIC_EMAIL + ".", true);
      }
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var text = buildRequest().text;

      var done = function () {
        setStatus("Details copied. Paste them into an email to " + CLINIC_EMAIL + ".");
        copyBtn.textContent = "Copied";
        window.setTimeout(function () { copyBtn.textContent = "Copy details"; }, 2400);
      };

      var fallback = function () {
        var area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.top = "-1000px";
        document.body.appendChild(area);
        area.select();
        var ok = false;
        try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
        document.body.removeChild(area);
        if (ok) {
          done();
        } else {
          setStatus("Copying is blocked in this browser. Please email " + CLINIC_EMAIL + " directly.", true);
        }
      };

      if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done).catch(fallback);
      } else {
        fallback();
      }
    });
  }
})();
