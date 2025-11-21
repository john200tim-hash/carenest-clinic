const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// --- Mongoose Models ---
// We need to define the Doctor model schema to interact with the database.
const DoctorSchema = new mongoose.Schema({ id: String, name: String, email: { type: String, required: true, unique: true }, password: { type: String, required: true } });
const Doctor = mongoose.model('Doctor', DoctorSchema);
const Patient = require('./models/Patient');
const Appointment = require('./models/Appointment');

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
  const { name, email, password, registrationCode } = req.body;

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
      id: `doc_${Date.now()}`, name, 
      email,
      password: hashedPassword,
    });

    const savedDoctor = await newDoctor.save();

    // --- FIX: Automatically log in the user by creating a token ---
    const token = jwt.sign({ id: savedDoctor.id, email: savedDoctor.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Return the token and user info, just like the login route
    res.status(201).json({
      message: 'Registration successful!',
      token,
      id: savedDoctor.id,
      name: savedDoctor.name
    });

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
    // --- FIX: Verify credentials against the database ---
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

    res.json({ message: 'Login successful', token, id: doctor.id, name: doctor.name });

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
// This route is now protected by the 'protect' middleware and fetches real data.
app.get('/api/patients', protect, async (req, res) => {
  try {
    const patients = await Patient.find({});
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch patients' });
  }
});

// --- Protected Patient CRUD Routes (for Doctors) ---

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

// UPDATE a patient's core details
app.put('/api/patients/:id', protect, async (req, res) => {
  try {
    const updatedPatient = await Patient.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true } // This option returns the document after it has been updated
    );
    if (!updatedPatient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(updatedPatient);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update patient', error: error.message });
  }
});

// UPDATE a patient's medical info (for symptoms, diagnoses, etc.)
app.post('/api/patients/:patientId/:infoType', protect, async (req, res) => {
  const { patientId, infoType } = req.params;
  const data = req.body;

  try {
    const patient = await Patient.findOne({ id: patientId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Dynamically push to the correct array in the patient document
    patient[infoType] = patient[infoType] || [];
    patient[infoType].push({ id: `${infoType.slice(0, 4)}_${Date.now()}`, ...data });

    await patient.save();
    res.status(201).json(patient);
  } catch (error) {
    console.error(`Error adding ${infoType}:`, error);
    res.status(500).json({ message: `Failed to add ${infoType}` });
  }
});

// --- Protected Appointment Routes (for Doctors) ---

// GET all appointments for a specific patient
app.get('/api/patients/:id/appointments', protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.params.id });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
});

// --- Protected Appointment Routes (for Doctors) ---

// GET all appointments for a specific doctor
app.get('/api/doctors/:doctorId/appointments', protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.params.doctorId });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
});

// UPDATE appointment status (for doctors)
app.put('/api/appointments/:appointmentId', protect, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body; // Expecting 'status' in the body

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updatedAppointment = await Appointment.findOneAndUpdate(
      { id: appointmentId },
      { status },
      { new: true } // Return the updated document
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(updatedAppointment);
  } catch (error) {
    console.error('Update Appointment Error:', error);
    res.status(500).json({ message: 'Failed to update appointment status' });
  }
});






// --- Public Appointment Request Route (for Patients) ---

app.post('/api/appointments/request', async (req, res) => {
  const { name, emailOrMobile, date, time, reason } = req.body;

  if (!name || !emailOrMobile || !date || !time || !reason) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Find patient or create a new one
    let patient = await Patient.findOne({ emailOrMobile });
    if (!patient) {
      patient = new Patient({
        id: `pat_${Date.now()}`,
        name,
        emailOrMobile,
        // Add default/placeholder values for other required fields
        dateOfBirth: new Date(),
        gender: 'Not specified',
        contactNumber: emailOrMobile,
        address: 'Not specified',
      });
      await patient.save();
    }

    // Create the new appointment
    const appointment = new Appointment({
      id: `appt_${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      date, time, reason,
    });
    await appointment.save();

    // Return the patient object so the frontend can get the ID
    res.status(201).json(patient);

  } catch (error) {
    console.error('Appointment Request Error:', error);
    res.status(500).json({ message: 'Failed to process appointment request.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});