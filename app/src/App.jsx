import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import PetMgm from './components/PetMgm';
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
              <Route path="/petmgm" element={<PetMgm />} />
            </Routes>
          </div>
        </div>
      </Router>
    );

}

export default App;