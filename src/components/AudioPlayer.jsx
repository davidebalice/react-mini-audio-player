import axios from "axios";
import { useEffect, useRef, useState } from "react";

import leftIcon from "../audio/images/left.png";
import nextIcon from "../audio/images/next.png";
import note from "../audio/images/nota.png";
import pauseIcon from "../audio/images/pause.png";
import playIcon from "../audio/images/play.png";
import prevIcon from "../audio/images/prev.png";
import rightIcon from "../audio/images/right.png";
import classes from "../index.module.css";

function AudioPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playlist, setPlaylist] = useState([]);

  const audioRef = useRef(null);
  const sideBarRef = useRef();
  const dataContainerRef = useRef();

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
      }
    } else {
      if (dataContainerRef.current) {
        dataContainerRef.current.style.display = "flex";
        sideBarRef.current.style.display = "none";
      }
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

  return (
    <div className={`${classes.audioPlayer} ${isOpen ? classes.open : ""}`}>
      <div className={classes.openButton} onClick={togglePanel}>
        {isOpen ? (
          <img src={rightIcon} className={classes.openArrow} />
        ) : (
          <img src={leftIcon} className={classes.openArrow} />
        )}
        <div>Audio player</div>
        <div>i</div>
      </div>
      <div className={classes.main}>
        <div className={classes.sideButtons} ref={sideBarRef}>
          <img src={note} className={classes.note} />
          <img
            src={isPlaying ? pauseIcon : playIcon}
            className={classes.playButton}
            onClick={togglePlayPause}
          />
        </div>

        <div className={classes.volumeControl}>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={audioRef.current?.volume || 1}
            onChange={(event) => (audioRef.current.volume = event.target.value)}
            className={classes.volumeSlider}
          />
        </div>

        <div className={classes.dataContainer} ref={dataContainerRef}>
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
      </div>
    </div>
  );
}

export default AudioPlayer;
