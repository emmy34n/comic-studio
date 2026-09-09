"use strict";

const canvas = document.getElementById("comicCanvas");
const ctx = canvas.getContext("2d");

const animationCanvas =
  document.getElementById("animationCanvas");

const actx = animationCanvas.getContext("2d");

let currentTool = "select";
let currentColor = "#000000";
let brushSize = 5;
let zoom = 1;

let isDrawing = false;
let startX = 0;
let startY = 0;

let pages = [];
let currentPage = 0;

let selectedObject = null;
let history = [];
let historyIndex = -1;

const project = {
  name: "My Comic",
  pages: [],
  characters: [],
  subtitles: [],
  audio: [],
  frames: []
};


/* =========================
   CANVAS SETUP
========================= */

function resizeCanvas(){

  const rect =
    document.getElementById("canvasWrapper")
    .getBoundingClientRect();

  const width = Math.max(600, Math.floor(rect.width));
  const height = Math.max(800, Math.floor(rect.height));

  canvas.width = width;
  canvas.height = height;

  animationCanvas.width = width;
  animationCanvas.height = height;

  redraw();

}

window.addEventListener(
  "resize",
  resizeCanvas
);


/* =========================
   DEFAULT PAGE
========================= */

function createPage(){

  return {
    background: "#ffffff",

    objects: [],

    drawing: null,

    panels: [],

    layers: [],

    name:
      "Page " + (pages.length + 1)
  };

}


/* =========================
   START PROJECT
========================= */

function initProject(){

  pages = [
    createPage()
  ];

  currentPage = 0;

  project.pages = pages;

  saveState();

  renderPageList();

  resizeCanvas();

}


/* =========================
   DRAW CURRENT PAGE
========================= */

function redraw(){

  if(!canvas.width) return;

  const page =
    pages[currentPage];

  if(!page) return;

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.fillStyle =
    page.background || "#ffffff";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  }
function saveState(){

  const state = JSON.stringify({
    pages: pages,
    currentPage: currentPage
  });

  history =
    history.slice(0, historyIndex + 1);

  history.push(state);

  historyIndex++;

  if(history.length > 30){

    history.shift();
    historyIndex--;

  }

  saveProject();

}


/* =========================
   UNDO
========================= */

function undo(){

  if(historyIndex <= 0) return;

  historyIndex--;

  const state =
    JSON.parse(history[historyIndex]);

  pages = state.pages;
  currentPage = state.currentPage;

  renderPageList();
  redraw();

}


/* =========================
   REDO
========================= */

function redo(){

  if(historyIndex >= history.length - 1)
    return;

  historyIndex++;

  const state =
    JSON.parse(history[historyIndex]);

  pages = state.pages;
  currentPage = state.currentPage;

  renderPageList();
  redraw();

}


/* =========================
   AUTOSAVE
========================= */

function saveProject(){

  try{

    project.pages = pages;

    localStorage.setItem(
      "comicStudioProject",
      JSON.stringify(project)
    );

  }catch(error){

    console.warn(
      "Autosave unavailable",
      error
    );

  }

}


/* =========================
   LOAD PROJECT
========================= */

function loadProject(){

  try{

    const saved =
      localStorage.getItem(
        "comicStudioProject"
      );

    if(!saved){

      initProject();
      return;

    }

    const data =
      JSON.parse(saved);

    if(
      data &&
      Array.isArray(data.pages) &&
      data.pages.length
    ){

      pages = data.pages;
      project.pages = pages;

      currentPage = 0;

      renderPageList();
      resizeCanvas();

    }else{

      initProject();

    }

  }catch(error){

    console.warn(
      "Could not load project",
      error
    );

    initProject();

  }

}


/* =========================
   PAGE LIST
========================= */

function renderPageList(){

  const list =
    document.getElementById(
      "pageList"
    );

  if(!list) return;

  list.innerHTML = "";

  pages.forEach(
    (page,index)=>{

      const item =
        document.createElement("button");

      item.className =
        "page-item" +
        (index === currentPage
          ? " active"
          : "");

      item.textContent =
        page.name ||
        "Page " + (index + 1);

      item.onclick = ()=>{
        currentPage = index;
        renderPageList();
        redraw();
      };

      list.appendChild(item);

    }
  );

}


/* =========================
   NEW PAGE
========================= */

function newPage(){

  pages.push(createPage());

  currentPage =
    pages.length - 1;

  saveState();

  renderPageList();
  redraw();

}


/* =========================
   DUPLICATE PAGE
========================= */

function duplicatePage(){

  const source =
    pages[currentPage];

  if(!source) return;

  const copy =
    JSON.parse(
      JSON.stringify(source)
    );

  copy.name =
    "Page " + (pages.length + 1);

  pages.push(copy);

  currentPage =
    pages.length - 1;

  saveState();

  renderPageList();
  redraw();

}


/* =========================
   DELETE PAGE
========================= */

function deletePage(){

  if(pages.length <= 1){

    alert(
      "A project must have at least one page."
    );

    return;

  }

  pages.splice(
    currentPage,
    1
  );

  currentPage =
    Math.max(
      0,
      currentPage - 1
    );

  saveState();

  renderPageList();
  redraw();

    }
function setTool(tool){

  currentTool = tool;

  document
    .querySelectorAll(".tool")
    .forEach(button=>{

      button.classList.toggle(
        "active",
        button.dataset.tool === tool
      );

    });

}


/* =========================
   TOOL BUTTONS
========================= */

document
  .querySelectorAll(".tool")
  .forEach(button=>{

    button.addEventListener(
      "click",
      ()=>{

        setTool(
          button.dataset.tool
        );

        if(
          button.dataset.tool === "image"
        ){

          document
            .getElementById("imageInput")
            .click();

        }

      }
    );

  });


/* =========================
   BRUSH SETTINGS
========================= */

const sizeInput =
  document.getElementById(
    "brushSize"
  );

const sizeValue =
  document.getElementById(
    "brushSizeValue"
  );

const colorInput =
  document.getElementById(
    "colorPicker"
  );


if(sizeInput){

  sizeInput.addEventListener(
    "input",
    ()=>{

      brushSize =
        Number(sizeInput.value);

      sizeValue.textContent =
        brushSize;

    }
  );

}


if(colorInput){

  colorInput.addEventListener(
    "input",
    ()=>{

      currentColor =
        colorInput.value;

    }
  );

}


/* =========================
   DRAWING
========================= */

function getCanvasPosition(event){

  const rect =
    canvas.getBoundingClientRect();

  return {

    x:
      (event.clientX - rect.left)
      * canvas.width
      / rect.width,

    y:
      (event.clientY - rect.top)
      * canvas.height
      / rect.height

  };

}


canvas.addEventListener(
  "pointerdown",
  event=>{

    if(
      ![
        "pen",
        "marker",
        "eraser"
      ].includes(currentTool)
    ){

      return;

    }

    isDrawing = true;

    const pos =
      getCanvasPosition(event);

    startX = pos.x;
    startY = pos.y;

    ctx.beginPath();

    ctx.moveTo(
      startX,
      startY
    );

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if(currentTool === "eraser"){

      ctx.globalCompositeOperation =
        "destination-out";

      ctx.lineWidth =
        brushSize * 3;

    }else{

      ctx.globalCompositeOperation =
        "source-over";

      ctx.strokeStyle =
        currentColor;

      ctx.lineWidth =
        currentTool === "marker"
          ? brushSize * 2
          : brushSize;

    }

  }
);


canvas.addEventListener(
  "pointermove",
  event=>{

    if(!isDrawing) return;

    const pos =
      getCanvasPosition(event);

    ctx.lineTo(
      pos.x,
      pos.y
    );

    ctx.stroke();

  }
);


function finishDrawing(){

  if(!isDrawing) return;

  isDrawing = false;

  ctx.closePath();

  ctx.globalCompositeOperation =
    "source-over";

  saveState();

}


canvas.addEventListener(
  "pointerup",
  finishDrawing
);

canvas.addEventListener(
  "pointercancel",
  finishDrawing
);

canvas.addEventListener(
  "pointerleave",
  finishDrawing
);


/* =========================
   UNDO / REDO BUTTONS
========================= */

document
  .getElementById("undoBtn")
  .addEventListener(
    "click",
    undo
  );

document
  .getElementById("redoBtn")
  .addEventListener(
    "click",
    redo
  );


/* =========================
   PAGE BUTTONS
========================= */

document
  .getElementById("newProjectBtn")
  .addEventListener(
    "click",
    newPage
  );

document
  .getElementById("duplicatePageBtn")
  .addEventListener(
    "click",
    duplicatePage
  );

document
  .getElementById("deletePageBtn")
  .addEventListener(
    "click",
    deletePage
  );
function setBackground(color){

  const page =
    pages[currentPage];

  if(!page) return;

  page.background = color;

  saveState();
  redraw();

}


document
  .getElementById("whiteBackgroundBtn")
  .onclick = ()=>{
    setBackground("#ffffff");
  };


document
  .getElementById("blackBackgroundBtn")
  .onclick = ()=>{
    setBackground("#000000");
  };


document
  .getElementById("transparentBackgroundBtn")
  .onclick = ()=>{

    const page =
      pages[currentPage];

    page.background =
      "rgba(0,0,0,0)";

    saveState();
    redraw();

  };


/* =========================
   PANEL LAYOUTS
========================= */

function createPanels(count){

  const page =
    pages[currentPage];

  if(!page) return;

  page.panels = [];

  if(count === 1){

    page.panels.push({
      x:0,
      y:0,
      width:1,
      height:1
    });

  }

  if(count === 2){

    for(let i=0;i<2;i++){

      page.panels.push({
        x:0,
        y:i/2,
        width:1,
        height:.5
      });

    }

  }

  if(count === 4){

    for(let y=0;y<2;y++){

      for(let x=0;x<2;x++){

        page.panels.push({
          x:x/2,
          y:y/2,
          width:.5,
          height:.5
        });

      }

    }

  }

  if(count === 6){

    for(let y=0;y<3;y++){

      for(let x=0;x<2;x++){

        page.panels.push({
          x:x/2,
          y:y/3,
          width:.5,
          height:1/3
        });

      }

    }

  }

  saveState();
  redraw();

}


document
  .querySelectorAll("[data-layout]")
  .forEach(button=>{

    button.onclick = ()=>{

      createPanels(
        Number(button.dataset.layout)
      );

    };

  });


/* =========================
   DRAW PANELS
========================= */

function drawPanels(){

  const page =
    pages[currentPage];

  if(
    !page ||
    !page.panels ||
    !page.panels.length
  ){

    return;

  }

  ctx.save();

  ctx.strokeStyle =
    "#111111";

  ctx.lineWidth = 4;

  page.panels.forEach(panel=>{

    ctx.strokeRect(
      panel.x * canvas.width,
      panel.y * canvas.height,
      panel.width * canvas.width,
      panel.height * canvas.height
    );

  });

  ctx.restore();

}


/* =========================
   GUIDES
========================= */

function toggleGuide(id){

  const element =
    document.getElementById(id);

  if(!element) return;

  const visible =
    element.style.display === "block";

  element.style.display =
    visible
      ? "none"
      : "block";

}


document
  .getElementById("gridBtn")
  .onclick = ()=>{
    toggleGuide("gridGuide");
  };


document
  .getElementById("rulerBtn")
  .onclick = ()=>{
    toggleGuide("rulerGuide");
  };


document
  .getElementById("perspectiveBtn")
  .onclick = ()=>{
    toggleGuide("perspectiveGuide");
  };


/* =========================
   SAVE BUTTON
========================= */

document
  .getElementById("saveBtn")
  .onclick = ()=>{

    saveProject();

    showToast(
      "Project saved ✓"
    );

  };


/* =========================
   FULLSCREEN
========================= */

document
  .getElementById("fullscreenBtn")
  .onclick = async ()=>{

    try{

      if(!document.fullscreenElement){

        await document.documentElement
          .requestFullscreen();

      }else{

        await document.exitFullscreen();

      }

    }catch(error){

      console.log(error);

    }

  };


/* =========================
   TOAST
========================= */

function showToast(message){

  const toast =
    document.getElementById("toast");

  if(!toast) return;

  toast.textContent =
    message;

  toast.classList.add("show");

  clearTimeout(
    window.toastTimer
  );

  window.toastTimer =
    setTimeout(()=>{

      toast.classList.remove(
        "show"
      );

    },1800);

                  }
function exportProject(){
  const data = JSON.stringify(
    project,
    null,
    2
  );

  const blob =
    new Blob(
      [data],
      {type:"application/json"}
    );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download =
    "comic-studio-project.json";

  link.click();

  URL.revokeObjectURL(url);

  showToast("Project exported ✓");
}

function importProjectFile(file){
  if(!file) return;

  const reader =
    new FileReader();

  reader.onload = event=>{
    try{
      const data =
        JSON.parse(
          event.target.result
        );

      if(
        !data ||
        !Array.isArray(data.pages)
      ){
        throw new Error(
          "Invalid project"
        );
      }

      pages = data.pages;
      project.pages = pages;

      currentPage = 0;

      saveProject();
      renderPageList();
      resizeCanvas();

      showToast(
        "Project imported ✓"
      );
    }catch(error){
      alert(
        "Could not import this project."
      );
    }
  };

  reader.readAsText(file);
}

const projectInput =
  document.getElementById(
    "projectInput"
  );

if(projectInput){
  projectInput.addEventListener(
    "change",
    ()=>{
      importProjectFile(
        projectInput.files[0]
      );
    }
  );
}

const exportBtn =
  document.getElementById(
    "exportProjectBtn"
  );

if(exportBtn){
  exportBtn.onclick =
    exportProject;
}

const importBtn =
  document.getElementById(
    "importProjectBtn"
  );

if(importBtn){
  importBtn.onclick = ()=>{
    projectInput.click();
  };
}

function exportPNG(){
  const link =
    document.createElement("a");

  link.download =
    "comic-page.png";

  link.href =
    canvas.toDataURL(
      "image/png"
    );

  link.click();

  showToast(
    "PNG exported ✓"
  );
}

const pngBtn =
  document.getElementById(
    "exportPngBtn"
  );

if(pngBtn){
  pngBtn.onclick =
    exportPNG;
}

const imageInput =
  document.getElementById(
    "imageInput"
  );

if(imageInput){
  imageInput.addEventListener(
    "change",
    ()=>{
      const file =
        imageInput.files[0];

      if(!file) return;

      const reader =
        new FileReader();

      reader.onload =
        event=>{
          const image =
            new Image();

          image.onload = ()=>{
            const page =
              pages[currentPage];

            if(!page) return;

            page.objects.push({
              type:"image",
              src:event.target.result,
              x:50,
              y:50,
              width:image.width,
              height:image.height,
              rotation:0
            });

            saveState();
            redraw();

            showToast(
              "Image added ✓"
            );
          };

          image.src =
            event.target.result;
        };

      reader.readAsDataURL(file);

      imageInput.value = "";
    }
  );
}

function generateIdea(){
  const genres = [
    "Superhero",
    "Fantasy",
    "Sci-Fi",
    "Adventure",
    "Mystery",
    "Comedy",
    "Action"
  ];

  const heroes = [
    "a young inventor",
    "a fearless warrior",
    "a mysterious student",
    "a rookie hero",
    "a time traveler",
    "a clever detective"
  ];

  const problems = [
    "discovers a strange portal",
    "loses something very important",
    "must protect a mysterious stranger",
    "finds a powerful ancient object",
    "gets trapped in another world",
    "discovers that their best friend has a secret"
  ];

  const endings = [
    "but the real enemy has not appeared yet.",
    "and the next clue changes everything.",
    "forcing them to make an impossible choice.",
    "while a much bigger threat approaches.",
    "only to discover that they caused the problem."
  ];

  const pick =
    array =>
      array[
        Math.floor(
          Math.random() * array.length
        )
      ];

  const idea =
    `${pick(genres)} story: ${pick(heroes)} ${pick(problems)}, ${pick(endings)}`;

  const output =
    document.getElementById(
      "ideaOutput"
    );

  if(output){
    output.textContent =
      idea;
  }

  return idea;
}

const ideaBtn =
  document.getElementById(
    "generateIdeaBtn"
  );

if(ideaBtn){
  ideaBtn.onclick =
    generateIdea;
}

function redraw(){
  if(!canvas.width) return;

  const page =
    pages[currentPage];

  if(!page) return;

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.fillStyle =
    page.background ||
    "#ffffff";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  if(
    page.objects &&
    page.objects.length
  ){
    page.objects.forEach(
      object=>{
        if(
          object.type === "image" &&
          object.src
        ){
          const image =
            new Image();

          image.onload = ()=>{
            ctx.save();

            ctx.translate(
              object.x +
              object.width / 2,
              object.y +
              object.height / 2
            );

            ctx.rotate(
              (object.rotation || 0)
              * Math.PI / 180
            );

            ctx.drawImage(
              image,
              -object.width / 2,
              -object.height / 2,
              object.width,
              object.height
            );

            ctx.restore();

            drawPanels();
          };

          image.src =
            object.src;
        }
      }
    );
  }

  drawPanels();
}

document
  .querySelectorAll("[data-mode]")
  .forEach(button=>{
    button.addEventListener(
      "click",
      ()=>{
        const mode =
          button.dataset.mode;

        document
          .querySelectorAll(
            ".feature-panel"
          )
          .forEach(panel=>{
            panel.classList.remove(
              "active"
            );
          });

        const target =
          document.getElementById(
            mode + "Panel"
          );

        if(target){
          target.classList.add(
            "active"
          );
        }
      }
    );
  });

document.addEventListener(
  "keydown",
  event=>{
    if(
      (event.ctrlKey ||
       event.metaKey) &&
      event.key.toLowerCase() === "z"
    ){
      event.preventDefault();
      undo();
    }

    if(
      (event.ctrlKey ||
       event.metaKey) &&
      event.key.toLowerCase() === "y"
    ){
      event.preventDefault();
      redo();
    }

    if(
      event.key === "Escape"
    ){
      setTool("select");
    }
  }
);

window.addEventListener(
  "beforeunload",
  ()=>{
    saveProject();
  }
);

if(
  document.readyState ===
  "loading"
){
  document.addEventListener(
    "DOMContentLoaded",
    loadProject
  );
}else{
  loadProject();
    }
