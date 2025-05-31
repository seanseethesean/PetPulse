import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import PetMgm from './pages/PetMgm';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import TaskChecklist from './pages/TaskChecklist';

function App() {
    return (
      <Router>
        <div className="App">
            {/* <Navbar /> */}
          <div className="content">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/home" element={<Home />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/petmgm" element={<PetMgm />} />
             </Routes>
          </div>
        </div>
      </Router>
    );

}

export default App;