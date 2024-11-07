// VideoPlayer.js
import React, { useRef, useEffect, useContext } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { GlobalContext } from "../globalHighlight/GlobalContext";

const VideoPlayer = ({
  videoPath,
  start_time,
  end_time,
  current_time,
  patient_id,
  trial,
  group,
  label,
}) => {
  const { setGlobalArray, setGlobalArray2, setGlobalArrayVideo } =
    useContext(GlobalContext);

  const videoRef = useRef();

  const handleRemove = () => {
    // Remove the item based on patient_id and trial
    setGlobalArrayVideo((prev) =>
      prev.filter(
        (item) =>
          !(
            item.patient_id === patient_id &&
            item.trial === trial &&
            item.group === group
          )
      )
    );

    const key = patient_id + "_" + trial;
    if (group === "g1") {
      setGlobalArray((prevKeys) => {
        const newKeys = prevKeys.includes(key)
          ? prevKeys.filter((k) => k !== key)
          : [...prevKeys, key];
        return newKeys;
      });
    }
    if (group === "g2") {
      setGlobalArray2((prevKeys) => {
        const newKeys = prevKeys.includes(key)
          ? prevKeys.filter((k) => k !== key)
          : [...prevKeys, key];
        return newKeys;
      });
    }
  };

  useEffect(() => {
    const video = videoRef.current;

    if (video) {
      // Set the video to start from start_time when it loads
      video.currentTime = start_time;

      const handleTimeUpdate = () => {
        // Pause the video and reset to start time when it reaches end_time

        if (video.currentTime >= end_time) {
          video.pause();
          video.currentTime = start_time;
        }
        const normalizedTime =
          ((video.currentTime - start_time) / (end_time - start_time)) * 100;

        // console.log("Mapped Current Time (0-100):", Math.round(normalizedTime));
        // update the global state with the current time
        setGlobalArrayVideo((prev) =>
          prev.map((item) => {
            if (
              item.patient_id === patient_id &&
              item.trial === trial &&
              item.group === group
            ) {
              return {
                ...item,
                current_time: Math.round(normalizedTime),
              };
            }
            return item;
          })
        );
      };

      const handlePlay = () => {
        // Ensure video starts from start_time if it’s outside the specified range
        if (video.currentTime < start_time || video.currentTime > end_time) {
          video.currentTime = start_time;
        }
      };

      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("play", handlePlay);

      return () => {
        // Clean up event listeners on unmount
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("play", handlePlay);
      };
    }
  }, [start_time, end_time]);

  return (
    <Card
      style={{
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
        backgroundColor: group === "g1" ? "#fc8d62" : "#66c2a5",
        position: "relative", // Needed for absolute positioning of close button
        maxWidth: 400,
        margin: "20px auto",
      }}
    >
      {/* Close Button */}
      <IconButton
        onClick={handleRemove}
        style={{
          position: "absolute",
          top: 1,
          right: 8,
          color: "#fff",
        }}
      >
        <CloseIcon />
      </IconButton>

      {/* Display title with patient and trial IDs */}
      <CardContent style={{ paddingBottom: "8px", paddingTop: "8px" }}>
        <Typography variant="h8" style={{ fontWeight: "bold", color: "#fff" }}>
          {label} | Patient: {patient_id} | Trial: {trial}
        </Typography>
      </CardContent>

      {/* Video Container */}
      <CardMedia
        component="video"
        ref={videoRef}
        src={videoPath}
        controls
        style={{
          height: "220px",
          width: "100%",
          objectFit: "contain",
        }}
      />
    </Card>
  );
};

export default VideoPlayer;
