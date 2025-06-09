import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import PetMgm from './pages/PetMgm';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import TaskChecklist from './pages/TaskChecklist';
import ExpenseTracker from './pages/ExpenseTracker';

function App() {
   return (
     <Router>
       <div className="App">
         <div className="content">
           <Routes>
             <Route path="/" element={<Login />} />
             <Route path="/login" element={<Login />} />
             <Route path="/home" element={<Home />} />
             <Route path="/forgot-password" element={<ForgotPassword />} />
             <Route path="/task-checklist" element={<TaskChecklist />} />
             {/* <Route path="/journal" element={<Journal />} />
             <Route path="/calendar" element={<Calendar />} /> */}
             <Route path="/expense-tracker" element={<ExpenseTracker />} />
             <Route path="/petmgm" element={<PetMgm />} />
            </Routes>
         </div>
       </div>
     </Router>
   );
}

export default App;