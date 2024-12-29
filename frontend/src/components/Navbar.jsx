import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Howl } from "howler"; // Import Howler.js
import "../styles/Navbar.css";

const Navbar = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Create a Howl instance for the navigation sound
  const navSound = new Howl({
    src: ["/nav.wav"], // Path to the sound file
    volume: 0.3, // Set volume
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Set breakpoint for mobile
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize); // Cleanup on unmount
    };
  }, []);

  const handleNavigation = (index) => {
    setActiveIndex(index);
    setMenuOpen(false); // Close the menu after clicking a link
    navSound.play(); // Play the navigation sound
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev); // Toggle menu visibility
  };

  return (
    <div className="nav">
      <div className="navLogo">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Service_mark.svg"
          alt="logo"
          height="80px"
          width="auto"
        />
      </div>
      {isMobile ? (
        // Mobile View: Hamburger Menu
        <div className="burgerMenu">
          <div className="burgerIcon" onClick={toggleMenu}>
            <div className="bar" />
            <div className="bar" />
            <div className="bar" />
          </div>
          {menuOpen && (
            <div className="dropdownMenu">
              {["Home 🏠", "Follow-up Visit 🩺", "AI Second Opinion"].map(
                (label, index) => (
                  <Link
                    to={
                      index === 0
                        ? "/"
                        : index === 1
                        ? "/follow-up"
                        : "/ai-second-opinion"
                    }
                    key={index}
                    className={`mobileNavItem ${
                      activeIndex === index ? "active" : ""
                    }`}
                    onClick={() => handleNavigation(index)}
                  >
                    {label}
                  </Link>
                )
              )}
            </div>
          )}
        </div>
      ) : (
        // Desktop View: Standard Navbar
        <div className="navItemContainer">
          {["Home 🏠", "Follow-up Visit 🩺", "AI Second Opinion"].map(
            (label, index) => (
              <Link
                to={
                  index === 0
                    ? "/"
                    : index === 1
                    ? "/follow-up"
                    : "/ai-second-opinion"
                }
                key={index}
                className={`navItem ${activeIndex === index ? "active" : ""}`}
                onClick={() => handleNavigation(index)}
              >
                {label}
              </Link>
            )
          )}
          <div
            className="navItemActiveContainer"
            style={{ transform: `translateX(${activeIndex * 200}px)` }}
          >
            <div className="navItemActive">
              <div className="navItemActiveLeft"></div>
              <div className="navItemActiveCenter"></div>
              <div className="navItemActiveRight"></div>
            </div>
            <div className="navItemActive">
              <div className="navItemActiveCopyLeft"></div>
              <div className="navItemActiveCopyCenter"></div>
              <div className="navItemActiveCopyRight"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;




