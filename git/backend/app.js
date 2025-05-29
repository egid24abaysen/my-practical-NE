// backend/server.js
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 3600000 }
}));


// Database initialization function
async function initializeDatabase() {
  let connection;
  try {
    // Connect to MySQL without specifying a database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'CWSMS'}`);
    await connection.query(`USE ${process.env.DB_NAME || 'cwsms'}`);

    // Create tables if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Package (
        PackageNumber INT AUTO_INCREMENT PRIMARY KEY,
        PackageName VARCHAR(100) NOT NULL,
        PackageDescription TEXT,
        PackagePrice DECIMAL(10, 2) NOT NULL
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS User (
        UserID INT AUTO_INCREMENT PRIMARY KEY,
        Username VARCHAR(50) NOT NULL UNIQUE,
        Email VARCHAR(100) NOT NULL UNIQUE,
        PasswordHash VARCHAR(255) NOT NULL,
        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS Car (
        PlateNumber VARCHAR(20) PRIMARY KEY,
        CarType VARCHAR(50) NOT NULL,
        CarSize VARCHAR(20) NOT NULL,
        DriverName VARCHAR(100) NOT NULL,
        PhoneNumber VARCHAR(20) NOT NULL
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS ServicePackage (
        RecordNumber INT AUTO_INCREMENT PRIMARY KEY,
        PlateNumber VARCHAR(20) NOT NULL,
        PackageNumber INT NOT NULL,
        ServiceDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (PlateNumber) REFERENCES Car(PlateNumber),
        FOREIGN KEY (PackageNumber) REFERENCES Package(PackageNumber)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS Payment (
        PaymentNumber INT AUTO_INCREMENT PRIMARY KEY,
        RecordNumber INT NOT NULL,
        AmountPaid DECIMAL(10, 2) NOT NULL,
        PaymentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (RecordNumber) REFERENCES ServicePackage(RecordNumber)
      )
    `);

    console.log('Database and tables initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  } finally {
    if (connection) await connection.end();
  }
}

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cwsms',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database before starting the server
initializeDatabase()
  .then(() => {
    // Package endpoints
    app.get('/api/packages', async (req, res) => {
      try {
        const [rows] = await pool.query('SELECT * FROM Package');
        res.json(rows);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/packages', async (req, res) => {
      try {
        const { PackageName, PackageDescription, PackagePrice } = req.body;
        const [result] = await pool.query(
          'INSERT INTO Package (PackageName, PackageDescription, PackagePrice) VALUES (?, ?, ?)',
          [PackageName, PackageDescription, PackagePrice]
        );
        res.status(201).json({ id: result.insertId });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Car endpoints
    app.get('/api/cars', async (req, res) => {
      try {
        const [rows] = await pool.query('SELECT * FROM Car');
        res.json(rows);
        console.log(rows);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/cars', async (req, res) => {
      try {
        const { PlateNumber, CarType, CarSize, DriverName, PhoneNumber } = req.body;
        const [result] = await pool.query(
          'INSERT INTO Car (PlateNumber, CarType, CarSize, DriverName, PhoneNumber) VALUES (?, ?, ?, ?, ?)',
          [PlateNumber, CarType, CarSize, DriverName, PhoneNumber]
        );
        res.status(201).json({ id: PlateNumber });
      } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
      }
    });

 // ServicePackage endpoints
    app.get('/api/services', async (req, res) => {
      try {
        const [rows] = await pool.query(`
          SELECT sp.RecordNumber, c.PlateNumber, c.DriverName, 
                 p.PackageName, p.PackagePrice, sp.ServiceDate
          FROM ServicePackage sp
          JOIN Car c ON sp.PlateNumber = c.PlateNumber
          JOIN Package p ON sp.PackageNumber = p.PackageNumber
        `);
        res.json(rows);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/services', async (req, res) => {
      try {
        const { PlateNumber, PackageNumber } = req.body;
        const [result] = await pool.query(
          'INSERT INTO ServicePackage (PlateNumber, PackageNumber) VALUES (?, ?)',
          [PlateNumber, PackageNumber]
        );
        res.status(201).json({ id: result.insertId });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Update service endpoint
    app.put('/api/services/:id', async (req, res) => {
      try {
        const serviceId = req.params.id;
        const { PlateNumber, PackageNumber } = req.body;
        const [result] = await pool.query(
          'UPDATE ServicePackage SET PlateNumber = ?, PackageNumber = ? WHERE RecordNumber = ?',
          [PlateNumber, PackageNumber, serviceId]
        );
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Service not found' });
        }
        res.json({ message: 'Service updated successfully' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Delete service endpoint
    app.delete('/api/services/:id', async (req, res) => {
      try {
        const serviceId = req.params.id;
        const [result] = await pool.query(
          'DELETE FROM ServicePackage WHERE RecordNumber = ?',
          [serviceId]
        );
        if (result.affectedRows === 0) {
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
        const [rows] = await pool.query(`
          SELECT py.PaymentNumber, py.AmountPaid, py.PaymentDate,
                 sp.RecordNumber, c.PlateNumber, c.DriverName,
                 p.PackageName, p.PackagePrice
          FROM Payment py
          JOIN ServicePackage sp ON py.RecordNumber = sp.RecordNumber
          JOIN Car c ON sp.PlateNumber = c.PlateNumber
          JOIN Package p ON sp.PackageNumber = p.PackageNumber
        `);
        res.json(rows);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/payments', async (req, res) => {
      try {
        const { RecordNumber, AmountPaid } = req.body;
        const [result] = await pool.query(
          'INSERT INTO Payment (RecordNumber, AmountPaid) VALUES (?, ?)',
          [RecordNumber, AmountPaid]
        );
        res.status(201).json({ id: result.insertId });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Add PUT endpoint to update payment
    app.put('/api/payments/:id', async (req, res) => {
      try {
        const paymentId = req.params.id;
        const { RecordNumber, AmountPaid } = req.body;
        const [result] = await pool.query(
          'UPDATE Payment SET RecordNumber = ?, AmountPaid = ? WHERE PaymentNumber = ?',
          [RecordNumber, AmountPaid, paymentId]
        );
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Payment not found' });
        }
        res.json({ message: 'Payment updated successfully' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Add DELETE endpoint to delete payment
    app.delete('/api/payments/:id', async (req, res) => {
      try {
        const paymentId = req.params.id;
        const [result] = await pool.query(
          'DELETE FROM Payment WHERE PaymentNumber = ?',
          [paymentId]
        );
        if (result.affectedRows === 0) {
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
        const [services] = await pool.query(`
          SELECT COUNT(*) as totalServices, SUM(p.PackagePrice) as totalRevenue
          FROM ServicePackage sp
          JOIN Package p ON sp.PackageNumber = p.PackageNumber
        `);
        
        const [payments] = await pool.query(`
          SELECT COUNT(*) as totalPayments, SUM(AmountPaid) as totalPaymentsAmount
          FROM Payment
        `);
        
        const [popularPackages] = await pool.query(`
          SELECT p.PackageName, COUNT(sp.PackageNumber) as count
          FROM ServicePackage sp
          JOIN Package p ON sp.PackageNumber = p.PackageNumber
          GROUP BY sp.PackageNumber
          ORDER BY count DESC
          LIMIT 3
        `);
        
        res.json({
          services: services[0],
          payments: payments[0],
          popularPackages
        });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email and password are required' });
  }
  try {
    // Check if user exists
    const [existingUser] = await pool.query('SELECT * FROM User WHERE Username = ? OR Email = ?', [username, email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // Insert user
    await pool.query('INSERT INTO User (Username, Email, PasswordHash) VALUES (?, ?, ?)', [username, email, hashedPassword]);
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
    // Find user
    const [rows] = await pool.query('SELECT * FROM User WHERE Username = ?', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const user = rows[0];
    // Compare password
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