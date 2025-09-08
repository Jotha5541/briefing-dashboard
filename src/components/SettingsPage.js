import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import { supabase } from './supabaseClient';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);


/* TESTING WEATHER SETTINGS ONLY */
function SettingsPage() {
    const [settings, setSettings] = useState({ weather: { city: '' } });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const response = await axios.get('/api/userSettings', {
                    headers: { Authorization: `Bearer ${session.access_token}` }
                });
                setSettings(response.data);
            }

            setLoading(false);
        };

        fetchSettings();
    }, []);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSettings((prev) => ({
            ...prev,
            weather: {
                ...prev.weather,
                [name]: value
            }
        }));
    }
    // // Save settings to Supabase
    // const handleSave = async () => {
    //     const { data: { session } } = await supabase.auth.getSession();
    //     if (session) {
    //         await axios.put('api/userSettings', settings, {
    //             headers: { Authorization: `Bearer ${session.access_token}` }
    //         });
    //         alert('Settings saved!');
    //     }
    // };

    if (loading) {
        return <div>Loading Settings...</div>;
    }

    return (
        <div>
            <h1>User Settings</h1>
            <section>
                <h2> Weather </h2>
                <label>
                    City:
                    <input
                        type="text"
                        value={settings.weather?.city || ''}
                        onChange={handleInputChange}
                    />
                </label>
            </section>

            {/* Add more settings sections here */}
        </div>
    );
}

export default SettingsPage;