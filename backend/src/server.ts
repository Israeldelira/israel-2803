import cors from 'cors';
import express from 'express';

import { apiRouter } from './routes/index.js';


const app = express();

const PORT = Number(process.env.PORT ?? 3000);
const FRONTEND_URL =
  process.env.FRONTEND_URL ?? 'http://localhost:5173';

app.disable('x-powered-by');

app.use(
  cors({
    origin: FRONTEND_URL,
  }),
);

app.use(express.json());

app.use('/api', apiRouter);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});