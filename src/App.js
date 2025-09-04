import './App.css'; // Used for styling login page 

import WeatherWidget from './components/WeatherWidget';
import NewsWidget from './components/NewsWidget';

import supabase from './supabaseClient';

import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

function DashboardComponent() {
  return (
    <div className="DashboardComponent">
      <h2>Weather Information</h2>
      <WeatherWidget />

      {/* Testing Purpose Only: Logout Button */}
      <button onClick={() => supabase.auth.signOut()}
      style={{ marginTop: '20px', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
      >
      Logout
      </button>

      <h2 style={{ marginTop: '40px' }}>News Information</h2>
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

      if (session) {  // Directs to dashboard if session exists
        navigate('/dashboard');
      }
    }).finally(() => {
      setLoading(false);    // End loading check
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
        session ? (   // No session -> show nothing : Session -> Dashboard
          <DashboardComponent session={session}/>
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
