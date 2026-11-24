/* ==========================================================================
   Therapeak Chiropractic — site.js
   Progressive enhancement only: the page works fully without it.
   1. Mobile navigation
   2. Header shadow on scroll
   3. Appointment request form (normal FormSubmit POST, with copy-to-clipboard fallback)
   4. Footer year
   ========================================================================== */
(function () {
  "use strict";

  var CLINIC_EMAIL = "therapeakchiro@gmail.com";
  var SUBMIT_TEXT = "Send Request";

  /* Confirmation email FormSubmit sends to the visitor, with a copy of what
     they submitted (the form's email field is what it replies to). Plain
     text: FormSubmit wraps this in its own layout. */
  var AUTORESPONSE =
    "Thank you for contacting Therapeak Chiropractic.\n\n" +
    "We have received your appointment request and will follow up during " +
    "business hours to confirm a day and time that works for you. If your " +
    "request is urgent, please call us at (425) 524-3602 and leave a message " +
    "if we are with a patient, and we will call you back.\n\n" +
    "Therapeak Chiropractic\n" +
    "15 S. Grady Way, Suite 510, Renton, WA 98057\n" +
    "(425) 524-3602  |  therapeakchiro@gmail.com\n" +
    "Hours: by appointment\n\n" +
    "A copy of the details you sent is included below. This message was sent " +
    "automatically, so there is no need to reply to it.";

  /* FormSubmit only emails the visitor a confirmation (_autoresponse) when the
     form is submitted as a normal form POST, so this value goes into the
     hidden field in index.html rather than into a fetch request. */
  var autoresponseField = document.getElementById("autoresponse");
  if (autoresponseField) autoresponseField.value = AUTORESPONSE;

  /* The clinic inbox labels each request with the patient's name, the way the
     AJAX payload used to. */
  var subjectField = document.getElementById("subject-field");

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
  var submitBtn = document.getElementById("send-request");
  var submitLabel = submitBtn ? submitBtn.querySelector(".btn-label") : null;
  var sending = false;

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
    status.classList.remove("is-success");
  }

  function setSending(busy) {
    sending = busy;
    if (form) form.setAttribute("aria-busy", busy ? "true" : "false");
    if (submitBtn) {
      submitBtn.disabled = busy;
      submitBtn.classList.toggle("is-busy", busy);
    }
    if (submitLabel) submitLabel.textContent = busy ? "Sending..." : SUBMIT_TEXT;
  }

  function clearInvalid() {
    Array.prototype.forEach.call(
      form.querySelectorAll("[aria-invalid='true']"),
      function (el) { el.removeAttribute("aria-invalid"); }
    );
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      clearInvalid();

      if (!form.checkValidity()) {
        event.preventDefault();
        var invalid = form.querySelector(":invalid");
        if (invalid) {
          invalid.setAttribute("aria-invalid", "true");
          invalid.focus();
        }
        setStatus("Please add your name, a phone number and an email address so we can reply.", true);
        return;
      }

      if (sending) {
        event.preventDefault();
        return;
      }

      /* Let the browser POST the form to FormSubmit as a normal submission.
         That is the only route on which FormSubmit emails the visitor a
         confirmation (its _autoresponse is not sent for AJAX submissions, and
         not when reCAPTCHA is turned off). FormSubmit sends the visitor on to
         thanks.html afterwards (_next). */
      if (subjectField) {
        subjectField.value = "New appointment request — " + (fieldValue("name") || "website visitor");
      }
      setSending(true);
      setStatus("Sending your request to the clinic...");
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
