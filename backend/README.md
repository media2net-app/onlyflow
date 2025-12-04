# OnlyFlow Backend API

Backend API voor OnlyFlow - AI Content Automation Platform

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
PORT=3001
HUGGINGFACE_API_KEY=your_key_here
FRONTEND_URL=http://localhost:5173
```

3. Start development server:
```bash
npm run dev
```

Server runs on `http://localhost:3001`

## API Endpoints

### Health Check
- `GET /api/health` - Server status

### Influencers
- `GET /api/influencers` - Get all influencers
- `GET /api/influencers/:id` - Get influencer by ID
- `POST /api/influencers` - Create new influencer
- `PUT /api/influencers/:id` - Update influencer
- `DELETE /api/influencers/:id` - Delete influencer

### Content
- `GET /api/content` - Get all content
- `GET /api/content/:id` - Get content by ID
- `GET /api/content/influencer/:influencerId` - Get content by influencer
- `DELETE /api/content/:id` - Delete content

### Generation
- `POST /api/generation/content` - Generate new content
- `GET /api/generation/status/:jobId` - Get generation status
- `GET /api/generation/queue` - Get generation queue

## Project Structure

```
backend/
├── src/
│   ├── server.js          # Express server setup
│   ├── routes/            # API routes
│   ├── controllers/       # Request handlers
│   ├── services/         # Business logic (AI integration)
│   ├── models/           # Data models
│   └── middleware/       # Custom middleware
├── package.json
└── README.md
```

