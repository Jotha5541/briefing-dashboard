import React from 'react';

import { createClient } from '@supabase/supabase-js';
import { useNavigate, Navigate } from 'react-router-dom';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase credentials');

const supabase = createClient(supabaseUrl, supabaseKey);

function HomePage() {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/login');
    }

    return (
        <div className="relative min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
            {/* Transparent Header */}
            <header className="fixed top-0 left-0 w-full flex justify-between items-center px-8 py-4 bg-black/30 backdrop-blur-md">
                <h1 className="text-2xl font-semibold tracking-wide"> Briefing Dashboard </h1>
                <button
                    onClick={handleLogin}
                    className="px-4 py-2 border border-white rounded-lg hover:bg-white hover:text-black transition-all"
                >
                    Login
                </button>
            </header>

            {/* Hero Section */}
            <main className="flex flex-col justify-center items-center h-screen text-center px-4">
                <h2 className="text-4xl font-bold mb-4">Welcome to Your Smart Dashboard</h2>
                <p className="text-lg text-gray-300 mb-6">
                Manage your Spotify, weather, and widgets in one place.
                </p>
                <button
                    onClick={handleLogin}
                    className="px-6 py-3 bg-green-500 hover:bg-green-400 rounded-lg text-black font-semibold transition-all"
                >
                    Get Started
                </button>
            </main>
        </div>
    );
}

export default HomePage;