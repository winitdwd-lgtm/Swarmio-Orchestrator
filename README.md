<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Nginx-Reverse_Proxy-009639?style=for-the-badge&logo=nginx&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Three.js-WebGL-000000?style=for-the-badge&logo=threedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
</p>

<h1 align="center">🐝 Swarmio Orchestrator</h1>

<p align="center">
  <strong>A Distributed AI Microservice Gateway & Real-Time Telemetry Engine</strong>
  <br />
  <em>Created by Vineet M Dharwad ™</em>
</p>

<p align="center">
  Swarmio Orchestrator is a production-grade, distributed AI inference gateway that intelligently routes workloads to specialized Dockerized worker drones. It features API key authentication, Redis-powered rate limiting, PostgreSQL audit logging, Nginx load balancing, and a stunning WebGL-powered 3D telemetry dashboard — all orchestrated through Docker Compose.
</p>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Features](#-features)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Configuration](#environment-configuration)
  - [Production Deployment](#-production-deployment)
  - [Local Development](#-local-development-frontend)
- [API Reference](#-api-reference)
- [Frontend Dashboard](#-frontend-dashboard)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Security](#-security)
- [License](#-license)

---

## 🔭 Overview

Modern AI systems require more than a single monolithic server. **Swarmio Orchestrator** solves this by implementing a **microservice swarm architecture** where:

1. A central **Gateway Router** receives all incoming API requests.
2. The gateway authenticates, rate-limits, and audits every request.
3. Based on the task type, the gateway **intelligently routes** the payload to the correct **specialized worker drone**.
4. Each drone is an isolated Docker container running its own AI/ML model.
5. An **Nginx reverse proxy** load-balances traffic across multiple gateway replicas.
6. A **real-time 3D telemetry dashboard** lets operators visualize network health, throughput, latency, and audit logs.

This is not a toy project — it is a fully containerized, multi-service distributed system with enterprise-grade security, observability, and horizontal scaling.

---

## 🏗️ System Architecture

```
                         ┌──────────────────────────────────┐
                         │        CLIENT / BROWSER          │
                         │  (Frontend Dashboard / API Call)  │
                         └────────────────┬─────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────┐
                              │   NGINX LOAD BALANCER  │
                              │       (Port 80)        │
                              │  ┌─ Timeout Hardening  │
                              │  └─ Reverse Proxy      │
                              └───────────┬───────────┘
                                          │
                        ┌─────────────────┼─────────────────┐
                        ▼                 ▼                 ▼
               ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
               │ Gateway Router │ │ Gateway Router │ │ Gateway Router │
               │  (Replica 1)   │ │  (Replica 2)   │ │  (Replica 3)   │
               │   Port 8000    │ │   Port 8000    │ │   Port 8000    │
               └───┬────────┬──┘ └───┬────────┬──┘ └───┬────────┬──┘
                   │        │        │        │        │        │
          ┌────────┘        └────────┼────────┘        └────────┘
          ▼                          ▼
 ┌─────────────────┐       ┌─────────────────┐
 │  TEXT WORKER     │       │  MATH WORKER    │
 │  (NLP Drone)     │       │  (Compute Drone) │
 │  Port 8001       │       │  Port 8002       │
 │  ┌─ TextBlob     │       │  ┌─ Sorting      │
 │  └─ Sentiment    │       │  ├─ Aggregation   │
 │     Analysis     │       │  └─ Optimization  │
 └─────────────────┘       └─────────────────┘

          ┌─────────────────┐       ┌─────────────────┐
          │   REDIS CACHE    │       │   POSTGRESQL DB  │
          │   (Port 6379)    │       │   (Port 5432)    │
          │  ┌─ Rate Limiting│       │  ┌─ Audit Logs   │
          │  ├─ Route Caching│       │  └─ Telemetry    │
          │  └─ Session State│       │     Records      │
          └─────────────────┘       └─────────────────┘
```

### How a Request Flows

1. **Client** sends a `POST /route` request with a task type (`text` or `math`) and a payload.
2. **Nginx** receives it on port `80` and reverse-proxies it to one of the **Gateway Router** replicas.
3. The **Gateway** validates the `X-Swarmio-Key` API key header.
4. **Redis** enforces a sliding-window rate limit (250 requests/minute per IP).
5. The Gateway resolves the target worker URL (cached in Redis for 1 hour).
6. The payload is forwarded to the appropriate **Worker Drone** (`text_worker` or `math_worker`).
7. The drone processes the payload and returns the result.
8. The Gateway wraps the response with telemetry metadata (latency, origin cluster) and writes an **audit log** to PostgreSQL.
9. The final response is returned to the client.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **API Gateway** | FastAPI + Gunicorn (4 workers) | High-concurrency async API routing with production WSGI server |
| **NLP Engine** | TextBlob | Sentiment analysis and polarity scoring |
| **Math Engine** | Pure Python | Statistical aggregation, sorting, and optimization |
| **Database** | PostgreSQL 16 (Alpine) | Persistent audit logging with indexed timestamps |
| **Cache** | Redis 7 (Alpine) | Rate limiting, route caching, and session state |
| **Load Balancer** | Nginx | Reverse proxy, connection timeout hardening, keep-alive |
| **Containerization** | Docker + Docker Compose | Multi-service orchestration with resource limits |
| **Frontend Framework** | React 19 + TypeScript + Vite | Type-safe, blazing-fast SPA |
| **3D Visualization** | Three.js + React Three Fiber | WebGL network topology with real-time animations |
| **Charts** | Recharts | Live throughput, packet drop, and latency graphs |
| **Styling** | Tailwind CSS 3 | Utility-first responsive design with glassmorphism |
| **Icons** | Lucide React | Lightweight, consistent icon system |
| **Animations** | Framer Motion | Smooth micro-interactions and transitions |
| **CI/CD** | GitHub Actions | Automated Docker build verification on every push |

---

## 📁 Project Structure

```
Swarmio-Orchestrator/
│
├── .github/
│   └── workflows/
│       └── swarmio-deploy.yml        # CI/CD pipeline — auto-tests Docker builds on push
│
├── routing_engine/
│   └── gateway.py                    # Central Gateway Router — auth, rate-limiting, routing, audit logging
│
├── specialized_models/
│   ├── text_worker.py                # NLP Drone — sentiment analysis via TextBlob
│   └── math_worker.py                # Math Drone — statistical computation engine
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                   # Main dashboard — 3D topology, charts, telemetry, user interface
│   │   ├── main.tsx                  # React entry point
│   │   └── index.css                 # Global styles with Tailwind directives
│   ├── public/
│   │   ├── favicon.svg               # Custom browser tab icon
│   │   └── icons.svg                 # SVG icon sprite
│   ├── Dockerfile.frontend           # Multi-stage build: Node builder → Nginx server
│   ├── package.json                  # Frontend dependencies and scripts
│   ├── tailwind.config.js            # Tailwind CSS configuration
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── vite.config.ts                # Vite bundler configuration
│   └── index.html                    # HTML entry point
│
├── Dockerfile.gateway                # Gateway container — Python 3.10 + Gunicorn + 4 Uvicorn workers
├── Dockerfile.text                   # NLP Drone container — Python 3.10 + TextBlob + NLP corpora
├── Dockerfile.math                   # Math Drone container — Python 3.10 + FastAPI
├── docker-compose.yml                # Development stack — all services with exposed ports
├── docker-compose.prod.yml           # Production stack — replicas, resource limits, isolated network
├── nginx.conf                        # Nginx config — upstream cluster, timeouts, proxy headers
├── requirements.txt                  # Python dependencies for the gateway
├── .env.example                      # Template for required environment variables
├── .gitignore                        # Ignores .env, .venv, __pycache__, .vscode
├── test_swarm.py                     # Manual API test script for verifying the swarm
├── LICENSE                           # MIT License
└── README.md                         # You are here
```

---

## ✨ Features

### Backend
- **Intelligent Task Routing** — The gateway dynamically resolves which worker drone should handle each request based on the `task_type` field.
- **API Key Authentication** — Every request must include a valid `X-Swarmio-Key` header. Unauthorized attempts are rejected with a `403` and logged.
- **Redis Rate Limiting** — A sliding-window rate limiter allows 250 requests per minute per IP. Exceeding this returns a `429 Too Many Requests`.
- **Redis Route Caching** — Worker URLs are cached for 1 hour to avoid redundant lookups.
- **PostgreSQL Audit Trail** — Every request (success, failure, rate-limited) is logged to `enterprise_audit_logs` with timestamp, client IP, task type, execution status, latency, and payload summary.
- **Thread-Safe Connection Pooling** — PostgreSQL connections are managed via `psycopg2.pool.ThreadedConnectionPool` (5–100 connections) for high-throughput safety.
- **Gunicorn Production Server** — The gateway runs behind Gunicorn with 4 Uvicorn workers for true parallel request handling.
- **Nginx Load Balancing** — Client connections are proxied through Nginx with aggressive timeout hardening (`10s` body/header/send, `15s` keepalive).
- **Horizontal Scaling** — Production config deploys 3 gateway replicas, 4 text worker replicas, and 2 math worker replicas with CPU/memory resource limits.

### Frontend
- **Interactive 3D Network Topology** — A live WebGL scene (Three.js + React Three Fiber) renders an octahedron gateway node surrounded by 6 orbiting drone spheres. The topology spins faster and turns red under critical load.
- **Dual-View Interface** — Toggle between a **User Interface** (send tasks to the swarm) and an **Admin Telemetry** dashboard (monitor system health).
- **Live Throughput Chart** — An area chart showing real-time requests/second vs. packet drops with gradient fills.
- **Live Latency Chart** — A step-line chart tracking system response latency in milliseconds.
- **Traffic Injection Slider** — Simulate traffic from 1,000 to 50,000 req/s to stress-test the visualization.
- **Gateway & Worker Scaling Controls** — Dynamically adjust the number of gateway nodes and NLP worker drones to observe capacity thresholds.
- **Real-Time Audit Terminal** — A scrolling terminal feed showing individual request logs with success/failure status, target drone, IP, and latency.
- **System Health Badge** — A glowing status indicator that shows `HEALTHY`, `CRITICAL LOAD`, or `STREAM PAUSED` with animated pulse effects.
- **Glassmorphism UI** — Backdrop-blur panels, gradient borders, and dark-mode aesthetics throughout.

### DevOps
- **GitHub Actions CI/CD** — Every push to `main` triggers an automated `docker-compose build` test on a clean Ubuntu runner.
- **Multi-Stage Docker Builds** — The frontend uses a two-stage Dockerfile (Node build → Nginx serve) for minimal production image size.
- **Environment Variable Security** — All secrets are loaded from `.env` files, never hardcoded in source.

---

## 🚀 Getting Started

### Prerequisites

Make sure the following tools are installed on your system:

| Tool | Version | Download |
|---|---|---|
| **Docker** | 20.10+ | [docker.com](https://www.docker.com/get-started/) |
| **Docker Compose** | v2.0+ | Included with Docker Desktop |
| **Node.js** | 18+ (only for local frontend dev) | [nodejs.org](https://nodejs.org/) |
| **Git** | 2.30+ | [git-scm.com](https://git-scm.com/) |

### Environment Configuration

1. Clone the repository:
   ```bash
   git clone https://github.com/winitdwd-lgtm/Swarmio-Orchestrator.git
   cd Swarmio-Orchestrator
   ```

2. Create your environment file from the provided template:
   ```bash
   cp .env.example .env
   ```

3. Open `.env` and fill in your credentials:
   ```env
   POSTGRES_USER=swarmio_admin
   POSTGRES_PASSWORD=<your_secure_password>
   POSTGRES_DB=swarmio_db
   SWARMIO_API_KEY=<your_secret_api_key>
   ```

   > ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

---

### 🐳 Production Deployment

To deploy the entire Swarmio network with Nginx load balancing, PostgreSQL, Redis, multi-replica gateways, worker drones, and the frontend dashboard:

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

This spins up:

| Service | Container | Replicas | Port | Resources |
|---|---|---|---|---|
| PostgreSQL 16 | `swarmio_postgres_prod` | 1 | Internal | 2 CPU, 4GB RAM |
| Redis 7 | `swarmio_redis_prod` | 1 | Internal | 1 CPU, 2GB RAM |
| Gateway Router | `gateway_router` | **3** | Internal | 1.5 CPU, 2GB RAM each |
| Text Worker (NLP) | `text_worker` | **4** | Internal | 2 CPU, 4GB RAM each |
| Math Worker | `math_worker` | **2** | Internal | 1 CPU, 2GB RAM each |
| Nginx Load Balancer | `swarmio_nginx_proxy` | 1 | **80** | Default |
| Frontend Dashboard | `swarmio_frontend` | 1 | **3000** | Default |

Once running, access the services:
- **API Endpoint**: `http://localhost:80/route`
- **Frontend Dashboard**: `http://localhost:3000`

To stop all services:
```bash
docker-compose -f docker-compose.prod.yml down
```

To stop and remove all data volumes:
```bash
docker-compose -f docker-compose.prod.yml down -v
```

---

### 💻 Local Development (Frontend)

If you want to work on the 3D telemetry dashboard independently:

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server will start at `http://localhost:5173` with hot module replacement.

To build the optimized production bundle:
```bash
npm run build
```

To lint the TypeScript codebase:
```bash
npm run lint
```

---

### 🧪 Development Stack (Without Replicas)

For a simpler development setup with all ports exposed and no replicas:

```bash
docker-compose up --build -d
```

This exposes all services on their individual ports:
- Gateway: `http://localhost:8000`
- Text Worker: `http://localhost:8001`
- Math Worker: `http://localhost:8002`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

---

## 📡 API Reference

### `POST /route`

Routes a task to the appropriate specialized worker drone.

**Headers:**
| Header | Type | Required | Description |
|---|---|---|---|
| `Content-Type` | `string` | Yes | Must be `application/json` |
| `X-Swarmio-Key` | `string` | Yes | Your secret API key from `.env` |

**Request Body:**
```json
{
  "task_type": "text",
  "payload": {
    "sentence": "Swarmio Orchestrator is an incredible piece of engineering."
  }
}
```

**Supported Task Types:**

| Task Type | Payload Format | Worker |
|---|---|---|
| `text` | `{ "sentence": "string" }` | NLP Drone (Port 8001) |
| `math` | `{ "numbers": [int, int, ...] }` | Math Drone (Port 8002) |

**Example — Text Analysis:**
```bash
curl -X POST http://localhost:80/route \
  -H "Content-Type: application/json" \
  -H "X-Swarmio-Key: your_api_key_here" \
  -d '{"task_type": "text", "payload": {"sentence": "This project is amazing!"}}'
```

**Response:**
```json
{
  "gateway_status": "secured_and_routed",
  "telemetry": {
    "latency_ms": 42,
    "origin_cluster": "http://text_worker:8001/process-text"
  },
  "model_response": {
    "status": "drone_execution_success",
    "sentiment": "POSITIVE",
    "polarity_score": 0.75
  }
}
```

**Example — Math Optimization:**
```bash
curl -X POST http://localhost:80/route \
  -H "Content-Type: application/json" \
  -H "X-Swarmio-Key: your_api_key_here" \
  -d '{"task_type": "math", "payload": {"numbers": [42, 108, 7, 999, 23]}}'
```

**Response:**
```json
{
  "gateway_status": "secured_and_routed",
  "telemetry": {
    "latency_ms": 12,
    "origin_cluster": "http://math_worker:8002/process-math"
  },
  "model_response": {
    "status": "drone_execution_success",
    "highest_number": 999,
    "total_sum": 1179,
    "average_value": 235.8,
    "sorted_sequence": [7, 23, 42, 108, 999]
  }
}
```

**Error Responses:**

| Code | Reason |
|---|---|
| `400` | Invalid `task_type` — no matching worker drone |
| `403` | Missing or invalid `X-Swarmio-Key` |
| `429` | Rate limit exceeded (250 req/min per IP) |
| `502` | Target worker drone is offline or unreachable |

---

## 🖥️ Frontend Dashboard

The frontend is a **React 19 + TypeScript** single-page application powered by **Vite**, featuring two distinct views:

### User Interface
A sleek command panel that lets you select a drone protocol (NLP Sentiment Analysis or Mathematical Optimization), type your input, and fire it directly at the Swarm Gateway. The response is rendered in a styled terminal-like output box.

### Admin Telemetry
A full monitoring suite featuring:
- **3D Network Topology** — A WebGL octahedron (gateway) surrounded by orbiting spheres (drones). Turns red and spins violently when the system is overloaded.
- **Traffic Injection** — A slider to simulate 1K–50K requests/second.
- **Gateway Scaler** — Buttons to add/remove gateway nodes and observe the capacity threshold.
- **Worker Scaler** — Buttons to add/remove NLP worker drones.
- **Throughput vs Drops Chart** — Real-time area chart with cyan (requests) and red (packet drops) gradients.
- **Latency Chart** — Real-time step-line chart tracking response times in milliseconds.
- **Audit Stream Terminal** — A scrolling log feed with color-coded entries (green = success, red = critical/dropped).
- **System Status Badge** — Animated indicator showing `HEALTHY` / `CRITICAL LOAD` / `STREAM PAUSED`.

---

## ⚙️ CI/CD Pipeline

The project includes a **GitHub Actions** workflow (`.github/workflows/swarmio-deploy.yml`) that automatically runs on every push to the `main` branch:

1. Checks out the repository on a fresh Ubuntu runner.
2. Executes `docker-compose build` to verify all Dockerfiles compile correctly.
3. Reports build success or failure.

This ensures that no broken Docker configuration ever reaches the main branch.

---

## 🔒 Security

| Layer | Mechanism | Details |
|---|---|---|
| **Authentication** | API Key via `X-Swarmio-Key` header | Validated against `SWARMIO_API_KEY` env var on every request |
| **Rate Limiting** | Redis sliding-window counter | 250 requests/minute per client IP, returns `429` on breach |
| **CORS Hardening** | FastAPI middleware | Restricts allowed methods to `POST` and `GET` only |
| **Nginx Timeouts** | Aggressive connection timeouts | `10s` body, `10s` header, `15s` keepalive, `10s` send |
| **Secrets Management** | `.env` file (git-ignored) | Credentials never appear in source code or Docker images |
| **Network Isolation** | Docker bridge network | All inter-service traffic flows over a private `swarmio_backend` network |
| **Connection Pooling** | `psycopg2` ThreadedConnectionPool | Thread-safe PostgreSQL access with 5–100 connection scaling |
| **Audit Logging** | PostgreSQL `enterprise_audit_logs` | Every request logged with IP, status, latency, and payload summary |
| **CI/CD Validation** | GitHub Actions | Automated build checks prevent deployment of broken images |

---

## 📜 License

```
MIT License

Copyright (c) 2026 Vineet M Dharwad

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<p align="center">
  <strong>Engineered with precision by Vineet M Dharwad ™</strong>
  <br />
  <sub>If you found this project interesting, consider giving it a ⭐</sub>
</p>
