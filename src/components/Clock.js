import { useState, useEffect } from 'react';
import { DateTime } from 'luxon';


function Clock({ timezone = 'UTC'}) {
    const [currentTime, setCurrentTime] = useState(DateTime.now().setZone(timezone).toFormat("HH:mm:ss"));

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(DateTime.now().setZone(timezone).toFormat("HH:mm:ss"));
        }, 1000);

        return () => clearInterval(interval);
    }, [timezone]);

    return (
        <div className="font-mono text-lg">
            {currentTime} ({timezone})
        </div>
    );
}

export default Clock;