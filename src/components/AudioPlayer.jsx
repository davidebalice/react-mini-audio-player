import axios from "axios";
import { useEffect, useRef, useState } from "react";

import infoIcon from "../audio/images/info.png";
import leftIcon from "../audio/images/left.png";
import nextIcon from "../audio/images/next.png";
import note from "../audio/images/nota.png";
import pauseIcon from "../audio/images/pause.png";
import playIcon from "../audio/images/play.png";
import prevIcon from "../audio/images/prev.png";
import rightIcon from "../audio/images/right.png";
import volumeIcon2 from "../audio/images/volume2.png";

import classes from "../index.module.css";

function AudioPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [volumeIsOpen, setVolumeIsOpen] = useState(false);
  const [infoIsOpen, setInfoIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playlist, setPlaylist] = useState([]);

  const audioRef = useRef(null);
  const sideBarRef = useRef();
  const dataContainerRef = useRef();
  const volumeRef = useRef();
  const playerRef = useRef();
  const playerContainerRef = useRef();
  const infoContainerRef = useRef();

  useEffect(() => {
    axios
      .get("https://audio-player.davidebalice.dev/playlist.json")
      .then((response) => {
        setPlaylist(response.data);
        if (response.data.length > 0) {
          audioRef.current = new Audio(response.data[0].url);
        }
      })
      .catch((error) =>
        console.error("Errore nel caricamento della playlist:", error)
      );
  }, []);

  const togglePanel = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      if (dataContainerRef.current) {
        dataContainerRef.current.style.display = "none";
        sideBarRef.current.style.display = "flex";
        infoContainerRef.current.style.display = "none";
        playerContainerRef.current.style.display = "block";
      }
    } else {
      if (dataContainerRef.current) {
        dataContainerRef.current.style.display = "flex";
        sideBarRef.current.style.display = "none";
      }
    }
  };

  const toggleVolume = () => {
    setVolumeIsOpen(!volumeIsOpen);
    if (volumeIsOpen) {
      volumeRef.current.style.display = "none";
      playerRef.current.style.width = "100%";
    } else {
      volumeRef.current.style.display = "block";
      playerRef.current.style.width = "80%";
    }
  };

  const toggleInfo = () => {
    setInfoIsOpen(!infoIsOpen);
    if (infoIsOpen) {
      infoContainerRef.current.style.display = "none";
      playerContainerRef.current.style.display = "block";
    } else {
      infoContainerRef.current.style.display = "block";
      playerContainerRef.current.style.display = "none";
    }
  };

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const updateCurrentTime = () => setCurrentTime(audio.currentTime);
    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener("timeupdate", updateCurrentTime);
    audio.addEventListener("loadedmetadata", setAudioData);

    if (isPlaying) {
      audio
        .play()
        .catch((error) => console.error("Failed to play audio:", error));
    } else {
      audio.pause();
    }

    return () => {
      audio.removeEventListener("timeupdate", updateCurrentTime);
      audio.removeEventListener("loadedmetadata", setAudioData);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (!audioRef.current || playlist.length === 0) return;

    const audio = audioRef.current;
    audio.src = playlist[currentTrackIndex].url;
    audio.load();
    setCurrentTime(0);
    if (isPlaying) {
      audio.play();
    }

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [currentTrackIndex, isPlaying, playlist]);

  const togglePlayPause = () => setIsPlaying((prev) => !prev);

  const handleProgressChange = (event) => {
    const audio = audioRef.current;
    const newTime = (event.target.value / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex(
      (prev) => (prev - 1 + playlist.length) % playlist.length
    );
    setIsPlaying(true);
  };

  const handlePlaylistItem = (index) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  return (
    <div className={`${classes.audioPlayer} ${isOpen ? classes.open : ""}`}>
      <div className={classes.header}>
        <div className={classes.flex}>
          <div onClick={togglePanel} className={classes.openArrow}>
            {isOpen ? <img src={rightIcon} /> : <img src={leftIcon} />}
          </div>
          <div className={classes.headerButton2}></div>
        </div>
        <div>Mini audio player</div>
        <div className={classes.flex}>
          <div onClick={toggleVolume} className={classes.headerButton}>
            <img src={volumeIcon2} />
          </div>
          <div onClick={toggleInfo} className={classes.headerButton}>
            <img src={infoIcon} />
          </div>
        </div>
      </div>
      <div ref={playerContainerRef}>
        <div className={classes.sideButtons} ref={sideBarRef}>
          <img src={note} className={classes.note} />
          <img
            src={isPlaying ? pauseIcon : playIcon}
            className={classes.playButton}
            onClick={togglePlayPause}
          />

          <img
            src={nextIcon}
            className={classes.playButton}
            onClick={nextTrack}
          />
        </div>

        <div className={classes.dataContainer} ref={dataContainerRef}>
          <div className={classes.playerContainer} ref={playerRef}>
            <div>{playlist[currentTrackIndex]?.title || "Loading..."}</div>
            <div style={{ width: `${(currentTime / duration) * 100}%` }} />
            <input
              type="range"
              min="0"
              max="100"
              value={(currentTime / duration) * 100 || 0}
              onChange={handleProgressChange}
              className={classes.progressBar}
            />

            <div className={classes.trackControls}>
              <img
                src={prevIcon}
                className={classes.playButton2}
                onClick={prevTrack}
              />
              <img
                src={isPlaying ? pauseIcon : playIcon}
                className={classes.playButton2}
                onClick={togglePlayPause}
              />
              <img
                src={nextIcon}
                className={classes.playButton2}
                onClick={nextTrack}
              />
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            ref={volumeRef}
            value={audioRef.current?.volume || 1}
            onChange={(event) => (audioRef.current.volume = event.target.value)}
            className={classes.volumeSlider}
          />
        </div>

        <div className={classes.spacer}></div>

        <div className={classes.playlistContainer}>
          {playlist.map((track, index) => (
            <div
              key={index}
              onClick={() => handlePlaylistItem(index)}
              className={`${classes.playlistItem} ${
                index === currentTrackIndex ? classes.playlistItemActive : ""
              }`}
            >
              <span>{track.title}</span>
              <span>{track.time}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={classes.infoContainer} ref={infoContainerRef}>
        <b>Mini audio player developed in React</b>
        <br />
        <br />
        Import the playlist by fetching the JSON file.
        <br />
        <br />
        Audio track are generated by Suno Ai.
        <br />
        Lyrics by Davide Balice
        <br />
        <br />
        <div className={classes.spacer}></div>
        <br />
        <br />
        <b>Github</b>
        <br />
        <br />
        <a
          href="https://github.com/davidebalice/react-mini-audio-player"
          target="_blank"
          rel="noreferrer"
        >
          github.com/davidebalice/react-mini-audio-player
        </a>
      </div>
    </div>
  );
}

export default AudioPlayer;
