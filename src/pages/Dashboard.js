import WeatherWidget from '../components/WeatherWidget';
import NewsWidget from '../components/NewsWidget';
import SpotifyWidget from '../components/SpotifyWidget';
import Clock from '../components/Clock';

import supabase from '../supabaseClient';

import axios from 'axios';
import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';

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

export default DashboardComponent;