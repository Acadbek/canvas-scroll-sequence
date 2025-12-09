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
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadImages = async () => {
      const loadedImages: HTMLImageElement[] = [];
      let loadedCount = 0;

      for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        const formattedIndex = i.toString().padStart(4, "0");
        img.src = `${folderPath}/${fileNamePrefix}${formattedIndex}.webp`;

        img.onload = () => {
          loadedCount++;
          if (loadedCount === frameCount) {
            setImages(loadedImages);
            setIsLoaded(true);
          }
        };
        loadedImages.push(img);
      }
    };

    loadImages();
  }, [frameCount, folderPath, fileNamePrefix]);

  useEffect(() => {
    if (!isLoaded || !canvasRef.current || !containerRef.current || images.length === 0) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    const render = (index: number) => {
      const img = images[Math.round(index)];
      if (!img) return;

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
    };

    const frameObj = { currentFrame: 0 };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      render(frameObj.currentFrame);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=300%",
        scrub: 0.5,
        pin: true,
        // markers: true,
      },
    });

    tl.to(frameObj, {
      currentFrame: frameCount - 1,
      snap: "currentFrame",
      ease: "none",
      onUpdate: () => {
        render(frameObj.currentFrame);
      },
    });

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [isLoaded, images, frameCount]);

  if (!isLoaded) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black text-white">
        Loading Assets... {Math.round((images.length / frameCount) * 100)}%
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
