# API Documentation

## Base URL
`http://localhost:8000`

## Endpoints

### Test Runs

#### Create Test Run
```http
POST /api/test-runs?url=https://example.com&profile=basic
```

#### List Test Runs
```http
GET /api/test-runs?page=1&per_page=20
```

#### Get Test Run
```http
GET /api/test-runs/{id}
```

#### Get Issues
```http
GET /api/test-runs/{id}/issues
```

#### Get Pages
```http
GET /api/test-runs/{id}/pages
```

#### Get Test Cases
```http
GET /api/test-runs/{id}/test-cases
```

#### Delete Test Run
```http
DELETE /api/test-runs/{id}
```

### WebSocket

#### Real-time Logs
```
ws://localhost:8000/ws/test-run/{id}
```

### Health
```http
GET /health
```
