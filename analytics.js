// ChemRender website analytics — GoatCounter (privacy-friendly, no cookies).
//
// To turn this on:
//   1. Create a site at https://www.goatcounter.com (e.g. "chemrender").
//   2. Replace YOURCODE below with that subdomain.
// View the data anytime at https://YOURCODE.goatcounter.com
//
// Point the text-to-chem app at the SAME code (VITE_GOATCOUNTER_ENDPOINT in
// its .env.local) so the app and website report into one dashboard.
const GOATCOUNTER_CODE = "bridgerb";

(function () {
  if (GOATCOUNTER_CODE === "YOURCODE") {
    return; // not configured yet — does nothing until you set the code above
  }

  const endpoint = "https://" + GOATCOUNTER_CODE + ".goatcounter.com/count";

  // Auto-count the page view.
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://gc.zgo.at/count.js";
  script.dataset.goatcounter = endpoint;
  document.head.appendChild(script);

  // Count clicks on anything tagged with data-gc-event="name" as an event.
  document.addEventListener("click", function (event) {
    const el = event.target.closest("[data-gc-event]");
    if (!el || !window.goatcounter || !window.goatcounter.count) {
      return;
    }
    const name = el.getAttribute("data-gc-event");
    window.goatcounter.count({ path: "site-" + name, title: name, event: true });
  });
})();
