// server.js (Corrected with better error logging)

import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "./Service.js";
import { format } from 'date-fns';

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "mysecret";

// Helper middleware to authenticate and get user from token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// ... AUTH and USER PROFILE routes are unchanged ...

// ---------------- AUTH ----------------
app.post("/api/signup", async (req, res) => {
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
        const [result] = await pool.query(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            [name, email, hashedPassword, role]
        );
        res.status(201).json({ message: "User registered successfully", id: result.insertId });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

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
        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: "6h" }
        );
        res.json({
            message: "Login successful",
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// ---------------- USER PROFILE ----------------
app.get("/api/users/me", authenticateToken, async (req, res) => {
    res.json({ user: req.user });
});

app.put("/api/users/me", authenticateToken, async (req, res) => {
    const { name, email } = req.body;
    const userId = req.user.id;
    if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required" });
    }
    try {
        await pool.query("UPDATE users SET name = ?, email = ? WHERE id = ?", [name, email, userId]);
        res.json({ message: "Profile updated successfully" });
    } catch (err) {
        console.error("Profile update error:", err);
        res.status(500).json({ message: "Server error while updating profile" });
    }
});


// ---------------- SERVICES CRUD ----------------
app.post("/api/services", authenticateToken, async (req, res) => {
    const provider_id = req.user.id;
    const { service_name, description, category, price, availability, location, image_url } = req.body;
    if (!service_name) {
        return res.status(400).json({ message: "Service name is required" });
    }
    try {
        const [result] = await pool.query(
            `INSERT INTO services (provider_id, service_name, description, category, price, availability, location, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [provider_id, service_name, description, category, price, availability, location, image_url]
        );
        res.status(201).json({ message: "Service created", service_id: result.insertId });
    } catch (err) {
        console.error("Service creation error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// GET SERVICES - UPDATED WITH DETAILED LOGGING
app.get("/api/services", async (req, res) => {
    const { category, keyword, location, provider_id } = req.query;
    let query = `
        SELECT s.*, u.name as provider_name 
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
        // THIS IS THE NEW LOGGING
        console.error("!!! DATABASE ERROR fetching services:", err);
        res.status(500).json({ message: "Server error" });
    }
});

app.put("/api/services/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const provider_id = req.user.id;
    const { service_name, description, category, price, availability, location, image_url } = req.body;
    try {
        const [result] = await pool.query(
            `UPDATE services SET service_name=?, description=?, category=?, price=?, availability=?, location=?, image_url=? WHERE id=? AND provider_id=?`,
            [service_name, description, category, price, availability, location, image_url, id, provider_id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Service not found or you don't have permission to edit it." });
        }
        res.json({ message: "Service updated successfully" });
    } catch (err) {
        console.error("Service update error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

app.delete("/api/services/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const provider_id = req.user.id;
    try {
        const [result] = await pool.query("DELETE FROM services WHERE id=? AND provider_id=?", [id, provider_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Service not found or you don't have permission to delete it." });
        }
        res.json({ message: "Service deleted successfully" });
    } catch (err) {
        console.error("Service delete error:", err);
        res.status(500).json({ message: "Server error" });
    }
});


// ... SCHEDULES and other BOOKING routes are unchanged ...
// ---------------- SCHEDULES ----------------
app.get("/api/schedules", authenticateToken, async (req, res) => {
    const provider_id = req.user.id;
    try {
        const [schedule] = await pool.query("SELECT * FROM provider_schedules WHERE provider_id = ?", [provider_id]);
        res.json(schedule);
    } catch (err) {
        console.error("Error fetching schedule:", err);
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/api/schedules", authenticateToken, async (req, res) => {
    const provider_id = req.user.id;
    const { schedules } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query("DELETE FROM provider_schedules WHERE provider_id = ?", [provider_id]);
        for (const s of schedules) {
            if (s.is_available) {
                await connection.query(
                    "INSERT INTO provider_schedules (provider_id, day_of_week, start_time, end_time, is_available) VALUES (?, ?, ?, ?, ?)",
                    [provider_id, s.day_of_week, s.start_time, s.end_time, s.is_available]
                );
            }
        }
        await connection.commit();
        res.status(201).json({ message: "Schedule updated successfully." });
    } catch (err) {
        await connection.rollback();
        console.error("Error updating schedule:", err);
        res.status(500).json({ message: "Server error while updating schedule." });
    } finally {
        connection.release();
    }
});

// ---------------- AVAILABILITY & BOOKINGS ----------------
app.get("/api/availability/:provider_id/:date", async (req, res) => {
    const { provider_id, date } = req.params;
    const dayOfWeek = new Date(date).getDay();
    try {
        const [schedules] = await pool.query(
            "SELECT start_time, end_time FROM provider_schedules WHERE provider_id = ? AND day_of_week = ? AND is_available = TRUE",
            [provider_id, dayOfWeek]
        );
        if (schedules.length === 0) {
            return res.json({ availableSlots: [] });
        }
        const schedule = schedules[0];
        const [bookings] = await pool.query(
            "SELECT booking_start_time FROM bookings WHERE provider_id = ? AND DATE(booking_start_time) = ?",
            [provider_id, date]
        );
        const bookedTimes = new Set(bookings.map(b => format(new Date(b.booking_start_time), 'HH:mm:ss')));
        const availableSlots = [];
        const serviceDurationHours = 1;
        let currentTime = new Date(`${date}T${schedule.start_time}`);
        const endTime = new Date(`${date}T${schedule.end_time}`);
        while (currentTime < endTime) {
            const slotTimeStr = format(currentTime, 'HH:mm:ss');
            if (!bookedTimes.has(slotTimeStr)) {
                availableSlots.push(format(currentTime, 'HH:mm'));
            }
            currentTime.setHours(currentTime.getHours() + serviceDurationHours);
        }
        res.json({ availableSlots });
    } catch (err) {
        console.error("Error fetching availability:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.post("/api/bookings", authenticateToken, async (req, res) => {
    const customer_id = req.user.id;
    const { service_id, provider_id, booking_start_time } = req.body;
    if (!service_id || !provider_id || !booking_start_time) {
        return res.status(400).json({ message: "Missing required booking information." });
    }
    const startTime = new Date(booking_start_time);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [existingBookings] = await connection.query(
            `SELECT * FROM bookings WHERE provider_id = ? AND booking_start_time = ? FOR UPDATE`,
            [provider_id, format(startTime, 'yyyy-MM-dd HH:mm:ss')]
        );
        if (existingBookings.length > 0) {
            await connection.rollback();
            return res.status(409).json({ message: "This time slot has just been booked. Please select another." });
        }
        await connection.query(
            `INSERT INTO bookings (service_id, customer_id, provider_id, booking_start_time, booking_end_time, status) VALUES (?, ?, ?, ?, ?, 'Pending')`,
            [service_id, customer_id, provider_id, startTime, endTime]
        );
        await connection.commit();
        res.status(201).json({ message: "Booking created successfully. Waiting for provider confirmation." });
    } catch (err) {
        await connection.rollback();
        console.error("Booking creation error:", err);
        res.status(500).json({ message: "Server error while creating booking." });
    } finally {
        connection.release();
    }
});

app.get("/api/bookings", authenticateToken, async (req, res) => {
    const { id: userId, role } = req.user;
    const userRole = role ? role.toLowerCase() : '';
    const baseQuery = `
        SELECT b.id, b.status, b.booking_start_time, s.service_name, s.price,
               cust.name as customer_name, prov.name as provider_name
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        JOIN users cust ON b.customer_id = cust.id
        JOIN users prov ON b.provider_id = prov.id
    `;
    let query = '';
    if (userRole === 'customer') {
        query = `${baseQuery} WHERE b.customer_id = ? ORDER BY b.booking_start_time DESC`;
    } else if (userRole === 'service provider') {
        query = `${baseQuery} WHERE b.provider_id = ? ORDER BY b.booking_start_time DESC`;
    } else {
        return res.status(403).json({ message: "Unauthorized: Role not recognized" });
    }
    try {
        const [bookings] = await pool.query(query, [userId]);
        res.json(bookings);
    } catch (err) {
        console.error("Error fetching bookings:", err);
        res.status(500).json({ message: "Server error" });
    }
});

app.put("/api/bookings/:bookingId/status", authenticateToken, async (req, res) => {
    const { bookingId } = req.params;
    const { status } = req.body;
    const provider_id = req.user.id;
    if (!status) {
        return res.status(400).json({ message: "Status is required." });
    }
    try {
        const [result] = await pool.query(
            "UPDATE bookings SET status = ? WHERE id = ? AND provider_id = ?",
            [status, bookingId, provider_id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Booking not found or you do not have permission to update it." });
        }
        res.json({ message: `Booking status updated to ${status}` });
    } catch (err) {
        console.error("Error updating booking status:", err);
        res.status(500).json({ message: "Server Error" });
    }
});


// --- Server Listen ---
app.listen(5000, () => console.log("🚀 Server running on port 5000"));