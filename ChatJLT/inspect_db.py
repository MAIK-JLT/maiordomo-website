from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv
import os

load_dotenv()

def inspect_db():
    embeddings = OpenAIEmbeddings()
    vector_store = Chroma(
        collection_name="code_store",
        embedding_function=embeddings,
        persist_directory="./vector_store"
    )
    
    collection = vector_store._collection
    count = collection.count()
    print(f"Total documents in DB: {count}")
    
    if count > 0:
        # Get a sample of documents to see what's in there
        results = collection.get(limit=10)
        print("\nSample documents:")
        for i, metadata in enumerate(results['metadatas']):
            source = metadata.get('source', 'Unknown') if metadata else 'Unknown'
            print(f"- {source}")

if __name__ == "__main__":
    inspect_db()
