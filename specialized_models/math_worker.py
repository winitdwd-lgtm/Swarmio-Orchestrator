from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import uvicorn

app = FastAPI(title="Swarmio Math Drone")

class MathPayload(BaseModel):
    numbers: List[int]

@app.post("/process-math")
def process_math(payload: MathPayload):
    # Mathematical Optimization Engine
    numbers = payload.numbers
    
    if not numbers:
        return {"status": "error", "message": "No numbers provided."}

    return {
        "status": "drone_execution_success",
        "highest_number": max(numbers),
        "total_sum": sum(numbers),
        "average_value": round(sum(numbers) / len(numbers), 2),
        "sorted_sequence": sorted(numbers)
    }

if __name__ == "__main__":
    # CRITICAL: 0.0.0.0 allows Docker routing. Port 8002 matches the Gateway map.
    uvicorn.run(app, host="0.0.0.0", port=8002)