import express from 'express';
import agentsRouter from './routes/agents';

const app = express();
app.use(express.json());
app.use(agentsRouter);

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'statful-agent-runtime' });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`Statful backend listening on :${port}`);
});
