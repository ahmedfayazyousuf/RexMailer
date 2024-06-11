import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// MAIN PAGES
import Home from './components/Home';
import CreateTemplate from './components/CreateTemplate';
import SendEmails from './components/SendEmails';
import Contacts from './components/Contacts';
import Navbar from './components/Constants/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* MAIN PAGES */}
        <Route exact path="/" element={<Home />} />
        <Route path="/CreateTemplate" element={<CreateTemplate />} />
        <Route path="/SendEmails" element={<SendEmails />} />
        <Route path="/Contacts" element={<Contacts />} />
      </Routes>
    </Router>
  );
}

export default App;
