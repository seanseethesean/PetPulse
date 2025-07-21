import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Home from './pages/Home';
import PetMgm from './pages/PetMgm';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import TaskChecklist from './pages/TaskChecklist';
import ExpenseTracker from './pages/ExpenseTracker';
import Journal from './pages/PetJournal';
import SocialPage from './pages/SocialPage';
import Spinner from './components/Spinner';
import { LoadingProvider, useLoading } from './components/LoadingContext';
import NearbyServices from './pages/NearbyServices';

function RouteChangeHandler() {
  const location = useLocation();
  const { setLoading } = useLoading();

  useEffect(() => {
    const pingBackend = async () => {
      setLoading(true);
      try {
        await fetch(`${process.env.REACT_APP_API_URL}/ping`, { method: "GET" });
      } catch (err) {
        console.error("Ping failed:", err);
      } finally {
        setLoading(false);
      }
    };

    pingBackend();
  }, [location.pathname]);

  return null;
}

function AppRoutes() {
  const { loading } = useLoading();

  return (
    <>
      {loading && <Spinner />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/task-checklist" element={<TaskChecklist />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/social-page" element={<SocialPage />} />
        <Route path="/expense-tracker" element={<ExpenseTracker />} />
        <Route path="/petmgm" element={<PetMgm />} />
        <Route path="/nearby-services" element={<NearbyServices />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <LoadingProvider>
      <Router>
        <RouteChangeHandler />
        <div className="App">
          <div className="content">
            <AppRoutes />
          </div>
        </div>
      </Router>
    </LoadingProvider>
  );
}

export default App;