import aiohttp
import asyncio
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import logging
from typing import List, Set
from agents.langchain_agent import agent

logger = logging.getLogger(__name__)

class WebCrawler:
    def __init__(self):
        self.visited: Set[str] = set()
        
    def is_valid_url(self, url: str, base_domain: str) -> bool:
        """Verifica si la URL es válida y pertenece al mismo dominio"""
        parsed = urlparse(url)
        return bool(parsed.netloc) and parsed.netloc == base_domain

    async def crawl(self, start_url: str, max_pages: int = 10):
        """Rastrea la web comenzando desde start_url"""
        logger.info(f"Iniciando rastreo en: {start_url}")
        self.visited.clear()
        
        domain = urlparse(start_url).netloc
        queue = [start_url]
        pages_processed = 0
        
        texts = []
        metadatas = []

        async with aiohttp.ClientSession() as session:
            while queue and pages_processed < max_pages:
                url = queue.pop(0)
                if url in self.visited:
                    continue
                    
                self.visited.add(url)
                
                try:
                    async with session.get(url, timeout=10) as response:
                        if response.status != 200:
                            continue
                        
                        html = await response.text()
                        soup = BeautifulSoup(html, 'html.parser')
                        
                        # Extraer texto útil (párrafos, encabezados)
                        # Eliminamos scripts y estilos
                        for script in soup(["script", "style"]):
                            script.decompose()
                            
                        text = soup.get_text(separator=' ', strip=True)
                        
                        if len(text) > 100: # Ignorar páginas con muy poco contenido
                            texts.append(text)
                            metadatas.append({"source": url})
                            pages_processed += 1
                            logger.info(f"Indexada página: {url}")

                        # Buscar enlaces para seguir rastreando
                        for link in soup.find_all('a'):
                            href = link.get('href')
                            if href:
                                full_url = urljoin(url, href)
                                if self.is_valid_url(full_url, domain) and full_url not in self.visited:
                                    queue.append(full_url)
                                    
                except Exception as e:
                    logger.error(f"Error rastreando {url}: {e}")

        if texts:
            logger.info(f"Enviando {len(texts)} páginas al agente para indexación...")
            await agent.add_documents(texts, metadatas)
            return {"status": "success", "pages_indexed": len(texts)}
        else:
            return {"status": "warning", "message": "No content found"}

# Instancia global
crawler = WebCrawler()
