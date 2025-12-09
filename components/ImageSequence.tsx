"use client";
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ImageSequenceProps {
  frameCount: number;
  folderPath: string;
  fileNamePrefix: string;
}

const ImageSequence: React.FC<ImageSequenceProps> = ({
  frameCount,
  folderPath,
  fileNamePrefix,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const [loadProgress, setLoadProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Lazy loading - faqat ko'rinadigan rasmlarni yuklash
  const preloadImage = (index: number): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      if (imagesRef.current.has(index)) {
        resolve(imagesRef.current.get(index)!);
        return;
      }

      const img = new Image();
      const formattedIndex = index.toString().padStart(4, "0");
      img.src = `${folderPath}/${fileNamePrefix}${formattedIndex}.webp`;

      img.onload = () => {
        imagesRef.current.set(index, img);
        resolve(img);
      };

      img.onerror = reject;
    });
  };

  // Dastlabki rasmlarni yuklash (har 10-rasmdan bittasini)
  useEffect(() => {
    const loadInitialFrames = async () => {
      const step = Math.ceil(frameCount / 50); // 50 ta rasm yuklash
      const framesToLoad: number[] = [];

      // Birinchi va oxirgi rasmlarni qo'shish
      framesToLoad.push(1, frameCount);

      // Oraliq rasmlarni qo'shish
      for (let i = 1; i <= frameCount; i += step) {
        framesToLoad.push(i);
      }

      let loaded = 0;
      for (const frameIndex of framesToLoad) {
        try {
          await preloadImage(frameIndex);
          loaded++;
          setLoadProgress(Math.round((loaded / framesToLoad.length) * 100));
        } catch (error) {
          console.error(`Failed to load frame ${frameIndex}`);
        }
      }

      setIsReady(true);
    };

    loadInitialFrames();
  }, [frameCount, folderPath, fileNamePrefix]);

  useEffect(() => {
    if (!isReady || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d", {
      alpha: false, // Alpha kanalni o'chirish
      desynchronized: true // Performance uchun
    });

    if (!context) return;

    let currentFrameIndex = 1;
    let isRendering = false;

    const render = async (index: number) => {
      if (isRendering) return;
      isRendering = true;

      const frameIndex = Math.max(1, Math.min(Math.round(index), frameCount));

      // Agar rasm yuklanmagan bo'lsa, uni yuklash
      if (!imagesRef.current.has(frameIndex)) {
        try {
          await preloadImage(frameIndex);
        } catch (error) {
          isRendering = false;
          return;
        }
      }

      const img = imagesRef.current.get(frameIndex);
      if (!img || !img.complete) {
        isRendering = false;
        return;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);

      const hRatio = canvas.width / img.width;
      const vRatio = canvas.height / img.height;
      const ratio = Math.max(hRatio, vRatio);
      const centerShift_x = (canvas.width - img.width * ratio) / 2;
      const centerShift_y = (canvas.height - img.height * ratio) / 2;

      context.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        centerShift_x,
        centerShift_y,
        img.width * ratio,
        img.height * ratio
      );

      currentFrameIndex = frameIndex;

      // Keyingi va oldingi rasmlarni prefetch qilish
      const prefetchRange = 5;
      for (let i = 1; i <= prefetchRange; i++) {
        const nextIndex = frameIndex + i;
        const prevIndex = frameIndex - i;

        if (nextIndex <= frameCount && !imagesRef.current.has(nextIndex)) {
          preloadImage(nextIndex).catch(() => { });
        }
        if (prevIndex >= 1 && !imagesRef.current.has(prevIndex)) {
          preloadImage(prevIndex).catch(() => { });
        }
      }

      isRendering = false;
    };

    const frameObj = { currentFrame: 1 };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      render(frameObj.currentFrame);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Birinchi rasmni render qilish
    render(1);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=300%",
        scrub: 2, // Scrub qiymatini kamaytirdim
        pin: true,
      },
    });

    tl.to(frameObj, {
      currentFrame: frameCount,
      ease: "none",
      onUpdate: () => {
        render(frameObj.currentFrame);
      },
    });

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      imagesRef.current.clear();
    };
  }, [isReady, frameCount, folderPath, fileNamePrefix]);

  if (!isReady) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white">
        <div className="text-2xl mb-4">Loading Experience...</div>
        <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${loadProgress}%` }}
          />
        </div>
        <div className="mt-2 text-sm text-gray-400">{loadProgress}%</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-black overflow-hidden">
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h1 className="text-white text-6xl font-bold mix-blend-difference">
          Next Gen Animation
        </h1>
      </div>
    </div>
  );
};

export default ImageSequence;
