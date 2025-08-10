require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
app.use(cors({
  origin: 'https://octopus-washy.onrender.com',
  credentials: true
}));
app.use(express.json());

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 3600000 }
}));

const pool = new Pool({
  host: 'dpg-d2cft9p5pdvs73dl2ik0-a',
  user: 'root',
  password: 'wYCcW7qp4izsogC6FayJkz5QdF1ngIlF',
  database: 'octobase_3093',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Package" (
        "PackageNumber" SERIAL PRIMARY KEY,
        "PackageName" VARCHAR(100) NOT NULL,
        "PackageDescription" TEXT,
        "PackagePrice" DECIMAL(10, 2) NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS "User" (
        "UserID" SERIAL PRIMARY KEY,
        "Username" VARCHAR(50) NOT NULL UNIQUE,
        "Email" VARCHAR(100) NOT NULL UNIQUE,
        "PasswordHash" VARCHAR(255) NOT NULL,
        "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS "Car" (
        "PlateNumber" VARCHAR(20) PRIMARY KEY,
        "CarType" VARCHAR(50) NOT NULL,
        "CarSize" VARCHAR(20) NOT NULL,
        "DriverName" VARCHAR(100) NOT NULL,
        "PhoneNumber" VARCHAR(20) NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS "ServicePackage" (
        "RecordNumber" SERIAL PRIMARY KEY,
        "PlateNumber" VARCHAR(20) NOT NULL REFERENCES "Car"("PlateNumber"),
        "PackageNumber" INT NOT NULL REFERENCES "Package"("PackageNumber"),
        "ServiceDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS "Payment" (
        "PaymentNumber" SERIAL PRIMARY KEY,
        "RecordNumber" INT NOT NULL REFERENCES "ServicePackage"("RecordNumber"),
        "AmountPaid" DECIMAL(10, 2) NOT NULL,
        "PaymentDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database and tables initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  }
}

initializeDatabase()
  .then(() => {
    // Package endpoints
    app.get('/api/packages', async (req, res) => {
      try {
        const { rows } = await pool.query('SELECT * FROM "Package"');
        res.json(rows);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/packages', async (req, res) => {
      try {
        const { PackageName, PackageDescription, PackagePrice } = req.body;
        const { rows } = await pool.query(
          'INSERT INTO "Package" ("PackageName", "PackageDescription", "PackagePrice") VALUES ($1, $2, $3) RETURNING *',
          [PackageName, PackageDescription, PackagePrice]
        );
        res.status(201).json(rows[0]);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Car endpoints
    app.get('/api/cars', async (req, res) => {
      try {
        const { rows } = await pool.query('SELECT * FROM "Car"');
        res.json(rows);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/cars', async (req, res) => {
      try {
        const { PlateNumber, CarType, CarSize, DriverName, PhoneNumber } = req.body;
        const { rows } = await pool.query(
          'INSERT INTO "Car" ("PlateNumber", "CarType", "CarSize", "DriverName", "PhoneNumber") VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [PlateNumber, CarType, CarSize, DriverName, PhoneNumber]
        );
        res.status(201).json(rows[0]);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // ServicePackage endpoints
    app.get('/api/services', async (req, res) => {
      try {
        const { rows } = await pool.query(`
          SELECT sp."RecordNumber", c."PlateNumber", c."DriverName", 
                 p."PackageName", p."PackagePrice", sp."ServiceDate"
          FROM "ServicePackage" sp
          JOIN "Car" c ON sp."PlateNumber" = c."PlateNumber"
          JOIN "Package" p ON sp."PackageNumber" = p."PackageNumber"
        `);
        res.json(rows);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/services', async (req, res) => {
      try {
        const { PlateNumber, PackageNumber } = req.body;
        const { rows } = await pool.query(
          'INSERT INTO "ServicePackage" ("PlateNumber", "PackageNumber") VALUES ($1, $2) RETURNING *',
          [PlateNumber, PackageNumber]
        );
        res.status(201).json(rows[0]);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.put('/api/services/:id', async (req, res) => {
      try {
        const serviceId = req.params.id;
        const { PlateNumber, PackageNumber } = req.body;
        const { rowCount } = await pool.query(
          'UPDATE "ServicePackage" SET "PlateNumber" = $1, "PackageNumber" = $2 WHERE "RecordNumber" = $3',
          [PlateNumber, PackageNumber, serviceId]
        );
        if (rowCount === 0) {
          return res.status(404).json({ error: 'Service not found' });
        }
        res.json({ message: 'Service updated successfully' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.delete('/api/services/:id', async (req, res) => {
      try {
        const serviceId = req.params.id;
        const { rowCount } = await pool.query(
          'DELETE FROM "ServicePackage" WHERE "RecordNumber" = $1',
          [serviceId]
        );
        if (rowCount === 0) {
          return res.status(404).json({ error: 'Service not found' });
        }
        res.json({ message: 'Service deleted successfully' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Payment endpoints
    app.get('/api/payments', async (req, res) => {
      try {
        const { rows } = await pool.query(`
          SELECT py."PaymentNumber", py."AmountPaid", py."PaymentDate",
                 sp."RecordNumber", c."PlateNumber", c."DriverName",
                 p."PackageName", p."PackagePrice"
          FROM "Payment" py
          JOIN "ServicePackage" sp ON py."RecordNumber" = sp."RecordNumber"
          JOIN "Car" c ON sp."PlateNumber" = c."PlateNumber"
          JOIN "Package" p ON sp."PackageNumber" = p."PackageNumber"
        `);
        res.json(rows);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/payments', async (req, res) => {
      try {
        const { RecordNumber, AmountPaid } = req.body;
        const { rows } = await pool.query(
          'INSERT INTO "Payment" ("RecordNumber", "AmountPaid") VALUES ($1, $2) RETURNING *',
          [RecordNumber, AmountPaid]
        );
        res.status(201).json(rows[0]);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.put('/api/payments/:id', async (req, res) => {
      try {
        const paymentId = req.params.id;
        const { RecordNumber, AmountPaid } = req.body;
        const { rowCount } = await pool.query(
          'UPDATE "Payment" SET "RecordNumber" = $1, "AmountPaid" = $2 WHERE "PaymentNumber" = $3',
          [RecordNumber, AmountPaid, paymentId]
        );
        if (rowCount === 0) {
          return res.status(404).json({ error: 'Payment not found' });
        }
        res.json({ message: 'Payment updated successfully' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.delete('/api/payments/:id', async (req, res) => {
      try {
        const paymentId = req.params.id;
        const { rowCount } = await pool.query(
          'DELETE FROM "Payment" WHERE "PaymentNumber" = $1',
          [paymentId]
        );
        if (rowCount === 0) {
          return res.status(404).json({ error: 'Payment not found' });
        }
        res.json({ message: 'Payment deleted successfully' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Reports endpoint
    app.get('/api/reports', async (req, res) => {
      try {
        const services = await pool.query(`
          SELECT COUNT(*) as "totalServices", SUM(p."PackagePrice") as "totalRevenue"
          FROM "ServicePackage" sp
          JOIN "Package" p ON sp."PackageNumber" = p."PackageNumber"
        `);
        
        const payments = await pool.query(`
          SELECT COUNT(*) as "totalPayments", SUM("AmountPaid") as "totalPaymentsAmount"
          FROM "Payment"
        `);
        
        const popularPackages = await pool.query(`
          SELECT p."PackageName", COUNT(sp."PackageNumber") as "count"
          FROM "ServicePackage" sp
          JOIN "Package" p ON sp."PackageNumber" = p."PackageNumber"
          GROUP BY sp."PackageNumber", p."PackageName"
          ORDER BY "count" DESC
          LIMIT 3
        `);
        
        res.json({
          services: services.rows[0],
          payments: payments.rows[0],
          popularPackages: popularPackages.rows
        });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Register endpoint
    app.post('/api/register', async (req, res) => {
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email and password are required' });
      }
      try {
        const { rows } = await pool.query('SELECT * FROM "User" WHERE "Username" = $1 OR "Email" = $2', [username, email]);
        if (rows.length > 0) {
          return res.status(409).json({ error: 'Username or email already exists' });
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        await pool.query(
          'INSERT INTO "User" ("Username", "Email", "PasswordHash") VALUES ($1, $2, $3)',
          [username, email, hashedPassword]
        );
        res.status(201).json({ message: 'User registered successfully' });
      } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Login endpoint
    app.post('/api/login', async (req, res) => {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }
      try {
        const { rows } = await pool.query('SELECT * FROM "User" WHERE "Username" = $1', [username]);
        if (rows.length === 0) {
          return res.status(401).json({ error: 'Invalid username or password' });
        }
        const user = rows[0];
        const match = await bcrypt.compare(password, user.PasswordHash);
        if (!match) {
          return res.status(401).json({ error: 'Invalid username or password' });
        }
        res.json({ message: 'Login successful' });
      } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
