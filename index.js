// ==UserScript==
// @name               Better Youtube Shorts
// @name:zh-CN         更好的 Youtube Shorts
// @name:zh-TW         更好的 Youtube Shorts
// @namespace          Violentmonkey Scripts
// @version            2.2.0
// @description        Provide more control functions for YouTube Shorts, including automatic/manual redirection to corresponding video pages, volume control, progress bar, auto scrolling, shortcut keys, and more.
// @description:zh-CN  为 Youtube Shorts提供更多的控制功能，包括自动/手动跳转到对应视频页面，音量控制，进度条，自动滚动，快捷键等等。
// @description:zh-TW  為 Youtube Shorts提供更多的控制功能，包括自動/手動跳轉到對應影片頁面，音量控制，進度條，自動滾動，快捷鍵等等。
// @author             Meriel
// @match              *://*.youtube.com/*
// @exclude            *://music.youtube.com/*
// @run-at             document-start
// @grant              GM.addStyle
// @grant              GM.registerMenuCommand
// @grant              GM.getValue
// @grant              GM.setValue
// @grant              GM_info
// @license            MIT
// @icon               https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// ==/UserScript==

(async () => {
  const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  let currentUrl = "";

  const once = (fn) => {
    let done = false;
    let result;
    return async (...args) => {
      if (done) return result;
      done = true;
      result = await fn(...args);
      return result;
    };
  };

  const closeText = `<br>Double click to close this message👆`;
  let updateText = `BTYS Version ${GM_info.script.version}<br>
    We add a red dot to the custom progress bar🔴<br>
    Just as what the original progress bar does<br>
    You can see it when you hover over the progress bar🖱️<br>
    Also, now you can switch the progress bar style between original and custom🔧<br>
    You can toggle it in the Tampermonkey menu🛠️<br>
    Which means when you switch to the original progress bar📶<br>
    All this script do is just enhance but not change🆙<br>
  `;
  let newInstallationText = `
    Welcome to Better YouTube Shorts🎉<br>
    Please check the settings in the Tampermonkey menu🛠️<br>
    There are more features in it📢<br>
    Below is the explanation of the shortcut keys👇<br>
    <br>
    Arrow Up/Down: Scroll up/down<br>
    Arrow Left/Right: Seek backward/forward<br>
    Shift + Arrow Up/Left: Volume up/backward<br>
    Shift + Arrow Down/Right: Volume down/forward<br>
    Alt + Enter: Toggle fullscreen<br>
    Alt + W: Open watch page in current tab<br>
    0~9: Jump to the corresponding progress<br>
  `;
  updateText += closeText;
  newInstallationText += closeText;

  const higherVersion = (v1, v2) => {
    const v1Arr = v1.split(".");
    const v2Arr = v2.split(".");
    for (let i = 0; i < v1Arr.length; i++) {
      if (v1Arr[i] > v2Arr[i]) {
        return true;
      } else if (v1Arr[i] < v2Arr[i]) {
        return false;
      }
    }
    return false;
  };

  const version = await GM.getValue("version");
  const newInstallation = once(async (reel, video) => {
    if (!version) {
      video.pause();
      GM.setValue("version", GM_info.script.version);
      const info = document.createElement("div");
      info.style.cssText = `position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; justify-content: center; align-items: center; background-color: rgba(0, 0, 0, 0.5); z-index: 999; margin: 5px 0; color: black; font-size: 2rem; font-weight: bold; text-align: center; border-radius: 10px; padding: 10px; box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.5); transition: 0.5s;`;
      const infoText = document.createElement("div");
      infoText.style.cssText = `background-color: white; padding: 10px; border-radius: 10px; font-size: 1.5rem;`;
      infoText.innerHTML = newInstallationText;
      info.appendChild(infoText);
      reel.appendChild(info);
      info.addEventListener("dblclick", () => {
        info.remove();
        video.play();
      });
    }
  });
  const update = once(async (reel, video) => {
    const shouldNotifyUserAboutChanges = true;
    if (
      typeof version === "string" &&
      higherVersion(GM_info.script.version, version) &&
      shouldNotifyUserAboutChanges
    ) {
      video.pause();
      GM.setValue("version", GM_info.script.version);
      const info = document.createElement("div");
      info.style.cssText = `position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; justify-content: center; align-items: center; background-color: rgba(0, 0, 0, 0.5); z-index: 999; margin: 5px 0; color: black; font-size: 2rem; font-weight: bold; text-align: center; border-radius: 10px; padding: 10px; box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.5); transition: 0.5s;`;
      const infoText = document.createElement("div");
      infoText.style.cssText = `background-color: white; padding: 10px; border-radius: 10px; font-size: 1.5rem;`;
      infoText.innerHTML = updateText;
      info.appendChild(infoText);
      reel.appendChild(info);
      info.addEventListener("dblclick", () => {
        info.remove();
        video.play();
      });
    }
  });

  let shortsAutoSwitchToVideo = await GM.getValue("shortsAutoSwitchToVideo");
  if (shortsAutoSwitchToVideo === void 0) {
    shortsAutoSwitchToVideo = false;
    GM.setValue("shortsAutoSwitchToVideo", shortsAutoSwitchToVideo);
  }
  GM.registerMenuCommand(
    `Shorts Auto Switch To Video: ${shortsAutoSwitchToVideo ? "on" : "off"}`,
    () => {
      shortsAutoSwitchToVideo = !shortsAutoSwitchToVideo;
      GM.setValue("shortsAutoSwitchToVideo", shortsAutoSwitchToVideo).then(
        () => (location.href = location.href.replace("watch?v=", "shorts/"))
      );
    }
  );

  if (shortsAutoSwitchToVideo) {
    if (window.location.pathname.match("/shorts/.+")) {
      window.location.replace(
        "https://www.youtube.com/watch?v=" +
          window.location.pathname.split("/shorts/").pop()
      );
    }
    document.addEventListener("yt-navigate-start", (event) => {
      const url = event.detail.url.split("/shorts/");
      if (url.length > 1) {
        window.location.replace("https://www.youtube.com/watch?v=" + url.pop());
      }
    });
    return;
  }

  const initialize = once(async () => {
    GM.addStyle(
      `input[type="range"].volslider {
          height: 12px;
          -webkit-appearance: none;
          margin: 10px 0;
        }
        input[type="range"].volslider:focus {
          outline: none;
        }
        input[type="range"].volslider::-webkit-slider-runnable-track {
          height: 8px;
          cursor: pointer;
          box-shadow: 0px 0px 0px #000000;
          background: rgb(50 50 50);
          border-radius: 25px;
          border: 1px solid #000000;
        }
        input[type="range"].volslider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          margin-top: -2px;
          border-radius: 50%;
          background: ${isDarkMode ? "white" : "black"};
        }
        input[type="range"]:focus::-webkit-slider-runnable-track {
          background: rgb(50 50 50);
        }
        .switch {
          position: relative;
          display: inline-block;
          width: 40px;
          height: 12px;
        }
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          -webkit-transition: 0.4s;
          transition: 0.4s;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 12px;
          width: 12px;
          left: 0px;
          bottom: 0px;
          background-color: ${isDarkMode ? "white" : "black"};
          -webkit-transition: 0.4s;
          transition: 0.4s;
        }
        input:checked + .slider {
          background-color: #ff0000;
        }
        input:focus + .slider {
          box-shadow: 0 0 0px #ff0000;
        }
        input:checked + .slider:before {
          -webkit-transform: translateX(29px);
          -ms-transform: translateX(29px);
          transform: translateX(29px);
        }
        /* Rounded sliders */
        .slider.round {
          border-radius: 12px;
        }
        .slider.round:before {
          border-radius: 50%;
        }
        /* red progress bar */
        #byts-progbar:hover #byts-progress::after,
        #byts-progbar.show-dot #byts-progress::after {
          content: '';
          position: absolute;
          top: 50%;
          right: 0;
          transform: translate(50%, -50%);
          width: 15px;
          height: 15px;
          background-color: #FF0000;
          border-radius: 50%;
          display: block;
        }
        `
    );

    let seekMouseDown = false;
    let lastCurSeconds = 0;
    let video = null;
    let autoScroll = await GM.getValue("autoScroll");
    let loopPlayback = await GM.getValue("loopPlayback");
    let constantVolume = await GM.getValue("constantVolume");
    let operationMode = await GM.getValue("operationMode");
    let openWatchInCurrentTab = await GM.getValue("openWatchInCurrentTab");
    let doubleClickToFullscreen = await GM.getValue("doubleClickToFullscreen");
    let progressBarStyle = await GM.getValue("progressBarStyle");
    const checkpointStatusEnum = Object.freeze({
      OFF: 0,
      TEMPORARY: 1,
      PERMANENT: 2,
    });
    let continueFromLastCheckpoint = await GM.getValue(
      "continueFromLastCheckpoint"
    );
    let lastShortsId = "";

    if (autoScroll === void 0) {
      autoScroll = true;
      GM.setValue("autoScroll", autoScroll);
    }
    if (constantVolume === void 0) {
      constantVolume = false;
      GM.setValue("constantVolume", constantVolume);
    }
    if (operationMode === void 0) {
      operationMode = "Shorts";
      GM.setValue("operationMode", operationMode);
    }
    if (continueFromLastCheckpoint === void 0) {
      continueFromLastCheckpoint = checkpointStatusEnum.OFF;
      GM.setValue("continueFromLastCheckpoint", continueFromLastCheckpoint);
    }
    if (loopPlayback === void 0) {
      loopPlayback = true;
      GM.setValue("loopPlayback", loopPlayback);
    }
    if (openWatchInCurrentTab === void 0) {
      openWatchInCurrentTab = false;
      GM.setValue("openWatchInCurrentTab", openWatchInCurrentTab);
    }
    let shortsCheckpoints;
    if (continueFromLastCheckpoint !== checkpointStatusEnum.OFF) {
      shortsCheckpoints = await GM.getValue("shortsCheckpoints");
      if (
        shortsCheckpoints === void 0 ||
        continueFromLastCheckpoint === checkpointStatusEnum.TEMPORARY
      ) {
        shortsCheckpoints = {};
        GM.setValue("shortsCheckpoints", shortsCheckpoints);
      }
    }
    if (doubleClickToFullscreen === void 0) {
      doubleClickToFullscreen = true;
      GM.setValue("doubleClickToFullscreen", doubleClickToFullscreen);
    }
    if (progressBarStyle === void 0) {
      progressBarStyle = "custom";
      GM.setValue("progressBarStyle", progressBarStyle);
    }

    GM.registerMenuCommand(
      `Constant Volume: ${constantVolume ? "on" : "off"}`,
      () => {
        constantVolume = !constantVolume;
        GM.setValue("constantVolume", constantVolume).then(() =>
          location.reload()
        );
      }
    );
    GM.registerMenuCommand(`Operating Mode: ${operationMode}`, () => {
      operationMode = operationMode === "video" ? "shorts" : "video";
      GM.setValue("operationMode", operationMode).then(() => location.reload());
    });
    GM.registerMenuCommand(
      `Continue From Last Checkpoint: ${Object.keys(checkpointStatusEnum)
        .find(
          (key) => checkpointStatusEnum[key] === continueFromLastCheckpoint % 3
        )
        .toLowerCase()}`,
      () => {
        continueFromLastCheckpoint = (continueFromLastCheckpoint + 1) % 3;
        GM.setValue(
          "continueFromLastCheckpoint",
          continueFromLastCheckpoint
        ).then(() => location.reload());
      }
    );
    GM.registerMenuCommand(
      `Loop Playback: ${loopPlayback ? "on" : "off"}`,
      () => {
        loopPlayback = !loopPlayback;
        GM.setValue("loopPlayback", loopPlayback).then(() => location.reload());
      }
    );
    GM.registerMenuCommand(
      `Open Watch in Current Tab: ${openWatchInCurrentTab ? "on" : "off"}`,
      () => {
        openWatchInCurrentTab = !openWatchInCurrentTab;
        GM.setValue("openWatchInCurrentTab", openWatchInCurrentTab).then(() =>
          location.reload()
        );
      }
    );
    GM.registerMenuCommand(
      `Double Click to Fullscreen: ${doubleClickToFullscreen ? "on" : "off"}`,
      () => {
        doubleClickToFullscreen = !doubleClickToFullscreen;
        GM.setValue("doubleClickToFullscreen", doubleClickToFullscreen).then(
          () => location.reload()
        );
      }
    );
    GM.registerMenuCommand(`Progress Bar Style: ${progressBarStyle}`, () => {
      progressBarStyle = progressBarStyle === "custom" ? "original" : "custom";
      GM.setValue("progressBarStyle", progressBarStyle).then(() =>
        location.reload()
      );
    });

    const observer = new MutationObserver(
      async (mutations, shortsReady = false, videoPlayerReady = false) => {
        outer: for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (!shortsReady) {
              shortsReady = node.tagName === "YTD-SHORTS";
            }
            if (!videoPlayerReady) {
              videoPlayerReady =
                typeof node.className === "string" &&
                node.className.includes("html5-main-video");
            }
            if (shortsReady && videoPlayerReady) {
              observer.disconnect();
              video = node;
              if (constantVolume) {
                video.volume = await GM.getValue("volume", 0);
              }
              addShortcuts();
              updateVidElemWithRAF();
              break outer;
            }
          }
        }
      }
    );
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    function videoOperationMode(e) {
      const volumeSlider = document.getElementById("byts-vol");
      if (!e.shiftKey) {
        if (
          e.key.toUpperCase() === "ARROWUP" ||
          e.key.toUpperCase() === "ARROWDOWN"
        ) {
          e.stopPropagation();
          e.preventDefault();
          switch (e.key.toUpperCase()) {
            case "ARROWUP":
              video.volume = Math.min(1, video.volume + 0.01);
              volumeSlider.value = video.volume;
              break;
            case "ARROWDOWN":
              video.volume = Math.max(0, video.volume - 0.01);
              volumeSlider.value = video.volume;
              break;
            default:
              break;
          }
        } else if (
          e.key.toUpperCase() === "ARROWLEFT" ||
          e.key.toUpperCase() === "ARROWRIGHT"
        ) {
          switch (e.key.toUpperCase()) {
            case "ARROWLEFT":
              video.currentTime -= 1;
              break;
            case "ARROWRIGHT":
              video.currentTime += 1;
              break;
            default:
              break;
          }
        }
      } else {
        switch (e.key.toUpperCase()) {
          case "ARROWLEFT":
          case "ARROWUP":
            navigationButtonUp();
            break;
          case "ARROWRIGHT":
          case "ARROWDOWN":
            navigationButtonDown();
            break;
          default:
            break;
        }
      }
    }

    function shortsOperationMode(e) {
      const volumeSlider = document.getElementById("byts-vol");
      if (
        e.key.toUpperCase() === "ARROWUP" ||
        e.key.toUpperCase() === "ARROWDOWN"
      ) {
        e.stopPropagation();
        e.preventDefault();
        if (e.shiftKey) {
          switch (e.key.toUpperCase()) {
            case "ARROWUP":
              video.volume = Math.min(1, video.volume + 0.02);
              volumeSlider.value = video.volume;
              break;
            case "ARROWDOWN":
              video.volume = Math.max(0, video.volume - 0.02);
              volumeSlider.value = video.volume;
              break;
            default:
              break;
          }
        } else {
          switch (e.key.toUpperCase()) {
            case "ARROWUP":
              navigationButtonUp();
              break;
            case "ARROWDOWN":
              navigationButtonDown();
              break;
            default:
              break;
          }
        }
      } else if (
        e.key.toUpperCase() === "ARROWLEFT" ||
        e.key.toUpperCase() === "ARROWRIGHT"
      ) {
        if (e.shiftKey) {
          switch (e.key.toUpperCase()) {
            case "ARROWLEFT":
              video.volume = Math.max(0, video.volume - 0.01);
              volumeSlider.value = video.volume;
              break;
            case "ARROWRIGHT":
              video.volume = Math.min(1, video.volume + 0.01);
              volumeSlider.value = video.volume;
              break;
            default:
              break;
          }
        } else {
          switch (e.key.toUpperCase()) {
            case "ARROWLEFT":
              video.currentTime -= 1;
              break;
            case "ARROWRIGHT":
              video.currentTime += 1;
              break;
            default:
              break;
          }
        }
      }
    }

    function addShortcuts() {
      if (operationMode === "Video") {
        const observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
              if (node?.id === "byts-vol-div") {
                document.addEventListener(
                  "keydown",
                  function (e) {
                    videoOperationMode(e);
                    if (constantVolume) {
                      constantVolume = false;
                      requestAnimationFrame(() => (constantVolume = true));
                    }
                  },
                  {
                    capture: true,
                  }
                );
                observer.disconnect();
              }
            }
          }
        });
        observer.observe(document.documentElement, {
          childList: true,
          subtree: true,
        });
      } else {
        document.addEventListener(
          "keydown",
          function (e) {
            shortsOperationMode(e);
            if (constantVolume) {
              constantVolume = false;
              requestAnimationFrame(() => (constantVolume = true));
            }
          },
          {
            capture: true,
          }
        );
      }
      if (doubleClickToFullscreen) {
        video.addEventListener("dblclick", function () {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            document.getElementsByTagName("ytd-app")[0].requestFullscreen();
          }
        });
      }
      document.addEventListener("keydown", function (e) {
        if (e.altKey && e.key.toUpperCase() === "ENTER") {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            document.getElementsByTagName("ytd-app")[0].requestFullscreen();
          }
        }
      });
      document.addEventListener("keydown", function (e) {
        if (e.altKey && e.key.toUpperCase() === "W") {
          const watchUrl = location.href.replace("shorts/", "watch?v=");
          if (openWatchInCurrentTab) {
            window.location.href = watchUrl;
          } else {
            window.open(watchUrl, "_blank");
          }
        }
      });
      document.addEventListener("keydown", function (e) {
        if (
          (e.key >= "0" && e.key <= "9") ||
          (e.code >= "Numpad0" && e.code <= "Numpad9")
        ) {
          video.currentTime = video.duration * (e.key / 10);
        }
      });
    }

    function padTo2Digits(num) {
      return num.toString().padStart(2, "0");
    }

    function updateVidElemWithRAF() {
      try {
        if (currentUrl?.includes("youtube.com/shorts")) {
          updateVidElem();
        }
      } catch (e) {
        console.error(e);
      }
      requestAnimationFrame(updateVidElemWithRAF);
    }

    function navigationButtonDown() {
      document.querySelector("#navigation-button-down button").click();
    }

    function navigationButtonUp() {
      document.querySelector("#navigation-button-up button").click();
    }

    function setVideoPlaybackTime(event, player) {
      const rect = player.getBoundingClientRect();
      let offsetX = event.clientX - rect.left;
      if (offsetX < 0) {
        offsetX = 0;
      } else if (offsetX > player.offsetWidth) {
        offsetX = player.offsetWidth - 1;
      }
      let currentTime = (offsetX / player.offsetWidth) * video.duration;
      if (currentTime === 0) currentTime = 1e-6;
      video.currentTime = currentTime;
    }

    async function updateVidElem() {
      const currentVideo = document.querySelector(
        "#shorts-player > div.html5-video-container > video"
      );
      if (video !== currentVideo) {
        video = currentVideo;
      }

      if (constantVolume) {
        video.volume = await GM.getValue("volume", 0);
      }

      const reel = document.querySelector("ytd-reel-video-renderer[is-active]");
      if (reel === null) {
        return;
      }

      if (progressBarStyle === "custom") {
        const shortsPlayerControls = document.querySelector(
          "#scrubber > ytd-scrubber > shorts-player-controls"
        );
        const scrubber = document.getElementById("scrubber");
        shortsPlayerControls?.remove();
        scrubber?.remove();
      }

      update(reel, video);
      newInstallation(reel, video);

      if (continueFromLastCheckpoint !== checkpointStatusEnum.OFF) {
        const currentSec = Math.floor(video.currentTime);
        const shortsUrlList = location.href.split("/");
        if (!shortsUrlList.includes("shorts")) return;
        const shortsId = shortsUrlList.pop();

        if (shortsId !== lastShortsId) {
          lastShortsId = shortsId;
          const checkpoint = shortsCheckpoints[shortsId] || 1e-6;
          video.pause();
          if (checkpoint + 1 >= video.duration) {
            video.currentTime = 1e-6;
          } else {
            video.currentTime = checkpoint;
          }
          video.play();
        }

        if (currentSec !== lastCurSeconds && video.currentTime !== 0) {
          lastCurSeconds = currentSec;
          shortsCheckpoints[shortsId] = currentSec;
          GM.setValue("shortsCheckpoints", shortsCheckpoints);
        }
      }

      if (operationMode === "Shorts") {
        document.removeEventListener("keydown", videoOperationMode, {
          capture: true,
        });
        document.addEventListener("keydown", shortsOperationMode, {});
      } else {
        document.removeEventListener("keydown", shortsOperationMode, {});
        document.addEventListener("keydown", videoOperationMode, {
          capture: true,
        });
      }

      // Volume Slider
      let volumeSliderDiv = document.getElementById("byts-vol-div");
      let volumeSlider = document.getElementById("byts-vol");
      let volumeTextDiv = document.getElementById("byts-vol-textdiv");
      const reelVolumeSliderDiv = reel.querySelector("#byts-vol-div");
      if (reelVolumeSliderDiv === null) {
        if (volumeSliderDiv === null) {
          volumeSliderDiv = document.createElement("div");
          volumeSliderDiv.id = "byts-vol-div";
          volumeSliderDiv.style.cssText = `user-select: none; width: 100px; left: 0px; background-color: transparent; position: absolute; margin-left: 5px; margin-top: ${reel.offsetHeight}px;`;
          volumeSlider = document.createElement("input");
          volumeSlider.style.cssText = `user-select: none; width: 80px; left: 0px; background-color: transparent; position: absolute; margin-top: 0px;`;
          volumeSlider.type = "range";
          volumeSlider.id = "byts-vol";
          volumeSlider.className = "volslider";
          volumeSlider.name = "vol";
          volumeSlider.min = 0.0;
          volumeSlider.max = 1.0;
          volumeSlider.step = 0.01;
          volumeSlider.value = video.volume;
          volumeSlider.addEventListener("input", function () {
            video.volume = this.value;
            GM.setValue("volume", this.value);
          });
          volumeSliderDiv.appendChild(volumeSlider);
          volumeTextDiv = document.createElement("div");
          volumeTextDiv.id = "byts-vol-textdiv";
          volumeTextDiv.style.cssText = `user-select: none; background-color: transparent; position: absolute; color: ${
            isDarkMode ? "white" : "black"
          }; font-size: 1.2rem; margin-left: ${volumeSlider.offsetWidth + 1}px`;
          volumeTextDiv.textContent = `${(
            video.volume.toFixed(2) * 100
          ).toFixed()}%`;
          volumeSliderDiv.appendChild(volumeTextDiv);
        }
        reel.appendChild(volumeSliderDiv);
        audioInitialized = true;
      }
      if (constantVolume) {
        video.volume = volumeSlider.value;
      }
      volumeSlider.value = video.volume;
      volumeTextDiv.textContent = `${(
        video.volume.toFixed(2) * 100
      ).toFixed()}%`;
      volumeSliderDiv.style.marginTop = `${reel.offsetHeight + 2}px`;
      volumeTextDiv.style.marginLeft = `${volumeSlider.offsetWidth + 1}px`;

      if (progressBarStyle === "custom") {
        // Progress Bar
        let progressBar = document.getElementById("byts-progbar");
        const reelProgressBar = reel.querySelector("#byts-progbar");
        if (reelProgressBar === null) {
          const builtinProgressbar = reel.querySelector("#progress-bar");
          if (builtinProgressbar !== null) {
            builtinProgressbar.remove();
          }
          if (progressBar === null) {
            progressBar = document.createElement("div");
            progressBar.id = "byts-progbar";
            progressBar.style.cssText = `user-select: none; cursor: pointer; width: 98%; height: 7px; background-color: #343434; position: absolute; border-radius: 10px; margin-top: ${
              reel.offsetHeight - 7
            }px;`;
          }
          reel.appendChild(progressBar);

          let wasPausedBeforeDrag = false;
          progressBar.addEventListener("mousedown", function (e) {
            seekMouseDown = true;
            wasPausedBeforeDrag = video.paused;
            setVideoPlaybackTime(e, progressBar);
            video.pause();
            progressBar.classList.add("show-dot");
          });
          document.addEventListener("mousemove", function (e) {
            if (!seekMouseDown) return;
            e.preventDefault();
            setVideoPlaybackTime(e, progressBar);
            if (!video.paused) {
              video.pause();
            }
            e.preventDefault();
          });
          document.addEventListener("mouseup", function () {
            if (!seekMouseDown) return;
            seekMouseDown = false;
            if (!wasPausedBeforeDrag) {
              video.play();
            }
            progressBar.classList.remove("show-dot");
          });
        }
        progressBar.style.marginTop = `${reel.offsetHeight - 7}px`;

        // Progress Bar (Inner Red Bar)
        const progressTime = (video.currentTime / video.duration) * 100;
        let InnerProgressBar = progressBar.querySelector("#byts-progress");
        if (InnerProgressBar === null) {
          InnerProgressBar = document.createElement("div");
          InnerProgressBar.id = "byts-progress";
          InnerProgressBar.style.cssText = `
              user-select: none;
              background-color: #FF0000;
              height: 100%;
              border-radius: 10px;
              width: ${progressTime}%;
              position: relative;
            `;
          progressBar.appendChild(InnerProgressBar);
        }
        InnerProgressBar.style.width = `${progressTime}%`;
      }

      // Time Info
      const durSecs = Math.floor(video.duration);
      const durMinutes = Math.floor(durSecs / 60);
      const durSeconds = durSecs % 60;
      const curSecs = Math.floor(video.currentTime);

      let timeInfo = document.getElementById("byts-timeinfo");
      let timeInfoText = document.getElementById("byts-timeinfo-textdiv");
      const reelTimeInfo = reel.querySelector("#byts-timeinfo");

      if (!Number.isNaN(durSecs) && reelTimeInfo !== null) {
        timeInfoText.textContent = `${Math.floor(curSecs / 60)}:${padTo2Digits(
          curSecs % 60
        )} / ${durMinutes}:${padTo2Digits(durSeconds)}`;
      }
      if (curSecs !== lastCurSeconds || reelTimeInfo === null) {
        lastCurSeconds = curSecs;
        const curMinutes = Math.floor(curSecs / 60);
        const curSeconds = curSecs % 60;

        if (reelTimeInfo === null) {
          if (timeInfo === null) {
            timeInfo = document.createElement("div");
            timeInfo.id = "byts-timeinfo";
            timeInfo.style.cssText = `user-select: none; display: flex; right: auto; left: auto; position: absolute; margin-top: ${
              reel.offsetHeight - 2
            }px;`;
            timeInfoText = document.createElement("div");
            timeInfoText.id = "byts-timeinfo-textdiv";
            timeInfoText.style.cssText = `display: flex; margin-right: 5px; margin-top: 4px; color: ${
              isDarkMode ? "white" : "black"
            }; font-size: 1.2rem;`;
            timeInfoText.textContent = `${curMinutes}:${padTo2Digits(
              curSeconds
            )} / ${durMinutes}:${padTo2Digits(durSeconds)}`;
            timeInfo.appendChild(timeInfoText);
          }
          reel.appendChild(timeInfo);
          timeInfoText.textContent = `${curMinutes}:${padTo2Digits(
            curSeconds
          )} / ${durMinutes}:${padTo2Digits(durSeconds)}`;
        }
      }
      timeInfo.style.marginTop = `${reel.offsetHeight - 2}px`;

      // AutoScroll
      let autoScrollDiv = document.getElementById("byts-autoscroll-div");
      const reelAutoScrollDiv = reel.querySelector("#byts-autoscroll-div");
      if (reelAutoScrollDiv === null) {
        if (autoScrollDiv === null) {
          autoScrollDiv = document.createElement("div");
          autoScrollDiv.id = "byts-autoscroll-div";
          autoScrollDiv.style.cssText = `user-select: none; display: flex; right: 0px; position: absolute; margin-top: ${
            reel.offsetHeight - 3
          }px;`;
          const autoScrollTextDiv = document.createElement("div");
          autoScrollTextDiv.style.cssText = `display: flex; margin-right: 5px; margin-top: 4px; color: ${
            isDarkMode ? "white" : "black"
          }; font-size: 1.2rem;`;
          autoScrollTextDiv.textContent = "Auto Scroll ";
          autoScrollDiv.appendChild(autoScrollTextDiv);
          const autoScrollSwitch = document.createElement("label");
          autoScrollSwitch.className = "switch";
          autoScrollSwitch.style.marginTop = "5px";
          const autoscrollInput = document.createElement("input");
          autoscrollInput.id = "byts-autoscroll-input";
          autoscrollInput.type = "checkbox";
          autoscrollInput.checked = autoScroll;
          autoscrollInput.addEventListener("input", function () {
            autoScroll = this.checked;
            GM.setValue("autoScroll", this.checked);
          });
          const autoScrollSlider = document.createElement("span");
          autoScrollSlider.className = "slider round";
          autoScrollSwitch.appendChild(autoscrollInput);
          autoScrollSwitch.appendChild(autoScrollSlider);
          autoScrollDiv.appendChild(autoScrollSwitch);
        }
        reel.appendChild(autoScrollDiv);
      }
      if (autoScroll === true) {
        video.removeAttribute("loop");
        video.removeEventListener("ended", navigationButtonDown);
        video.addEventListener("ended", navigationButtonDown);
      } else {
        if (loopPlayback) {
          video.setAttribute("loop", true);
          video.removeEventListener("ended", navigationButtonDown);
        } else {
          video.removeAttribute("loop");
          video.removeEventListener("ended", navigationButtonDown);
        }
      }
      autoScrollDiv.style.marginTop = `${reel.offsetHeight - 3}px`;
      autoScrollSlider.style.marginTop = `0px`;
      autoScrollSwitch.style.marginTop = "5px";
    }
  });

  const urlChange = (event) => {
    const destinationUrl = event?.destination?.url || "";
    if (destinationUrl.startsWith("about:blank")) return;
    const href = destinationUrl || location.href;
    if (href.includes("youtube.com/shorts")) {
      if (shortsAutoSwitchToVideo) {
        currentUrl = location.href = href.replace("shorts/", "watch?v=");
        return;
      } else {
        currentUrl = href;
        initialize();
      }
    }
  };
  urlChange();

  unsafeWindow?.navigation?.addEventListener("navigate", urlChange);
  unsafeWindow.addEventListener("replaceState", urlChange);
  unsafeWindow.addEventListener("pushState", urlChange);
  unsafeWindow.addEventListener("popState", urlChange);
  unsafeWindow.addEventListener("hashchange", urlChange);
})();
