const status = document.querySelector("#status");
const insertButton = document.querySelector("#insert");
const recoverButton = document.querySelector("#recover");
const updateButton = document.querySelector("#update");

const CONTROL_TITLE = "VietMath Equation";
const TAG_PREFIX = "vietmath:";
const EQUATION_ID = "phase0-word-equation";

function toBase64Url(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

function fromBase64Url(value) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeMetadata(metadata) {
  return TAG_PREFIX + toBase64Url(JSON.stringify(metadata));
}

function decodeMetadata(tag) {
  if (!tag.startsWith(TAG_PREFIX)) throw new Error("Not a VietMath tag");
  return JSON.parse(fromBase64Url(tag.slice(TAG_PREFIX.length)));
}

function escapeXmlAttribute(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function sampleOoxml(revision) {
  const metadata = {
    id: EQUATION_ID,
    schemaVersion: 1,
    latex: "\\frac{a+" + revision + "}{b}",
    revision,
  };
  const tag = escapeXmlAttribute(encodeMetadata(metadata));
  const omml =
    "<m:f>" +
    "<m:num><m:e><m:r><m:t>a+" + revision + "</m:t></m:r></m:e></m:num>" +
    "<m:den><m:e><m:r><m:t>b</m:t></m:r></m:e></m:den>" +
    "</m:f>";

  return [
    '<pkg:package xmlns:pkg="http://schemas.microsoft.com/office/2006/xmlPackage">',
    '<pkg:part pkg:name="/_rels/.rels" pkg:contentType="application/vnd.openxmlformats-package.relationships+xml">',
    "<pkg:xmlData>",
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>',
    "</Relationships>",
    "</pkg:xmlData>",
    "</pkg:part>",
    '<pkg:part pkg:name="/word/document.xml" pkg:contentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml">',
    "<pkg:xmlData>",
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math">',
    "<w:body><w:sdt><w:sdtPr>",
    '<w:alias w:val="' + CONTROL_TITLE + '"/>',
    '<w:tag w:val="' + tag + '"/>',
    "</w:sdtPr><w:sdtContent><w:p><m:oMath>",
    omml,
    "</m:oMath></w:p></w:sdtContent></w:sdt></w:body></w:document>",
    "</pkg:xmlData></pkg:part></pkg:package>",
  ].join("");
}

async function getVietMathControls(context) {
  const controls = context.document.contentControls.getByTitle(CONTROL_TITLE);
  controls.load("items/tag,title");
  await context.sync();
  return controls;
}

async function recover() {
  return Word.run(async (context) => {
    const controls = await getVietMathControls(context);
    if (controls.items.length === 0) {
      status.textContent = "No VietMath equation found in this document.";
      return null;
    }

    const control = controls.items[controls.items.length - 1];
    const metadata = decodeMetadata(control.tag);
    status.textContent = "Recovered source:\n" + JSON.stringify(metadata, null, 2);
    return { control, metadata };
  });
}

insertButton.addEventListener("click", async () => {
  if (typeof Word === "undefined") {
    status.textContent = "Word JavaScript API is unavailable";
    return;
  }

  try {
    await Word.run(async (context) => {
      const range = context.document.getSelection();
      range.insertOoxml(sampleOoxml(1), Word.InsertLocation.replace);
      await context.sync();
    });
    status.textContent = "Inserted VietMath sample revision 1. Save and reopen the document, then Recover.";
  } catch (error) {
    status.textContent = "Insert failed: " + String(error);
  }
});

recoverButton.addEventListener("click", async () => {
  try {
    await recover();
  } catch (error) {
    status.textContent = "Recover failed: " + String(error);
  }
});

updateButton.addEventListener("click", async () => {
  try {
    await Word.run(async (context) => {
      const controls = await getVietMathControls(context);
      if (controls.items.length === 0) {
        status.textContent = "No VietMath equation found to update.";
        return;
      }

      const control = controls.items[controls.items.length - 1];
      const previous = decodeMetadata(control.tag);
      const nextRevision = Number(previous.revision ?? 0) + 1;
      const range = control.getRange();
      range.insertOoxml(sampleOoxml(nextRevision), Word.InsertLocation.replace);
      await context.sync();
      status.textContent = "Updated sample equation to revision " + nextRevision + ".";
    });
  } catch (error) {
    status.textContent = "Update failed: " + String(error);
  }
});

Office.onReady((info) => {
  status.textContent =
    info.host === Office.HostType.Word
      ? "Word host ready — run Insert, save/reopen, then Recover/Update."
      : "Open this spike inside Microsoft Word";
});
