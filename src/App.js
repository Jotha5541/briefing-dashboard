import './App.css'; // Used for styling login page 

import HomePage from './pages/Home';
import DashboardComponent from './pages/Dashboard';
import SettingsMenu from './pages/SettingsMenu';
import SpotifyCallback from './pages/SpotifyCallback';

import supabase from './supabaseClient';

import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import axios from 'axios';

/* Note: Add a built-in timer widget */
/* Change User Settings as drop-down menu instead of separate page */

function App() {
  const [ session, setSession ] = useState(null);
  const [ loading, setLoading ] = useState(true);
  const [ settings, setSettings ] = useState({ timeFormat: '12h' });
  const [ user, setUser ] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  /* Helper Function */
  const fetchUserSettings = useCallback(async(currentSession) => {
    try {
      const response = await axios.get('/api/userSettings', {
        headers: { Authorization: `Bearer ${currentSession.access_token}` },
      });

      const saved = response.data.settings || response.data;
      setSettings((prev) => ({
        ...prev,
        ...saved,
        timeFormat: saved.timeFormat || prev.timeFormat || '12h',
      }));
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  }, []);

  useEffect(() => {
    setLoading(true);   // Start loading check
      
    /* Check for Session */
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);

      // Redirects to Dashboard if user is on Home or Login
      if (session && (location.pathname === '/' || location.pathname === '/login')) {
        navigate('/dashboard');
      }
      
      // Fetch for settings if currently logged in
      if (session) fetchUserSettings(session)
      
      setLoading(false);
    });

    /* Listen for login/logout events */
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);

      // Navigate to Dashboard page after logging in
      if (session) {
        if (window.location.pathname === '/' || window.location.pathname === '/login') {
          navigate('/dashboard');
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [navigate, fetchUserSettings, location.pathname]);


  if (loading) {
    return <div className="flex h-screen items-center justify-center text-white bg-gray-900">Loading...</div>;
  }

  return (
    <Routes>
      {/* Route 1: Home Page ('/') */}
      <Route path='/' element={<HomePage />} />

      {/* Route 2: Login Page ('/login') */}
      <Route path='/login' element={
        !session ? (
          <div style={{ width: '320px', margin: '50px auto' }}>
            <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} theme="dark" providers={['google', 'github', 'spotify']} />
          </div>
        ) : (<Navigate to='/dashboard' />)
      } />

      { /* Route 3: Dashboard Page ('/dashboard') */}
      <Route path="/dashboard" element={
        session ? (   // No Session -> show nothing : Session -> Dashboard
          <DashboardComponent settings={settings} user={user} />
        ) : (<Navigate to='/' />)
      } />

      {/* Route 4: User Settings Customization ('/settings') */}
      <Route path="/settings" element={session ? (
        <SettingsMenu session={session} settings={settings} setSettings={setSettings} /> ) : <Navigate to='/' />} />
      {/* Route 5: Spotify Callback */}
      <Route path="/spotify-callback" element={<SpotifyCallback />} />
    
    </Routes>
  );
}

export default App;
