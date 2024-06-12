import { RiContactsBook3Fill } from "react-icons/ri";
import { RiMailSendFill } from "react-icons/ri";
import { HiTemplate } from "react-icons/hi";
import React from 'react';
import '../1_MediaAssets/Styles/All.css';
import Illustration1 from '../1_MediaAssets/Home/Illustration1.png';
import Illustration2 from '../1_MediaAssets/Home/Illustration2.png';
import { NavLink } from "react-router-dom";

const Home = () => {
    return (
        <div className="MainDiv" style={{height: '100vh'}}>
            
            <h2 style={{textAlign: 'center'}}><span>Welcome to the </span><span style={{color: '#FF3380', fontWeight: '900'}}>REX Mailer!</span></h2>
            <div style={{ padding: '0px', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', flexWrap: 'wrap', margin: '0px 10px 0px 10px'}}>
                <img className="DPhider" src={Illustration1} alt="lalaland" style={{position: 'absolute', bottom: '0', right: '0', width: '250px'}}/>
                <img className="DPhider" src={Illustration2} alt="lalaland" style={{position: 'absolute', top: '50px', left: '0', width: '230px'}}/>

                
                <NavLink to="/CreateTemplate" style={{textDecoration: 'none'}}>
                    <div className="MenuItem">
                        <HiTemplate style={{fontSize: '33px'}}/>
                        <p style={{padding: '0', margin: '0'}}>Create Template</p>
                    </div>
                </NavLink>

                <NavLink to="/SendEmails" style={{textDecoration: 'none'}}>
                    <div className="MenuItem">
                        <RiMailSendFill style={{fontSize: '30px'}}/>
                        <p style={{padding: '0', margin: '0'}}>Send Emails</p>
                    </div>
                </NavLink>

                <NavLink to="/Contacts" style={{textDecoration: 'none'}}>
                    <div className="MenuItem">
                        <RiContactsBook3Fill style={{fontSize: '30px'}}/>
                        <p style={{padding: '0', margin: '0'}}>Contacts</p>
                    </div>
                </NavLink>

            </div>
        </div>
    );
};

export default Home;
