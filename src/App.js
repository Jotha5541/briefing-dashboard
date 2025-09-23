import './App.css'; // Used for styling login page 

import WeatherWidget from './components/WeatherWidget';
import NewsWidget from './components/NewsWidget';
import SpotifyWidget from './components/SpotifyWidget';
import SettingsPage from './components/SettingsPage';

import supabase from './supabaseClient';

import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

/* Note: Add Background Music with a toggle option */
/* Note: Add a Home Page for Login/Signup Info */
/* Note: Add a built-in timer widget */

function DashboardComponent() {
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
            <SpotifyWidget />
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
  const navigate = useNavigate();

  useEffect(() => {
    /* Check for existing session when app first loads */
    setLoading(true);   // Start loading check
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);

      if (session && window.location.pathname === '/') {  // Directs to dashboard if logged in
        navigate('/dashboard');
      }
    });

    /* Listen for login/logout events */
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);

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
          <DashboardComponent session={session}/>
        ) : null
      } />

      {/* Route 3: User Settings Customization ('/settings') */}
      <Route path="/settings" element={session ? <SettingsPage /> : <navigate to='/' />} />
    
    </Routes>
  );
}

export default App;
