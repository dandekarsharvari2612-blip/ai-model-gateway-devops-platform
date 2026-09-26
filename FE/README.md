# AI Enterprise Frontend (Tier 1)

Modern React Single Page Application (SPA) with Vite, Glassmorphism, Multi-User Context, and Real-time Database Comparison.

## Key Features
- **AI Chatbot Interface**: Real-time streaming response simulation, syntax-highlighted code blocks, copy actions, and quick architecture starter prompts.
- **Model Selector**: Switch dynamically between fine-tuned in-house models and external cloud foundation models with latency metrics.
- **Database Persistence & Multi-Tenant Retrieval**: Full conversation histories and sessions retrieved directly from Azure Database for PostgreSQL. Switch team accounts to inspect isolated or shared histories.
- **Database Comparison Engine**: Dedicated UI to compare new incoming prompt data against historical database records and prevent duplication.
- **3-Tier & AKS Telemetry View**: Live health probes, cluster topology, and pod metrics.

## Development Setup
```bash
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` and proxy API requests to `http://localhost:8000`.

## Production Build
```bash
npm run build
```
