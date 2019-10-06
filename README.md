Hello! Welcome to _Simple Flash Cards_.

- Environment Variables

| Name            | Example                                                    | Description                                       |
| --------------- | ---------------------------------------------------------- | ------------------------------------------------- |
| PRISMA_ENDPOINT | https://us1.prisma.sh/shawn-reisner-e6118b/flash-cards/dev | The Prisma server where the database lives.       |
| PRISMA_SECRET   | supersecret                                                | The secret to access the Prisma server.           |
| APP_SECRET      | supersecret                                                | The secret used for signing JWTs.                 |
| MAIL_HOST       | smtp.mailtrap.io                                           | The mail host for sending emails.                 |
| MAIL_PORT       | 2525                                                       | The port on the mail host for sending emails.     |
| MAIL_USER       | username                                                   | The username on the mail host for sending emails. |
| MAIL_PASS       | password                                                   | The password on the mail host for sending emails. |
| FRONTEND_URL    | http://localhost:7777                                      | The URL of the front end of the project.          |

- Running the Project

  - Prerequisites

    - An internet connection
    - See "Environment Variables"
    - Clone and run front end project (https://github.com/sreisner/flash-cards-frontend)
    - Install all dependencies with `npm install`

  - **Dev Mode w/ Hot Reloading**: `npm run dev`
  - **Production Mode**: `npm start`

- Linting the project: `npm run lint`
- Seeding the database: `npm run seed`
  - **Note**: This will delete all data from the database before seeding.
