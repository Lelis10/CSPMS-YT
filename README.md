<h1 align="center">Cspms-YT</h1>

<p>
  This project was generated with Angular CLI version 16.1.3.
</p>

## Development server

Run `npm start` for a dev server in the frontend. The app will automatically reload if you change any of the source files. Also, navigate to backend file with `cd backend` and run `npm start` to start the backend server.

## Create the  MySQL database

Copy the database script `Cspms-Db` in the `backend` file and run to generate the database in any MySQL client.

## Config your conection between backend and you MySQL database
Navigate to backend/app.js and change the details to your MySQL database details.
```json
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});
```
## Deploy the app

Navigate to `http://localhost:4200/` and you will see the project.
