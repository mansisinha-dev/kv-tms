import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import AdminConsole from './components/AdminConsole';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import TraineePortal from './components/TraineePortal';
import TrainerConsole from './components/TrainerConsole';
import ProductionUnit from './components/ProductionUnit';
import DualWarehouse from './components/DualWarehouse';
import SalesPOS from './components/SalesPOS';
import AIForecasting from './components/AIForecasting';
import QualityDefectCenter from './components/QualityDefectCenter';
import FeedbackCertificationHub from './components/FeedbackCertificationHub';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export default function App() {
  // Page View state: 'home' | 'login' | 'portal'
  const urlParams = new URLSearchParams(window.location.search);
  const paramView = urlParams.get('view');
  const paramTab = urlParams.get('tab');
  const paramRole = urlParams.get('role');

  const [view, setView] = useState(paramView || 'home');
  const [currentUser, setCurrentUser] = useState(() => {
    if (paramRole === 'trainer') {
      return {
        fullName: "Prof. S Sinha",
        name: "Prof. S Sinha",
        username: "KISS-FAC-002",
        collegeId: "KISS-FAC-002",
        role: "ROLE_TRAINER",
        email: "kiss-fac-002@kiss.ac.in",
        token: "demo_jwt_token"
      };
    }
    if (paramRole === 'trainee') {
      return {
        fullName: "Bikash Soren",
        name: "Bikash Soren",
        username: "KISS-TRN-2026-003",
        collegeId: "KISS-TRN-2026-003",
        role: "ROLE_TRAINEE",
        email: "bikash.soren@kiss.ac.in",
        token: "demo_jwt_token"
      };
    }
    if (paramRole === 'production') {
      return {
        fullName: "Rahul Verma",
        name: "Rahul Verma",
        username: "KISS-PRD-002",
        collegeId: "KISS-PRD-002",
        role: "ROLE_PRODUCTION_MANAGER",
        email: "kiss-prd-002@kiss.ac.in",
        token: "demo_jwt_token"
      };
    }
    const saved = localStorage.getItem('kvtms_user');
    if (saved && !paramRole) {
      try { return JSON.parse(saved); } catch(e){}
    }
    if (paramView === 'portal') {
      return {
        fullName: "Mansi Sinha",
        name: "Mansi Sinha",
        username: "admin_mansi",
        collegeId: "KISS-ADM-001",
        role: "ROLE_ADMIN",
        email: "admin.testing@kiss.ac.in",
        token: "demo_jwt_token"
      };
    }
    return null;
  });
  const [activeTab, setActiveTab] = useState(paramTab || 'admin');
  const [backendStatus, setBackendStatus] = useState('online');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (paramTab) {
      setActiveTab(paramTab);
    }
    if (paramRole) return;
    const savedToken = localStorage.getItem('kvtms_token');
    const savedUser = localStorage.getItem('kvtms_user');
    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        setView('portal');
        if (!paramTab) {
          const role = (parsed.role || '').toUpperCase();
          if (role.includes('TRAINEE')) setActiveTab('trainee');
          else if (role.includes('TRAINER') || role.includes('FAC')) setActiveTab('trainer-profile');
          else if (role.includes('PRODUCTION') || role.includes('PRD')) setActiveTab('production');
          else setActiveTab('admin');
        }

        // Dynamically sync profile from backend to ensure real display name (e.g. Mr. Sharma) is up to date
        const cid = parsed.collegeId || parsed.username;
        if (cid) {
          axios.get(`${API_BASE_URL}/auth/profile/${cid}`)
            .then(res => {
              if (res.data && res.data.fullName) {
                setCurrentUser(prev => {
                  const updated = {
                    ...(prev || parsed),
                    fullName: res.data.fullName,
                    name: res.data.fullName,
                    email: res.data.email || prev?.email,
                    contactNumber: res.data.contactNumber || prev?.contactNumber,
                    trade: res.data.trade || prev?.trade
                  };
                  localStorage.setItem('kvtms_user', JSON.stringify(updated));
                  return updated;
                });
              }
            })
            .catch(() => {});
        }
      } catch (e) {}
    }

    axios.get(`${API_BASE_URL}/reports/executive-dashboard`)
        .then(() => setBackendStatus('online'))
        .catch(() => setBackendStatus('offline'));
  }, []);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('kvtms_token', userData.token);
    localStorage.setItem('kvtms_user', JSON.stringify(userData));
    setView('portal');

    // Default tab based on role (flexible matching)
    const role = (userData.role || '').toUpperCase();
    if (role.includes('TRAINEE')) {
      setActiveTab('trainee-profile');
    } else if (role.includes('TRAINER') || role.includes('FAC')) {
      setActiveTab('trainer-profile');
    } else if (role.includes('PRODUCTION') || role.includes('PRD')) {
      setActiveTab('production');
    } else {
      setActiveTab('admin');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kvtms_token');
    localStorage.removeItem('kvtms_user');
    setCurrentUser(null);
    setView('login');
    setActiveTab('admin');
    setSidebarOpen(false);
  };

  // 1. PUBLIC HOME PAGE
  if (view === 'home') {
    return (
      <HomePage
        currentUser={currentUser}
        onGoToLogin={() => setView('login')}
        onGoToPortal={() => setView('portal')}
        onLogout={handleLogout}
      />
    );
  }

  // 2. AUTHENTICATION LOGIN / REGISTER PAGE
  if (view === 'login') {
    return (
        <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onBackToHome={() => setView('home')}
        />
    );
  }

  // 3. ROLE-BASED AUTHENTICATED PORTAL (WITH INDEPENDENT CONTENT SCROLL & FIXED SIDEBAR)
  return (
      <div className="h-screen bg-slate-100 text-slate-800 flex flex-col font-sans overflow-hidden">

        {/* Clean Header (University Branding & User Controls) */}
        <Header
            currentUser={currentUser}
            onLogout={handleLogout}
            onGoToHome={() => setView('home')}
            onToggleSidebar={() => setSidebarOpen(prev => !prev)}
            isSidebarOpen={sidebarOpen}
        />

        {/* Master Workspace: Fixed Left Sidebar + Scrollable Dynamic Content */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden relative">

          {/* Dedicated Left Sidebar Navigation */}
          <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              currentUser={currentUser}
              backendStatus={backendStatus}
              isOpen={sidebarOpen}
              setIsOpen={setSidebarOpen}
          />

          {/* Main Authorized Module Workspace with Independent Scroll */}
          <main className="flex-1 min-w-0 p-4 md:p-6 overflow-y-auto max-w-full h-full flex flex-col justify-between">
            <div className="flex-1 pb-6">
              {['admin', 'courses', 'admin-reg', 'production-reg', 'trainer-reg', 'trainee-reg', 'trainee-records', 'trainer-records', 'notice-board', 'notices', 'production-approvals'].includes(activeTab) && (
                  <AdminConsole 
                      currentUser={currentUser}
                      activeSection={activeTab === 'admin' ? 'courses' : activeTab} 
                      onNavigateSection={setActiveTab} 
                  />
              )}

              {activeTab === 'dashboard' && (
                  <ExecutiveDashboard onNavigateToForecast={() => setActiveTab('forecast')} />
              )}

              {['trainee', 'trainee-profile', 'trainee-training', 'trainee-exams', 'trainee-leaves', 'trainee-attendance', 'trainee-stipend', 'trainee-notices'].includes(activeTab) && (
                  <TraineePortal 
                      currentUser={currentUser} 
                      activeSection={activeTab === 'trainee' ? 'trainee-profile' : activeTab}
                      onNavigateSection={setActiveTab}
                  />
              )}

              {['trainer', 'trainer-profile', 'trainer-attendance', 'trainer-leaves', 'trainer-courses', 'trainer-students', 'trainer-notices'].includes(activeTab) && (
                  <TrainerConsole 
                      currentUser={currentUser} 
                      activeSection={activeTab === 'trainer' ? 'trainer-profile' : activeTab}
                      onNavigateSection={setActiveTab}
                  />
              )}

              {activeTab === 'production' && (
                  <ProductionUnit currentUser={currentUser} onNavigateTab={setActiveTab} />
              )}

              {activeTab === 'inventory' && (
                  <DualWarehouse onNavigateTab={setActiveTab} />
              )}

              {activeTab === 'sales' && (
                  <SalesPOS onNavigateTab={setActiveTab} />
              )}

              {activeTab === 'forecast' && (
                  <AIForecasting />
              )}

              {activeTab === 'qa-defects' && (
                  <QualityDefectCenter currentUser={currentUser} />
              )}

              {['feedback-hub', 'certifications-placements'].includes(activeTab) && (
                  <FeedbackCertificationHub
                      currentUser={currentUser}
                      initialMode={activeTab}
                  />
              )}
            </div>

            {/* Footer positioned at bottom of scrollable content */}
            <Footer />
          </main>
        </div>

      </div>
  );
}