import axios from 'axios';

export const getWeatherAlerts = async (lat: string, lng: string) => {
    const apiKey = process.env.OPENWEATHER_API_KEY!;
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
    
    const { data } = await axios.get(url);
    
    const alerts = [];
    if (data.alerts) {
        alerts.push(...data.alerts);
    }

    // Custom logic
    data.daily?.forEach((day: any) => {
        if (day.temp.max > 35) alerts.push({ type: 'extreme_heat', message: 'Chaleur extrême attendue' });
        if (day.pop > 0.7) alerts.push({ type: 'heavy_rain', message: 'Fortes pluies prévues' });
        if (day.wind_speed > 30) alerts.push({ type: 'strong_wind', message: 'Vents forts attendus' });
    });

    // Store in DB (assume supabase integration in controller)
    return alerts;
};
