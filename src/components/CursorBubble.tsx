import { useEffect, useRef } from "react";

export default function CursorBubble() {
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bubble = bubbleRef.current;
    if (!bubble) return;

    let mouseX = 0;
    let mouseY = 0;
    let bubbleX = 0;
    let bubbleY = 0;
    let animationFrame: number | undefined;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      bubble.classList.remove("is-hidden");
      animationFrame ??= requestAnimationFrame(animate);
    };
    const handleMouseLeave = () => bubble.classList.add("is-hidden");
    const animate = () => {
      bubbleX += (mouseX - bubbleX) * 0.08;
      bubbleY += (mouseY - bubbleY) * 0.08;
      bubble.style.transform = `translate3d(${bubbleX}px, ${bubbleY}px, 0) translate(-50%, -50%)`;

      if (Math.abs(mouseX - bubbleX) > 0.1 || Math.abs(mouseY - bubbleY) > 0.1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        animationFrame = undefined;
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <div ref={bubbleRef} className="cursor-bubble is-hidden" aria-hidden="true" />;
}
