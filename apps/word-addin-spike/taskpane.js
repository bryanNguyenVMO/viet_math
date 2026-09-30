const status = document.querySelector("#status");
const insert = document.querySelector("#insert");

Office.onReady((info) => {
  status.textContent =
    info.host === Office.HostType.Word
      ? "Word host ready"
      : "Open this spike inside Microsoft Word";
});

insert.addEventListener("click", async () => {
  if (typeof Word === "undefined") {
    status.textContent = "Word JavaScript API is unavailable";
    return;
  }

  status.textContent =
    "Use the generated OOXML fixture from packages/word-spike in the manual validation harness.";
});
