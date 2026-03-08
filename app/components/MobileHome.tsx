"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MainWebsite from "./MainWebsite";

// Pre-define the beats for the mobile static animation
const mobileBeats = [
  "A golden shell,",
  "waiting to be shattered.",
  "Hand-rolled.",
  "Spiced Moong Dal.",
  "Tangy Tamarind.",
  "An explosion of flavor."
];

export default function MobileHome() {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [introFinished, setIntroFinished] = useState(false);

  // Preload images for smooth playback (load every 2nd frame to cut memory and lag by 50%)
  useEffect(() => {
    for (let i = 1; i <= 71; i += 2) {
      const img = new Image();
      img.src = `/sequence/kachori_hover_${i}.png`;
    }
  }, []);

  // Play animation sequence automatically
  useEffect(() => {
    if (introFinished) return;

    // Optimized image swap: Show 1 frame every 180ms (skipping intermediate frames)
    // 36 frames * 180ms = ~6.4 seconds (matches text duration perfectly but with 50% less load)
    const frameInterval = setInterval(() => {
      setCurrentFrame(prev => {
        if (prev >= 69) {
          clearInterval(frameInterval); // Stop interval exactly at the end
          return 71; // Lock on final frame (71)
        }
        return prev + 2; // Skip every other frame to eliminate lag
      });
    }, 180);

    // Faster text cycles to match image duration (6 beats * 1200ms = 7.2 seconds)
    const beatInterval = setInterval(() => {
      setCurrentBeat(prev => {
        if (prev >= mobileBeats.length - 1) {
          clearInterval(beatInterval);
          setTimeout(() => setIntroFinished(true), 1500); // Finish shortly after last text
          return prev;
        }
        return prev + 1;
      });
    }, 1200); 

    return () => {
      clearInterval(frameInterval);
      clearInterval(beatInterval);
    };
  }, [introFinished]);

  return (
    <>
      {/* Mobile Intro Sequence */}
      <AnimatePresence>
        {!introFinished && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
            className="fixed inset-0 w-full h-full bg-[#0A0A0A] z-[100] flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Optimized Image Swapper (Lighter than Canvas) */}
            <div className="relative w-full h-[50vh] flex items-center justify-center mt-[-10vh]">
              <img
                src={`/sequence/kachori_hover_${currentFrame}.png`}
                alt="Kachori Animation"
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>

            {/* Text Beats */}
            <div className="absolute bottom-[20vh] w-full px-6 text-center h-24 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.h2
                  key={currentBeat}
                  initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
                  transition={{ duration: 0.8 }}
                  className="text-3xl text-white font-bold leading-snug drop-shadow-md"
                >
                  {mobileBeats[currentBeat]}
                </motion.h2>
              </AnimatePresence>
            </div>

            {/* Skip Button */}
            <button 
              onClick={() => setIntroFinished(true)}
              className="absolute bottom-10 text-white/50 text-xs tracking-widest uppercase border border-white/20 px-6 py-2 rounded-full active:bg-white/10"
            >
              Skip Intro
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Website loaded beneath */}
      <div style={{ opacity: introFinished ? 1 : 0, transition: 'opacity 1.5s ease-in-out' }}>
         <MainWebsite />
      </div>
    </>
  );
}
