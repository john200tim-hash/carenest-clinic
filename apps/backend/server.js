const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// --- Mongoose Models ---
// We need to define the Doctor model schema to interact with the database.
const DoctorSchema = new mongoose.Schema({ id: String, email: { type: String, unique: true }, password: String });
const Doctor = mongoose.model('Doctor', DoctorSchema);

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

// --- Doctor Registration ---
const REGISTRATION_CODE = 'JOHN200TIM#'; // Keep your registration code secure

app.post('/api/doctor/register', async (req, res) => {
  const { email, password, registrationCode } = req.body;

  if (registrationCode !== REGISTRATION_CODE) {
    return res.status(400).json({ message: 'Invalid registration code.' });
  }
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(409).json({ message: 'A doctor with this email is already registered.' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    const newDoctor = new Doctor({
      id: `doc_${Date.now()}`,
      email,
      password: hashedPassword,
    });

    await newDoctor.save();

    res.status(201).json({ message: 'Registration successful. Please log in.' });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'An unexpected error occurred.' });
  }
});

// --- Doctor Login ---
app.post('/api/doctor/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create and sign a JWT
    const token = jwt.sign({ id: doctor.id, email: doctor.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ message: 'Login successful', token });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'An unexpected error occurred.' });
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