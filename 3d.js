"use strict";

const threeProject = {
  objects: [],
  camera: {
    x: 0,
    y: 0,
    z: 500,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    zoom: 1
  },

  lighting: {
    intensity: 1,
    angle: 45
  },

  lowPoly: true
};

let threeObjects = [];
let selected3DObject = null;

let camera3D = {
  x: 0,
  y: 0,
  z: 500,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  zoom: 1
};

let lighting3D = {
  intensity: 1,
  angle: 45
};

let lowPolyMode = true;

const threeCanvas =
  document.getElementById(
    "threeCanvas"
  );

let threeCtx = null;

if(threeCanvas){
  threeCtx =
    threeCanvas.getContext(
      "2d"
    );
}

function create3DObject(
  type = "cube",
  name = "3D Object"
){
  return {
    id:
      "3d_" +
      Date.now() +
      "_" +
      Math.floor(
        Math.random() * 10000
      ),

    name: name,

    type: type,

    position: {
      x: 0,
      y: 0,
      z: 0
    },

    rotation: {
      x: 0,
      y: 0,
      z: 0
    },

    scale: {
      x: 1,
      y: 1,
      z: 1
    },

    color: "#6688ff",

    opacity: 1,

    visible: true,

    lowPoly: true,

    keyframes: []
  };
}

function ensure3DObjects(){
  if(
    !Array.isArray(
      threeObjects
    )
  ){
    threeObjects = [];
  }
}

function save3DProject(){
  threeProject.objects =
    threeObjects;

  threeProject.camera =
    camera3D;

  threeProject.lighting =
    lighting3D;

  threeProject.lowPoly =
    lowPolyMode;

  try{
    localStorage.setItem(
      "comicStudio3D",
      JSON.stringify(
        threeProject
      )
    );
  }catch(error){
    console.warn(
      "3D autosave unavailable",
      error
    );
  }
}

function load3DProject(){
  try{
    const saved =
      localStorage.getItem(
        "comicStudio3D"
      );

    if(saved){
      const data =
        JSON.parse(saved);

      if(
        data &&
        Array.isArray(
          data.objects
        )
      ){
        threeObjects =
          data.objects;
      }

      if(
        data &&
        data.camera
      ){
        camera3D = {
          ...camera3D,
          ...data.camera
        };
      }

      if(
        data &&
        data.lighting
      ){
        lighting3D = {
          ...lighting3D,
          ...data.lighting
        };
      }

      if(
        data &&
        typeof data.lowPoly ===
        "boolean"
      ){
        lowPolyMode =
          data.lowPoly;
      }
    }
  }catch(error){
    console.warn(
      "Could not load 3D project",
      error
    );
  }

  ensure3DObjects();

  render3DScene();
}
function project3DPoint(
  x,
  y,
  z
){
  const zoom =
    Number(camera3D.zoom) || 1;

  const depth =
    Math.max(
      100,
      camera3D.z - z
    );

  const perspective =
    500 / depth;

  return {
    x:
      threeCanvas.width / 2 +
      (x - camera3D.x) *
      perspective *
      zoom,

    y:
      threeCanvas.height / 2 +
      (y - camera3D.y) *
      perspective *
      zoom
  };
}

function draw3DCube(
  ctx,
  object
){
  const size =
    80;

  const sx =
    object.scale.x || 1;

  const sy =
    object.scale.y || 1;

  const sz =
    object.scale.z || 1;

  const w =
    size * sx;

  const h =
    size * sy;

  const depth =
    size * sz;

  const x =
    object.position.x;

  const y =
    object.position.y;

  const z =
    object.position.z;

  const points = [
    project3DPoint(
      x - w / 2,
      y - h / 2,
      z - depth / 2
    ),

    project3DPoint(
      x + w / 2,
      y - h / 2,
      z - depth / 2
    ),

    project3DPoint(
      x + w / 2,
      y + h / 2,
      z - depth / 2
    ),

    project3DPoint(
      x - w / 2,
      y + h / 2,
      z - depth / 2
    ),

    project3DPoint(
      x - w / 2,
      y - h / 2,
      z + depth / 2
    ),

    project3DPoint(
      x + w / 2,
      y - h / 2,
      z + depth / 2
    ),

    project3DPoint(
      x + w / 2,
      y + h / 2,
      z + depth / 2
    ),

    project3DPoint(
      x - w / 2,
      y + h / 2,
      z + depth / 2
    )
  ];

  ctx.save();

  ctx.globalAlpha =
    object.opacity ?? 1;

  ctx.strokeStyle =
    object.color ||
    "#6688ff";

  ctx.lineWidth =
    lowPolyMode ? 2 : 3;

  const edges = [
    [0,1],
    [1,2],
    [2,3],
    [3,0],
    [4,5],
    [5,6],
    [6,7],
    [7,4],
    [0,4],
    [1,5],
    [2,6],
    [3,7]
  ];

  edges.forEach(
    edge=>{
      const a =
        points[edge[0]];

      const b =
        points[edge[1]];

      ctx.beginPath();

      ctx.moveTo(
        a.x,
        a.y
      );

      ctx.lineTo(
        b.x,
        b.y
      );

      ctx.stroke();
    }
  );

  ctx.restore();
}

function draw3DSphere(
  ctx,
  object
){
  const point =
    project3DPoint(
      object.position.x,
      object.position.y,
      object.position.z
    );

  const radius =
    45 *
    (object.scale.x || 1) *
    (Number(camera3D.zoom) || 1);

  ctx.save();

  ctx.globalAlpha =
    object.opacity ?? 1;

  ctx.strokeStyle =
    object.color ||
    "#6688ff";

  ctx.lineWidth =
    lowPolyMode ? 2 : 3;

  ctx.beginPath();

  ctx.arc(
    point.x,
    point.y,
    radius,
    0,
    Math.PI * 2
  );

  ctx.stroke();

  if(!lowPolyMode){
    ctx.beginPath();

    ctx.ellipse(
      point.x,
      point.y,
      radius,
      radius * 0.35,
      0,
      0,
      Math.PI * 2
    );

    ctx.stroke();
  }

  ctx.restore();
}

function draw3DPlane(
  ctx,
  object
){
  const width =
    140 *
    (object.scale.x || 1);

  const height =
    100 *
    (object.scale.y || 1);

  const topLeft =
    project3DPoint(
      object.position.x -
        width / 2,
      object.position.y -
        height / 2,
      object.position.z
    );

  const topRight =
    project3DPoint(
      object.position.x +
        width / 2,
      object.position.y -
        height / 2,
      object.position.z
    );

  const bottomRight =
    project3DPoint(
      object.position.x +
        width / 2,
      object.position.y +
        height / 2,
      object.position.z
    );

  const bottomLeft =
    project3DPoint(
      object.position.x -
        width / 2,
      object.position.y +
        height / 2,
      object.position.z
    );

  ctx.save();

  ctx.globalAlpha =
    object.opacity ?? 1;

  ctx.strokeStyle =
    object.color ||
    "#6688ff";

  ctx.lineWidth = 2;

  ctx.beginPath();

  ctx.moveTo(
    topLeft.x,
    topLeft.y
  );

  ctx.lineTo(
    topRight.x,
    topRight.y
  );

  ctx.lineTo(
    bottomRight.x,
    bottomRight.y
  );

  ctx.lineTo(
    bottomLeft.x,
    bottomLeft.y
  );

  ctx.closePath();

  ctx.stroke();

  ctx.restore();
}

function draw3DObject(
  ctx,
  object
){
  if(
    !object ||
    object.visible === false
  ){
    return;
  }

  if(object.type === "sphere"){
    draw3DSphere(
      ctx,
      object
    );

    return;
  }

  if(object.type === "plane"){
    draw3DPlane(
      ctx,
      object
    );

    return;
  }

  draw3DCube(
    ctx,
    object
  );
}
function add3DObject(
  type,
  name
){
  const object =
    create3DObject(
      type ||
      "cube",

      name ||
      "3D Object " +
      (threeObjects.length + 1)
    );

  threeObjects.push(
    object
  );

  selected3DObject =
    object;

  save3DProject();

  render3DObjectList();
  render3DScene();

  if(
    typeof showToast ===
    "function"
  ){
    showToast(
      "3D object added ✓"
    );
  }

  return object;
}

function select3DObject(
  id
){
  const object =
    threeObjects.find(
      item =>
        item.id === id
    );

  if(!object){
    return;
  }

  selected3DObject =
    object;

  render3DObjectList();
  render3DInspector();
  render3DScene();
}

function delete3DObject(){
  if(!selected3DObject){
    return;
  }

  const index =
    threeObjects.indexOf(
      selected3DObject
    );

  if(index !== -1){
    threeObjects.splice(
      index,
      1
    );
  }

  selected3DObject =
    null;

  save3DProject();

  render3DObjectList();
  render3DInspector();
  render3DScene();

  if(
    typeof showToast ===
    "function"
  ){
    showToast(
      "3D object deleted"
    );
  }
}

function duplicate3DObject(){
  if(!selected3DObject){
    return;
  }

  const copy =
    JSON.parse(
      JSON.stringify(
        selected3DObject
      )
    );

  copy.id =
    "3d_" +
    Date.now() +
    "_" +
    Math.floor(
      Math.random() * 10000
    );

  copy.name =
    selected3DObject.name +
    " Copy";

  copy.position.x += 40;
  copy.position.y += 40;

  threeObjects.push(
    copy
  );

  selected3DObject =
    copy;

  save3DProject();

  render3DObjectList();
  render3DInspector();
  render3DScene();
}

function set3DPosition(
  axis,
  value
){
  if(
    !selected3DObject ||
    !selected3DObject.position
  ){
    return;
  }

  if(
    !["x","y","z"].includes(axis)
  ){
    return;
  }

  selected3DObject.position[axis] =
    Number(value) || 0;

  save3DProject();
  render3DScene();
}

function set3DRotation(
  axis,
  value
){
  if(
    !selected3DObject ||
    !selected3DObject.rotation
  ){
    return;
  }

  if(
    !["x","y","z"].includes(axis)
  ){
    return;
  }

  selected3DObject.rotation[axis] =
    Number(value) || 0;

  save3DProject();
  render3DScene();
}

function set3DScale(
  axis,
  value
){
  if(
    !selected3DObject ||
    !selected3DObject.scale
  ){
    return;
  }

  if(
    !["x","y","z"].includes(axis)
  ){
    return;
  }

  selected3DObject.scale[axis] =
    Math.max(
      0.1,
      Math.min(
        10,
        Number(value) || 1
      )
    );

  save3DProject();
  render3DScene();
}

function set3DColor(
  color
){
  if(!selected3DObject){
    return;
  }

  selected3DObject.color =
    color;

  save3DProject();
  render3DScene();
}

function set3DOpacity(
  value
){
  if(!selected3DObject){
    return;
  }

  selected3DObject.opacity =
    Math.max(
      0,
      Math.min(
        1,
        Number(value) || 0
      )
    );

  save3DProject();
  render3DScene();
}

function toggleLowPolyMode(){
  lowPolyMode =
    !lowPolyMode;

  threeObjects.forEach(
    object=>{
      object.lowPoly =
        lowPolyMode;
    }
  );

  save3DProject();
  render3DScene();

  const button =
    document.getElementById(
      "lowPolyBtn"
    );

  if(button){
    button.classList.toggle(
      "active",
      lowPolyMode
    );
  }
}
const threeRotationControls = {
  object3DRotX:
    ["x", set3DRotation],

  object3DRotY:
    ["y", set3DRotation],

  object3DRotZ:
    ["z", set3DRotation]
};

Object.keys(
  threeRotationControls
).forEach(
  id=>{
    const input =
      document.getElementById(id);

    if(input){
      input.addEventListener(
        "input",
        ()=>{
          const data =
            threeRotationControls[id];

          data[1](
            data[0],
            input.value
          );
        }
      );
    }
  }
);

const threeScaleControls = {
  object3DScaleX:
    ["x", set3DScale],

  object3DScaleY:
    ["y", set3DScale],

  object3DScaleZ:
    ["z", set3DScale]
};

Object.keys(
  threeScaleControls
).forEach(
  id=>{
    const input =
      document.getElementById(id);

    if(input){
      input.addEventListener(
        "input",
        ()=>{
          const data =
            threeScaleControls[id];

          data[1](
            data[0],
            input.value
          );
        }
      );
    }
  }
);

const threeColorInput =
  document.getElementById(
    "object3DColor"
  );

if(threeColorInput){
  threeColorInput.addEventListener(
    "input",
    ()=>{
      set3DColor(
        threeColorInput.value
      );
    }
  );
}

const threeOpacityInput =
  document.getElementById(
    "object3DOpacity"
  );

if(threeOpacityInput){
  threeOpacityInput.addEventListener(
    "input",
    ()=>{
      set3DOpacity(
        threeOpacityInput.value
      );
    }
  );
}

function resize3DCanvas(){
  if(!threeCanvas){
    return;
  }

  const rect =
    threeCanvas
      .parentElement
      ?.getBoundingClientRect();

  if(!rect){
    return;
  }

  threeCanvas.width =
    Math.max(
      320,
      Math.floor(rect.width)
    );

  threeCanvas.height =
    Math.max(
      300,
      Math.floor(rect.height)
    );

  render3DScene();
}

function set3DMode(){
  const panel =
    document.getElementById(
      "threePanel"
    );

  if(panel){
    panel.classList.add(
      "active"
    );
  }

  render3DObjectList();
  render3DInspector();
  render3DScene();
}

const threeNav =
  document.querySelector(
    '[data-mode="3d"]'
  );

if(threeNav){
  threeNav.addEventListener(
    "click",
    set3DMode
  );
}

window.addEventListener(
  "resize",
  resize3DCanvas
);

function initialize3D(){
  load3DProject();

  connect3DControls();

  resize3DCanvas();

  render3DObjectList();
  render3DInspector();
  render3DScene();
}

window.addEventListener(
  "beforeunload",
  save3DProject
);

if(
  document.readyState ===
  "loading"
){
  document.addEventListener(
    "DOMContentLoaded",
    initialize3D
  );
}else{
  initialize3D();
}

window.threeStudio = {
  getObjects:
    ()=>{
      return threeObjects;
    },

  getSelected:
    ()=>{
      return selected3DObject;
    },

  add:
    add3DObject,

  select:
    select3DObject,

  delete:
    delete3DObject,

  duplicate:
    duplicate3DObject,

  save:
    save3DProject,

  lowPoly:
    ()=>{
      return lowPolyMode;
    }
};

console.log(
  "Comic Studio 3D Engine ready ✓"
);
function render3DScene(){
  if(
    !threeCanvas ||
    !threeCtx
  ){
    return;
  }

  threeCtx.clearRect(
    0,
    0,
    threeCanvas.width,
    threeCanvas.height
  );

  threeCtx.fillStyle =
    "#10141c";

  threeCtx.fillRect(
    0,
    0,
    threeCanvas.width,
    threeCanvas.height
  );

  // Lightweight floor grid
  threeCtx.save();

  threeCtx.strokeStyle =
    "#263040";

  threeCtx.lineWidth = 1;

  const gridSize =
    lowPolyMode
      ? 40
      : 30;

  for(
    let x = 0;
    x < threeCanvas.width;
    x += gridSize
  ){
    threeCtx.beginPath();

    threeCtx.moveTo(
      x,
      0
    );

    threeCtx.lineTo(
      x,
      threeCanvas.height
    );

    threeCtx.stroke();
  }

  for(
    let y = 0;
    y < threeCanvas.height;
    y += gridSize
  ){
    threeCtx.beginPath();

    threeCtx.moveTo(
      0,
      y
    );

    threeCtx.lineTo(
      threeCanvas.width,
      y
    );

    threeCtx.stroke();
  }

  threeCtx.restore();

  threeObjects.forEach(
    object=>{
      draw3DObject(
        threeCtx,
        object
      );
    }
  );

  if(selected3DObject){
    const point =
      project3DPoint(
        selected3DObject.position.x,
        selected3DObject.position.y,
        selected3DObject.position.z
      );

    threeCtx.save();

    threeCtx.strokeStyle =
      "#00d9ff";

    threeCtx.lineWidth = 2;

    threeCtx.setLineDash([
      6,
      4
    ]);

    threeCtx.beginPath();

    threeCtx.arc(
      point.x,
      point.y,
      55,
      0,
      Math.PI * 2
    );

    threeCtx.stroke();

    threeCtx.setLineDash([]);

    threeCtx.restore();
  }
}

function render3DObjectList(){
  const list =
    document.getElementById(
      "threeObjectList"
    );

  if(!list){
    return;
  }

  list.innerHTML = "";

  threeObjects.forEach(
    object=>{
      const item =
        document.createElement(
          "button"
        );

      item.className =
        "three-object-item" +
        (
          selected3DObject &&
          selected3DObject.id ===
          object.id
            ? " active"
            : ""
        );

      item.textContent =
        object.name ||
        object.type;

      item.onclick =
        ()=>{
          select3DObject(
            object.id
          );
        };

      list.appendChild(
        item
      );
    }
  );
}

function render3DInspector(){
  if(!selected3DObject){
    return;
  }

  const object =
    selected3DObject;

  const values = {
    object3DX:
      object.position.x,

    object3DY:
      object.position.y,

    object3DZ:
      object.position.z,

    object3DRotX:
      object.rotation.x,

    object3DRotY:
      object.rotation.y,

    object3DRotZ:
      object.rotation.z,

    object3DScaleX:
      object.scale.x,

    object3DScaleY:
      object.scale.y,

    object3DScaleZ:
      object.scale.z
  };

  Object.keys(
    values
  ).forEach(
    id=>{
      const input =
        document.getElementById(
          id
        );

      if(input){
        input.value =
          values[id];
      }
    }
  );

  const colorInput =
    document.getElementById(
      "object3DColor"
    );

  if(colorInput){
    colorInput.value =
      object.color ||
      "#6688ff";
  }

  const opacityInput =
    document.getElementById(
      "object3DOpacity"
    );

  if(opacityInput){
    opacityInput.value =
      object.opacity ??
      1;
  }
}

function connect3DControls(){
  const addCubeBtn =
    document.getElementById(
      "add3DCubeBtn"
    );

  if(addCubeBtn){
    addCubeBtn.onclick =
      ()=>{
        add3DObject(
          "cube",
          "Cube"
        );
      };
  }

  const addSphereBtn =
    document.getElementById(
      "add3DSphereBtn"
    );

  if(addSphereBtn){
    addSphereBtn.onclick =
      ()=>{
        add3DObject(
          "sphere",
          "Sphere"
        );
      };
  }

  const addPlaneBtn =
    document.getElementById(
      "add3DPlaneBtn"
    );

  if(addPlaneBtn){
    addPlaneBtn.onclick =
      ()=>{
        add3DObject(
          "plane",
          "Plane"
        );
      };
  }

  const deleteBtn =
    document.getElementById(
      "delete3DObjectBtn"
    );

  if(deleteBtn){
    deleteBtn.onclick =
      delete3DObject;
  }

  const duplicateBtn =
    document.getElementById(
      "duplicate3DObjectBtn"
    );

  if(duplicateBtn){
    duplicateBtn.onclick =
      duplicate3DObject;
  }

  const lowPolyBtn =
    document.getElementById(
      "lowPolyBtn"
    );

  if(lowPolyBtn){
    lowPolyBtn.onclick =
      toggleLowPolyMode;

    lowPolyBtn.classList.toggle(
      "active",
      lowPolyMode
    );
  }
}

const threePositionControls = {
  object3DX:
    ["x", set3DPosition],

  object3DY:
    ["y", set3DPosition],

  object3DZ:
    ["z", set3DPosition]
};

Object.keys(
  threePositionControls
).forEach(
  id=>{
    const input =
      document.getElementById(id);

    if(input){
      input.addEventListener(
        "input",
        ()=>{
          const data =
            threePositionControls[id];

          data[1](
            data[0],
            input.value
          );
        }
      );
    }
  }
);
