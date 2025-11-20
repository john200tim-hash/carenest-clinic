const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// --- Mongoose Models ---
// We need to define the Doctor model schema to interact with the database.
const DoctorSchema = new mongoose.Schema({ id: String, email: { type: String, unique: true }, password: String });
const Doctor = mongoose.model('Doctor', DoctorSchema);
const Patient = require('./models/Patient'); // Import the Patient model

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

// --- Authentication Middleware ---
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Token is not valid' }); // Forbidden
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: 'Not authorized, no token' }); // Unauthorized
  }
};


// --- Protected Patient Route ---
// The 'protect' middleware will run before the main route logic
app.get('/api/patients', protect, async (req, res) => {
  try {
    // Now we can safely fetch and return patient data
    const patients = await Patient.find({});
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch patients' });
  }
});

// --- Protected Patient CRUD Routes ---

// CREATE a new patient
app.post('/api/patients', protect, async (req, res) => {
  try {
    const newPatient = new Patient({
      id: `pat_${Date.now()}`,
      ...req.body
    });
    await newPatient.save();
    res.status(201).json(newPatient);
  } catch (error) {
    console.error('Create Patient Error:', error);
    res.status(400).json({ message: 'Failed to create patient', error: error.message });
  }
});

// GET a single patient by ID
app.get('/api/patients/:id', protect, async (req, res) => {
  try {
    const patient = await Patient.findOne({ id: req.params.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch patient' });
  }
});

// UPDATE a patient by ID
app.put('/api/patients/:id', protect, async (req, res) => {
  try {
    const updatedPatient = await Patient.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!updatedPatient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(updatedPatient);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update patient', error: error.message });
  }
});

// DELETE a patient by ID
app.delete('/api/patients/:id', protect, async (req, res) => {
  try {
    const deletedPatient = await Patient.findOneAndDelete({ id: req.params.id });
    if (!deletedPatient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.status(200).json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete patient' });
  }
});

// --- Appointment Request Route ---
// This is a public route, so it does not use the 'protect' middleware.
app.post('/api/appointments/request', async (req, res) => {
  try {
    const { name, emailOrMobile, date, time, reason } = req.body;
    console.log('Received appointment request:', { name, emailOrMobile, date, time, reason });

    // In a real application, you would save this to a new 'Appointments' collection in your database.
    // For now, we just acknowledge the request and send a success response.
    res.status(201).json({ message: 'Appointment request received successfully. We will contact you shortly.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process appointment request.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// This is a public route, so it does not use the 'protect' middleware.
app.post('/api/appointments/request', async (req, res) => {
  try {
    // Extract data from the request body
    const { name, emailOrMobile, date, time, reason } = req.body;
    console.log('Received appointment request:', { name, emailOrMobile, date, time, reason });

    // In a real application, you would save this to a new 'Appointments' collection in your database.
    // For now, we just acknowledge the request and send a success response.

    // Send a 201 Created status with a success message
    res.status(201).json({ message: 'Appointment request received successfully. We will contact you shortly.' });
  } catch (error) {
    // If there is an error, send a 500 Internal Server Error with a JSON error message
    res.status(500).json({ message: 'Failed to process appointment request.' });
  }
});

