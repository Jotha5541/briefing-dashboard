import { useState, useEffect } from 'react';
import { DateTime } from 'luxon';


function Clock({ timezone, timeFormat}) {
    const formatString = timeFormat === '12h' ? "hh:mm:ss" : "HH:mm:ss";
    const zone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

    const [currentTime, setCurrentTime] = useState(DateTime.now().setZone(timezone).toFormat(formatString));

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(DateTime.now().setZone(timezone).toFormat(formatString));
        }, 1000);

        return () => clearInterval(interval);
    }, [zone, formatString]);

    return (
        <div className="font-mono text-lg">
            {currentTime} ({zone}, {timeFormat || '12h'})
        </div>
    );
}

export default Clock;