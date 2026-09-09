"use strict";

const drawingCanvas =
  document.getElementById("comicCanvas");

const drawingCtx =
  drawingCanvas.getContext("2d");

let drawingObjects = [];

let selectedDrawingObject = null;

let drawingStartX = 0;
let drawingStartY = 0;

let drawingTempObject = null;

function getDrawingPage(){
  if(
    typeof pages === "undefined" ||
    !pages[currentPage]
  ){
    return null;
  }

  const page =
    pages[currentPage];

  if(!Array.isArray(page.objects)){
    page.objects = [];
  }

  return page;
}

function createDrawingObject(
  type,
  x,
  y,
  width,
  height
){
  return {
    id:
      "obj_" +
      Date.now() +
      "_" +
      Math.floor(
        Math.random() * 10000
      ),

    type: type,

    x: x,
    y: y,

    width: width,
    height: height,

    rotation: 0,

    scaleX: 1,
    scaleY: 1,

    color:
      typeof currentColor !== "undefined"
        ? currentColor
        : "#000000",

    lineWidth:
      typeof brushSize !== "undefined"
        ? brushSize
        : 5,

    opacity: 1
  };
}

function addDrawingObject(object){
  const page =
    getDrawingPage();

  if(!page) return;

  page.objects.push(object);

  selectedDrawingObject =
    object;

  if(
    typeof saveState ===
    "function"
  ){
    saveState();
  }

  if(
    typeof redraw ===
    "function"
  ){
    redraw();
  }
}

function removeDrawingObject(object){
  const page =
    getDrawingPage();

  if(!page || !object) return;

  const index =
    page.objects.indexOf(object);

  if(index !== -1){
    page.objects.splice(
      index,
      1
    );
  }

  selectedDrawingObject =
    null;

  if(
    typeof saveState ===
    "function"
  ){
    saveState();
  }

  if(
    typeof redraw ===
    "function"
  ){
    redraw();
  }
}

function clearSelection(){
  selectedDrawingObject =
    null;

  drawingTempObject =
    null;

  if(
    typeof redraw ===
    "function"
  ){
    redraw();
  }
}

function selectDrawingObjectAt(
  x,
  y
){
  const page =
    getDrawingPage();

  if(!page) return null;

  for(
    let i =
      page.objects.length - 1;
    i >= 0;
    i--
  ){
    const object =
      page.objects[i];

    const left =
      object.x;

    const top =
      object.y;

    const right =
      object.x +
      object.width;

    const bottom =
      object.y +
      object.height;

    if(
      x >= left &&
      x <= right &&
      y >= top &&
      y <= bottom
    ){
      selectedDrawingObject =
        object;

      return object;
    }
  }

  selectedDrawingObject =
    null;

  return null;
  }
function drawShapeObject(object){
  if(!object) return;

  drawingCtx.save();

  drawingCtx.translate(
    object.x + object.width / 2,
    object.y + object.height / 2
  );

  drawingCtx.rotate(
    (object.rotation || 0) *
    Math.PI / 180
  );

  drawingCtx.globalAlpha =
    object.opacity ?? 1;

  drawingCtx.strokeStyle =
    object.color || "#000000";

  drawingCtx.fillStyle =
    object.fillColor ||
    "transparent";

  drawingCtx.lineWidth =
    object.lineWidth || 4;

  const width =
    object.width;

  const height =
    object.height;

  if(object.type === "rectangle"){
    if(
      object.fillColor &&
      object.fillColor !==
      "transparent"
    ){
      drawingCtx.fillRect(
        -width / 2,
        -height / 2,
        width,
        height
      );
    }

    drawingCtx.strokeRect(
      -width / 2,
      -height / 2,
      width,
      height
    );
  }

  if(object.type === "circle"){
    drawingCtx.beginPath();

    drawingCtx.ellipse(
      0,
      0,
      Math.abs(width) / 2,
      Math.abs(height) / 2,
      0,
      0,
      Math.PI * 2
    );

    if(
      object.fillColor &&
      object.fillColor !==
      "transparent"
    ){
      drawingCtx.fill();
    }

    drawingCtx.stroke();
  }

  if(object.type === "triangle"){
    drawingCtx.beginPath();

    drawingCtx.moveTo(
      0,
      -height / 2
    );

    drawingCtx.lineTo(
      width / 2,
      height / 2
    );

    drawingCtx.lineTo(
      -width / 2,
      height / 2
    );

    drawingCtx.closePath();

    if(
      object.fillColor &&
      object.fillColor !==
      "transparent"
    ){
      drawingCtx.fill();
    }

    drawingCtx.stroke();
  }

  if(object.type === "line"){
    drawingCtx.beginPath();

    drawingCtx.moveTo(
      -width / 2,
      0
    );

    drawingCtx.lineTo(
      width / 2,
      0
    );

    drawingCtx.stroke();
  }

  drawingCtx.restore();
}

function drawSelectionBox(object){
  if(!object) return;

  drawingCtx.save();

  drawingCtx.strokeStyle =
    "#00aaff";

  drawingCtx.lineWidth = 2;

  drawingCtx.setLineDash([
    6,
    4
  ]);

  drawingCtx.strokeRect(
    object.x - 6,
    object.y - 6,
    object.width + 12,
    object.height + 12
  );

  drawingCtx.setLineDash([]);

  drawingCtx.fillStyle =
    "#ffffff";

  const handles = [
    [object.x, object.y],
    [
      object.x +
      object.width,
      object.y
    ],
    [
      object.x +
      object.width,
      object.y +
      object.height
    ],
    [
      object.x,
      object.y +
      object.height
    ]
  ];

  handles.forEach(
    handle=>{
      drawingCtx.beginPath();

      drawingCtx.arc(
        handle[0],
        handle[1],
        6,
        0,
        Math.PI * 2
      );

      drawingCtx.fill();
      drawingCtx.stroke();
    }
  );

  drawingCtx.restore();
}

function drawAllObjects(){
  const page =
    getDrawingPage();

  if(!page) return;

  if(
    !Array.isArray(page.objects)
  ){
    return;
  }

  page.objects.forEach(
    object=>{
      if(
        object.type ===
        "rectangle" ||
        object.type ===
        "circle" ||
        object.type ===
        "triangle" ||
        object.type ===
        "line"
      ){
        drawShapeObject(
          object
        );
      }
    }
  );

  if(selectedDrawingObject){
    drawSelectionBox(
      selectedDrawingObject
    );
  }
}

function getActiveShape(){
  if(
    typeof currentTool ===
    "undefined"
  ){
    return "rectangle";
  }

  return "rectangle";
}
function handleDrawingPointerDown(event){
  if(
    typeof currentTool ===
    "undefined"
  ){
    return;
  }

  if(
    currentTool !== "select" &&
    currentTool !== "shape" &&
    currentTool !== "line"
  ){
    return;
  }

  const rect =
    drawingCanvas.getBoundingClientRect();

  const x =
    (event.clientX - rect.left) *
    drawingCanvas.width /
    rect.width;

  const y =
    (event.clientY - rect.top) *
    drawingCanvas.height /
    rect.height;

  drawingStartX = x;
  drawingStartY = y;

  if(currentTool === "select"){
    selectedDrawingObject =
      selectDrawingObjectAt(
        x,
        y
      );

    drawingCanvas.style.cursor =
      selectedDrawingObject
        ? "move"
        : "default";

    if(
      typeof redraw ===
      "function"
    ){
      redraw();
    }

    return;
  }

  drawingTempObject =
    createDrawingObject(
      currentTool === "line"
        ? "line"
        : getActiveShape(),
      x,
      y,
      0,
      0
    );

  drawingCanvas.setPointerCapture(
    event.pointerId
  );
}

function handleDrawingPointerMove(event){
  if(!drawingTempObject) return;

  const rect =
    drawingCanvas.getBoundingClientRect();

  const x =
    (event.clientX - rect.left) *
    drawingCanvas.width /
    rect.width;

  const y =
    (event.clientY - rect.top) *
    drawingCanvas.height /
    rect.height;

  drawingTempObject.width =
    x - drawingStartX;

  drawingTempObject.height =
    y - drawingStartY;

  if(
    typeof redraw ===
    "function"
  ){
    redraw();
  }

  drawingCtx.save();

  drawingCtx.globalAlpha =
    0.65;

  drawShapeObject(
    drawingTempObject
  );

  drawingCtx.restore();
}

function handleDrawingPointerUp(event){
  if(!drawingTempObject){
    return;
  }

  const object =
    drawingTempObject;

  drawingTempObject =
    null;

  if(
    Math.abs(object.width) < 5 ||
    Math.abs(object.height) < 5
  ){
    if(
      typeof redraw ===
      "function"
    ){
      redraw();
    }

    return;
  }

  if(object.width < 0){
    object.x +=
      object.width;

    object.width =
      Math.abs(object.width);
  }

  if(object.height < 0){
    object.y +=
      object.height;

    object.height =
      Math.abs(object.height);
  }

  addDrawingObject(
    object
  );

  try{
    drawingCanvas.releasePointerCapture(
      event.pointerId
    );
  }catch(error){}
}

drawingCanvas.addEventListener(
  "pointerdown",
  handleDrawingPointerDown
);

drawingCanvas.addEventListener(
  "pointermove",
  handleDrawingPointerMove
);

drawingCanvas.addEventListener(
  "pointerup",
  handleDrawingPointerUp
);

drawingCanvas.addEventListener(
  "pointercancel",
  ()=>{
    drawingTempObject =
      null;
  }
);

function bringObjectForward(){
  const page =
    getDrawingPage();

  if(
    !page ||
    !selectedDrawingObject
  ){
    return;
  }

  const index =
    page.objects.indexOf(
      selectedDrawingObject
    );

  if(
    index >= 0 &&
    index < page.objects.length - 1
  ){
    const next =
      page.objects[index + 1];

    page.objects[index + 1] =
      selectedDrawingObject;

    page.objects[index] =
      next;

    saveState();
    redraw();
  }
}

function sendObjectBackward(){
  const page =
    getDrawingPage();

  if(
    !page ||
    !selectedDrawingObject
  ){
    return;
  }

  const index =
    page.objects.indexOf(
      selectedDrawingObject
    );

  if(index > 0){
    const previous =
      page.objects[index - 1];

    page.objects[index - 1] =
      selectedDrawingObject;

    page.objects[index] =
      previous;

    saveState();
    redraw();
  }
        }function handleDrawingPointerDown(event){
  if(
    typeof currentTool ===
    "undefined"
  ){
    return;
  }

  if(
    currentTool !== "select" &&
    currentTool !== "shape" &&
    currentTool !== "line"
  ){
    return;
  }

  const rect =
    drawingCanvas.getBoundingClientRect();

  const x =
    (event.clientX - rect.left) *
    drawingCanvas.width /
    rect.width;

  const y =
    (event.clientY - rect.top) *
    drawingCanvas.height /
    rect.height;

  drawingStartX = x;
  drawingStartY = y;

  if(currentTool === "select"){
    selectedDrawingObject =
      selectDrawingObjectAt(
        x,
        y
      );

    drawingCanvas.style.cursor =
      selectedDrawingObject
        ? "move"
        : "default";

    if(
      typeof redraw ===
      "function"
    ){
      redraw();
    }

    return;
  }

  drawingTempObject =
    createDrawingObject(
      currentTool === "line"
        ? "line"
        : getActiveShape(),
      x,
      y,
      0,
      0
    );

  drawingCanvas.setPointerCapture(
    event.pointerId
  );
}

function handleDrawingPointerMove(event){
  if(!drawingTempObject) return;

  const rect =
    drawingCanvas.getBoundingClientRect();

  const x =
    (event.clientX - rect.left) *
    drawingCanvas.width /
    rect.width;

  const y =
    (event.clientY - rect.top) *
    drawingCanvas.height /
    rect.height;

  drawingTempObject.width =
    x - drawingStartX;

  drawingTempObject.height =
    y - drawingStartY;

  if(
    typeof redraw ===
    "function"
  ){
    redraw();
  }

  drawingCtx.save();

  drawingCtx.globalAlpha =
    0.65;

  drawShapeObject(
    drawingTempObject
  );

  drawingCtx.restore();
}

function handleDrawingPointerUp(event){
  if(!drawingTempObject){
    return;
  }

  const object =
    drawingTempObject;

  drawingTempObject =
    null;

  if(
    Math.abs(object.width) < 5 ||
    Math.abs(object.height) < 5
  ){
    if(
      typeof redraw ===
      "function"
    ){
      redraw();
    }

    return;
  }

  if(object.width < 0){
    object.x +=
      object.width;

    object.width =
      Math.abs(object.width);
  }

  if(object.height < 0){
    object.y +=
      object.height;

    object.height =
      Math.abs(object.height);
  }

  addDrawingObject(
    object
  );

  try{
    drawingCanvas.releasePointerCapture(
      event.pointerId
    );
  }catch(error){}
}

drawingCanvas.addEventListener(
  "pointerdown",
  handleDrawingPointerDown
);

drawingCanvas.addEventListener(
  "pointermove",
  handleDrawingPointerMove
);

drawingCanvas.addEventListener(
  "pointerup",
  handleDrawingPointerUp
);

drawingCanvas.addEventListener(
  "pointercancel",
  ()=>{
    drawingTempObject =
      null;
  }
);

function bringObjectForward(){
  const page =
    getDrawingPage();

  if(
    !page ||
    !selectedDrawingObject
  ){
    return;
  }

  const index =
    page.objects.indexOf(
      selectedDrawingObject
    );

  if(
    index >= 0 &&
    index < page.objects.length - 1
  ){
    const next =
      page.objects[index + 1];

    page.objects[index + 1] =
      selectedDrawingObject;

    page.objects[index] =
      next;

    saveState();
    redraw();
  }
}

function sendObjectBackward(){
  const page =
    getDrawingPage();

  if(
    !page ||
    !selectedDrawingObject
  ){
    return;
  }

  const index =
    page.objects.indexOf(
      selectedDrawingObject
    );

  if(index > 0){
    const previous =
      page.objects[index - 1];

    page.objects[index - 1] =
      selectedDrawingObject;

    page.objects[index] =
      previous;

    saveState();
    redraw();
  }
    }
function copySelectedObject(){
  if(!selectedDrawingObject){
    return;
  }

  const page =
    getDrawingPage();

  if(!page) return;

  const copy =
    JSON.parse(
      JSON.stringify(
        selectedDrawingObject
      )
    );

  copy.id =
    "obj_" +
    Date.now() +
    "_" +
    Math.floor(
      Math.random() * 10000
    );

  copy.x += 20;
  copy.y += 20;

  page.objects.push(copy);

  selectedDrawingObject =
    copy;

  saveState();
  redraw();
}

function transformSelectedObject(
  changes
){
  if(!selectedDrawingObject){
    return;
  }

  Object.keys(changes)
    .forEach(key=>{
      const value =
        Number(changes[key]);

      if(Number.isFinite(value)){
        selectedDrawingObject[key] =
          value;
      }
    });

  saveState();
  redraw();
}

function rotateSelectedObject(
  amount
){
  if(!selectedDrawingObject){
    return;
  }

  selectedDrawingObject.rotation =
    (
      selectedDrawingObject.rotation ||
      0
    ) + amount;

  saveState();
  redraw();
}

function flipSelectedObject(
  horizontal
){
  if(!selectedDrawingObject){
    return;
  }

  if(horizontal){
    selectedDrawingObject.scaleX =
      (selectedDrawingObject.scaleX || 1)
      * -1;
  }else{
    selectedDrawingObject.scaleY =
      (selectedDrawingObject.scaleY || 1)
      * -1;
  }

  saveState();
  redraw();
}

function deleteSelectedObject(){
  if(!selectedDrawingObject){
    return;
  }

  removeDrawingObject(
    selectedDrawingObject
  );
}

function duplicateSelectedObject(){
  copySelectedObject();
}

const frontBtn =
  document.getElementById(
    "bringFrontBtn"
  );

if(frontBtn){
  frontBtn.onclick =
    bringObjectForward;
}

const backBtn =
  document.getElementById(
    "sendBackBtn"
  );

if(backBtn){
  backBtn.onclick =
    sendObjectBackward;
}

const copyBtn =
  document.getElementById(
    "copyObjectBtn"
  );

if(copyBtn){
  copyBtn.onclick =
    duplicateSelectedObject;
}

const deleteBtn =
  document.getElementById(
    "deleteObjectBtn"
  );

if(deleteBtn){
  deleteBtn.onclick =
    deleteSelectedObject;
}

const applyTransformBtn =
  document.getElementById(
    "applyTransformBtn"
  );

if(applyTransformBtn){
  applyTransformBtn.onclick =
    ()=>{
      if(!selectedDrawingObject){
        return;
      }

      const values = {};

      [
        "objectX",
        "objectY",
        "objectWidth",
        "objectHeight",
        "objectRotation",
        "objectScale"
      ].forEach(
        id=>{
          const input =
            document.getElementById(id);

          if(input){
            values[
              id
            ] =
              input.value;
          }
        }
      );

      transformSelectedObject({
        x: values.objectX,
        y: values.objectY,
        width: values.objectWidth,
        height: values.objectHeight,
        rotation:
          values.objectRotation,
        scaleX:
          values.objectScale,
        scaleY:
          values.objectScale
      });
    };
}

document.addEventListener(
  "keydown",
  event=>{
    if(!selectedDrawingObject){
      return;
    }

    if(
      event.key === "Delete" ||
      event.key === "Backspace"
    ){
      deleteSelectedObject();
    }

    if(
      event.ctrlKey &&
      event.key.toLowerCase() === "d"
    ){
      event.preventDefault();
      duplicateSelectedObject();
    }

    if(event.key === "ArrowLeft"){
      selectedDrawingObject.x -= 2;
      redraw();
    }

    if(event.key === "ArrowRight"){
      selectedDrawingObject.x += 2;
      redraw();
    }

    if(event.key === "ArrowUp"){
      selectedDrawingObject.y -= 2;
      redraw();
    }

    if(event.key === "ArrowDown"){
      selectedDrawingObject.y += 2;
      redraw();
    }
  }
);
function syncInspector(){
  if(!selectedDrawingObject){
    return;
  }

  const fields = {
    objectX: selectedDrawingObject.x,
    objectY: selectedDrawingObject.y,
    objectWidth: selectedDrawingObject.width,
    objectHeight: selectedDrawingObject.height,
    objectRotation:
      selectedDrawingObject.rotation || 0,
    objectScale:
      selectedDrawingObject.scaleX || 1
  };

  Object.keys(fields).forEach(
    id=>{
      const input =
        document.getElementById(id);

      if(input){
        input.value =
          fields[id];
      }
    }
  );
}

const originalSelect =
  selectDrawingObjectAt;

selectDrawingObjectAt =
  function(x,y){
    const object =
      originalSelect(x,y);

    syncInspector();

    return object;
  };

function setObjectColor(color){
  if(!selectedDrawingObject){
    return;
  }

  selectedDrawingObject.color =
    color;

  saveState();
  redraw();
}

function setObjectOpacity(value){
  if(!selectedDrawingObject){
    return;
  }

  selectedDrawingObject.opacity =
    Math.max(
      0,
      Math.min(1, Number(value))
    );

  saveState();
  redraw();
}

function initializeDrawingModule(){
  const page =
    getDrawingPage();

  if(!page) return;

  if(!Array.isArray(page.objects)){
    page.objects = [];
  }

  if(
    typeof redraw ===
    "function"
  ){
    redraw();
  }
}

window.addEventListener(
  "resize",
  ()=>{
    setTimeout(
      initializeDrawingModule,
      50
    );
  }
);

const objectColor =
  document.getElementById(
    "objectColor"
  );

if(objectColor){
  objectColor.addEventListener(
    "input",
    ()=>{
      setObjectColor(
        objectColor.value
      );
    }
  );
}

const opacityInput =
  document.getElementById(
    "objectOpacity"
  );

if(opacityInput){
  opacityInput.addEventListener(
    "input",
    ()=>{
      setObjectOpacity(
        opacityInput.value
      );
    }
  );
}

window.addEventListener(
  "load",
  initializeDrawingModule
);
