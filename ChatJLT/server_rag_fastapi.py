from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, List, Optional
import uvicorn
import logging
import traceback
import traceback
from agents.langchain_agent import agent
from agents.crawler import crawler

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Modelos Pydantic para validar request y response
class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    sources: List[str]

class CrawlRequest(BaseModel):
    url: str

app = FastAPI(root_path="/bodel_estetica_api")

# Configurar CORS
origins = [
    "http://localhost:3001",
    "http://localhost:3000",
    "http://127.0.0.1:3001",
    "https://maiordomo.com",
    "http://maiordomo.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception handler caught: {str(exc)}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "traceback": traceback.format_exc()}
    )

# API routes primero
@app.post("/api/crawl")
async def crawl_url(request: CrawlRequest):
    try:
        logger.info(f"Received crawl request for: {request.url}")
        result = await crawler.crawl(request.url)
        return result
    except Exception as e:
        logger.error(f"Error crawling url: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat", response_model=ChatResponse)
async def chat(message: ChatMessage) -> ChatResponse:
    try:
        logger.info(f"Received chat message: {message.message}")
        
        if not message.message.strip():
            logger.warning("Empty message received")
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        try:
            result = await agent.process_message(message.message)
            logger.info(f"Got result from agent: {result}")
            
            # Extraer fuentes de los documentos
            sources = []
            if "source_documents" in result:
                sources = [
                    f"{doc['source']}: {doc['content'][:200]}..."
                    for doc in result["source_documents"]
                ]
            
            return ChatResponse(
                response=result["response"],
                sources=sources
            )
            
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise HTTPException(
                status_code=500,
                detail=f"Error processing message: {str(e)}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred"
        )

# Montar archivos estáticos después de las rutas API
app.mount("/", StaticFiles(directory="public", html=True), name="static")

if __name__ == "__main__":
    logger.info("Starting server on http://localhost:3001")
    uvicorn.run(
        "server_rag_fastapi:app",
        host="0.0.0.0",
        port=3001,
        reload=True,
        log_level="debug"
    )
