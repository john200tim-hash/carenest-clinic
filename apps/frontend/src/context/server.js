const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Database Connection ---
// Railway will provide the MONGODB_URI as an environment variable
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch(err => console.error('Connection error', err));

app.use(cors()); // Allow requests from your Vercel frontend
app.use(express.json());

// --- API Routes ---
// You will move all your API logic from the Next.js app here.

// Example: Doctor Login Route
app.post('/api/doctor/login', async (req, res) => {
  const { email, password } = req.body;

  // This is where you would query your real database
  // For now, we'll use a placeholder
  if (email === 'john200tim@gmail.com' && password === 'password123') {
    res.json({
      message: 'Login successful',
      token: `mock-jwt-token-for-${email}`,
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Example: Get All Patients Route
app.get('/api/patients', async (req, res) => {
  // Here you would add authentication middleware to check for a doctor's token
  try {
    // const patients = await PatientModel.find({});
    // res.json(patients);
    res.json({ message: "This will return all patients from MongoDB" });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch patients' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});