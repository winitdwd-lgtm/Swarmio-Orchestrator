from fastapi import FastAPI, HTTPException, Security, Depends, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from pydantic import BaseModel
from datetime import datetime
from psycopg2 import pool
import requests
import redis
import os

app = FastAPI(
    title="Swarmio Enterprise Gateway Router",
    version="1.0.0",
    docs_url=None,
    redoc_url=None
)

# --- 1. ENTERPRISE CORS HARDENING ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type", "X-Swarmio-Key"],
)

# --- 2. CRYPTOGRAPHIC ACCESS GATEWAY ---
API_KEY_NAME = "X-Swarmio-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

def verify_key(api_key: str = Security(api_key_header)):
    if not api_key or api_key != os.getenv("SWARMIO_API_KEY"):
        raise HTTPException(
            status_code=403, 
            detail="CRITICAL: Unauthorized Access Attempt Intercepted by Edge Security."
        )
    return api_key

# --- 3. THREAD-SAFE POSTGRESQL CONNECTION POOLING ---
try:
    db_pool = pool.ThreadedConnectionPool(
        minconn=5,
        maxconn=100,  # Dynamically scales up to 100 concurrent persistent pipes
        dbname=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD"),
        host="postgres_db",
        port="5432"
    )
    
    # Initialize Schema instantly on bootstrap using a temporary connection
    conn = db_pool.getconn()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS enterprise_audit_logs (
            id BIGSERIAL PRIMARY KEY,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            client_ip VARCHAR(45),
            task_type VARCHAR(32),
            execution_status VARCHAR(16),
            latency_ms INT,
            payload_summary TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON enterprise_audit_logs(timestamp desc);
    """)
    conn.commit()
    cur.close()
    db_pool.putconn(conn)
except Exception as e:
    print(f"CRITICAL: Failed to Initialize Threaded DB Connection Pool: {e}")
    db_pool = None

# --- 4. HIGH-VELOCITY IN-MEMORY CACHE LAYER ---
cache = redis.Redis(host='redis_cache', port=6379, decode_responses=True)

class UserRequest(BaseModel):
    task_type: str  
    payload: dict   

def execute_audit_logging(client_ip: str, task_type: str, status: str, latency: int, summary: str):
    if not db_pool:
        return
    conn = None
    try:
        conn = db_pool.getconn()
        cur = conn.cursor()
        cur.execute(
            """INSERT INTO enterprise_audit_logs 
               (client_ip, task_type, execution_status, latency_ms, payload_summary) 
               VALUES (%s, %s, %s, %s, %s)""",
            (client_ip, task_type, status, latency, summary)
        )
        conn.commit()
        cur.close()
    except Exception as e:
        print(f"TELEMETRY ERROR: Failed to commit transaction packet: {e}")
    finally:
        if conn:
            db_pool.putconn(conn)

# --- 5. HIGH-AVAILABILITY ORCHESTRATION PIPELINE ---
@app.post("/route")
def route_inference(request: UserRequest, raw_req: Request, valid_key: str = Depends(verify_key)):
    start_time = datetime.now()
    client_ip = raw_req.client.host
    
    # SYSTEM PROTECTION LAYER: Redis Sliding Window Rate Limiting
    try:
        request_count = cache.incr(f"rate_limit:{client_ip}")
        if request_count == 1:
            cache.expire(f"rate_limit:{client_ip}", 60)
            
        if request_count > 250:  # Advanced capacity tolerance
            execute_audit_logging(client_ip, request.task_type, "RATE_LIMITED", 0, "Spam threshold triggered.")
            raise HTTPException(status_code=429, detail="RATE_LIMIT_EXCEEDED: Transaction rejected.")
    except redis.RedisError as re:
        print(f"CACHE FAULT: Bypassing rate-limiter to maintain availability: {re}")

    # RESOLVE DYNAMIC WORKER DESTINATION
    target_url = cache.get(f"route:{request.task_type}")
    if not target_url:
        if request.task_type == "text":
            target_url = "http://text_worker:8001/process-text"
        elif request.task_type == "math":
            target_url = "http://math_worker:8002/process-math"
        else:
            execute_audit_logging(client_ip, request.task_type, "INVALID_ROUTE", 0, "Malformed task target.")
            raise HTTPException(status_code=400, detail="Target processing cluster not found.")
        cache.set(f"route:{request.task_type}", target_url, ex=3600)

    # EXECUTE CLUSTER INFERENCE WITH METRIC WRAPPER
    try:
        response = requests.post(target_url, json=request.payload, timeout=5.0)
        model_data = response.json()
        
        duration = int((datetime.now() - start_time).total_seconds() * 1000)
        summary = str(model_data.get("sentiment", "")) or str(model_data.get("status", ""))
        
        execute_audit_logging(client_ip, request.task_type, "COMPLETED", duration, summary)
        
        return {
            "gateway_status": "secured_and_routed",
            "telemetry": {"latency_ms": duration, "origin_cluster": target_url},
            "model_response": model_data
        }
    except requests.RequestException as exc:
        duration = int((datetime.now() - start_time).total_seconds() * 1000)
        execute_audit_logging(client_ip, request.task_type, "CLUSTER_FAULT", duration, str(exc))
        raise HTTPException(status_code=502, detail="WORKER_UNREACHABLE: Target container node offline.")