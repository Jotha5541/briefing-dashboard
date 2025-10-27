import './App.css'; // Used for styling login page 

import DashboardComponent from './pages/Dashboard';
import SettingsMenu from './pages/SettingsMenu';
import SpotifyCallback from './pages/SpotifyCallback';
import HomePage from './pages/Home';

import supabase from './supabaseClient';

import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

import axios from 'axios';

/* Note: Add a Home Page for Login/Signup Info */
/* Note: Add a built-in timer widget */
/* Change User Settings as drop-down menu instead of separate page */

function App() {
  const [ session, setSession ] = useState(null);
  const [ loading, setLoading ] = useState(true);
  const [ settings, setSettings ] = useState({
    timezone: 'UTC',
    timeFormat: '12h',
  });
  const [ user, setUser ] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    /* Check for existing session when app first loads */
    setLoading(true);   // Start loading check
    
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);

      if (session) {
        try {
          const response = await axios.get('/api/userSettings', {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });

          const saved = response.data.settings || response.data;
          setSettings((prev) => ({
            ...prev,
            ...saved,
            timezone: saved.timezone || prev.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            timeFormat: saved.timeFormat || prev.timeFormat || '12h',
          }));
        } catch (error) {
          console.error('Failed to fetch settings:', error);
        }
      }

      if (session && window.location.pathname === '/') {  // Directs to dashboard if logged in
        navigate('/dashboard');
      }
    });

    /* Listen for login/logout events */
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);

      if (!session) {  // Directs to Home on logout
        navigate('/');
      }
      else if (window.location.pathname === '/'){    // Auto redirect to dashboard on login
        navigate('/dashboard');
      }
    });

    return () => 
      subscription.unsubscribe();
  }, [navigate]);

    
    if (loading) {
      return <div>Loading . . . </div>;
    }

  return (
    <Routes>
      {/* Route 1: Home Page ('/') */}
      <Route path='/' element={<HomePage />} />

      {/* Route 2: Login Page ('/login') */}
      <Route path='/login' element={
        !session ? (
          <div style={{ width: '320px', margin: '50px auto' }}>
            <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} theme="dark" />
          </div>
        ) : (<Navigate to='/dashboard' />)
      } />

      { /* Route 3: Dashboard Page ('/dashboard') */}
      <Route path="/dashboard" element={
        session ? (   // No Session -> show nothing : Session -> Dashboard
          <DashboardComponent session={session} settings={settings} user={user} />
        ) : (<Navigate to='/' />)
      } />

      {/* Route 4: User Settings Customization ('/settings') */}
      <Route path="/settings" element={session ? <SettingsMenu/> : <Navigate to='/' />} />

      {/* Route 5: Spotify Callback */}
      <Route path="/spotify-callback" element={<SpotifyCallback />} />
    
    </Routes>
  );
}

export default App;
