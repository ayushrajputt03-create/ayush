import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverLinks from "./HoverLinks";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap-trial/ScrollSmoother";
import "./styles/Navbar.css";

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);
export let smoother: ScrollSmoother;

const Navbar = () => {
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

    const scrollToSection = (section: string | null) => {
      if (!section) return;
      requestAnimationFrame(() => {
        ScrollTrigger.refresh(true);
        smoother.scrollTo(section, true, "top top");
      });
    };

    const handleNavClick = (e: Event) => {
      e.preventDefault();
      const link = e.currentTarget as HTMLAnchorElement;
      const section = link.getAttribute("data-href");
      if (section) {
        history.pushState(null, "", section);
        scrollToSection(section);
      }
    };

    const handleHashChange = () => {
      scrollToSection(window.location.hash);
    };

    const handleResize = () => {
      ScrollSmoother.refresh(true);
      scrollToSection(window.location.hash);
    };

    const links = document.querySelectorAll(".header ul a");
    links.forEach((elem) => {
      elem.addEventListener("click", handleNavClick);
    });
    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("resize", handleResize);

    if (window.location.hash) {
      setTimeout(() => scrollToSection(window.location.hash), 300);
    }

    return () => {
      links.forEach((elem) => {
        elem.removeEventListener("click", handleNavClick);
      });
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("resize", handleResize);
      smoother.kill();
    };
  }, []);
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
        <ul>
          <li>
            <a data-href="#about" href="#about">
              <HoverLinks text="ABOUT" />
            </a>
          </li>
          <li>
            <a data-href="#work" href="#work">
              <HoverLinks text="WORK" />
            </a>
          </li>
          <li>
            <a data-href="#contact" href="#contact">
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
