## Note Maker

Note Maker is not your average notes app. It provides you with the ability to chat with your notes. It constructs knowledge graph using your notes

[architecture image]

### Techologies Used

- Frontend: React, Tailwind CSS, ShadCN UI Components, Zustand, TanStack Query
- Backend: Python FastAPI, LangChain, GuardRails AI, Qdrant
- LLM Provider: Groq cloud
- Embedding Model Provider: Google Generative AI Embeddings 
- Vector Store Hosting: Qdrant Cloud
- Database: Aurora Postgres DB
- Cache: Amazon ElastiCache
- Backend Deployment: AWS Lambda
- API Gateway: Amazon API Gateway
- Authentication: API Gateway Authorizer with JWT
- Frontend Hosting: Amazon S3
- CDN: Amazon CloudFront
- DNS: Route 53 DNS

### Run Locally

1. create utility services: `docker-compose up -d`
2. add .env files to all backend folders:

    ```
    GROQ_API_KEY=<add your key>
    DB_URL=postgresql+asyncpg://admin:admin123@localhost:5432/mydb
    REDIS_HOST=localhost
    REDIS_PORT=6379
    GOOGLE_API_KEY=<add your key>
    ```

3. create tables
     - `cd backend/ai_analyze_service`
     - `python tables.py`

4. run ai_analyze_service
     - `cd backend/ai_analyze_service`
     - `python app.py`

5. run auth_service
     - `cd backend/auth_service`
     - `python app.py`

6. run notes_crud_service
     - `cd backend/notes_crud_service`
     - `python app.py`

7. run verify_token_service
     - `cd backend/verify_token_service`
     - `python app.py`

7. run frontend
     - `cd frontend`
     - `npm run dev`
