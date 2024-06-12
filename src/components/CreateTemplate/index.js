import React from 'react';
import '../1_MediaAssets/Styles/All.css';
import EmailEditor from './EmailEditor/index.js';

const CreateTemplate = () => {
    return (
        <div className='MainDiv' style={{padding: '70px 0px'}}>
            
            <h2 style={{textAlign: 'center', margin: '0'}}><span>Create an </span><span style={{color: '#FF3380', fontWeight: '900'}}>Email Template</span></h2>
            
            <div className='EditorDiv'>
                <EmailEditor />
            </div>
        </div>
    );
};

export default CreateTemplate;
