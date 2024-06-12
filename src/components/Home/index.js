import { RiContactsBook3Fill } from "react-icons/ri";
import { RiMailSendFill } from "react-icons/ri";
import { HiTemplate } from "react-icons/hi";
import React from 'react';
import '../1_MediaAssets/Styles/All.css';
import Illustration1 from '../1_MediaAssets/Home/Illustration1.png';
import Illustration2 from '../1_MediaAssets/Home/Illustration2.png';
import Cover from '../1_MediaAssets/Home/Texture2.png';
import { NavLink } from "react-router-dom";

const Home = () => {
    return (
        // backgroundImage: `url('${Cover}')`, backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundAttachment: 'fixed'
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', width: '100vw', height: '100vh', background: '#fff', color: 'black', position: 'relative', backgroundImage: `url('${Cover}')`, backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundAttachment: 'fixed'}}>
            
            <h1><span>Welcome to the </span><span className="fontSpecial" style={{color: '#FF3380'}}>REX Mailer!</span></h1>
            <div style={{ padding: '0px', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', flexWrap: 'wrap'}}>
                <img src={Illustration1} alt="lalaland" style={{position: 'absolute', bottom: '0', right: '0', width: '250px'}}/>
                <img src={Illustration2} alt="lalaland" style={{position: 'absolute', top: '50px', left: '0', width: '230px'}}/>

                
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
