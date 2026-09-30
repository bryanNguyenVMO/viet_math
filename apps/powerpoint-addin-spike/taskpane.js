const SOURCE_TAG = "VIETMATH_SOURCE";

function bindingId(id) {
  return `vietmath:${id}`;
}

export async function insertEquationShape({
  id,
  base64Image,
  encodedSource,
  geometry = { left: 30, top: 100, width: 240, height: 80 },
}) {
  return PowerPoint.run(async (context) => {
    const slides = context.presentation.getSelectedSlides();
    const slide = slides.getItemAt(0);

    const shape = slide.shapes.addGeometricShape(
      PowerPoint.GeometricShapeType.rectangle,
      geometry,
    );

    shape.fill.setImage(base64Image);
    shape.tags.add(SOURCE_TAG, encodedSource);

    context.presentation.bindings.add(
      shape,
      PowerPoint.BindingType.shape,
      bindingId(id),
    );

    shape.load("id,left,top,width,height,rotation");
    await context.sync();

    return {
      shapeId: shape.id,
      left: shape.left,
      top: shape.top,
      width: shape.width,
      height: shape.height,
      rotation: shape.rotation,
    };
  });
}

export async function updateBoundEquation({
  id,
  base64Image,
  encodedSource,
}) {
  return PowerPoint.run(async (context) => {
    const binding = context.presentation.bindings.getItem(bindingId(id));
    const shape = binding.getShape();

    shape.load("id,left,top,width,height,rotation");
    await context.sync();

    const geometry = {
      left: shape.left,
      top: shape.top,
      width: shape.width,
      height: shape.height,
      rotation: shape.rotation,
    };

    shape.fill.setImage(base64Image);
    shape.tags.add(SOURCE_TAG, encodedSource);
    await context.sync();

    return { shapeId: shape.id, geometry };
  });
}

Office.onReady((info) => {
  const status = document.querySelector("#status");

  if (!status) return;

  if (info.host !== Office.HostType.PowerPoint) {
    status.textContent = "Open this Phase 0 spike inside Microsoft PowerPoint.";
    return;
  }

  const bindingsSupported =
    Office.context.requirements.isSetSupported("PowerPointApi", "1.8");

  status.textContent = bindingsSupported
    ? "PowerPoint host ready — shape bindings are supported."
    : "PowerPoint host ready — PowerPointApi 1.8 binding support is required.";
});


const PHASE0_ID = "phase0-powerpoint-equation";
const SAMPLE_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+H0TbWQAAAABJRU5ErkJggg==";

function encodeSource(revision) {
  const payload = JSON.stringify({
    id: PHASE0_ID,
    schemaVersion: 1,
    latex: "\\frac{a+" + revision + "}{b}",
    revision,
  });
  return btoa(unescape(encodeURIComponent(payload)));
}

document.querySelector("#insert-sample")?.addEventListener("click", async () => {
  const status = document.querySelector("#status");
  try {
    const result = await insertEquationShape({
      id: PHASE0_ID,
      base64Image: SAMPLE_PNG_BASE64,
      encodedSource: encodeSource(1),
    });
    if (status) status.textContent =
      "Inserted shape " + result.shapeId + ". Move/resize/rotate it, save/reopen, then Update.";
  } catch (error) {
    if (status) status.textContent = "Insert failed: " + String(error);
  }
});

document.querySelector("#update-sample")?.addEventListener("click", async () => {
  const status = document.querySelector("#status");
  try {
    const result = await updateBoundEquation({
      id: PHASE0_ID,
      base64Image: SAMPLE_PNG_BASE64,
      encodedSource: encodeSource(2),
    });
    if (status) status.textContent =
      "Updated bound shape " + result.shapeId + "; geometry: " + JSON.stringify(result.geometry);
  } catch (error) {
    if (status) status.textContent = "Update failed: " + String(error);
  }
});
