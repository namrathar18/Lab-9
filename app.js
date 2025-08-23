const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Create uploads folder
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL');
    
    // Create patients table
    const createPatientsTable = `
        CREATE TABLE IF NOT EXISTS patients (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            phone VARCHAR(20) NOT NULL,
            profile_picture VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    db.query(createPatientsTable, (err) => {
        if (err) console.error('Table creation error:', err);
        else console.log('Patients table ready');
    });

    // Create contact_messages table
    const createContactTable = `
        CREATE TABLE IF NOT EXISTS contact_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    db.query(createContactTable, (err) => {
        if (err) console.error('Contact table creation error:', err);
        else console.log('Contact messages table ready');
    });
});

// File upload setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'patient-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only images allowed'), false);
    }
});

// Email setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send email function
const sendEmail = async (email, name) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Hospital Registration Successful',
            html: `
                <h2>Welcome to MediCare Hospital!</h2>
                <p>Dear ${name},</p>
                <p>Your registration has been completed successfully.</p>
                <p>Thank you for choosing our hospital.</p>
                <br>
                <p>Best regards,<br>MediCare Hospital Team</p>
            `
        });
        return true;
    } catch (error) {
        console.error('Email error:', error);
        return false;
    }
};

// Routes

// Contact form submission
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required' });
    }
    const query = 'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)';
    db.query(query, [name, email, message], (err, result) => {
        if (err) {
            console.error('Contact DB error:', err);
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        res.status(201).json({ message: 'Message sent successfully!' });
    });
});

// Test route (no file upload)
app.post('/api/patients/test', async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        
        if (!name || !email || !phone) {
            return res.status(400).json({ error: 'Name, email, and phone are required' });
        }
        
        const query = 'INSERT INTO patients (name, email, phone, profile_picture) VALUES (?, ?, ?, ?)';
        
        db.query(query, [name, email, phone, null], async (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'Email already exists' });
                }
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error: ' + err.message });
            }
            
            // Skip email for now - just respond with success
            let emailSent = false;
            try {
                emailSent = await sendEmail(email, name);
            } catch (emailError) {
                console.error('Email error (continuing anyway):', emailError);
                emailSent = false;
            }
            
            res.status(201).json({
                message: 'Patient registered successfully',
                id: result.insertId,
                emailSent: emailSent
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

// 1. Register patient (CREATE)
app.post('/api/patients', (req, res) => {
    // Check if it's JSON or form-data
    const contentType = req.get('Content-Type');
    
    if (contentType && contentType.includes('application/json')) {
        // Handle JSON request
        handleJsonRegistration(req, res);
    } else {
        // Handle form-data with file upload
        upload.single('profilePicture')(req, res, (err) => {
            if (err) {
                console.error('Multer error:', err);
                return res.status(400).json({ error: 'File upload error: ' + err.message });
            }
            handleFormDataRegistration(req, res);
        });
    }
});

// Handle JSON registration
async function handleJsonRegistration(req, res) {
    try {
        const { name, email, phone } = req.body;
        
        if (!name || !email || !phone) {
            return res.status(400).json({ error: 'Name, email, and phone are required' });
        }
        
        const query = 'INSERT INTO patients (name, email, phone, profile_picture) VALUES (?, ?, ?, ?)';
        
        db.query(query, [name, email, phone, null], async (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'Email already exists' });
                }
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error: ' + err.message });
            }
            
            // Send email
            let emailSent = false;
            try {
                emailSent = await sendEmail(email, name);
            } catch (emailError) {
                console.error('Email error (continuing anyway):', emailError);
            }
            
            res.status(201).json({
                message: 'Patient registered successfully',
                id: result.insertId,
                emailSent: emailSent
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
}

// Handle form-data registration
async function handleFormDataRegistration(req, res) {
    try {
        const { name, email, phone } = req.body;
        const profilePicture = req.file ? req.file.filename : null;
        
        if (!name || !email || !phone) {
            return res.status(400).json({ error: 'Name, email, and phone are required' });
        }
        
        const query = 'INSERT INTO patients (name, email, phone, profile_picture) VALUES (?, ?, ?, ?)';
        
        db.query(query, [name, email, phone, profilePicture], async (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'Email already exists' });
                }
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error: ' + err.message });
            }
            
            // Send email
            let emailSent = false;
            try {
                emailSent = await sendEmail(email, name);
            } catch (emailError) {
                console.error('Email error (continuing anyway):', emailError);
            }
            
            res.status(201).json({
                message: 'Patient registered successfully',
                id: result.insertId,
                emailSent: emailSent
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
}

// 2. Get all patients (READ)
app.get('/api/patients', (req, res) => {
    db.query('SELECT * FROM patients ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(results);
    });
});

// 3. Get single patient (READ)
app.get('/api/patients/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM patients WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length === 0) return res.status(404).json({ error: 'Patient not found' });
        res.json(results[0]);
    });
});

// 4. Update patient (UPDATE)
app.put('/api/patients/:id', upload.single('profilePicture'), (req, res) => {
    const id = req.params.id;
    const { name, email, phone } = req.body;
    const profilePicture = req.file ? req.file.filename : null;
    
    let query, params;
    if (profilePicture) {
        query = 'UPDATE patients SET name = ?, email = ?, phone = ?, profile_picture = ? WHERE id = ?';
        params = [name, email, phone, profilePicture, id];
    } else {
        query = 'UPDATE patients SET name = ?, email = ?, phone = ? WHERE id = ?';
        params = [name, email, phone, id];
    }
    
    db.query(query, params, (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Patient not found' });
        res.json({ message: 'Patient updated successfully' });
    });
});

// 5. Delete patient (DELETE)
app.delete('/api/patients/:id', (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM patients WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Patient not found' });
        res.json({ message: 'Patient deleted successfully' });
    });
});

// Serve HTML page

// Serve HTML pages for multi-page website
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/about.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});
app.get('/services.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'services.html'));
});
app.get('/contact.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});