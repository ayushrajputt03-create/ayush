import { MouseEvent, useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverLinks from "./HoverLinks";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import "./styles/Navbar.css";

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);
export let smoother: ScrollSmoother;

const scrollToSection = (section: string | null) => {
  if (!section) return;
  requestAnimationFrame(() => {
    if (smoother) {
      smoother.scrollTo(section, true, "top top");
    } else {
      document.querySelector(section)?.scrollIntoView({ behavior: "smooth" });
    }
  });
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isCompactView =
      ScrollTrigger.isTouch || window.matchMedia("(max-width: 899px)").matches;

    smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: prefersReducedMotion ? 0 : isCompactView ? 0.55 : 1.15,
      speed: isCompactView ? 1 : 1.08,
      effects: !isCompactView && !prefersReducedMotion,
      autoResize: true,
      ignoreMobileResize: true,
    });

    smoother.scrollTop(0);
    smoother.paused(true);

    const handleHashChange = () => {
      scrollToSection(window.location.hash);
    };

    let resizeFrame = 0;

    const handleResize = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        ScrollSmoother.refresh(true);
        if (window.location.hash) {
          scrollToSection(window.location.hash);
        }
      });
    };

    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("resize", handleResize);

    if (window.location.hash) {
      setTimeout(() => scrollToSection(window.location.hash), 300);
    }

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(resizeFrame);
      smoother.kill();
    };
  }, []);

  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const section = e.currentTarget.getAttribute("href");
    if (section) {
      setIsMenuOpen(false);
      history.pushState(null, "", section);
      scrollToSection(section);
    }
  };

  return (
    <>
      <div className="header">
        <a href="/#" className="navbar-title" data-cursor="disable">
          AYUSH
        </a>
        <a
          href="mailto:ayushrajputt03@gmail.com"
          className="navbar-connect"
          data-cursor="disable"
        >
          ayushrajputt03@gmail.com
        </a>
        <button
          className={`navbar-toggle ${isMenuOpen ? "navbar-toggle-open" : ""}`}
          type="button"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((value) => !value)}
          data-cursor="disable"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <ul className={isMenuOpen ? "navbar-menu-open" : ""}>
          <li>
            <a href="#about" onClick={handleNavClick}>
              <HoverLinks text="ABOUT" />
            </a>
          </li>
          <li>
            <a href="#work" onClick={handleNavClick}>
              <HoverLinks text="WORK" />
            </a>
          </li>
          <li>
            <a href="#contact" onClick={handleNavClick}>
              <HoverLinks text="CONTACT" />
            </a>
          </li>
        </ul>
      </div>

      <div className="landing-circle1"></div>
      <div className="landing-circle2"></div>
      <div className="nav-fade"></div>
    </>
  );
};

export default Navbar;
