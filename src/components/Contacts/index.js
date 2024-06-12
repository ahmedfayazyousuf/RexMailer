import React from 'react';
import '../1_MediaAssets/Styles/All.css';
import Cover from '../1_MediaAssets/Home/Texture2.png';

const Contacts = () => {
    return (
        // backgroundImage: `url('${Cover}')`, backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundAttachment: 'fixed'
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', width: '100vw', height: '100vh', background: '#fff', color: 'black', position: 'relative', backgroundImage: `url('${Cover}')`, backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundAttachment: 'fixed'}}>
            
            <h1><span className="fontSpecial" style={{color: '#FF3380'}}>Contacts</span></h1>

        </div>
    );
};

export default Contacts;
