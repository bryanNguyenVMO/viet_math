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
