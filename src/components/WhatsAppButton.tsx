import { FaWhatsapp } from "react-icons/fa6";
import "./styles/WhatsAppButton.css";

const whatsAppUrl =
  "https://wa.me/917290810294?text=Hi%20NXT%20Eleveta%20Media%20%F0%9F%91%8B%0AI%20want%20to%20grow%20my%20business%20through%20digital%20marketing.%20Please%20share%20details.";

const WhatsAppButton = () => {
  return (
    <a
      className="whatsapp-button"
      href={whatsAppUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp with NXT Eleveta Media"
      data-cursor="disable"
    >
      <span className="whatsapp-button-icon">
        <FaWhatsapp />
      </span>
      <span className="whatsapp-button-text">Chat on WhatsApp</span>
    </a>
  );
};

export default WhatsAppButton;
