from fastapi import FastAPI
from pydantic import BaseModel
from textblob import TextBlob
import uvicorn

app = FastAPI(title="Swarmio NLP Drone")

class TextPayload(BaseModel):
    sentence: str

@app.post("/process-text")
def process_text(payload: TextPayload):
    # Process the text using our ML Brain
    analysis = TextBlob(payload.sentence)
    
    # Calculate sentiment polarity
    if analysis.sentiment.polarity > 0:
        sentiment = "POSITIVE"
    elif analysis.sentiment.polarity < 0:
        sentiment = "NEGATIVE"
    else:
        sentiment = "NEUTRAL"
        
    return {
        "status": "drone_execution_success",
        "sentiment": sentiment,
        "polarity_score": round(analysis.sentiment.polarity, 2)
    }

if __name__ == "__main__":
    # CRITICAL: 0.0.0.0 allows Docker to route traffic. Port 8001 matches the Gateway.
    uvicorn.run(app, host="0.0.0.0", port=8001)