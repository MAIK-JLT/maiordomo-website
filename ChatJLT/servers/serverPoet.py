from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from prompt_poet import Prompt  # Asumiendo que ya has instalado y configurado PromptPoet

app = FastAPI()

# Definir el modelo de entrada de los datos que se enviarán desde Node.js
class PromptRequest(BaseModel):
    user_query: str
    context: str

# Ruta principal para generar el prompt
@app.post("/generate_prompt/")
async def generate_prompt(request: PromptRequest):
    try:
        # Crear el prompt usando PromptPoet
        raw_template = """
        - name: system instructions
          role: system
          content: |
            Aquí está la información relevante: {{ context }}

        - name: user query
          role: user
          content: |
            Usuario preguntó: {{ user_query }}

        - name: response
          role: assistant
          content: |
            Respuesta:
        """

        # Utilizando PromptPoet para generar el prompt final
        template_data = {"user_query": request.user_query, "context": request.context}
        prompt = Prompt(raw_template=raw_template, template_data=template_data)
        
        return {"prompt": prompt.messages}  # Devolver el prompt generado
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Correr el servidor de FastAPI
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
