<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# URL Shortener Backend

## Overview

This project is a URL shortener backend built with NestJS, Prisma, and Zod for validation. The API allows users to generate short URLs, customize them, and retrieve the original URLs via redirection. It also includes authentication with JWT, rate-limiting, and expiration handling for shortened URLs.

## Features

- User Authentication: Email-password authentication using JWT.

- Short URL Generation: Automatically generates a unique 6-character short URL.

- Custom Short URL: Users can customize the short URL (up to 16 characters).

- Expiration Handling: Shortened URLs expire after 5 years.

- Redirection Service: Redirects users to the original URL when accessing the shortened link.

- Rate Limiting: Prevents abuse by limiting requests per second.

- Database Management: Uses Prisma with MySQL (support for migration files).

- API Documentation: Documented using Swagger.

- Testing: Unit tests included to ensure functionality.

## Tech Stack

- Backend Framework: NestJS
- ORM: Prisma
- Validation: Zod
- Authentication: JWT
- Database: MySQL
- Rate Limiting: @nestjs/throttler
- API Documentation: Swagger
- Testing: Jest

## Installation

### Steps :

1. **Clone the repository** :

    ```bash
    git clone https://github.com/your-repo/url-shortener.git
    cd url-shortener
    ```

2. **Install dependencies** :

    ```bash
    npm install
    ```

3. **Set up environment variables** :

    ```bash
    cp .env.example .env
    ```

4. **Start the server** :

    ```bash
    npm run start:dev
    ```


5. **Access API documentation at** :

    ```bash
    http://localhost:4000/api
    ```


## API Endpoints

### Authentication
- Register: POST /api/auth/register
- Login: POST /api/auth/login

### User Management
- User details : GET /api/users/current
- Update: PATCH /api/users/current
- Logout: DELETE /api/users/current

### Url Management
- Shorten URL: POST /api/users/:userId/url/shorten
- Redirect to Original URL: GET /api/users/url/:shortened

## Testing

**Run unit tests with** :

    ```bash
    npm run test
    ```