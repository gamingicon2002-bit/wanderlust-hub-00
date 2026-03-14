import { ReactNode, useEffect, useRef, useState } from "react";

interface SlideLayoutProps {
  children: ReactNode;
}

const SlideLayout = ({ children }: SlideLayoutProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const resize = () => {
      if (!containerRef.current?.parentElement) return;
      const parent = containerRef.current.parentElement;
      const scaleX = parent.clientWidth / 1920;
      const scaleY = parent.clientHeight / 1080;
      setScale(Math.min(scaleX, scaleY));
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      <div
        ref={containerRef}
        className="absolute slide-content"
        style={{
          width: 1920,
          height: 1080,
          left: "50%",
          top: "50%",
          marginLeft: -960,
          marginTop: -540,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default SlideLayout;
