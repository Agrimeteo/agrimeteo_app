import { Request, Response } from 'express';

export const getWeather = async (_req: Request, res: Response) => {
    try {
        // Mock weather data for Cameroon - in production, integrate with weather API
        const weather = {
            temperature: 28,
            humidity: 65,
            condition: 'Partly cloudy',
            location: 'Yaoundé, Cameroon',
            forecast: [
                { day: 'Today', temp: 28, condition: 'Partly cloudy' },
                { day: 'Tomorrow', temp: 30, condition: 'Sunny' },
                { day: 'Day after', temp: 27, condition: 'Light rain' }
            ]
        };
        res.json({ success: true, data: weather });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
};

export const getWeatherAlerts = async (_req: Request, res: Response) => {
    try {
        // Mock alerts for Cameroon - in production, integrate with weather API
        const alerts = [
            {
                description: 'Light rain expected tomorrow. Ideal for organic fertilizer application.',
                date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }
        ];
        res.json({ success: true, data: alerts });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
};
