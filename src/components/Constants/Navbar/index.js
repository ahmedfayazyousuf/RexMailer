import './Navbar.css';
import Burger from '../../1_MediaAssets/Home/Burger.png';
import LogoWhite from '../../1_MediaAssets/Home/FullLogoWhite.png';
import { NavLink } from "react-router-dom";
import React, { useState, useEffect, useRef } from 'react';

const NavbarMain = () => {
  const [isChecked, setIsChecked] = useState(false); 
  const navRef = useRef(null); 

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsChecked(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const closeNavvy = () => {
    setIsChecked(!isChecked);
  };


  return (
    <>
      <nav ref={navRef} style={{ zIndex: '100' }}>
        <input type="checkbox" id="check" checked={isChecked} onChange={handleCheckboxChange} />

        <NavLink className="nav-link" style={{ margin: '5px 0px 0px 15px', zIndex: '2'}} to="/">
          <img src={LogoWhite} alt='LogoWhite' style={{ width: '150px', height: '30px', marginLeft: '5px', marginRight: '-20px', filter: 'brightness(-1000%)' }}></img>
        </NavLink>

        <label htmlFor="check" className="checkbtn">
          <img src={Burger} alt='Burger' className='Burger' style={{ width: '27px', height: '22px', filter: 'brightness(-1000%)' }}></img>
        </label>

        <ul>
          <li>
            <NavLink className="nav-link" onClick={closeNavvy} to="/">
              Home
            </NavLink> 
          </li>
          <li>
            <NavLink className="nav-link" onClick={closeNavvy} to="/CreateTemplate">
              Create template
            </NavLink>
          </li>
          <li>
            <NavLink className="nav-link" onClick={closeNavvy} to="/SendEmails">
              Send emails
            </NavLink>
          </li>
          <li>
            <NavLink className="nav-link" onClick={closeNavvy} to="/Contacts">
              Contacts
            </NavLink>
          </li>
        </ul>

      </nav>
    </>
  );
};

export default NavbarMain;
