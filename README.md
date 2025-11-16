# User Directory Backend

Backend API that proxies the [ReqRes API](https://reqres.in/). Built with Nest.js and TypeScript.

## Stack

- Nest.js 10.x
- Node.js >= 18
- TypeScript
- Axios
- Jest

## Getting Started

Install dependencies:
```bash
npm install
```

Start the dev server:
```bash
npm run start:dev
```

Server runs at `http://localhost:3000`.

### Environment Variables (optional)

Create a `.env` file if you want to customize:
```env
REQRES_BASE_URL=https://reqres.in/api
REQRES_API_KEY=reqres-free-v1
PORT=3000
```

These are the defaults. ReqRes API requires the `x-api-key` header with value `reqres-free-v1`.

### Production Build

```bash
npm run build
npm run start:prod
```

## API

### GET /users

Returns paginated user list.

**Query params:**
- `page` (number, default: 1)
- `perPage` (number, default: 6, max: 100)
- `delay` (number, optional, max: 60) - adds delay in seconds to response

**Examples:**
```bash
# Basic request
curl http://localhost:3000/users

# With pagination
curl "http://localhost:3000/users?page=2&perPage=10"

# With delay (useful for testing loading states)
curl "http://localhost:3000/users?page=1&perPage=6&delay=2"
```

**Response:**
```json
{
  "page": 1,
  "per_page": 6,
  "total": 12,
  "total_pages": 2,
  "data": [
    {
      "id": 1,
      "email": "george.bluth@reqres.in",
      "first_name": "George",
      "last_name": "Bluth",
      "avatar": "https://reqres.in/img/faces/1-image.jpg"
    }
  ],
  "support": { ... }
}
```

**Errors:**
- 404: Page not found
- 502: ReqRes API unavailable
- 500: Unexpected error

All errors are logged and return `{ statusCode, message }`.

## Testing

Run tests:
```bash
npm test
```

Watch mode:
```bash
npm run test:watch
```

With coverage:
```bash
npm run test:cov
```

## Code Quality

Format and lint:
```bash
npm run format
npm run lint
```

## Project Structure

```
src/
├── main.ts                 # Entry point
├── app.module.ts           # Root module
└── users/
    ├── users.module.ts
    ├── users.controller.ts
    ├── users.service.ts
    ├── users.service.spec.ts
    ├── dto/
    │   └── get-users-query.dto.ts
    └── interfaces/
        ├── user.interface.ts
        └── paginated-users-response.interface.ts
```
