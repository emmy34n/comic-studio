"use strict";

const animCanvas =
  document.getElementById("animationCanvas");

const animCtx =
  animCanvas.getContext("2d");

let animationFrames = [];
let currentFrame = 0;

let animationFPS = 12;
let animationPlaying = false;
let animationLoop = true;

let animationTimer = null;

let onionSkinEnabled = false;

const animationProject = {
  fps: 12,
  loop: true,
  frames: [],
  subtitles: [],
  camera: {
    x: 0,
    y: 0,
    zoom: 1,
    rotation: 0
  }
};

function createAnimationFrame(){
  return {
    id:
      "frame_" +
      Date.now() +
      "_" +
      Math.floor(
        Math.random() * 10000
      ),

    duration:
      1 / animationFPS,

    objects: [],

    camera: {
      x: 0,
      y: 0,
      zoom: 1,
      rotation: 0
    }
  };
}

function getAnimationFrame(){
  return animationFrames[
    currentFrame
  ];
}

function ensureAnimationFrames(){
  if(
    !Array.isArray(animationFrames)
  ){
    animationFrames = [];
  }

  if(
    animationFrames.length === 0
  ){
    animationFrames.push(
      createAnimationFrame()
    );

    currentFrame = 0;
  }
}

function syncAnimationProject(){
  animationProject.fps =
    animationFPS;

  animationProject.loop =
    animationLoop;

  animationProject.frames =
    animationFrames;

  animationProject.camera = {
    ...animationProject.camera
  };
}

function saveAnimationState(){
  syncAnimationProject();

  try{
    localStorage.setItem(
      "comicStudioAnimation",
      JSON.stringify(
        animationProject
      )
    );
  }catch(error){
    console.warn(
      "Animation autosave unavailable",
      error
    );
  }
}

function loadAnimationState(){
  try{
    const saved =
      localStorage.getItem(
        "comicStudioAnimation"
      );

    if(!saved){
      ensureAnimationFrames();
      return;
    }

    const data =
      JSON.parse(saved);

    if(
      data &&
      Array.isArray(data.frames) &&
      data.frames.length
    ){
      animationFrames =
        data.frames;

      animationFPS =
        Number(data.fps) || 12;

      animationLoop =
        data.loop !== false;

      animationProject.camera =
        data.camera ||
        animationProject.camera;

      currentFrame = 0;
    }else{
      ensureAnimationFrames();
    }
  }catch(error){
    console.warn(
      "Could not load animation",
      error
    );

    ensureAnimationFrames();
  }
}

function setAnimationFPS(value){
  const fps =
    Number(value);

  if(
    !Number.isFinite(fps)
  ){
    return;
  }

  animationFPS =
    Math.max(
      1,
      Math.min(60, fps)
    );

  animationProject.fps =
    animationFPS;

  saveAnimationState();
}

function setAnimationLoop(value){
  animationLoop =
    Boolean(value);

  saveAnimationState();
}

function addAnimationFrame(){
  ensureAnimationFrames();

  const previous =
    getAnimationFrame();

  const frame =
    JSON.parse(
      JSON.stringify(previous)
    );

  frame.id =
    "frame_" +
    Date.now() +
    "_" +
    Math.floor(
      Math.random() * 10000
    );

  animationFrames.splice(
    currentFrame + 1,
    0,
    frame
  );

  currentFrame++;

  saveAnimationState();
  renderAnimationTimeline();
  renderAnimationFrame();
  }
function deleteAnimationFrame(){
  if(
    animationFrames.length <= 1
  ){
    return;
  }

  animationFrames.splice(
    currentFrame,
    1
  );

  currentFrame =
    Math.max(
      0,
      Math.min(
        currentFrame,
        animationFrames.length - 1
      )
    );

  saveAnimationState();
  renderAnimationTimeline();
  renderAnimationFrame();
}

function duplicateAnimationFrame(){
  const frame =
    getAnimationFrame();

  if(!frame) return;

  const copy =
    JSON.parse(
      JSON.stringify(frame)
    );

  copy.id =
    "frame_" +
    Date.now() +
    "_" +
    Math.floor(
      Math.random() * 10000
    );

  animationFrames.splice(
    currentFrame + 1,
    0,
    copy
  );

  currentFrame++;

  saveAnimationState();
  renderAnimationTimeline();
  renderAnimationFrame();
}

function selectAnimationFrame(index){
  if(
    index < 0 ||
    index >= animationFrames.length
  ){
    return;
  }

  currentFrame =
    index;

  renderAnimationTimeline();
  renderAnimationFrame();
}

function renderAnimationTimeline(){
  const timeline =
    document.getElementById(
      "animationTimeline"
    );

  if(!timeline) return;

  timeline.innerHTML = "";

  animationFrames.forEach(
    (frame,index)=>{
      const item =
        document.createElement(
          "button"
        );

      item.className =
        "animation-frame" +
        (
          index === currentFrame
            ? " active"
            : ""
        );

      item.textContent =
        index + 1;

      item.title =
        "Frame " + (index + 1);

      item.onclick =
        ()=>{
          selectAnimationFrame(
            index
          );
        };

      timeline.appendChild(
        item
      );
    }
  );
}

function clearAnimationCanvas(){
  animCtx.clearRect(
    0,
    0,
    animCanvas.width,
    animCanvas.height
  );
}

function drawAnimationFrame(
  frame,
  opacity = 1
){
  if(!frame) return;

  animCtx.save();

  animCtx.globalAlpha =
    opacity;

  const objects =
    Array.isArray(frame.objects)
      ? frame.objects
      : [];

  objects.forEach(
    object=>{
      if(
        object.type ===
        "rectangle"
      ){
        animCtx.strokeStyle =
          object.color ||
          "#000000";

        animCtx.lineWidth =
          object.lineWidth ||
          4;

        animCtx.strokeRect(
          object.x,
          object.y,
          object.width,
          object.height
        );
      }

      if(
        object.type ===
        "circle"
      ){
        animCtx.beginPath();

        animCtx.ellipse(
          object.x +
            object.width / 2,
          object.y +
            object.height / 2,
          Math.abs(
            object.width / 2
          ),
          Math.abs(
            object.height / 2
          ),
          0,
          0,
          Math.PI * 2
        );

        animCtx.strokeStyle =
          object.color ||
          "#000000";

        animCtx.lineWidth =
          object.lineWidth ||
          4;

        animCtx.stroke();
      }

      if(
        object.type ===
        "line"
      ){
        animCtx.beginPath();

        animCtx.moveTo(
          object.x,
          object.y
        );

        animCtx.lineTo(
          object.x +
            object.width,
          object.y +
            object.height
        );

        animCtx.strokeStyle =
          object.color ||
          "#000000";

        animCtx.lineWidth =
          object.lineWidth ||
          4;

        animCtx.stroke();
      }
    }
  );

  animCtx.restore();
}

function renderAnimationFrame(){
  ensureAnimationFrames();

  clearAnimationCanvas();

  const frame =
    getAnimationFrame();

  if(!frame) return;

  if(
    onionSkinEnabled &&
    currentFrame > 0
  ){
    drawAnimationFrame(
      animationFrames[
        currentFrame - 1
      ],
      0.2
    );
  }

  drawAnimationFrame(
    frame,
    1
  );
    }
function toggleOnionSkin(){
  onionSkinEnabled =
    !onionSkinEnabled;

  renderAnimationFrame();

  const button =
    document.getElementById(
      "onionSkinBtn"
    );

  if(button){
    button.classList.toggle(
      "active",
      onionSkinEnabled
    );
  }
}

function playAnimation(){
  ensureAnimationFrames();

  if(animationPlaying){
    return;
  }

  animationPlaying = true;

  const interval =
    1000 / animationFPS;

  animationTimer =
    setInterval(
      ()=>{
        if(
          currentFrame >=
          animationFrames.length - 1
        ){
          if(animationLoop){
            currentFrame = 0;
          }else{
            pauseAnimation();
            return;
          }
        }else{
          currentFrame++;
        }

        renderAnimationTimeline();
        renderAnimationFrame();

        updateAnimationSubtitles();
      },
      interval
    );
}

function pauseAnimation(){
  animationPlaying =
    false;

  if(animationTimer){
    clearInterval(
      animationTimer
    );

    animationTimer =
      null;
  }
}

function stopAnimation(){
  pauseAnimation();

  currentFrame = 0;

  renderAnimationTimeline();
  renderAnimationFrame();

  updateAnimationSubtitles();
}

function toggleAnimationPlayback(){
  if(animationPlaying){
    pauseAnimation();
  }else{
    playAnimation();
  }
}

function setAnimationFrame(index){
  const target =
    Number(index);

  if(
    !Number.isFinite(target)
  ){
    return;
  }

  currentFrame =
    Math.max(
      0,
      Math.min(
        animationFrames.length - 1,
        Math.floor(target)
      )
    );

  renderAnimationTimeline();
  renderAnimationFrame();
  updateAnimationSubtitles();
}

function previousAnimationFrame(){
  setAnimationFrame(
    currentFrame - 1
  );
}

function nextAnimationFrame(){
  setAnimationFrame(
    currentFrame + 1
  );
}

const playAnimationBtn =
  document.getElementById(
    "playAnimationBtn"
  );

if(playAnimationBtn){
  playAnimationBtn.onclick =
    toggleAnimationPlayback;
}

const pauseAnimationBtn =
  document.getElementById(
    "pauseAnimationBtn"
  );

if(pauseAnimationBtn){
  pauseAnimationBtn.onclick =
    pauseAnimation;
}

const stopAnimationBtn =
  document.getElementById(
    "stopAnimationBtn"
  );

if(stopAnimationBtn){
  stopAnimationBtn.onclick =
    stopAnimation;
}

const addFrameBtn =
  document.getElementById(
    "addFrameBtn"
  );

if(addFrameBtn){
  addFrameBtn.onclick =
    addAnimationFrame;
}

const deleteFrameBtn =
  document.getElementById(
    "deleteFrameBtn"
  );

if(deleteFrameBtn){
  deleteFrameBtn.onclick =
    deleteAnimationFrame;
}

const duplicateFrameBtn =
  document.getElementById(
    "duplicateFrameBtn"
  );

if(duplicateFrameBtn){
  duplicateFrameBtn.onclick =
    duplicateAnimationFrame;
}

const previousFrameBtn =
  document.getElementById(
    "previousFrameBtn"
  );

if(previousFrameBtn){
  previousFrameBtn.onclick =
    previousAnimationFrame;
}

const nextFrameBtn =
  document.getElementById(
    "nextFrameBtn"
  );

if(nextFrameBtn){
  nextFrameBtn.onclick =
    nextAnimationFrame;
}

const onionBtn =
  document.getElementById(
    "onionSkinBtn"
  );

if(onionBtn){
  onionBtn.onclick =
    toggleOnionSkin;
}

const fpsInput =
  document.getElementById(
    "animationFPS"
  );

if(fpsInput){
  fpsInput.addEventListener(
    "change",
    ()=>{
      setAnimationFPS(
        fpsInput.value
      );

      if(animationPlaying){
        pauseAnimation();
        playAnimation();
      }
    }
  );
}

const loopInput =
  document.getElementById(
    "animationLoop"
  );

if(loopInput){
  loopInput.addEventListener(
    "change",
    ()=>{
      setAnimationLoop(
        loopInput.checked
      );
    }
  );
}
function addKeyframe(
  property,
  value
){
  const frame =
    getAnimationFrame();

  if(!frame) return;

  if(!frame.keyframes){
    frame.keyframes = {};
  }

  if(
    !Array.isArray(
      frame.keyframes[property]
    )
  ){
    frame.keyframes[property] =
      [];
  }

  frame.keyframes[property]
    .push({
      frame: currentFrame,
      value: value
    });

  saveAnimationState();
  renderAnimationTimeline();
}

function getKeyframeValue(
  property,
  frameIndex
){
  const frame =
    animationFrames[
      frameIndex
    ];

  if(
    !frame ||
    !frame.keyframes ||
    !Array.isArray(
      frame.keyframes[property]
    )
  ){
    return null;
  }

  const keys =
    frame.keyframes[property];

  let result = null;

  keys.forEach(
    key=>{
      if(
        key.frame <= frameIndex
      ){
        result =
          key.value;
      }
    }
  );

  return result;
}

function addCameraKeyframe(
  x,
  y,
  zoomValue,
  rotation
){
  const frame =
    getAnimationFrame();

  if(!frame) return;

  frame.camera = {
    x: Number(x) || 0,
    y: Number(y) || 0,
    zoom:
      Number(zoomValue) || 1,
    rotation:
      Number(rotation) || 0
  };

  addKeyframe(
    "camera",
    frame.camera
  );
}

function applyCamera(
  camera
){
  if(!camera) return;

  animationProject.camera = {
    x:
      Number(camera.x) || 0,

    y:
      Number(camera.y) || 0,

    zoom:
      Number(camera.zoom) || 1,

    rotation:
      Number(camera.rotation) || 0
  };
}

function updateAnimationSubtitles(){
  const subtitleContainer =
    document.getElementById(
      "animationSubtitlePreview"
    );

  if(!subtitleContainer){
    return;
  }

  subtitleContainer.innerHTML =
    "";

  if(
    typeof subtitles ===
    "undefined" ||
    !Array.isArray(subtitles)
  ){
    return;
  }

  const currentTime =
    currentFrame /
    animationFPS;

  subtitles.forEach(
    subtitle=>{
      const start =
        Number(subtitle.start) || 0;

      const end =
        Number(subtitle.end) || 0;

      if(
        currentTime >= start &&
        currentTime <= end
      ){
        const text =
          document.createElement(
            "div"
          );

        text.className =
          "animation-subtitle";

        text.textContent =
          subtitle.text || "";

        subtitleContainer
          .appendChild(text);
      }
    }
  );
}

function resizeAnimationCanvas(){
  if(
    !animCanvas ||
    !drawingCanvas
  ){
    return;
  }

  animCanvas.width =
    drawingCanvas.width;

  animCanvas.height =
    drawingCanvas.height;

  renderAnimationFrame();
}

window.addEventListener(
  "resize",
  resizeAnimationCanvas
);

document.addEventListener(
  "keydown",
  event=>{
    if(
      event.target &&
      (
        event.target.tagName ===
        "INPUT" ||
        event.target.tagName ===
        "TEXTAREA"
      )
    ){
      return;
    }

    if(event.key === " "){
      event.preventDefault();

      toggleAnimationPlayback();
    }

    if(
      event.key ===
      "ArrowLeft"
    ){
      previousAnimationFrame();
    }

    if(
      event.key ===
      "ArrowRight"
    ){
      nextAnimationFrame();
    }
  }
);
function initializeAnimation(){
  loadAnimationState();

  if(fpsInput){
    fpsInput.value =
      animationFPS;
  }

  if(loopInput){
    loopInput.checked =
      animationLoop;
  }

  renderAnimationTimeline();
  renderAnimationFrame();
  updateAnimationSubtitles();
}

function exportAnimationFrames(){
  ensureAnimationFrames();

  const data = {
    fps: animationFPS,
    loop: animationLoop,
    frames: animationFrames,
    camera: animationProject.camera
  };

  const blob =
    new Blob(
      [
        JSON.stringify(
          data,
          null,
          2
        )
      ],
      {
        type:
          "application/json"
      }
    );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;

  link.download =
    "comic-animation.json";

  link.click();

  URL.revokeObjectURL(url);

  if(
    typeof showToast ===
    "function"
  ){
    showToast(
      "Animation exported ✓"
    );
  }
}

const exportAnimationBtn =
  document.getElementById(
    "exportAnimationBtn"
  );

if(exportAnimationBtn){
  exportAnimationBtn.onclick =
    exportAnimationFrames;
}

function setAnimationMode(){
  const panel =
    document.getElementById(
      "animationPanel"
    );

  if(panel){
    panel.classList.add(
      "active"
    );
  }

  initializeAnimation();
}

const animateNav =
  document.querySelector(
    '[data-mode="animate"]'
  );

if(animateNav){
  animateNav.addEventListener(
    "click",
    setAnimationMode
  );
}

window.addEventListener(
  "beforeunload",
  ()=>{
    pauseAnimation();
    saveAnimationState();
  }
);

if(
  document.readyState ===
  "loading"
){
  document.addEventListener(
    "DOMContentLoaded",
    initializeAnimation
  );
}else{
  initializeAnimation();
}
