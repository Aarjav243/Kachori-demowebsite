"use client";

import { useRef, useEffect } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import AntiGravityCanvas from "@/components/AntiGravityCanvas";
import MainWebsite from "./components/MainWebsite";

const beats = [
  {
    isFirst: true,
    keyframes: [0, 0.05, 0.20, 0.30],
    text: "A golden shell, waiting to be shattered.",
    align: "center",
  },
  {
    keyframes: [0.25, 0.35, 0.50, 0.60],
    text: "Crispy spheres and spiced potatoes defy gravity.",
    align: "left",
  },
  {
    keyframes: [0.55, 0.65, 0.80, 0.90],
    text: "Sweet tamarind and whisked yogurt, suspended in time.",
    align: "right",
  },
  {
    isLast: true,
    keyframes: [0.85, 0.95, 0.99, 1.0],
    text: "Taste the masterpiece.",
    align: "center",
    cta: true,
  },
];

function TextBeat({ beat, scrollYProgress }: { beat: any, scrollYProgress: any }) {

  const opacity = useTransform(
    scrollYProgress,
    beat.keyframes,
    beat.isFirst ? [1, 1, 1, 0] : (beat.isLast ? [0, 1, 1, 1] : [0, 1, 1, 0])
  );

  const y = useTransform(
    scrollYProgress,
    beat.keyframes,
    beat.isFirst ? [0, 0, 0, -50] : (beat.isLast ? [50, 0, 0, 0] : [50, 0, 0, -50])
  );

  const filter = useTransform(
    scrollYProgress,
    beat.keyframes,
    beat.isFirst
      ? ["blur(0px)", "blur(0px)", "blur(0px)", "blur(12px)"]
      : (beat.isLast
        ? ["blur(12px)", "blur(0px)", "blur(0px)", "blur(0px)"]
        : ["blur(12px)", "blur(0px)", "blur(0px)", "blur(12px)"])
  );

  const alignmentClass =
    beat.align === "left" ? "items-start text-left pl-6 md:pl-24" :
      beat.align === "right" ? "items-end text-right pr-6 md:pr-24" :
        "items-center text-center";

  return (
    <motion.div
      style={{ opacity, y, filter }}
      className={`fixed top-0 left-0 w-full h-full flex flex-col justify-center pointer-events-none ${alignmentClass}`}
    >
      <div className={`px-4 md:px-6 ${beat.align === 'center' ? 'w-full max-w-5xl' : 'max-w-2xl'}`}>
        <h2 className={`text-2xl sm:text-4xl md:text-6xl font-bold tracking-tight text-white mb-4 leading-tight drop-shadow-2xl font-sans ${beat.align === 'center' ? 'mx-auto text-center max-w-4xl' : 'max-w-2xl'}`}>
          {beat.text}
        </h2>

        {beat.cta && (
          <motion.div className="mt-8 md:mt-12 pointer-events-auto flex justify-center w-full z-50 relative">
            <motion.button
              className="px-8 md:px-12 py-4 md:py-5 bg-white text-black text-xs font-bold tracking-[0.3em] rounded-sm hover:bg-black hover:text-white hover:border-white border border-transparent transition-all uppercase shadow-2xl cursor-pointer"
              whileTap={{ scale: 0.95 }}
            >
              Order Now
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const curRef = useRef<HTMLDivElement>(null);
  const curRingRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  // Global Cursor Logic — disabled on touch devices
  useEffect(() => {
    // Detect touch device: skip cursor logic entirely
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (isTouch) return;
    const cur = curRef.current;
    const curR = curRingRef.current;
    if (!cur || !curR) return;

    let mx = 0, my = 0, rx = 0, ry = 0;
    let animationFrameId: number;

    const onMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      cur.style.left = mx + 'px';
      cur.style.top = my + 'px';
    };

    const animR = () => {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      curR.style.left = rx + 'px';
      curR.style.top = ry + 'px';
      animationFrameId = requestAnimationFrame(animR);
    };

    window.addEventListener('mousemove', onMouseMove);
    animR();

    const updateInteractions = () => {
      const interactiveEls = document.querySelectorAll('a, button, .mc, .ci, .ing-item');
      const onEnter = () => { cur.classList.add('big'); curR.classList.add('big'); };
      const onLeave = () => { cur.classList.remove('big'); curR.classList.remove('big'); };

      interactiveEls.forEach(el => {
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
      });

      return () => {
        interactiveEls.forEach(el => {
          el.removeEventListener('mouseenter', onEnter);
          el.removeEventListener('mouseleave', onLeave);
        });
      };
    };

    const cleanupInteractions = updateInteractions();

    // Re-check interactions periodically or on route/mount changes
    const intervalId = setInterval(updateInteractions, 2000);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationFrameId);
      cleanupInteractions();
      clearInterval(intervalId);
    };
  }, []);

  return (
    <main className="relative bg-[#0A0A0A] selection:bg-white selection:text-black min-h-screen font-sans">
      {/* Custom Global Cursor — hidden on touch devices via CSS */}
      <div id="cur" ref={curRef} style={{ zIndex: 99999, pointerEvents: 'none' }}></div>
      <div id="cur-ring" ref={curRingRef} style={{ zIndex: 99998, pointerEvents: 'none' }}></div>

      {/* Scroll Container */}
      <div ref={containerRef} className="relative w-full" style={{ height: '400vh' }}>

        {/* Sticky Background & Canvas */}
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <AntiGravityCanvas scrollYProgress={scrollYProgress} />
          {/* Subtle Vignette for text legibility */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,10,10,0.8)_100%)] pointer-events-none z-0" />

          {/* Scrollytelling Beats Container (Fixed Relative to Sticky) */}
          <div className="absolute inset-0 pointer-events-none">
            {beats.map((beat, idx) => (
              <TextBeat key={idx} beat={beat} scrollYProgress={scrollYProgress} />
            ))}
          </div>

          {/* Scroll Indicator */}
          <motion.div
            style={{ opacity: scrollIndicatorOpacity }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 z-20 pointer-events-none"
          >
            <div className="flex flex-col items-center gap-2">
              <p className="text-white/30 text-[10px] tracking-[0.4em] uppercase font-light">
                Scroll to explore
              </p>
              <div className="w-[1px] h-16 bg-gradient-to-b from-white/30 via-white/10 to-transparent" />
            </div>
          </motion.div>
        </div>
      </div>
      <MainWebsite />
    </main>
  );
}

