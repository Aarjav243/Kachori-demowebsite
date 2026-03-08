"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useSpring, AnimatePresence, motion } from "framer-motion";

const FRAME_COUNT = 72;

export default function AntiGravityCanvas({ scrollYProgress: externalScrollProgress }: { scrollYProgress?: any }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);

    const { scrollYProgress: internalScrollProgress } = useScroll();
    const activeScrollProgress = externalScrollProgress || internalScrollProgress;

    // Smooth the scroll progress for buttery zero-gravity feel
    const smoothScrollProgress = useSpring(activeScrollProgress, {
        stiffness: 45,
        damping: 25,
        restDelta: 0.001
    });

    // Preload images
    useEffect(() => {
        const loadedImages: HTMLImageElement[] = [];
        let loadedCount = 0;

        for (let i = 0; i < FRAME_COUNT; i++) {
            const img = new Image();
            img.src = `/sequence/kachori_hover_${i}.png`;
            img.onload = () => {
                loadedCount++;
                setLoadingProgress(Math.floor((loadedCount / FRAME_COUNT) * 100));
                if (loadedCount === FRAME_COUNT) {
                    setImages(loadedImages);
                    // Small delay for smooth transition
                    setTimeout(() => setIsLoading(false), 500);
                }
            };
            img.onerror = () => {
                console.error(`Failed to load image: kachori_hover_${i}.png`);
                loadedCount++;
                if (loadedCount === FRAME_COUNT) {
                    setImages(loadedImages);
                    setIsLoading(false);
                }
            }
            loadedImages[i] = img;
        }
    }, []);

    // Update canvas on scroll
    useEffect(() => {
        if (images.length === 0 || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        const render = () => {
            const progress = smoothScrollProgress.get() as any as number;
            const frameIndex = Math.min(
                FRAME_COUNT - 1,
                Math.floor(progress * FRAME_COUNT)
            );

            const img = images[frameIndex];
            if (!img) return;

            // Ensure canvas matches screen pixels exactly
            const dpr = window.devicePixelRatio || 1;
            const canvasWidth = window.innerWidth * dpr;
            const canvasHeight = window.innerHeight * dpr;

            if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
            }

            // Handle responsive scaling (cover logic — fills screen on all devices)
            const imgWidth = img.width;
            const imgHeight = img.height;

            const ratio = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
            const newWidth = imgWidth * ratio;
            const newHeight = imgHeight * ratio;
            const x = (canvasWidth - newWidth) / 2;
            const y = (canvasHeight - newHeight) / 2;

            context.clearRect(0, 0, canvasWidth, canvasHeight);
            context.drawImage(img, x, y, newWidth, newHeight);
        };

        const unsubscribe = smoothScrollProgress.on("change", render);

        // Initial render
        render();

        // Resize handler
        const handleResize = () => {
            render();
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        return () => {
            unsubscribe();
            window.removeEventListener("resize", handleResize);
        };
    }, [images, smoothScrollProgress]);

    return (
        <div className="relative w-full h-full">
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0A0A0A]"
                    >
                        <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden mb-6">
                            <div
                                className="h-full bg-white transition-all duration-300 ease-out"
                                style={{ width: `${loadingProgress}%` }}
                            />
                        </div>
                        <p className="text-white/40 text-[10px] tracking-[0.4em] font-light uppercase">
                            Preparing Experience {loadingProgress}%
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
            <canvas
                ref={canvasRef}
                className="fixed top-0 left-0 w-full h-screen block pointer-events-none z-0"
                style={{ width: '100vw', height: '100vh' }}
            />
        </div>
    );
}
