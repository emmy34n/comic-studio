"use strict";

const characterProject = {
  characters: [],
  activeCharacter: null
};

let characters = [];
let activeCharacter = null;

function createCharacter(
  name = "New Character"
){
  return {
    id:
      "char_" +
      Date.now() +
      "_" +
      Math.floor(
        Math.random() * 10000
      ),

    name: name,

    parts: {
      body: {
        type: "body",
        color: "#f1c27d"
      },

      head: {
        type: "head",
        color: "#f1c27d"
      },

      hair: {
        type: "hair",
        style: "short",
        color: "#222222"
      },

      eyes: {
        type: "eyes",
        style: "normal",
        color: "#222222"
      },

      face: {
        type: "face",
        expression: "neutral"
      },

      clothes: {
        type: "clothes",
        style: "casual",
        color: "#3366ff"
      },

      shoes: {
        type: "shoes",
        style: "simple",
        color: "#222222"
      },

      accessories: []
    },

    pose: {
      headRotation: 0,
      bodyRotation: 0,
      leftArm: 0,
      rightArm: 0,
      leftForearm: 0,
      rightForearm: 0,
      leftLeg: 0,
      rightLeg: 0,
      leftShin: 0,
      rightShin: 0
    },

    position: {
      x: 300,
      y: 300
    },

    scale: 1,

    library: true
  };
}

function ensureCharacters(){
  if(!Array.isArray(characters)){
    characters = [];
  }

  if(
    characters.length === 0
  ){
    const character =
      createCharacter(
        "Hero"
      );

    characters.push(
      character
    );

    activeCharacter =
      character;
  }

  if(!activeCharacter){
    activeCharacter =
      characters[0];
  }
}

function saveCharacters(){
  characterProject.characters =
    characters;

  characterProject.activeCharacter =
    activeCharacter
      ? activeCharacter.id
      : null;

  try{
    localStorage.setItem(
      "comicStudioCharacters",
      JSON.stringify(
        characterProject
      )
    );
  }catch(error){
    console.warn(
      "Character autosave unavailable",
      error
    );
  }
}

function loadCharacters(){
  try{
    const saved =
      localStorage.getItem(
        "comicStudioCharacters"
      );

    if(saved){
      const data =
        JSON.parse(saved);

      if(
        data &&
        Array.isArray(
          data.characters
        )
      ){
        characters =
          data.characters;

        const found =
          characters.find(
            character =>
              character.id ===
              data.activeCharacter
          );

        activeCharacter =
          found ||
          characters[0] ||
          null;
      }
    }
  }catch(error){
    console.warn(
      "Could not load characters",
      error
    );
  }

  ensureCharacters();

  renderCharacterLibrary();
  renderCharacterBuilder();
}

function addCharacter(
  name
){
  const character =
    createCharacter(
      name ||
      "Character " +
      (characters.length + 1)
    );

  characters.push(
    character
  );

  activeCharacter =
    character;

  saveCharacters();

  renderCharacterLibrary();
  renderCharacterBuilder();

  if(
    typeof showToast ===
    "function"
  ){
    showToast(
      "Character created ✓"
    );
  }

  return character;
        }
function selectCharacter(id){
  const character =
    characters.find(
      item =>
        item.id === id
    );

  if(!character){
    return;
  }

  activeCharacter =
    character;

  saveCharacters();

  renderCharacterLibrary();
  renderCharacterBuilder();
}

function deleteCharacter(){
  if(!activeCharacter){
    return;
  }

  const index =
    characters.indexOf(
      activeCharacter
    );

  if(index !== -1){
    characters.splice(
      index,
      1
    );
  }

  activeCharacter =
    characters[0] ||
    null;

  ensureCharacters();

  saveCharacters();

  renderCharacterLibrary();
  renderCharacterBuilder();

  if(
    typeof showToast ===
    "function"
  ){
    showToast(
      "Character deleted"
    );
  }
}

function duplicateCharacter(){
  if(!activeCharacter){
    return;
  }

  const copy =
    JSON.parse(
      JSON.stringify(
        activeCharacter
      )
    );

  copy.id =
    "char_" +
    Date.now() +
    "_" +
    Math.floor(
      Math.random() * 10000
    );

  copy.name =
    activeCharacter.name +
    " Copy";

  characters.push(
    copy
  );

  activeCharacter =
    copy;

  saveCharacters();

  renderCharacterLibrary();
  renderCharacterBuilder();

  if(
    typeof showToast ===
    "function"
  ){
    showToast(
      "Character duplicated ✓"
    );
  }
}

function renameCharacter(
  name
){
  if(
    !activeCharacter ||
    !name
  ){
    return;
  }

  activeCharacter.name =
    name.trim() ||
    activeCharacter.name;

  saveCharacters();

  renderCharacterLibrary();
  renderCharacterBuilder();
}

function updateCharacterPart(
  part,
  property,
  value
){
  if(
    !activeCharacter ||
    !activeCharacter.parts[part]
  ){
    return;
  }

  activeCharacter.parts[part][
    property
  ] = value;

  saveCharacters();
  renderCharacterBuilder();
}

function addCharacterAccessory(
  name,
  type = "accessory"
){
  if(!activeCharacter){
    return;
  }

  if(
    !Array.isArray(
      activeCharacter.parts.accessories
    )
  ){
    activeCharacter.parts.accessories =
      [];
  }

  activeCharacter.parts.accessories
    .push({
      id:
        "acc_" +
        Date.now() +
        "_" +
        Math.floor(
          Math.random() * 10000
        ),

      name:
        name ||
        "Accessory",

      type:
        type,

      color:
        "#222222",

      x: 0,
      y: 0,

      rotation: 0,
      scale: 1
    });

  saveCharacters();
  renderCharacterBuilder();
}

function removeCharacterAccessory(
  index
){
  if(!activeCharacter){
    return;
  }

  const accessories =
    activeCharacter.parts
      .accessories;

  if(
    !Array.isArray(accessories) ||
    index < 0 ||
    index >= accessories.length
  ){
    return;
  }

  accessories.splice(
    index,
    1
  );

  saveCharacters();
  renderCharacterBuilder();
}

function setCharacterPosition(
  x,
  y
){
  if(!activeCharacter){
    return;
  }

  activeCharacter.position.x =
    Number(x) || 0;

  activeCharacter.position.y =
    Number(y) || 0;

  saveCharacters();
}

function setCharacterScale(
  value
){
  if(!activeCharacter){
    return;
  }

  activeCharacter.scale =
    Math.max(
      0.1,
      Math.min(
        5,
        Number(value) || 1
      )
    );

  saveCharacters();
  renderCharacterBuilder();
}

function setCharacterPose(
  joint,
  value
){
  if(
    !activeCharacter ||
    !activeCharacter.pose
  ){
    return;
  }

  if(
    !Object.prototype
      .hasOwnProperty.call(
        activeCharacter.pose,
        joint
      )
  ){
    return;
  }

  activeCharacter.pose[joint] =
    Number(value) || 0;

  saveCharacters();
  renderCharacterBuilder();
}
function drawCharacter(
  ctx,
  character
){
  if(!ctx || !character){
    return;
  }

  const parts =
    character.parts || {};

  const pose =
    character.pose || {};

  const position =
    character.position || {
      x: 300,
      y: 300
    };

  const scale =
    Number(character.scale) || 1;

  ctx.save();

  ctx.translate(
    position.x,
    position.y
  );

  ctx.scale(
    scale,
    scale
  );

  /*
   * Lightweight character renderer.
   * It uses simple shapes so older phones
   * can handle large numbers of characters.
   */

  // Body
  ctx.save();

  ctx.rotate(
    (pose.bodyRotation || 0) *
    Math.PI / 180
  );

  ctx.fillStyle =
    parts.clothes &&
    parts.clothes.color
      ? parts.clothes.color
      : "#3366ff";

  ctx.beginPath();

  ctx.roundRect(
    -45,
    -80,
    90,
    140,
    18
  );

  ctx.fill();

  ctx.restore();

  // Neck
  ctx.fillStyle =
    parts.head &&
    parts.head.color
      ? parts.head.color
      : "#f1c27d";

  ctx.fillRect(
    -12,
    -105,
    24,
    30
  );

  // Head
  ctx.save();

  ctx.translate(
    0,
    -145
  );

  ctx.rotate(
    (pose.headRotation || 0) *
    Math.PI / 180
  );

  ctx.fillStyle =
    parts.head &&
    parts.head.color
      ? parts.head.color
      : "#f1c27d";

  ctx.beginPath();

  ctx.arc(
    0,
    0,
    55,
    0,
    Math.PI * 2
  );

  ctx.fill();

  // Hair
  if(parts.hair){
    ctx.fillStyle =
      parts.hair.color ||
      "#222222";

    ctx.beginPath();

    ctx.arc(
      0,
      -10,
      56,
      Math.PI,
      Math.PI * 2
    );

    ctx.fill();
  }

  // Eyes
  ctx.fillStyle =
    parts.eyes &&
    parts.eyes.color
      ? parts.eyes.color
      : "#222222";

  ctx.beginPath();

  ctx.arc(
    -20,
    -5,
    6,
    0,
    Math.PI * 2
  );

  ctx.arc(
    20,
    -5,
    6,
    0,
    Math.PI * 2
  );

  ctx.fill();

  // Face expression
  ctx.strokeStyle =
    "#222222";

  ctx.lineWidth = 3;

  ctx.beginPath();

  if(
    parts.face &&
    parts.face.expression ===
    "happy"
  ){
    ctx.arc(
      0,
      15,
      18,
      0,
      Math.PI
    );
  }else if(
    parts.face &&
    parts.face.expression ===
    "sad"
  ){
    ctx.arc(
      0,
      30,
      18,
      Math.PI,
      Math.PI * 2
    );
  }else{
    ctx.moveTo(
      -10,
      20
    );

    ctx.lineTo(
      10,
      20
    );
  }

  ctx.stroke();

  ctx.restore();

  // Left arm
  drawCharacterArm(
    ctx,
    -55,
    -55,
    pose.leftArm || 0,
    pose.leftForearm || 0
  );

  // Right arm
  drawCharacterArm(
    ctx,
    55,
    -55,
    pose.rightArm || 0,
    pose.rightForearm || 0
  );

  // Legs
  drawCharacterLeg(
    ctx,
    -22,
    60,
    pose.leftLeg || 0,
    pose.leftShin || 0
  );

  drawCharacterLeg(
    ctx,
    22,
    60,
    pose.rightLeg || 0,
    pose.rightShin || 0
  );

  ctx.restore();
}

function drawCharacterArm(
  ctx,
  x,
  y,
  upperRotation,
  forearmRotation
){
  ctx.save();

  ctx.translate(
    x,
    y
  );

  ctx.rotate(
    upperRotation *
    Math.PI / 180
  );

  ctx.fillStyle =
    "#f1c27d";

  ctx.fillRect(
    -10,
    0,
    20,
    65
  );

  ctx.translate(
    0,
    65
  );

  ctx.rotate(
    forearmRotation *
    Math.PI / 180
  );

  ctx.fillRect(
    -9,
    0,
    18,
    60
  );

  ctx.beginPath();

  ctx.arc(
    0,
    65,
    11,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.restore();
}

function drawCharacterLeg(
  ctx,
  x,
  y,
  upperRotation,
  lowerRotation
){
  ctx.save();

  ctx.translate(
    x,
    y
  );

  ctx.rotate(
    upperRotation *
    Math.PI / 180
  );

  ctx.fillStyle =
    "#3366ff";

  ctx.fillRect(
    -12,
    0,
    24,
    75
  );

  ctx.translate(
    0,
    75
  );

  ctx.rotate(
    lowerRotation *
    Math.PI / 180
  );

  ctx.fillRect(
    -11,
    0,
    22,
    70
  );

  // Shoe
  ctx.fillStyle =
    "#222222";

  ctx.fillRect(
    -17,
    65,
    34,
    15
  );

  ctx.restore();
}

function renderCharacterPreview(){
  const preview =
    document.getElementById(
      "characterPreview"
    );

  if(!preview){
    return;
  }

  const previewCtx =
    preview.getContext("2d");

  previewCtx.clearRect(
    0,
    0,
    preview.width,
    preview.height
  );

  if(activeCharacter){
    const copy =
      JSON.parse(
        JSON.stringify(
          activeCharacter
        )
      );

    copy.position = {
      x:
        preview.width / 2,
      y:
        preview.height / 2 + 80
    };

    copy.scale =
      Math.min(
        1,
        preview.height / 600
      );

    drawCharacter(
      previewCtx,
      copy
    );
  }
           }
function renderCharacterLibrary(){
  const library =
    document.getElementById(
      "characterLibrary"
    );

  if(!library){
    return;
  }

  library.innerHTML = "";

  characters.forEach(
    character=>{
      const item =
        document.createElement(
          "button"
        );

      item.className =
        "character-item" +
        (
          activeCharacter &&
          activeCharacter.id ===
          character.id
            ? " active"
            : ""
        );

      item.textContent =
        character.name ||
        "Character";

      item.onclick =
        ()=>{
          selectCharacter(
            character.id
          );
        };

      library.appendChild(
        item
      );
    }
  );
}

function renderCharacterBuilder(){
  const nameInput =
    document.getElementById(
      "characterName"
    );

  if(
    nameInput &&
    activeCharacter
  ){
    nameInput.value =
      activeCharacter.name;
  }

  if(!activeCharacter){
    return;
  }

  const partControls = {
    skinColor:
      [
        "body",
        "color"
      ],

    hairColor:
      [
        "hair",
        "color"
      ],

    clothesColor:
      [
        "clothes",
        "color"
      ],

    shoeColor:
      [
        "shoes",
        "color"
      ],

    hairStyle:
      [
        "hair",
        "style"
      ],

    eyeStyle:
      [
        "eyes",
        "style"
      ],

    expression:
      [
        "face",
        "expression"
      ],

    clothesStyle:
      [
        "clothes",
        "style"
      ],

    shoeStyle:
      [
        "shoes",
        "style"
      ]
  };

  Object.keys(
    partControls
  ).forEach(
    id=>{
      const input =
        document.getElementById(id);

      if(!input){
        return;
      }

      const pair =
        partControls[id];

      const part =
        activeCharacter.parts[
          pair[0]
        ];

      if(part){
        input.value =
          part[pair[1]] ??
          input.value;
      }
    }
  );

  const poseControls = {
    headRotation:
      "headRotation",

    bodyRotation:
      "bodyRotation",

    leftArm:
      "leftArm",

    rightArm:
      "rightArm",

    leftForearm:
      "leftForearm",

    rightForearm:
      "rightForearm",

    leftLeg:
      "leftLeg",

    rightLeg:
      "rightLeg",

    leftShin:
      "leftShin",

    rightShin:
      "rightShin"
  };

  Object.keys(
    poseControls
  ).forEach(
    id=>{
      const input =
        document.getElementById(id);

      if(
        input &&
        activeCharacter.pose
      ){
        input.value =
          activeCharacter.pose[
            poseControls[id]
          ] || 0;
      }
    }
  );

  const scaleInput =
    document.getElementById(
      "characterScale"
    );

  if(scaleInput){
    scaleInput.value =
      activeCharacter.scale ||
      1;
  }

  renderCharacterPreview();
}

function connectCharacterControls(){
  const nameInput =
    document.getElementById(
      "characterName"
    );

  if(nameInput){
    nameInput.addEventListener(
      "change",
      ()=>{
        renameCharacter(
          nameInput.value
        );
      }
    );
  }

  const addBtn =
    document.getElementById(
      "addCharacterBtn"
    );

  if(addBtn){
    addBtn.onclick =
      ()=>{
        addCharacter();
      };
  }

  const deleteBtn =
    document.getElementById(
      "deleteCharacterBtn"
    );

  if(deleteBtn){
    deleteBtn.onclick =
      deleteCharacter;
  }

  const duplicateBtn =
    document.getElementById(
      "duplicateCharacterBtn"
    );

  if(duplicateBtn){
    duplicateBtn.onclick =
      duplicateCharacter;
  }

  const controls = {
    skinColor:
      ()=>{
        updateCharacterPart(
          "body",
          "color",
          document.getElementById(
            "skinColor"
          ).value
        );
      },

    hairColor:
      ()=>{
        updateCharacterPart(
          "hair",
          "color",
          document.getElementById(
            "hairColor"
          ).value
        );
      },

    clothesColor:
      ()=>{
        updateCharacterPart(
          "clothes",
          "color",
          document.getElementById(
            "clothesColor"
          ).value
        );
      },

    shoeColor:
      ()=>{
        updateCharacterPart(
          "shoes",
          "color",
          document.getElementById(
            "shoeColor"
          ).value
        );
      },

    hairStyle:
      ()=>{
        updateCharacterPart(
          "hair",
          "style",
          document.getElementById(
            "hairStyle"
          ).value
        );
      },

    eyeStyle:
      ()=>{
        updateCharacterPart(
          "eyes",
          "style",
          document.getElementById(
            "eyeStyle"
          ).value
        );
      },

    expression:
      ()=>{
        updateCharacterPart(
          "face",
          "expression",
          document.getElementById(
            "expression"
          ).value
        );
      },

    clothesStyle:
      ()=>{
        updateCharacterPart(
          "clothes",
          "style",
          document.getElementById(
            "clothesStyle"
          ).value
        );
      },

    shoeStyle:
      ()=>{
        updateCharacterPart(
          "shoes",
          "style",
          document.getElementById(
            "shoeStyle"
          ).value
        );
      }
  };

  Object.keys(
    controls
  ).forEach(
    id=>{
      const input =
        document.getElementById(id);

      if(input){
        input.addEventListener(
          "change",
          controls[id]
        );

        input.addEventListener(
          "input",
          controls[id]
        );
      }
    }
  );

  const scaleInput =
    document.getElementById(
      "characterScale"
    );

  if(scaleInput){
    scaleInput.addEventListener(
      "input",
      ()=>{
        setCharacterScale(
          scaleInput.value
        );
      }
    );
  }
      }
function connectCharacterToComic(){
  if(
    !activeCharacter ||
    typeof pages ===
    "undefined" ||
    !pages[currentPage]
  ){
    return;
  }

  const page =
    pages[currentPage];

  if(!Array.isArray(page.objects)){
    page.objects = [];
  }

  const character =
    JSON.parse(
      JSON.stringify(
        activeCharacter
      )
    );

  character.position = {
    x: 300,
    y: 300
  };

  character.scale = 1;

  page.objects.push({
    id:
      "character_" +
      Date.now(),

    type:
      "character",

    character:
      character,

    x:
      character.position.x,

    y:
      character.position.y,

    width: 180,

    height: 360,

    rotation: 0,

    scaleX: 1,

    scaleY: 1
  });

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

  if(
    typeof showToast ===
    "function"
  ){
    showToast(
      "Character added to comic ✓"
    );
  }
}

const addToComicBtn =
  document.getElementById(
    "addCharacterToComicBtn"
  );

if(addToComicBtn){
  addToComicBtn.onclick =
    connectCharacterToComic;
}

function addAccessoryFromLibrary(
  name,
  type
){
  addCharacterAccessory(
    name,
    type
  );
}

const accessoryButtons =
  document.querySelectorAll(
    "[data-accessory]"
  );

accessoryButtons.forEach(
  button=>{
    button.addEventListener(
      "click",
      ()=>{
        addAccessoryFromLibrary(
          button.dataset.accessory,
          button.dataset.type ||
            "accessory"
        );
      }
    );
  }
);

function resetCharacterPose(){
  if(!activeCharacter){
    return;
  }

  activeCharacter.pose = {
    headRotation: 0,
    bodyRotation: 0,
    leftArm: 0,
    rightArm: 0,
    leftForearm: 0,
    rightForearm: 0,
    leftLeg: 0,
    rightLeg: 0,
    leftShin: 0,
    rightShin: 0
  };

  saveCharacters();
  renderCharacterBuilder();
}

const resetPoseBtn =
  document.getElementById(
    "resetCharacterPoseBtn"
  );

if(resetPoseBtn){
  resetPoseBtn.onclick =
    resetCharacterPose;
}

function initializeCharacters(){
  loadCharacters();

  connectCharacterControls();

  renderCharacterLibrary();
  renderCharacterBuilder();
}

window.addEventListener(
  "load",
  initializeCharacters
);

window.characterStudio = {
  getCharacters:
    ()=>{
      return characters;
    },

  getActiveCharacter:
    ()=>{
      return activeCharacter;
    },

  create:
    addCharacter,

  select:
    selectCharacter,

  duplicate:
    duplicateCharacter,

  delete:
    deleteCharacter,

  addToComic:
    connectCharacterToComic,

  addAccessory:
    addCharacterAccessory,

  setPose:
    setCharacterPose,

  save:
    saveCharacters
};

console.log(
  "Comic Studio Character Engine ready ✓"
);
