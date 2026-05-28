import "./styles/Work.css";
import WorkImage from "./WorkImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const projects = [
  {
    name: "Freelance Digital Marketing",
    category: "Local Business Growth",
    tools: "Instagram, Facebook, Canva, CapCut Pro, Google Business Profile",
    image: "/images/work-digital-marketing.svg",
  },
  {
    name: "School Admission Campaigns",
    category: "Education Marketing",
    tools: "Admission creatives, parent engagement posts, branding ideas",
    image: "/images/work-school-campaign.svg",
  },
  {
    name: "Restaurant Promotion Concepts",
    category: "Food Brand Visibility",
    tools: "Local SEO, reel concepts, posters, offer-based content planning",
    image: "/images/work-restaurant-growth.svg",
  },
  {
    name: "Google Business Profile SEO",
    category: "Local SEO",
    tools: "Profile optimization, keywords, service updates, visibility ideas",
    image: "/images/work-local-seo.svg",
  },
  {
    name: "Social Media Creatives",
    category: "Content Design",
    tools: "Posters, thumbnails, campaign visuals, Canva designing",
    image: "/images/work-social-creatives.svg",
  },
  {
    name: "AI-Powered Marketing Ideas",
    category: "Strategy",
    tools: "ChatGPT, content calendars, branding concepts, lead generation",
    image: "/images/work-ai-marketing.svg",
  },
];

const Work = () => {
  useGSAP(() => {
    if (window.innerWidth < 900) {
      return;
    }

    let translateX: number = 0;

    function setTranslateX() {
      const box = document.getElementsByClassName("work-box");
      const rectLeft = document
        .querySelector(".work-container")!
        .getBoundingClientRect().left;
      const rect = box[0].getBoundingClientRect();
      const parentWidth = box[0].parentElement!.getBoundingClientRect().width;
      const padding: number =
        parseInt(window.getComputedStyle(box[0]).padding) / 2;
      translateX = rect.width * box.length - (rectLeft + parentWidth) + padding;
    }

    setTranslateX();

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".work-section",
        start: "top top",
        end: `+=${translateX}`, // Use actual scroll width
        scrub: true,
        pin: true,
        id: "work",
      },
    });

    timeline.to(".work-flex", {
      x: -translateX,
      ease: "none",
    });

    // Clean up (optional, good practice)
    return () => {
      timeline.kill();
      ScrollTrigger.getById("work")?.kill();
    };
  }, []);
  return (
    <div className="work-section" id="work">
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>
        <div className="work-flex">
          {projects.map((project, index) => (
            <div className="work-box" key={index}>
              <div className="work-info">
                <div className="work-title">
                  <h3>0{index + 1}</h3>

                  <div>
                    <h4>{project.name}</h4>
                    <p>{project.category}</p>
                  </div>
                </div>
                <h4>Tools and features</h4>
                <p>{project.tools}</p>
              </div>
              <WorkImage image={project.image} alt={project.name} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Work;
