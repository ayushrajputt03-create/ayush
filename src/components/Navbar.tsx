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
    ScrollTrigger.refresh(true);
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
    smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.7,
      speed: 1.7,
      effects: true,
      autoResize: true,
      ignoreMobileResize: true,
    });

    smoother.scrollTop(0);
    smoother.paused(true);

    const handleHashChange = () => {
      scrollToSection(window.location.hash);
    };

    const handleResize = () => {
      ScrollSmoother.refresh(true);
      scrollToSection(window.location.hash);
    };

    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("resize", handleResize);

    if (window.location.hash) {
      setTimeout(() => scrollToSection(window.location.hash), 300);
    }

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("resize", handleResize);
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
