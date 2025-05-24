import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';

function App() {
    return (
      <Router>
        <div className="App">
            {/* <Navbar /> */}
          <div className="content">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/home" element={<Home />} />
            </Routes>
          </div>
        </div>
      </Router>
    );
/*
    return (
        <div>
            <Login />
        </div>
    )*/
}

export default App;