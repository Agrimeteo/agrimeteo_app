import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mainRoutes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import morgan from 'morgan';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const rawConfiguredOrigins = [
  process.env.CORS_ORIGIN,
  process.env.CORS_ORIGINS,
]
  .filter(Boolean)
  .flatMap((value) => value!.split(','))
  .map((value) => value.trim())
  .filter(Boolean);

const defaultOrigins = ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'];
const exactAllowedOrigins = new Set(
  [...defaultOrigins, ...rawConfiguredOrigins.filter((value) => !value.startsWith('*.') && !value.startsWith('.'))],
);
const suffixAllowedOrigins = rawConfiguredOrigins
  .filter((value) => value.startsWith('*.') || value.startsWith('.'))
  .map((value) => (value.startsWith('*.') ? value.slice(1) : value));

const isOriginAllowed = (origin: string) => {
  if (exactAllowedOrigins.has(origin)) {
    return true;
  }

  return suffixAllowedOrigins.some((suffix) => {
    try {
      return new URL(origin).hostname.endsWith(suffix);
    } catch {
      return false;
    }
  });
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || isOriginAllowed(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  }),
);
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', mainRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
