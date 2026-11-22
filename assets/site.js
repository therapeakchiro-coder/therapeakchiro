/* ==========================================================================
   Therapeak Chiropractic — site.js
   Progressive enhancement only: the page works fully without it.
   1. Mobile navigation
   2. Header shadow on scroll
   3. Appointment request form (FormSubmit AJAX, with copy-to-clipboard fallback)
   4. Footer year
   ========================================================================== */
(function () {
  "use strict";

  var CLINIC_EMAIL = "therapeakchiro@gmail.com";
  var FORM_ENDPOINT = "https://formsubmit.co/ajax/" + CLINIC_EMAIL;
  var SUBMIT_TEXT = "Send Request";

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

  /* Fallback when the message cannot be sent from the page: offer the same
     details as an email, next to the Copy details button. */
  function showSendFailure() {
    if (!status) return;
    var request = buildRequest();
    status.textContent = "";
    status.classList.add("is-error");
    status.classList.remove("is-success");
    status.appendChild(document.createTextNode("We could not send your request just now. "));
    var mail = document.createElement("a");
    mail.href = request.mailto;
    mail.textContent = "Send it by email instead";
    status.appendChild(mail);
    status.appendChild(document.createTextNode(" or use Copy details below and send it to " + CLINIC_EMAIL + "."));
  }

  function showSuccess() {
    if (form) {
      form.classList.add("is-sent");
      form.reset();
    }
    if (status) {
      status.textContent = "Request sent — we'll reply during business hours. For anything urgent, call (425) 524-3602.";
      status.classList.remove("is-error");
      status.classList.add("is-success");
    }
  }

  /* FormSubmit payload: every named field plus its options, and _replyto set
     to the visitor's own address so the clinic can answer straight from the
     notification email. */
  function buildPayload() {
    var payload = {};
    var data = new window.FormData(form);
    data.forEach(function (value, key) {
      if (key === "_replyto") return;
      payload[key] = typeof value === "string" ? value.trim() : value;
    });
    payload._subject = "New appointment request — " + (fieldValue("name") || "website visitor");
    payload._template = "table";
    payload._captcha = "false";
    payload._replyto = fieldValue("email");
    return payload;
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

      if (sending) return;

      /* No fetch (very old browser): fall back to the email draft. */
      if (typeof window.fetch !== "function") {
        var draft = buildRequest();
        setStatus("Sending from the page is not supported in this browser. Opening your email app with the request filled in.");
        window.location.href = draft.mailto;
        return;
      }

      setSending(true);
      setStatus("Sending your request to the clinic...");

      var payload = buildPayload();
      var controller = typeof window.AbortController === "function" ? new window.AbortController() : null;
      var timer = controller
        ? window.setTimeout(function () { controller.abort(); }, 20000)
        : null;

      window.fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload),
        signal: controller ? controller.signal : undefined
      })
        .then(function (response) {
          return response.json().catch(function () { return {}; }).then(function (body) {
            return { ok: response.ok, body: body };
          });
        })
        .then(function (result) {
          var body = result.body || {};
          if (result.ok && String(body.success).toLowerCase() === "true") {
            showSuccess();
          } else {
            showSendFailure();
          }
        })
        .catch(function () {
          showSendFailure();
        })
        .then(function () {
          if (timer) window.clearTimeout(timer);
          setSending(false);
        });
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
