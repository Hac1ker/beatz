console.log('Thank you for visiting us!');
let currentSong = new Audio();
let songs;
let currFolder
function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;
    if (isNaN(secs)) {
        return `00:00`
    }
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text()
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    // console.log(as);
    songs = []
    let songNames = []
    for (let i = 0; i < as.length; i++) {
        const e = as[i];
        if (e.href.endsWith(".mp3")) {
            songs.push(e.href.split(`/${folder}/`)[1])
        }
    }
    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songul.innerHTML = ""
    for (const song of songs) {
        songul.innerHTML += ` <li class="flex align_i pointer">
                                <img src="img/music.svg" alt="">
                                <div class="info">
                                    <div>${song.replaceAll("%20", " ").split(".mp3")[0]}</div>
                                    <div>Spotify</div>
                                </div>
                                <div class="play flex gap align_i">
                                    <span>Play Now</span>
                                    <img src="img/play.svg" class="pointer" alt="Click me">
                                </div>
                            </li>`
    }
    Array.from(songul.getElementsByTagName("li")).forEach(e => {
        let songname = e.querySelector(".info").querySelector("div").innerHTML.concat(".mp3")
        e.addEventListener("click", () => {
            console.log(`Now playing ${songname.replaceAll(".mp3", "")}`);

            playmusic(songname)
        })
    });
    return songs

}

function playmusic(song, pause) {
    // let audio = new Audio(`songs/${song}`);
    currentSong.src = `${currFolder}/${song}`
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(song.split(".mp3")[0])

}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let cardcont = document.querySelector(".cardcont")
    let array  = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];  
        if (e.href.includes("/songs")) {
            let folders = e.href.split("/")[4];
            let a = await fetch(`http://127.0.0.1:3000/songs/${folders}/info.json`)
            let response = await a.json()
            cardcont.innerHTML = cardcont.innerHTML + `<div data-folder="${folders}" class="card pointer rounded">
                        <div class="play">
                            <svg fill="#000000" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true"
                                class="e-9640-icon" viewBox="0 0 24 24">
                                <path
                                    d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z">
                                    </path>
                                    </svg>
                                    </div>
                                    <img src="/songs/${folders}/cover.png"
                                    alt="Be Happy" class="rounded">
                                    <h2>${response.title}</h2>
                                    <p>${response.description}</p>
                                    </div>`

        }
    }
    Array.from(document.getElementsByClassName('card')).forEach((e) => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playmusic(songs[0])
        })
    })
}

async function main() {

    await getSongs("songs/cs")
    playmusic(songs[0], true)
    // console.log(songs);

    displayAlbums()



    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        } else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${formatTime(Math.floor(currentSong.currentTime))} / ${formatTime(Math.floor(currentSong.duration))}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
        if (currentSong.currentTime == currentSong.duration) {
            play.src = "img/play.svg"
        }
    })

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = (percent + "%");
        currentSong.currentTime = (currentSong.duration * percent) / 100

    })

    let hamburger = document.querySelector(".hamburger");

    hamburger.addEventListener("click", () => {
        let leftBar = document.querySelector(".left");

        if (hamburger.src.includes("hamburger.svg")) {
            // console.log('Left bar opened');
            leftBar.style.left = "0";
            hamburger.src = "img/cross.svg";
        } else {
            // console.log('Left bar closed');
            leftBar.style.left = "-200%";
            hamburger.src = "img/hamburger.svg";
        }
    });

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1])
        // console.log(index ,songs);
        if (index - 1 >= 0) {
            playmusic(songs[index - 1])
        }
    })
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1])
        // console.log(index, songs.length);
        if (index + 1 <= songs.length - 1) {
            playmusic(songs[index + 1])
        }
        else {
            alert("No more songs")
        }
    })

    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = e.target.value / 100
        // console.log(e.target.value / 100);

    })

    document.querySelector(".volumecont > img").addEventListener("click", (e) => {
        if (e.target.src.endsWith("img/volume.svg")) {
            e.target.src = "img/mute.svg";
            currentSong.volume = 0;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 0
        } else {
            e.target.src = "img/volume.svg";
            currentSong.volume = 0.5;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 50
        }
    });
    

}
main()
