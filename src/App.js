import './App.css'; // Used for styling login page 

import WeatherWidget from './components/WeatherWidget';
import NewsWidget from './components/NewsWidget';
import SpotifyWidget from './components/SpotifyWidget';
import Clock from './components/Clock';

import SettingsPage from './pages/SettingsPage';
import SpotifyCallback from './pages/SpotifyCallback';

import supabase from './supabaseClient';

import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

import axios from 'axios';

/* Note: Add Background Music with a toggle option */
/* Note: Add a Home Page for Login/Signup Info */
/* Note: Add a built-in timer widget */


function DashboardComponent({ session, settings, user }) {
  return (
    <div className="DashboardComponent">
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          background: '#111',
          color: '#fff',
        }}
      >
        <h1 style={{ fontSize: '20px' }}> Briefing Dashboard </h1>
        <Clock 
          timezone={settings.timezone || 'UTC'}
          timeFormat={settings.timeFormat || '12h'}
        />

        <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link to='/settings' style={{ color: '#fff', textDecoration: 'none' }}>
            Settings
          </Link>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: '#e50914',
              color: '#fff',
              cursor: 'pointer',
            }}
            >
              Logout
            </button>
        </nav>
      </header>

      {/* Left: Weather + Right: Spotify */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginTop: '20px', marginLeft: '10px', marginRight: '10px' }}>
        {/* Weather Section */}
        <div style={{ flex: 1 }}>
          <h2> Weather Forecast </h2>
          <WeatherWidget />
        </div>

        {/* Spotify Section */}
        <div style={{ flex: 1 }}>
          <h2> Spotify </h2>
          {user ? (
            <SpotifyWidget userId={user?.id} />
          ) : (
            <div>Please log in to view Spotify data.</div>
          )}
        </div>
      </div>

      {/* News Section */}
     <h2 style={{ marginTop: '40px', marginLeft: '10px' }}> News Information </h2>
      <NewsWidget />

    </div>
  );
}


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

      if (!session) {  // Directs to dashboard on logout
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
      {/* Route 1: Login Page ('/') */}
      <Route path="/" element={
        !session ? (  // No session -> Login Form : Session -> show nothing
          <div style={{ width: '320px', margin: '50px auto' }}>
            <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} theme="dark" />
          </div>
        ) : null
      } />

      { /* Route 2: Dashboard Page ('/dashboard') */}
      <Route path="/dashboard" element={
        session ? (   // No Session -> show nothing : Session -> Dashboard
          <DashboardComponent session={session} settings={settings} user={user} />
        ) : null
      } />

      {/* Route 3: User Settings Customization ('/settings') */}
      <Route path="/settings" element={session ? <SettingsPage /> : <navigate to='/' />} />

      {/* Route 4: Spotify Callback */}
      <Route path="/spotify-callback" element={<SpotifyCallback />} />
    
    </Routes>
  );
}

export default App;
