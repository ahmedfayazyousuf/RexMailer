import React from 'react';
import '../1_MediaAssets/Styles/All.css';
// import EmailEditor from '../EmailEditor/index.js';
import Cover from '../1_MediaAssets/Home/Texture.png';

const SendEmails = () => {
    return (
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', height: '100%', background: 'white', color: 'black', paddingTop: '50px', backgroundImage: `url('${Cover}')`, backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover'}}>
            <div style={{width: '80vw', background: 'white', padding: '20px', borderRadius: '10px'}}>
            <h1 style={{color: 'black'}}>Welcome to REX Mailer!</h1>
                {/* <EmailEditor /> */}
            </div>
        </div>
    );
};

export default SendEmails;
