import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { Pose } from "@mediapipe/pose";
import * as cam from "@mediapipe/camera_utils";

export default function BodyDetection({
  isActive,
  setFeedbackMsg,
  selectedProgram,
  setSessionReps,
  setSessionErrors // Dashboard kadhun yenara navin prop
}) {
  
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);

  const [angle, setAngle] = useState(0);
  const [counter, setCounter] = useState(0);

  const stageRef = useRef("neutral"); 
  const repsRef = useRef(0);
  const errorsRef = useRef(0); // Internal error counter
  const lastSpoken = useRef("");
  const lastFeedbackMsg = useRef("");

  const triggerDynamicFeedback = (msg, shouldSpeak = false) => {
    if (lastFeedbackMsg.current !== msg) {
      lastFeedbackMsg.current = msg;
      if (setFeedbackMsg) setFeedbackMsg(msg);
      
      // 🚨 JAR MSG MADHE "❌" ASEL TAR ERROR COUNT VADHAWA
      if (msg.includes("❌") && setSessionErrors) {
        errorsRef.current += 1;
        setSessionErrors(errorsRef.current);
      }
    }
    if (shouldSpeak && lastSpoken.current !== msg) {
      lastSpoken.current = msg;
      window.speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance(msg);
      speech.rate = 1.1;
      window.speechSynthesis.speak(speech);
    }
  };

  const calculateAngle = (a, b, c) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let currentAngle = Math.abs((radians * 180) / Math.PI);
    if (currentAngle > 180) currentAngle = 360 - currentAngle;
    return currentAngle;
  };

  useEffect(() => {
    repsRef.current = 0;
    errorsRef.current = 0; // Reset errors on start
    stageRef.current = "neutral";
    setCounter(0);
    lastSpoken.current = "";
    lastFeedbackMsg.current = "";
    if (setSessionReps) setSessionReps(0);
    if (setSessionErrors) setSessionErrors(0);
  }, [selectedProgram, setSessionReps, setSessionErrors]);

  useEffect(() => {
    if (!isActive) {
      if (cameraRef.current) { cameraRef.current.stop(); cameraRef.current = null; }
      return;
    }

    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    pose.onResults((results) => {
      if (!results.poseLandmarks || !canvasRef.current) return;

      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, 640, 480);
      ctx.drawImage(results.image, 0, 0, 640, 480);

      const lm = results.poseLandmarks;
      
      const legAngle = Math.round(calculateAngle(lm[24], lm[26], lm[28]));
      const shoulderMidX = (lm[11].x + lm[12].x) / 2;
      const shoulderMidY = (lm[11].y + lm[12].y) / 2;
      const neckAngle = Math.round(Math.atan2(Math.abs(lm[0].x - shoulderMidX), Math.abs(lm[0].y - shoulderMidY)) * (180 / Math.PI));

      const wristMovement = Math.abs(lm[15].y - lm[23].y);

      if (selectedProgram === "Neck Tilt") {
        if (legAngle < 140) {
          triggerDynamicFeedback("❌ Focus on your neck, stop bending your legs.", true);
          return;
        }
        if (wristMovement > 0.45) {
          triggerDynamicFeedback("❌ Hands steady! Only move your head.", true);
          return;
        }

        setAngle(neckAngle);
        if (neckAngle > 5 && neckAngle < 15) {
          triggerDynamicFeedback("Starting to tilt... keep going slowly.", true);
        } else if (neckAngle >= 15 && neckAngle < 25) {
          triggerDynamicFeedback("Almost there, feel the stretch in your neck.", true);
        } else if (neckAngle >= 28) {
          if (stageRef.current !== "tilted") {
            triggerDynamicFeedback("✅ Perfect stretch! Now bring it back to center.", true);
            stageRef.current = "tilted";
            repsRef.current += 1; setCounter(repsRef.current); setSessionReps(repsRef.current);
          }
        } else if (neckAngle < 8) {
          stageRef.current = "neutral";
          triggerDynamicFeedback("Back to center. Ready for next.", false);
        }
      }

      else if (selectedProgram === "Squat") {
        if (neckAngle > 30) {
          triggerDynamicFeedback("❌ Keep your head straight while squatting.", true);
          return;
        }

        setAngle(legAngle);
        if (legAngle < 160 && legAngle > 120 && stageRef.current === "up") {
          triggerDynamicFeedback("Lowering down... watch your balance.", true);
        } else if (legAngle <= 100) {
          if (stageRef.current !== "down") {
            triggerDynamicFeedback("Target depth reached! Hold... now push up.", true);
            stageRef.current = "down";
          }
        } else if (legAngle >= 165 && stageRef.current === "down") {
          triggerDynamicFeedback("✅ Great Rep! Stand up straight.", true);
          stageRef.current = "up";
          repsRef.current += 1; setCounter(repsRef.current); setSessionReps(repsRef.current);
        }
      }

      lm.forEach((p) => {
        ctx.beginPath(); ctx.arc(p.x * 640, p.y * 480, 3, 0, 2 * Math.PI);
        ctx.fillStyle = "#00FF00"; ctx.fill();
      });
    });

    if (webcamRef.current?.video) {
      cameraRef.current = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => { if (isActive && webcamRef.current?.video) await pose.send({ image: webcamRef.current.video }); },
        width: 640, height: 480,
      });
      cameraRef.current.start();
    }
    return () => cameraRef.current?.stop();
  }, [isActive, selectedProgram, setSessionReps, setSessionErrors]);

  return (
    <div className="bg-white p-4 rounded-[2rem] border shadow-lg h-full">
      <div className="flex justify-between mb-2 font-bold text-gray-800 px-2">
        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">Reps: {counter}</span>
        <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full">Angle: {angle}°</span>
      </div>
      <div className="relative h-[400px] w-full bg-black rounded-xl overflow-hidden flex items-center justify-center">
        {isActive ? (
          <>
            <Webcam ref={webcamRef} className="absolute opacity-0 w-full h-full" />
            <canvas ref={canvasRef} className="absolute w-full h-full object-cover" width="640" height="480" />
          </>
        ) : (
          <div className="text-white font-bold flex flex-col items-center gap-2">
            <span className="text-3xl">📷</span>
            <span>AI Camera Standby</span>
          </div>
        )}
      </div>
    </div>
  );
}