import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// MAIN PAGES
import Home from './components/Home';
import EmailEditor from './components/EmailEditor';
import Navbar from './components/Constants/Navbar'

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* MAIN PAGES */}
        <Route exact path="/" element={<Home />} />
        <Route path="/EmailEditor" component={EmailEditor} />
      </Routes>
    </Router>
  );
}

export default App;
