import { useState, useEffect } from 'react';
import { DateTime } from 'luxon';

function Clock({ timeFormat}) {
    const formatString = timeFormat === '12h' ? "hh:mm:ss" : "HH:mm:ss";

    let localDate = DateTime.local();

    const [currentTime, setCurrentTime] = useState(DateTime.now().setZone(localDate.zoneName).toFormat(formatString));

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(DateTime.now().setZone(localDate.zoneName).toFormat(formatString));
        }, 999);

        return () => clearInterval(interval);
    }, [formatString]);

    return (
        <div className="font-mono text-lg">
            {currentTime} [{localDate.zoneName}, {timeFormat || '12h'}]
        </div>
    );
}

export default Clock;