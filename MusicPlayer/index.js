let playIcon = document.getElementById("playIcon");
let songDurationText = document.getElementById("songDurationText");
let songPercentage = document.getElementById("songPercentage");
let songPercentageBackground = document.getElementById("songPercentageBackground");
let songNameText = document.getElementById("songNameText");
let songIcon = document.getElementById("songIcon");
let musicPlayer = document.getElementById("mpContainer");
let lastSongIcon = document.getElementById("lastSongIcon");
let nextSongIcon = document.getElementById("nextSongIcon");
let fileUploadIcon = document.getElementById("fileUploadIcon");
let settingsIcon = document.getElementById("settingsIcon");
let settingsContainer = document.getElementById("mpSettingsContainer");
let settingsBox = document.getElementById("mpSettingsBox");
let dirHandle = null;

let controlsHideInterval = setInterval(hideIcons, 100);
function hideIcons() {
    //console.log("hideIcons");
    if (playIcon.complete) {
        playIcon.style.visibility = "hidden";
        //console.log("hid play icon");
        UpdateCanvasIcons(playIcon);
    }
    if (lastSongIcon.complete) {
        lastSongIcon.style.visibility = "hidden";
        //console.log("hid last song icon");
        UpdateCanvasIcons(lastSongIcon);
    }
    if (nextSongIcon.complete) {
        nextSongIcon.style.visibility = "hidden";
        //console.log("hid next song icon");
        UpdateCanvasIcons(nextSongIcon);
    }
    if (fileUploadIcon.complete) {
        fileUploadIcon.style.visibility = "hidden";
        UpdateCanvasIcons(fileUploadIcon);
    }
    if (settingsIcon.complete) {
        settingsIcon.style.visibility = "hidden";
        UpdateCanvasIcons(settingsIcon);
    }
    if (playIcon.complete && lastSongIcon.complete && nextSongIcon.complete && fileUploadIcon.complete && settingsIcon.complete) {
        //clearInterval(controlsHideInterval);
        //console.log("cleared interval");
    }
}

function UpdateCanvasIcons(icon, color) {
    let canvas;
    let setting;
    if (icon.id === "playIcon") {
        setting = 10;
        canvas = document.getElementById("playSongIconCanvas");
    }
    else if (icon.id === "lastSongIcon") {
        setting = 9;
        canvas = document.getElementById("lastSongIconCanvas");
    }
    else if (icon.id === "nextSongIcon") {
        canvas = document.getElementById("nextSongIconCanvas");
        setting = 11;
        canvas.style.transform = "scaleX(-100%)"
    }
    else if (icon.id === "fileUploadIcon") {
        setting = 13;
        canvas = document.getElementById("fileUploadIconCanvas");
    }
    else if (icon.id === "settingsIcon") {
        setting = 12;
        canvas = document.getElementById("settingsIconCanvas");
        canvas.style.width = "17px";
        canvas.style.height = "17px";
    }
    let context = canvas.getContext("2d");
    if (color === null || color === undefined) {color = settings[setting][2]}
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(icon, 0, 0, canvas.width, canvas.height);
    context.globalCompositeOperation = "source-in";
    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.globalCompositeOperation = "source-over";
}

let sound = undefined;

let time = 0;
let interval;
let autoscroll = true;
let autoscrollSpeed = "7s";

let drag = null;
let offsetX = 0;
let offsetY = 0;


const defaultSettings = [
    ["Volume", "percentage", "100%"],
    ["Auto-scroll", "boolean", "true"],
    ["Auto-scroll-speed", "text", "7s"],
    ["Background-color", "color", "rgba(0, 0, 0, 0.6)"],
    ["Background-border-color", "color", "rgba(0, 0, 0, 1)"],
    ["Percentage-background-color", "color", "rgba(14, 14, 14, 1)"],
    ["Percentage-color", "color", "rgba(255, 255, 255, 1)"],
    ["Current-time-color", "color", "rgba(255, 255, 255, 1)"],
    ["Box-shadow-color", "color", "rgba(255, 255, 255, 0.4)"],
    ["Last-song-icon-color", "color", "rgba(255, 255, 255, 1)"],
    ["Play-pause-song-icon-color", "color", "rgba(255, 255, 255, 1)"],
    ["Next-song-icon-color", "color", "rgba(255, 255, 255, 1)"],
    ["Settings-icon-color", "color", "rgba(255, 255, 255, 1)"],
    ["Playlist-folder-icon-color", "color", "rgba(255, 255, 255, 1)"],
    ["Song-icon-border-color", "color", "rgba(255, 255, 255, 1)"],
    ["Position", "position", ["0", "0"]],
];
function deepFreeze(obj) {
    Object.freeze(obj);
    for (const key of Object.getOwnPropertyNames(obj)) {
        const value = obj[key];
        if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
            deepFreeze(value);
        }
    }
    return obj;
}
deepFreeze(defaultSettings);

let settings = [
    ["Volume", "percentage", "100%"], //0
    ["Auto-scroll", "boolean", "true"],//1
    ["Auto-scroll-speed", "text", "7s"],//2
    ["Background-color", "color", "rgba(0, 0, 0, 0.6)"],//3
    ["Background-border-color", "color", "rgba(0, 0, 0, 1)"],//4
    ["Percentage-background-color", "color", "rgba(14, 14, 14, 1)"],//5
    ["Percentage-color", "color", "rgba(255, 255, 255, 1)"],//6
    ["Current-time-color", "color", "rgba(255, 255, 255, 1)"],//7
    ["Box-shadow-color", "color", "rgba(255, 255, 255, 0.4)"],//8
    ["Last-song-icon-color", "color", "rgba(255, 255, 255, 1)"],//9
    ["Play-pause-song-icon-color", "color", "rgba(255, 255, 255, 1)"],//10
    ["Next-song-icon-color", "color", "rgba(255, 255, 255, 1)"],//11
    ["Settings-icon-color", "color", "rgba(255, 255, 255, 1)"],//12
    ["Playlist-folder-icon-color", "color", "rgba(255, 255, 255, 1)"],//13
    ["Song-icon-border-color", "color", "rgba(255, 255, 255, 1)"],//14
    ["Position", "position", ["0", "0"]],//15
]

window.addEventListener("DOMContentLoaded", () => {
    settingsContainer.style.display = "none";
    ReloadSettings();
    Drag([document.getElementById('mpContainer')])
})

function ReloadSettings() {
    settingsBox.innerHTML = '';
    for (let i = 0; i < settings.length; i++) {
        let setting = settings[i];
        if (setting[1] === "percentage") {
            let container = document.createElement("div");
            let name = document.createElement("span");
            let slider = document.createElement("input");
            settingsBox.appendChild(container);
            container.appendChild(name);
            container.appendChild(slider);
            container.className = "mpSetting mpPercentageSetting";
            container.id = `mp${setting[0]}`;
            name.innerHTML = `${setting[0]}: `;
            slider.type = "range";
            slider.min = 1;
            slider.max = 100;
            slider.value = setting[2].split("%")[0];
            slider.onchange = SettingChanged;
            slider.id = `mp${setting[0]}Slider`;
        }
        else if (setting[1] === "boolean") {
            let container = document.createElement("div");
            let name = document.createElement("span");
            let checkBox = document.createElement("input");
            settingsBox.appendChild(container);
            container.appendChild(name);
            container.appendChild(checkBox);
            container.className = "mpSetting mpBooleanSetting";
            container.id = `mp${setting[0]}`;
            name.innerHTML = `${setting[0]}: `;
            checkBox.type = "checkbox";
            checkBox.checked = setting[2] === "true";
            checkBox.onchange = SettingChanged;
            checkBox.id = `mp${setting[0]}Checkbox`;
        }
        else if (setting[1] === "text") {
            let container = document.createElement("div");
            let name = document.createElement("span");
            let textBox = document.createElement("input");
            settingsBox.appendChild(container);
            container.appendChild(name);
            container.appendChild(textBox);
            container.className = "mpSetting mpBooleanSetting";
            container.id = `mp${setting[0]}`;
            name.innerHTML = `${setting[0]}: `;
            textBox.type = "text";
            textBox.value = setting[2];
            textBox.onchange = SettingChanged;
            textBox.id = `mp${setting[0]}Textbox`;
            textBox.style.color = "black";
        }
        else if (setting[1] === "color") {
            let container = document.createElement("div");
            let name = document.createElement("span");
            let colorBox = document.createElement("div");
            settingsBox.appendChild(container);
            container.appendChild(name);
            container.appendChild(colorBox);
            container.className = "mpSetting mpBooleanSetting";
            container.id = `mp${setting[0]}`;
            name.innerHTML = `${setting[0]}: `;
            try {
                let pickr = new Pickr({
                    el: colorBox,
                    container: container,
                    theme: 'nano',
                    autoReposition: false,
                    inline: true,
                    sliders: '>',
                    default: setting[2],
                    defaultRepresentation: 'RGBA',
                    closeWithKey: 'Escape',
                    showAlways: true,
                    components: {
                        palette: true,
                        preview: true,
                        opacity: true,
                        hue: true,
                        interaction: {
                            input: true, // Display input/output textbox which shows the selected color value.
                            save: true,  // Display Save Button,
                        },
                    }
                });
                pickr.on("save", (color, instance) => {
                    switch (setting[0]) {
                        case "Background-color":
                            document.getElementById(`mpContainer`).style.backgroundColor = color.toRGBA().toString();
                            setting[2] = color.toRGBA().toString();
                            break;
                        case "Background-border-color":
                            document.getElementById(`mpContainer`).style.borderColor = color.toRGBA().toString();
                            setting[2] = color.toRGBA().toString();
                            break;
                        case "Percentage-background-color":
                            document.getElementById(`songPercentageContainer`).style.backgroundColor = color.toRGBA().toString();
                            setting[2] = color.toRGBA().toString();
                            break;
                        case "Percentage-color":
                            document.getElementById(`songPercentageBackground`).style.backgroundColor = color.toRGBA().toString();
                            setting[2] = color.toRGBA().toString();
                            break;
                        case "Current-time-color":
                            document.getElementById(`songDurationText`).style.color = color.toRGBA().toString();
                            setting[2] = color.toRGBA().toString();
                            break;
                        case "Box-shadow-color":
                            document.getElementById("mpContainer").style.boxShadow = `0 0px 12px ${color.toRGBA().toString()}`;
                            setting[2] = color.toRGBA().toString();
                            break;
                        case "Last-song-icon-color":
                            UpdateCanvasIcons(lastSongIcon, color.toRGBA().toString());
                            setting[2] = color.toRGBA().toString();
                            break;
                        case "Play-pause-song-icon-color":
                            UpdateCanvasIcons(playIcon, color.toRGBA().toString());
                            setting[2] = color.toRGBA().toString();
                            break;
                        case "Next-song-icon-color":
                            UpdateCanvasIcons(nextSongIcon, color.toRGBA().toString());
                            setting[2] = color.toRGBA().toString();
                            break;
                        case "Settings-icon-color":
                            UpdateCanvasIcons(settingsIcon, color.toRGBA().toString());
                            setting[2] = color.toRGBA().toString();
                            break;
                        case "Playlist-folder-icon-color":
                            UpdateCanvasIcons(fileUploadIcon, color.toRGBA().toString());
                            setting[2] = color.toRGBA().toString();
                            break;
                        case "Song-icon-border-color":
                            document.getElementById("songIconContainer").style.borderColor = color.toRGBA().toString();
                            setting[2] = color.toRGBA().toString();
                            break;
                    }
                });
                pickr.id = `mp${setting[0]}Pickr`;
            } catch (e) {
                console.error(e);
            }
        } else if (setting[1] === "position") {
            musicPlayer.style.left = setting[2][0];
            musicPlayer.style.top = setting[2][1];
        }
    }
}

function ShowMPSettings() {
    settingsContainer.style.display = "flex";
}

function SettingChanged() {
    //cannot update color settings here because of how pickr works
    for (let i = 0; i < settings.length; i++) {
        switch (settings[i][0]) {
            case "Volume":
                if (sound !== undefined) {
                    sound.volume(document.getElementById("mpVolumeSlider").value / 100);
                    settings[i][2] = `${document.getElementById("mpVolumeSlider").value}%`;
                }
                break;
            case "Auto-scroll":
                autoscroll = document.getElementById(`mp${settings[i][0]}Checkbox`).checked === true;
                settings[i][2] = (document.getElementById(`mp${settings[i][0]}Checkbox`).checked === true).toString();
                UpdateSongInfo(false);
                break;
            case "Auto-scroll-speed":
                autoscrollSpeed = document.getElementById(`mp${settings[i][0]}Textbox`).value;
                settings[i][2] = document.getElementById(`mp${settings[i][0]}Textbox`).value;
                UpdateSongInfo(false);
                break;
            case "Background-color":
                document.getElementById(`mpContainer`).style.backgroundColor = settings[i][2];
                break;
            case "Background-border-color":
                document.getElementById(`mpContainer`).style.borderColor = settings[i][2];
                break;
            case "Percentage-background-color":
                document.getElementById(`songPercentageContainer`).style.backgroundColor = settings[i][2];
                break;
            case "Percentage-color":
                document.getElementById(`songPercentageBackground`).style.backgroundColor = settings[i][2];
                break;
            case "Current-time-color":
                document.getElementById(`songDurationText`).style.color = settings[i][2];
                break;
            case "Box-shadow-color":
                document.getElementById("mpContainer").style.boxShadow = `0 0px 12px ${settings[i][2]}`;
                break;
            case "Last-song-icon-color":
                UpdateCanvasIcons(lastSongIcon, settings[i][2]);
                break;
            case "Play-pause-song-icon-color":
                UpdateCanvasIcons(playIcon, settings[i][2]);
                break;
            case "Next-song-icon-color":
                UpdateCanvasIcons(nextSongIcon, settings[i][2]);
                break;
            case "Settings-icon-color":
                UpdateCanvasIcons(settingsIcon, settings[i][2]);
                break;
            case "Playlist-folder-icon-color":
                UpdateCanvasIcons(fileUploadIcon, settings[i][2]);
                break;
            case "Song-icon-border-color":
                document.getElementById("songIconContainer").style.borderColor = settings[i][2];
                break;
            case "Position":
                musicPlayer.style.left = settings[15][2][0];
                musicPlayer.style.top = settings[15][2][1];
                break;
        }
    }
}

function ExitMPSettings() {
    settingsContainer.style.display = "none";
}

async function SaveMPSettings() {
    if (await getStructure(dirHandle, dirHandle.name) !== null) {
        try {
            const configHandle = await dirHandle.getFileHandle("mpConfig.json", {create: false});
            const writable = await configHandle.createWritable();
            const data = JSON.stringify(settings, null, 2);
            await writable.write(data);
            await writable.close();
            document.getElementById("saveConfigButton").style.backgroundColor = "rgba(0, 244, 0, 1)";
            setInterval(() => {document.getElementById("saveConfigButton").style.backgroundColor = "rgba(0, 0, 0, 1)";}, 1000);
            return 0;
        } catch (e) {
            console.error(e);
            document.getElementById("saveConfigButton").style.backgroundColor = "rgba(244, 0, 0, 1)";
            setInterval(() => {document.getElementById("saveConfigButton").style.backgroundColor = "rgba(0, 0, 0, 1)";}, 1000);
            return 1;
        }
    } else {
        try {
            const configHandle = await dirHandle.getFileHandle("mpConfig.json", {create: true});
            const writable = await configHandle.createWritable();
            const data = JSON.stringify(settings, null, 2);
            await writable.write(data);
            await writable.close();
            document.getElementById("saveConfigButton").style.backgroundColor = "rgba(0, 244, 0, 1)";
            setInterval(() => {document.getElementById("saveConfigButton").style.backgroundColor = "rgba(0, 0, 0, 1)";}, 1000);
            return 0;
        } catch (e) {
            console.error(e);
            document.getElementById("saveConfigButton").style.backgroundColor = "rgba(244, 0, 0, 1)";
            setInterval(() => {document.getElementById("saveConfigButton").style.backgroundColor = "rgba(0, 0, 0, 1)";}, 1000);
            return 1;
        }
    }
}

async function LoadMPSettings() {
    let [fileHandle] = await window.showOpenFilePicker({
        types: [{
            description: 'Config File',
            accept: {
                'json/*': ['.json']
            }
        }],
        excludeAcceptAllOption: true,
        multiple: false,
    });
    let file = await fileHandle.getFile();
    let data = await file.text();
    const dbKey = await fileHandle.requestPermission({mode: 'read' });
    if (dbKey === "granted") {
        localStorage.setItem("configHandle", JSON.stringify(fileHandle));
    }
    const loadedSettings = JSON.parse(data);
    if (Array.isArray(loadedSettings)) {
        for (let i = 0; i < loadedSettings.length; i++) {
            for (let n = 0; n < settings[i].length; n++) {
                //console.log(settings[i][n]);
                //console.log(loadedSettings[i][n]);
                settings[i][n] = loadedSettings[i][n];
                //console.log("New settings: " + settings[i][n] + "\n\n\n");
            }
        }
    }
    ReloadSettings();
    SettingChanged();
}

function ResetMPSettings() {
    settings = defaultSettings;
    ReloadSettings();
    SettingChanged();
}

function Drag(elements) {
    for (const element of elements) {
        element.style.position = "fixed";

        element.onmousedown = function (e) {
            drag = element;
            let rect = drag.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
        };
    }
}

document.onmouseup = function () {
    drag = null;
    //musicPlayer.style.position = "fixed";
};

document.onmousemove = function (e) {
    if (drag !== null) {
        drag.style.left = (e.clientX - offsetX) + "px";
        drag.style.top = (e.clientY - offsetY) + "px";
        settings[15][2][0] = musicPlayer.style.left.toString();
        settings[15][2][1] = musicPlayer.style.top.toString();
    }
};

function increment() {
    time += 1;
    songDurationText.innerHTML = `${GetDuration(time)}/${GetDuration(sound.duration())}`;
    songPercentage.value = ((time / sound.duration()) * 100);
    songPercentageBackground.style.width = `${((time / sound.duration()) * 100)}%`;
    //console.log(songPercentage.value);
}

songPercentage.onchange = () => {
    if (sound !== undefined) {
        time = (songPercentage.value * sound.duration()) / 100;
        songPercentageBackground.style.width = `${((time / sound.duration()) * 100)}%`;
        sound.seek(time);
    } else {
        songPercentage.value = 1;
    }
};

function lastSong() {
    if (index !== 0) {
        index -= 1;
        UpdateSongInfo();
    } else {
        // grey out the last song icon
        time = 0;
        sound.stop();
        songDurationText.innerHTML = `${GetDuration(time)}/` + GetDuration(sound.duration());
        clearInterval(interval);
        songPercentage.value = 1;
        songPercentageBackground.style.width = `${1}%`;
        playIcon.src = "MusicPlayer/assets/play.webp";

    }
}

let playlist = undefined;
let index = 0;
async function toggleSong() {
    if (!sound.playing()) {
        sound.play();
        playIcon.src = "MusicPlayer/assets/pause.webp";
        UpdateCanvasIcons(playIcon, settings[11][2]);
        songDurationText.innerHTML = `${GetDuration(time)}/` + GetDuration(sound.duration());
        interval = setInterval(increment, 1000);
    } else {
        sound.pause();
        playIcon.src = "MusicPlayer/assets/play.webp";
        UpdateCanvasIcons(playIcon, settings[11][2]);
        clearInterval(interval);
    }
}

function nextSong() {
    if (index < playlist.length-1) {
        index += 1;
        UpdateSongInfo();
    } else {
        // grey out the next song icon
        time = 0;
        sound.stop();
        songDurationText.innerHTML = `${GetDuration(time)}/` + GetDuration(sound.duration());
        songPercentage.value = 1;
        songPercentageBackground.style.width = `${1}%`;
        playIcon.src = "MusicPlayer/assets/play.webp";
        clearInterval(interval);
    }
}

function SongEnded() {
    clearInterval(interval);
    time = 0;
    songDurationText.innerHTML = `0:00/0:00`;
    playIcon.src = "MusicPlayer/assets/play.webp";
    songPercentage.value = 1;
    songPercentageBackground.style.width = `${1}%`;
    nextSong();
}

function GetDuration(duration) {
    let minutes = Math.floor(duration / 60);
    let seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function SetDuration() {
    songDurationText.innerHTML = `0:00/` + GetDuration(sound.duration());
}

function StopSong() {
    clearInterval(interval);
    time = 0;
    if (sound !== undefined) {
        sound.stop();
        sound = undefined;
    }
    songDurationText.innerHTML = `${GetDuration(time)}/0:00`;
    songPercentage.value = 1;
    songPercentageBackground.style.width = `${1}%`;
    songNameText.innerHTML = "Song Name";
    songIcon.src = "MusicPlayer/assets/defaultSongIcon.png";
    playIcon.src = "MusicPlayer/assets/play.webp";
    songNameText.style.paddingLeft = "0%";
    songNameText.style.animation = `none`;
}

function UpdateSongInfo(stopSound = true) {
    if (stopSound) {
        sound.stop();
        time = 0;
        clearInterval(interval);
        interval = setInterval(increment, 1000);
        songPercentage.value = 1;
        songPercentageBackground.style.width = `${1}%`;
        console.log(`index: ${index}`);
        let url = URL.createObjectURL(playlist[index]);
        console.log(url);
        sound = new Howl({
            src: url,
            format: 'mp3',
        });
        sound.volume(document.getElementById("mpVolumeSlider").value / 100);
        sound.on('end', SongEnded);
        songDurationText.innerHTML = `${GetDuration(time)}/` + GetDuration(sound.duration());
        songNameText.innerHTML = playlist[index].name.split(".mp3", true);
        SetSongIcon(playlist[index]);
    } else {
        if (sound !== undefined) {
            sound.pause();
        }
    }
    sound.play();
    playIcon.src = "MusicPlayer/assets/pause.webp";
    if (songNameText.innerHTML.length  > 16 && autoscroll) {
        songNameText.style.paddingLeft = "100%";
        songNameText.style.animation = `songNameAnim ${autoscrollSpeed} linear infinite`;
    } else {
        songNameText.style.paddingLeft = "0%";
        songNameText.style.animation = `none`;
    }
}

function SetSongIcon(fileData) {
    jsmediatags.read(fileData, {
        onSuccess: (tag) => {
            const picture = tag.tags.picture;
            if (picture) {
                let base64String = "";
                for (let i = 0; i < picture.data.length; i++) {
                    base64String += String.fromCharCode(picture.data[i]);
                }
                const base64 = `data:${picture.format};base64,${window.btoa(base64String)}`;
                songIcon.src = base64;
            } else {
                songIcon.src = "MusicPlayer/assets/defaultSongIcon.png";
            }
        }
    });
}

async function getStructure(dirHandle, path = dirHandle.name) {
    const dirs = [];
    const files = [];
    let configFile = null;
    for await (const entry of dirHandle.values()) {
        const nestedPath = `${path}/${entry.name}`;
        if (entry.kind === "file" && entry.name.toString().includes(".mp3")) {
            files.push(
                entry.getFile().then((file) => {
                    file.directoryHandle = dirHandle;
                    file.handle = entry;
                    return Object.defineProperty(file, "webkitRelativePath", {
                        configurable: true,
                        enumerable: true,
                        get: () => nestedPath,
                    });
                })
            );
        } else if (entry.kind === "directory") {
            dirs.push(getStructure(entry, nestedPath));
        } else if (entry.kind === "file" && entry.name === "mpConfig.json") {
            configFile = entry;
        }
    }
    return [
        (await Promise.all(dirs)).flat(),
        (await Promise.all(files)),
        configFile,
    ];
}

async function SelectPlaylistFolder() {
    StopSong();
    try {
        dirHandle = await window.showDirectoryPicker({
            mode: "readwrite",
            id: 1,
            startIn: "downloads"
        });

        let directoryStructure = await getStructure(dirHandle, undefined);
        let urls = [];
        for (let i = 0; i < directoryStructure[1].length; i++) {
            urls.push(URL.createObjectURL(directoryStructure[1][i]));
        }
        playlist = directoryStructure[1];
        sound = new Howl({
            src: urls[0],
            format: 'mp3',
        });
        playIcon.src = "MusicPlayer/assets/pause.webp";

        SetSongIcon(playlist[0]);
        UpdateSongInfo();
        //config file exists for playlist
        if (directoryStructure[2] !== null) {
            const file = await directoryStructure[2].getFile();
            const text = await file.text();
            const loadedSettings = JSON.parse(text);
            //console.log("loaded settings: \n\n" + loadedSettings);
            if (Array.isArray(loadedSettings)) {
                for (let i = 0; i < loadedSettings.length; i++) {
                    for (let n = 0; n < settings[i].length; n++) {
                        //console.log(settings[i][n]);
                        //console.log(loadedSettings[i][n]);
                        settings[i][n] = loadedSettings[i][n];
                        //console.log("New settings: " + settings[i][n] + "\n\n\n");
                    }
                }
            }
        } else {
            try {
                const configHandle = await dirHandle.getFileHandle("mpConfig.json", { create: true });
                const writable = await configHandle.createWritable();
                const data = JSON.stringify(defaultSettings, null, 2);
                await writable.write(data);
                await writable.close();
                //console.log("Created default config file with settings:", settings);
            } catch (err) {
                //console.error("Failed to create config file:", err);
            }
        }
    } catch (error) {
        console.log(error);
    }
    ReloadSettings();
    SettingChanged();
    UpdateCanvasIcons(playIcon);
}
