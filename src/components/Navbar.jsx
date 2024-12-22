import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const [activeIndex, setActiveIndex] = useState(0);

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
      <div className="navItemContainer">
        {['Home', 'Follow-up Visit', 'AI Second Opinion'].map((label, index) => (
          <div
            key={index}
            className={`navItem ${activeIndex === index ? 'active' : ''}`}
            onClick={() => setActiveIndex(index)}
          >
            <Link to={index === 0 ? '/' : index === 1 ? '/follow-up' : '/ai-second-opinion'}>
              {label}
            </Link>
          </div>
        ))}
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
      <div className="burgerMenu">
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>
    </div>
  );
};

export default Navbar;

