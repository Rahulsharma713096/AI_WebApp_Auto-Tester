# Welcome to contributors!

## Development Setup

1. Fork and clone the repo
2. Install Python 3.11+, Node.js 20+
3. Backend: `cd backend && pip install -r requirements.txt`
4. Frontend: `cd frontend && npm install && npm run dev`
5. Copy `.env.example` to `.env` and configure

## Code Style

- Python: Follow PEP 8 via `ruff`
- TypeScript/React: Follow the existing patterns
- Use `npm run format` and `npm run lint` before committing

## Testing

- Backend: `cd backend && pytest`
- Frontend: `cd frontend && npm test`

## Pull Request Process

1. Create a feature branch
2. Write tests for new functionality
3. Ensure lint passes
4. Update documentation if needed
5. Create PR against `main`
