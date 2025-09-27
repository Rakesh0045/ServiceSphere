// server.js

import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "./Service.js";

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "mysecret";

// Helper middleware to authenticate and get user from token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden
    req.user = user; // Attach user payload to the request object
    next();
  });
};

// ---------------- AUTH ----------------

// NEW & UPDATED: SIGNUP Endpoint
app.post("/api/signup", async (req, res) => {
  // Now accepting 'name'
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert 'name' into the database
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role]
    );

    res.status(201).json({
      message: "User registered successfully",
      id: result.insertId,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// NEW & UPDATED: LOGIN Endpoint
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Missing fields" });

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Add 'name' to the JWT payload
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "6h" }
    );

    // Also return 'name' in the response body
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ---------------- USER PROFILE (NEW) ----------------

// NEW: GET current user's profile
app.get("/api/users/me", authenticateToken, async (req, res) => {
  // The user object is attached by the authenticateToken middleware
  res.json({ user: req.user });
});

// NEW: UPDATE current user's profile
app.put("/api/users/me", authenticateToken, async (req, res) => {
  const { name, email } = req.body;
  const userId = req.user.id;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  try {
    await pool.query(
      "UPDATE users SET name = ?, email = ? WHERE id = ?",
      [name, email, userId]
    );
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Server error while updating profile" });
  }
});


// ---------------- SERVICES CRUD ----------------

// Create service (protected)
app.post("/api/services", authenticateToken, async (req, res) => {
  // Provider ID is now securely taken from the token
  const provider_id = req.user.id;

  const {
    service_name,
    description,
    category,
    price,
    availability,
    location,
    image_url
  } = req.body;

  if (!service_name) {
    return res.status(400).json({ message: "Service name is required" });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO services 
       (provider_id, service_name, description, category, price, availability, location, image_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [provider_id, service_name, description, category, price, availability, location, image_url]
    );
    res.status(201).json({ message: "Service created", service_id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// NEW & UPDATED: Read services with provider's name
app.get("/api/services", async (req, res) => {
  const { category, keyword, location, provider_id } = req.query;

  // This query now JOINS with the users table to get the provider's name
  let query = `
    SELECT 
      s.*, 
      u.name as provider_name 
    FROM services s
    JOIN users u ON s.provider_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (category) { query += " AND s.category LIKE ?"; params.push(`%${category}%`); }
  if (keyword) { query += " AND (s.service_name LIKE ? OR s.description LIKE ?)"; params.push(`%${keyword}%`, `%${keyword}%`); }
  if (location) { query += " AND s.location LIKE ?"; params.push(`%${location}%`); }
  if (provider_id) { query += " AND s.provider_id = ?"; params.push(provider_id); }

  try {
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update service (protected)
app.put("/api/services/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const provider_id = req.user.id; // User ID from token
  const { service_name, description, category, price, availability, location, image_url } = req.body;

  try {
    // Ensure the service belongs to the logged-in provider before updating
    const [result] = await pool.query(
      `UPDATE services SET service_name=?, description=?, category=?, price=?, availability=?, location=?, image_url=? 
       WHERE id=? AND provider_id=?`,
      [service_name, description, category, price, availability, location, image_url, id, provider_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Service not found or you don't have permission to edit it." });
    }
    res.json({ message: "Service updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete service (protected)
app.delete("/api/services/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const provider_id = req.user.id; // User ID from token

  try {
    // Ensure the service belongs to the logged-in provider before deleting
    const [result] = await pool.query("DELETE FROM services WHERE id=? AND provider_id=?", [id, provider_id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Service not found or you don't have permission to delete it." });
    }
    res.json({ message: "Service deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));