import { useState } from "react";

const cards = [
  {
    className: "ktm-photocard--1",
    src: "/photocards/20251125_191850_h264.mp4",
    label: "WorldSkills Asia 2025",
    video: true,
  },
  {
    className: "ktm-photocard--2",
    src: "/photocards/photocard1.webp",
    label: "Samsung Friendship Challenge",
    video: false,
  },
  {
    className: "ktm-photocard--3",
    src: "/photocards/20260503_021843_h264.mp4",
    label: "WorldSkills Ireland 2026",
    video: true,
  },
];

export default function Photocards() {
  const [activeCard, setActiveCard] = useState<number | null>(null);

  return (
    <div className="ktm-photocards">
      {cards.map((card, index) => (
        <button
          type="button"
          className={`ktm-photocard ${card.className}${activeCard === index ? " is-active" : ""}`}
          onClick={() => setActiveCard(activeCard === index ? null : index)}
          aria-pressed={activeCard === index}
          key={card.src}
        >
          <span className="ktm-photocard-media">
            {card.video ? (
              <video src={card.src} autoPlay loop muted playsInline preload="metadata" />
            ) : (
              <img src={card.src} alt="Minhyeok Park" width="1080" height="1080" loading="lazy" decoding="async" />
            )}
          </span>
          <span className="ktm-photocard-label">{card.label}</span>
        </button>
      ))}
    </div>
  );
}
