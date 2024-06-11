import React from 'react';
import '../1_MediaAssets/Styles/All.css';
import EmailEditor from '../EmailEditor/index.js';

const Home = () => {
    return (
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', minHeight: '100vh', background: 'black', color: 'white'}}>
            <div style={{width: '80vw', background: 'white', padding: '20px', borderRadius: '10px'}}>
                <h1>Welcome to the Email Marketing App</h1>
                <EmailEditor />
            </div>
        </div>
    );
};

export default Home;
