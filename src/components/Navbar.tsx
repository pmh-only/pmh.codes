import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const links = [
  ["know", "About"],
  ["work", "Work"],
  ["projects", "Projects"],
  ["contact", "Contact"],
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const stateRef = useRef({ hasScrolled: false, previousY: 0, direction: "down", suppress: false });
  const flashTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const suppressTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    stateRef.current.previousY = window.scrollY;

    const handleScroll = () => {
      const state = stateRef.current;
      state.direction = window.scrollY >= state.previousY ? "down" : "up";
      state.previousY = window.scrollY;
      state.hasScrolled = true;
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          setActiveSection(entry.target.id);
          const state = stateRef.current;
          if (state.hasScrolled && state.direction === "down" && !state.suppress) {
            setIsFlashing(true);
            clearTimeout(flashTimer.current);
            flashTimer.current = setTimeout(() => setIsFlashing(false), 1000);
          }
        }
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 },
    );

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.querySelectorAll("section[id]").forEach((section) => observer.observe(section));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
      clearTimeout(flashTimer.current);
      clearTimeout(suppressTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const main = document.querySelector("main");
    const skipLink = document.querySelector<HTMLElement>(".skip-link");
    document.body.style.overflow = "hidden";
    if (main instanceof HTMLElement) main.inert = true;
    if (skipLink) skipLink.inert = true;
    firstLinkRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        toggleRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      if (main instanceof HTMLElement) main.inert = false;
      if (skipLink) skipLink.inert = false;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const closeFromLink = (id: string) => {
    setIsOpen(false);
    requestAnimationFrame(() => document.getElementById(id)?.focus());
    stateRef.current.suppress = true;
    clearTimeout(suppressTimer.current);
    suppressTimer.current = setTimeout(() => {
      stateRef.current.suppress = false;
    }, 1200);
  };

  const toggle = () => {
    clearTimeout(flashTimer.current);
    setIsFlashing(false);
    setIsOpen((open) => !open);
  };

  return (
    <nav className={`site-nav${isOpen ? " is-open" : ""}`} aria-label="Site navigation">
      <button ref={toggleRef} className="nav-toggle" onClick={toggle} aria-expanded={isOpen} aria-controls="nav-links" aria-label={isOpen ? "Close navigation" : "Open navigation"}>
        {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>
      <div className={`nav-overlay${isFlashing && !isOpen ? " is-flashing" : ""}`} role="dialog" aria-modal={isOpen ? "true" : undefined} aria-label="Site navigation" aria-hidden={!isOpen} inert={!isOpen}>
        <ul className="nav-links" id="nav-links" role="list">
          {links.map(([id, label], index) => (
            <li key={id}>
              <a
                ref={index === 0 ? firstLinkRef : undefined}
                href={`#${id}`}
                className={`nav-link${activeSection === id ? " is-active" : ""}`}
                aria-current={activeSection === id ? "location" : undefined}
                onClick={() => closeFromLink(id)}
              >
                {label}<span className="nav-link-index">{String(index + 1).padStart(2, "0")}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
