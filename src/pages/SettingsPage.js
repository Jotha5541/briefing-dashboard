import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

function SettingsPage() {
    const [settings, setSettings] = useState({ weather: { city: '' }, username: '' });
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchSettings = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                try {
                    const response = await axios.get('/api/userSettings', {
                        headers: { Authorization: `Bearer ${session.access_token}` },
                    });

                    const saved = response.data.settings || response.data;

                    setSettings((prev) => ({
                        ...prev,
                        ...response.data,
                        weather: {
                            ...prev.weather,
                            ...(saved.weather || {}),
                        },
                        timezone: 
                            response.data.timezone || 
                            prev.timezone || 
                            Intl.DateTimeFormat().resolvedOptions().timeZone,
                        timeFormat: response.data.timeFormat || prev.timeFormat || '12h',
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

        if (name === 'timezone') {
            setSettings((prev) => ({
                ...prev,
                timezone: value,
            }));
        }
        else {
            setSettings((prev) => ({
                ...prev,
                weather: {
                    ...prev.weather,
                    [name]: value
                },
            }));
        }
    };

    const handleSave = async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
            try {
                await axios.put('/api/userSettings', settings, {
                    headers: { Authorization: `Bearer ${session.access_token}`},
                });
                alert('Settings saved successfully!');
                navigate('/dashboard');
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
                <h2> City </h2>
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

            <label className="block mb-2 font-medium"> Timezone </label>
            <select
                name="timezone"
                value={settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'}
                onChange={handleInputChange}
                className="border rounded p-2 w-full"
            >
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="America/New_York">America/New_York</option>
            </select>

            <label className="block mb-2 font-medium mt-4"> Time Format </label>
            <select
                name="timeFormat"
                value={settings.timeFormat || '12h'}
                onChange={(e) =>
                    setSettings((prev) => ({
                        ...prev,
                        timeFormat: e.target.value,
                    }))
                }
                className="border rounded p-2 w-full"
            >
                <option value="12h"> 12-hour Format </option>
                <option value="24h"> 24-hour Format </option>
            </select>
                
            <button onClick={handleSave} style={{ padding: '8px 16px', borderRadius: '6px' }}>
                Save Settings
            </button>
        </div>
    );
}

export default SettingsPage; 