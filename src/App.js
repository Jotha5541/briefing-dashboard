import './App.css'; // Used for styling login page 

import WeatherWidget from './components/WeatherWidget';

import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from './supabaseClient';

function App() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    /* Check for existing session when app first loads */
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);

      if (session) {  // Directs to dashboard if session exists
        navigate('/dashboard');
      }
    });

    /* Listen for login/logout events */
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);

      if (session) {  // Directs to dashboard on login
        navigate('/dashboard');
      }
      else {    // Directs to login on logout
        navigate('/');
      }
    });

    return () =>
      subscription.unsubscribe();
    }, [navigate]);

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
        session ? (   // No session -> show nothing : Session -> Dashboard
          <div className="App">
            <header className="App-header">
              <h1>Daily Briefing Dashboard</h1>
              <WeatherWidget />
            </header>
          </div>
        ) : null
      } />
    </Routes>


  );
}

/*
    <div className="App">
      <header className="App-header">
        <h1>Daily Briefing Dashboard</h1>
        <WeatherWidget />
      </header>
    </div>
  );
*/

export default App;
