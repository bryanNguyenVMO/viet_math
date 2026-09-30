import { encodeWordMetadataTag } from "./metadata";
import type { WordEquationMetadata } from "./types";

function escapeXmlAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function buildWordOoxmlPackage(
  omml: string,
  metadata: WordEquationMetadata,
): string {
  const tag = escapeXmlAttribute(encodeWordMetadataTag(metadata));

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
    "<w:body>",
    "<w:sdt>",
    "<w:sdtPr>",
    '<w:alias w:val="VietMath Equation"/>',
    `<w:tag w:val="${tag}"/>`,
    "</w:sdtPr>",
    "<w:sdtContent>",
    `<w:p><m:oMath>${omml}</m:oMath></w:p>`,
    "</w:sdtContent>",
    "</w:sdt>",
    "</w:body>",
    "</w:document>",
    "</pkg:xmlData>",
    "</pkg:part>",
    "</pkg:package>",
  ].join("");
}
