"use strict";

const audioProject = {
  tracks: [],
  clips: [],
  duration: 0
};

let audioTracks = [];
let audioClips = [];

let audioContext = null;
let mediaRecorder = null;
let recordedChunks = [];

let recording = false;
let audioPreview = null;

function createAudioTrack(
  name = "Audio Track"
){
  return {
    id:
      "track_" +
      Date.now() +
      "_" +
      Math.floor(
        Math.random() * 10000
      ),

    name: name,

    muted: false,

    volume: 1,

    clips: []
  };
}

function createAudioClip(
  source,
  name = "Audio Clip"
){
  return {
    id:
      "clip_" +
      Date.now() +
      "_" +
      Math.floor(
        Math.random() * 10000
      ),

    name: name,

    source: source,

    start: 0,

    duration: 0,

    volume: 1,

    muted: false
  };
}

function ensureAudioTrack(){
  if(
    !Array.isArray(audioTracks)
  ){
    audioTracks = [];
  }

  if(
    audioTracks.length === 0
  ){
    audioTracks.push(
      createAudioTrack(
        "Voice"
      )
    );
  }
}

function syncAudioProject(){
  audioProject.tracks =
    audioTracks;

  audioProject.clips =
    audioClips;

  try{
    localStorage.setItem(
      "comicStudioAudio",
      JSON.stringify(
        audioProject
      )
    );
  }catch(error){
    console.warn(
      "Audio autosave unavailable",
      error
    );
  }
}

function loadAudioProject(){
  try{
    const saved =
      localStorage.getItem(
        "comicStudioAudio"
      );

    if(saved){
      const data =
        JSON.parse(saved);

      if(
        Array.isArray(data.tracks)
      ){
        audioTracks =
          data.tracks;
      }

      if(
        Array.isArray(data.clips)
      ){
        audioClips =
          data.clips;
      }
    }
  }catch(error){
    console.warn(
      "Could not load audio project",
      error
    );
  }

  ensureAudioTrack();

  renderAudioTimeline();
}

function addAudioTrack(name){
  const track =
    createAudioTrack(
      name ||
      "Audio Track " +
      (audioTracks.length + 1)
    );

  audioTracks.push(track);

  syncAudioProject();
  renderAudioTimeline();

  return track;
}

function addAudioClip(
  clip,
  trackIndex = 0
){
  ensureAudioTrack();

  const track =
    audioTracks[
      trackIndex
    ];

  if(!track) return;

  track.clips =
    Array.isArray(track.clips)
      ? track.clips
      : [];

  track.clips.push(clip);

  audioClips.push(clip);

  syncAudioProject();
  renderAudioTimeline();
}
async function startVoiceRecording(){
  if(recording){
    return;
  }

  try{
    const stream =
      await navigator.mediaDevices
        .getUserMedia({
          audio: true
        });

    recordedChunks = [];

    mediaRecorder =
      new MediaRecorder(
        stream
      );

    mediaRecorder.ondataavailable =
      event=>{
        if(
          event.data &&
          event.data.size > 0
        ){
          recordedChunks.push(
            event.data
          );
        }
      };

    mediaRecorder.onstop =
      ()=>{
        const blob =
          new Blob(
            recordedChunks,
            {
              type:
                "audio/webm"
            }
          );

        const url =
          URL.createObjectURL(
            blob
          );

        const clip =
          createAudioClip(
            url,
            "Voice Recording"
          );

        clip.blobType =
          "audio/webm";

        addAudioClip(
          clip,
          0
        );

        stream
          .getTracks()
          .forEach(
            track=>{
              track.stop();
            }
          );

        recording = false;

        updateRecordingButton();

        if(
          typeof showToast ===
          "function"
        ){
          showToast(
            "Voice recording added ✓"
          );
        }
      };

    mediaRecorder.start();

    recording = true;

    updateRecordingButton();

  }catch(error){
    console.warn(
      "Microphone unavailable",
      error
    );

    alert(
      "Microphone access was not available."
    );
  }
}

function stopVoiceRecording(){
  if(
    !mediaRecorder ||
    !recording
  ){
    return;
  }

  mediaRecorder.stop();
}

function updateRecordingButton(){
  const button =
    document.getElementById(
      "recordAudioBtn"
    );

  if(!button) return;

  button.textContent =
    recording
      ? "⏹ Stop Recording"
      : "🎤 Record Voice";

  button.classList.toggle(
    "recording",
    recording
  );
}

const recordAudioBtn =
  document.getElementById(
    "recordAudioBtn"
  );

if(recordAudioBtn){
  recordAudioBtn.onclick =
    ()=>{
      if(recording){
        stopVoiceRecording();
      }else{
        startVoiceRecording();
      }
    };
}

function importAudioFile(file){
  if(!file) return;

  const url =
    URL.createObjectURL(
      file
    );

  const audio =
    new Audio();

  audio.preload =
    "metadata";

  audio.onloadedmetadata =
    ()=>{
      const clip =
        createAudioClip(
          url,
          file.name
        );

      clip.duration =
        audio.duration || 0;

      addAudioClip(
        clip,
        0
      );

      if(
        typeof showToast ===
        "function"
      ){
        showToast(
          "Audio added ✓"
        );
      }
    };

  audio.onerror =
    ()=>{
      URL.revokeObjectURL(
        url
      );

      alert(
        "This audio file could not be loaded."
      );
    };

  audio.src = url;
}

const audioInput =
  document.getElementById(
    "audioInput"
  );

if(audioInput){
  audioInput.addEventListener(
    "change",
    ()=>{
      const file =
        audioInput.files[0];

      importAudioFile(
        file
      );

      audioInput.value = "";
    }
  );
}

const importAudioBtn =
  document.getElementById(
    "importAudioBtn"
  );

if(importAudioBtn){
  importAudioBtn.onclick =
    ()=>{
      if(audioInput){
        audioInput.click();
      }
    };
}
let activeAudioElements = [];

function stopAllAudio(){
  activeAudioElements.forEach(
    audio=>{
      try{
        audio.pause();
        audio.currentTime = 0;
      }catch(error){}
    }
  );

  activeAudioElements = [];
}

function playAudioClip(
  clip,
  currentTime = 0
){
  if(
    !clip ||
    !clip.source ||
    clip.muted
  ){
    return null;
  }

  const audio =
    new Audio(
      clip.source
    );

  audio.volume =
    Math.max(
      0,
      Math.min(
        1,
        Number(clip.volume) || 0
      )
    );

  const offset =
    Math.max(
      0,
      currentTime -
      (Number(clip.start) || 0)
    );

  try{
    audio.currentTime =
      offset;
  }catch(error){}

  audio.play()
    .catch(
      error=>{
        console.warn(
          "Audio playback blocked",
          error
        );
      }
    );

  activeAudioElements.push(
    audio
  );

  audio.onended =
    ()=>{
      const index =
        activeAudioElements
          .indexOf(audio);

      if(index !== -1){
        activeAudioElements
          .splice(index,1);
      }
    };

  return audio;
}

function playAudioTimeline(
  currentTime = 0
){
  stopAllAudio();

  audioClips.forEach(
    clip=>{
      const start =
        Number(clip.start) || 0;

      const duration =
        Number(clip.duration) || 0;

      const end =
        duration > 0
          ? start + duration
          : Infinity;

      if(
        currentTime >= start &&
        currentTime < end
      ){
        playAudioClip(
          clip,
          currentTime
        );
      }
    }
  );
}

function setClipVolume(
  clip,
  volume
){
  if(!clip) return;

  clip.volume =
    Math.max(
      0,
      Math.min(
        1,
        Number(volume)
      )
    );

  syncAudioProject();
  renderAudioTimeline();
}

function setClipStart(
  clip,
  start
){
  if(!clip) return;

  clip.start =
    Math.max(
      0,
      Number(start) || 0
    );

  syncAudioProject();
  renderAudioTimeline();
}

function setClipDuration(
  clip,
  duration
){
  if(!clip) return;

  clip.duration =
    Math.max(
      0,
      Number(duration) || 0
    );

  syncAudioProject();
  renderAudioTimeline();
}

function muteClip(clip){
  if(!clip) return;

  clip.muted =
    !clip.muted;

  syncAudioProject();
  renderAudioTimeline();
}

function deleteAudioClip(
  clip
){
  if(!clip) return;

  audioClips =
    audioClips.filter(
      item =>
        item.id !== clip.id
    );

  audioTracks.forEach(
    track=>{
      if(
        Array.isArray(track.clips)
      ){
        track.clips =
          track.clips.filter(
            item =>
              item.id !== clip.id
          );
      }
    }
  );

  syncAudioProject();
  renderAudioTimeline();

  if(
    typeof showToast ===
    "function"
  ){
    showToast(
      "Audio clip deleted"
    );
  }
}

function duplicateAudioClip(
  clip
){
  if(!clip) return;

  const copy =
    JSON.parse(
      JSON.stringify(clip)
    );

  copy.id =
    "clip_" +
    Date.now() +
    "_" +
    Math.floor(
      Math.random() * 10000
    );

  copy.start =
    (Number(copy.start) || 0) +
    (Number(copy.duration) || 1);

  audioClips.push(copy);

  if(audioTracks[0]){
    audioTracks[0].clips =
      Array.isArray(
        audioTracks[0].clips
      )
        ? audioTracks[0].clips
        : [];

    audioTracks[0].clips.push(
      copy
    );
  }

  syncAudioProject();
  renderAudioTimeline();
    }
function renderAudioTimeline(){
  const timeline =
    document.getElementById(
      "audioTimeline"
    );

  if(!timeline) return;

  timeline.innerHTML = "";

  ensureAudioTrack();

  audioTracks.forEach(
    (track, trackIndex)=>{
      const row =
        document.createElement(
          "div"
        );

      row.className =
        "audio-track";

      const title =
        document.createElement(
          "div"
        );

      title.className =
        "audio-track-title";

      title.textContent =
        track.name;

      row.appendChild(
        title
      );

      const clips =
        Array.isArray(track.clips)
          ? track.clips
          : [];

      clips.forEach(
        clip=>{
          const item =
            document.createElement(
              "button"
            );

          item.className =
            "audio-clip";

          item.textContent =
            clip.name ||
            "Audio";

          item.style.left =
            (
              Number(clip.start) || 0
            ) * 40 + "px";

          item.style.width =
            Math.max(
              60,
              (
                Number(
                  clip.duration
                ) || 2
              ) * 40
            ) + "px";

          item.onclick =
            ()=>{
              audioPreview =
                playAudioClip(
                  clip,
                  Number(clip.start) || 0
                );
            };

          item.oncontextmenu =
            event=>{
              event.preventDefault();

              duplicateAudioClip(
                clip
              );
            };

          row.appendChild(
            item
          );
        }
      );

      timeline.appendChild(
        row
      );
    }
  );
}

function addNewAudioTrack(){
  const nameInput =
    document.getElementById(
      "audioTrackName"
    );

  const name =
    nameInput &&
    nameInput.value.trim()
      ? nameInput.value.trim()
      : "Audio Track " +
        (audioTracks.length + 1);

  addAudioTrack(
    name
  );

  if(nameInput){
    nameInput.value = "";
  }
}

const addAudioTrackBtn =
  document.getElementById(
    "addAudioTrackBtn"
  );

if(addAudioTrackBtn){
  addAudioTrackBtn.onclick =
    addNewAudioTrack;
}

const stopAudioBtn =
  document.getElementById(
    "stopAudioBtn"
  );

if(stopAudioBtn){
  stopAudioBtn.onclick =
    stopAllAudio;
}

function setMasterVolume(
  volume
){
  const value =
    Math.max(
      0,
      Math.min(
        1,
        Number(volume)
      )
    );

  activeAudioElements.forEach(
    audio=>{
      audio.volume =
        value;
    }
  );
}

const masterVolume =
  document.getElementById(
    "masterVolume"
  );

if(masterVolume){
  masterVolume.addEventListener(
    "input",
    ()=>{
      setMasterVolume(
        masterVolume.value
      );
    }
  );
}

function calculateAudioDuration(){
  let duration = 0;

  audioClips.forEach(
    clip=>{
      const end =
        (
          Number(clip.start) || 0
        ) +
        (
          Number(clip.duration) || 0
        );

      duration =
        Math.max(
          duration,
          end
        );
    }
  );

  audioProject.duration =
    duration;

  return duration;
}

function getAudioAtTime(
  time
){
  return audioClips.filter(
    clip=>{
      const start =
        Number(clip.start) || 0;

      const end =
        start +
        (
          Number(clip.duration) || 0
        );

      return (
        time >= start &&
        time <= end
      );
    }
  );
}

function initializeAudio(){
  loadAudioProject();
  calculateAudioDuration();
  renderAudioTimeline();
}

if(
  document.readyState ===
  "loading"
){
  document.addEventListener(
    "DOMContentLoaded",
    initializeAudio
  );
}else{
  initializeAudio();
}
function connectAudioToAnimation(){
  if(
    typeof animationPlaying ===
    "undefined"
  ){
    return;
  }

  if(animationPlaying){
    const time =
      typeof currentFrame !==
      "undefined" &&
      typeof animationFPS !==
      "undefined"
        ? currentFrame /
          animationFPS
        : 0;

    playAudioTimeline(
      time
    );
  }
}

function previewAudioWithAnimation(){
  stopAllAudio();

  if(
    typeof animationFrames ===
    "undefined" ||
    !animationFrames.length
  ){
    return;
  }

  if(
    typeof playAnimation ===
    "function"
  ){
    playAnimation();
  }

  playAudioTimeline(0);
}

const previewAudioBtn =
  document.getElementById(
    "previewAudioBtn"
  );

if(previewAudioBtn){
  previewAudioBtn.onclick =
    previewAudioWithAnimation;
}

function createAudioContext(){
  if(audioContext){
    return audioContext;
  }

  try{
    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    if(AudioContext){
      audioContext =
        new AudioContext();
    }
  }catch(error){
    console.warn(
      "Web Audio unavailable",
      error
    );
  }

  return audioContext;
}

document.addEventListener(
  "pointerdown",
  ()=>{
    const context =
      createAudioContext();

    if(
      context &&
      context.state ===
      "suspended"
    ){
      context.resume()
        .catch(
          ()=>{}
        );
    }
  },
  {
    once: true
  }
);

function cleanupAudio(){
  stopAllAudio();

  if(
    mediaRecorder &&
    recording
  ){
    try{
      mediaRecorder.stop();
    }catch(error){}
  }

  syncAudioProject();
}

window.addEventListener(
  "beforeunload",
  cleanupAudio
);

window.addEventListener(
  "pagehide",
  cleanupAudio
);

window.audioStudio = {
  getTracks:
    ()=>audioTracks,

  getClips:
    ()=>audioClips,

  addTrack:
    addAudioTrack,

  addClip:
    addAudioClip,

  playClip:
    playAudioClip,

  stop:
    stopAllAudio,

  record:
    startVoiceRecording,

  stopRecording:
    stopVoiceRecording,

  save:
    syncAudioProject
};

console.log(
  "Comic Studio Audio Engine ready ✓"
);
