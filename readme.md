# Wallet & Transactions API Setup Instructions

## 1. Clone the repository

```
git clone https://github.com/xunna59/remittra.git
cd your-repo
```

## 2. Install dependencies

```
npm install
```

## 3. Configure environment variables

Create a `.env` file in the project root:

```
JWT_SECRET=
TOKEN_EXPIRES_IN=
PORT=3000
NODE_ENV=production

# Db Configuration
DB_HOST=
DB_DATABASE=
DB_USER=
DB_PASSWORD=
DB_PORT=
```

## Docker Setup (Optional)

You can run the app fully containerized using Docker:

1. **Build and start the container**:

```
docker-compose build
docker-compose up -d
```

2. **Verify the container is running**:

```
docker ps
```

3. **Stop the container**:

```
docker-compose down
```

💡 Make sure your `.env` file is set up before running the container, so the app can connect to the database properly.

## 4. Run database migrations

```
npx sequelize-cli db:migrate
```

## 5. Start the server

```
npm run dev
```

Server will run at `http://localhost:3000`.

## 6. Running Tests

```
npm test
```

## 7. Endpoints

* POST `/api/auth/register` - Create a new user
* POST `/api/auth/login` - Login user account
* GET  `/api/user/fetch-profile` - Fetch user profile / balance
* POST `/api/transaction/credit` - Credit a user's wallet
* POST `/api/transaction/debit` - Debit a user's wallet
* GET `/api/transactions?page=1&limit=10` - Fetch paginated transactions for all users
* GET `/api/user/transactions?page=1&limit=10` - Fetch paginated transactions for authenticated users
