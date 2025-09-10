import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);


/* TESTING WEATHER SETTINGS ONLY */
function SettingsPage() {
    const [settings, setSettings] = useState({ weather: { city: '' }, username: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                try {
                    const response = await axios.get('/api/userSettings', {
                        headers: { Authorization: `Bearer ${session.access_token}` },
                    });

                    setSettings((prev) => ({
                        ...prev,
                        ...response.data,
                        weather: {
                            ...prev.weather,
                            ...(response.data.weather || {}),
                        },
                    }));
                } catch (error) {
                    console.error('Failed to fetch settings:', error);
                }
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
            },
        }));
    };

    const handleSave = async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
            try {
                await axios.put('/api/userSettings', settings, {
                    headers: { Authorization: `Bearer $(session.access_token)`},
                });
                alert('Settings saved successfully!');
            } catch (error) {
                console.error('Error saving settings:', error);
                alert('Failed to save settings');
            }
        }
    };

    if (loading) {
        return <div>Loading Settings...</div>;
    }

    return (
        <div style={{ maxWidth: '500px', margin: '2rem auto' }}>
            <h1>User Settings</h1>

            <section style={{ marginBottom: '20px'}}>
                <h2> Weather </h2>
                <label>
                    City:{' '}
                    <input
                        type="text"
                        name="city"
                        value={settings.weather?.city || ''}
                        onChange={handleInputChange}
                    />
                </label>
            </section>

            <section style={{ marginBottom: '20px' }}>
                <h2> Profile </h2>
                <label>
                    Username:{' '}
                    <input
                        type="text"
                        value={settings.username || ''}
                        onChange={(e) => setSettings((prev) => ({ ...prev, username: e.target.value }))}
                    />
                </label>
            </section>

            <button onClick={handleSave} style={{ padding: '8px 16px', borderRadius: '6px' }}>
                Save Settings
            </button>
        </div>
    );
}

export default SettingsPage; 