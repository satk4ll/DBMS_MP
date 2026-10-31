# System architecture

Browser (Next.js pages) → Next.js Route Handlers (`app/api/*`) → PostgreSQL (`lib/db.ts` / `DATABASE_URL`).

PostgreSQL stores structured entities and relationships. Constraints enforce data integrity; indexes support joins and filters; a view supports analytics; a trigger keeps project status aligned with application acceptance. Full-text search supports keyword relevance. A future pgvector extension can store embeddings for project and student bio/profile text and use cosine distance for semantic retrieval, followed by relational filters and a combined ranking score.
