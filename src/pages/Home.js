import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';


const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase credentials');

const supabase = createClient(supabaseUrl, supabaseKey);

function HomePage() {





    return (
        
    );
}

export default HomePage;



