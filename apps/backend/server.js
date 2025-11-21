const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

// --- PostgreSQL Database Connection ---
// The 'pg' library automatically uses the DATABASE_URL environment variable on Railway.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
pool.connect()
  .then(() => console.log('Successfully connected to PostgreSQL'))
  .catch(err => console.error('Connection error', err));

app.use(cors());
app.use(express.json());

// --- API Routes ---

// --- Doctor Registration ---
const REGISTRATION_CODE = 'JOHN200TIM#';

app.post('/api/doctor/register', async (req, res) => {
  const { name, email, password, registrationCode } = req.body;

  if (registrationCode !== REGISTRATION_CODE) {
    return res.status(400).json({ message: 'Invalid registration code.' });
  }
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  try {
    const existingDoctorResult = await pool.query('SELECT * FROM doctors WHERE email = $1', [email]);
    const existingDoctor = existingDoctorResult.rows[0];
    if (existingDoctor) {
      return res.status(409).json({ message: 'A doctor with this email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newDoctorId = `doc_${Date.now()}`;

    const insertResult = await pool.query(
      'INSERT INTO doctors (id, name, email, password) VALUES ($1, $2, $3, $4) RETURNING *',
      [newDoctorId, name, email, hashedPassword]
    );
    const savedDoctor = insertResult.rows[0];
    const token = jwt.sign({ id: savedDoctor.id, email: savedDoctor.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

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
    const result = await pool.query('SELECT * FROM doctors WHERE email = $1', [email]);
    const doctor = result.rows[0];
    if (!doctor) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

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

    // --- Live Authentication Logic ---
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Token is not valid' });
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// --- Protected Patient Route ---
app.get('/api/patients', protect, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM patients ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch Patients Error:', error);
    res.status(500).json({ message: 'Failed to fetch patients' });
  }
});

// --- Protected Patient CRUD Routes (for Doctors) ---
app.get('/api/patients/:id', protect, async (req, res) => {
  try {
    // Fetch patient data directly from PostgreSQL
    const patientResult = await pool.query('SELECT * FROM patients WHERE id = $1', [req.params.id]);
    const patient = patientResult.rows[0];
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Fetch related data from other tables
    const [symptoms, diagnoses, prescriptions, bills, appointments] = await Promise.all([
      pool.query('SELECT * FROM symptoms WHERE patient_id = $1', [req.params.id]).then(r => r.rows),
      pool.query('SELECT * FROM diagnoses WHERE patient_id = $1', [req.params.id]).then(r => r.rows),
      pool.query('SELECT * FROM prescriptions WHERE patient_id = $1', [req.params.id]).then(r => r.rows),
      pool.query('SELECT * FROM bills WHERE patient_id = $1', [req.params.id]).then(r => r.rows),
      pool.query('SELECT * FROM appointments WHERE patient_id = $1', [req.params.id]).then(r => r.rows),
    ]);

    const fullPatientData = { ...patient, symptoms, diagnoses, prescriptions, bills, appointments };

    res.json(fullPatientData);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch patient data' });
  }
});

app.put('/api/patients/:id', protect, async (req, res) => {
  try {
    // This endpoint updates a patient's core demographic information.
    const { name, dateOfBirth, gender, emailOrMobile, contactNumber, address, medicalHistory } = req.body;
    const result = await pool.query(
      'UPDATE patients SET name = $1, date_of_birth = $2, gender = $3, email_or_mobile = $4, contact_number = $5, address = $6, medical_history = $7 WHERE id = $8 RETURNING *',
      [name, dateOfBirth, gender, emailOrMobile, contactNumber, address, medicalHistory, req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update patient', error: error.message });
  }
});

app.post('/api/patients/:patientId/:infoType', protect, async (req, res) => {
  const { patientId, infoType } = req.params;
  const data = req.body;
  const newId = `${infoType.slice(0, 4)}_${Date.now()}`;

  try {
    let query, params;
    switch (infoType) {
      case 'symptoms':
        query = 'INSERT INTO symptoms (id, patient_id, description, date, severity) VALUES ($1, $2, $3, $4, $5)';
        params = [newId, patientId, data.description, data.date, data.severity];
        break;
      case 'diagnoses':
        query = 'INSERT INTO diagnoses (id, patient_id, condition, date, notes) VALUES ($1, $2, $3, $4, $5)';
        params = [newId, patientId, data.condition, data.date, data.notes];
        break;
      case 'prescriptions':
        query = 'INSERT INTO prescriptions (id, patient_id, medication, dosage, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6)';
        params = [newId, patientId, data.medication, data.dosage, data.startDate, data.endDate];
        break;
      case 'bills':
        query = 'INSERT INTO bills (id, patient_id, item, bill, date, status) VALUES ($1, $2, $3, $4, $5, $6)';
        params = [newId, patientId, data.item, data.bill, data.date, data.status];
        break;
      default:
        return res.status(400).json({ message: 'Invalid medical info type' });
    }

    await pool.query(query, params);
    // To keep the response simple, we just confirm success. The frontend will refetch.
    res.status(201).json({ message: `${infoType} added successfully.` });

  } catch (error) {
    console.error(`Error adding ${infoType}:`, error);
    res.status(500).json({ message: `Failed to add ${infoType}` });
  }
});

// --- Protected Appointment Routes (for Doctors) ---
app.get('/api/patients/:id/appointments', protect, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM appointments WHERE patient_id = $1', [req.params.id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
});

app.get('/api/doctors/:doctorId/appointments', protect, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM appointments WHERE doctor_id = $1', [req.params.doctorId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
});

app.put('/api/appointments/:appointmentId', protect, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    const result = await pool.query(
      'UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *',
      [status, appointmentId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update Appointment Error:', error);
    res.status(500).json({ message: 'Failed to update appointment status' });
  }
});

// --- Doctor Creates Appointment Route ---
app.post('/api/appointments/doctor-create', protect, async (req, res) => {
  const { patientId, date, time, reason } = req.body;
  const doctorId = req.user.id; // Get doctor's ID from the token middleware

  if (!patientId || !date || !time || !reason) {
    return res.status(400).json({ message: 'Patient, date, time, and reason are required.' });
  }

  try {
    const patientResult = await pool.query('SELECT name FROM patients WHERE id = $1', [patientId]);
    const patient = patientResult.rows[0];
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    const newAppointmentId = `appt_${Date.now()}`;
    const insertResult = await pool.query(
      'INSERT INTO appointments (id, patient_id, doctor_id, patient_name, date, time, reason, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [newAppointmentId, patientId, doctorId, patient.name, date, time, reason, 'confirmed']
    );

    const newAppointment = insertResult.rows[0];
    res.status(201).json(newAppointment);

  } catch (error) {
    console.error('Doctor Create Appointment Error:', error);
    res.status(500).json({ message: 'Failed to create appointment.' });
  }
});


// --- Public Appointment Request Route (for Patients) ---
app.post('/api/appointments/request', async (req, res) => {
  const { name, emailOrMobile, date, time, reason } = req.body;
  if (!name || !emailOrMobile || !date || !time || !reason) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    // --- DEFINITIVE FIX: Find a doctor to assign the new appointment to ---
    const doctorResult = await pool.query('SELECT id FROM doctors LIMIT 1');
    const assignedDoctor = doctorResult.rows[0];

    if (!assignedDoctor) {
      return res.status(500).json({ message: 'No doctors are available in the system to handle appointments.' });
    }

    const patientResult = await pool.query('SELECT * FROM patients WHERE email_or_mobile = $1', [emailOrMobile]);
    let patient = patientResult.rows[0];

    if (!patient) {
      const newPatientId = `pat_${Date.now()}`;
      const newPatientResult = await pool.query(
        'INSERT INTO patients (id, name, date_of_birth, gender, email_or_mobile, contact_number, address) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [newPatientId, name, new Date('1900-01-01'), 'Not specified', emailOrMobile, emailOrMobile, 'Not specified']
      );
      patient = newPatientResult.rows[0];
    }
    const newAppointmentId = `appt_${Date.now()}`;
    await pool.query(
      'INSERT INTO appointments (id, patient_id, doctor_id, patient_name, date, time, reason) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [newAppointmentId, patient.id, assignedDoctor.id, patient.name, date, time, reason]
    );
    res.status(201).json(patient); // Return the patient object as before
  } catch (error) {
    console.error('Appointment Request Error:', error);
    res.status(500).json({ message: 'Failed to process appointment request.' });
  }
});

// --- Public Patient Status Endpoint (for patients to view their own status) ---
app.get('/api/public/patients/:id', async (req, res) => {
  try {
    const patientResult = await pool.query('SELECT * FROM patients WHERE id = $1', [req.params.id]);
    const patient = patientResult.rows[0];
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Fetch related data for the public view
    const [symptoms, diagnoses, prescriptions, bills, appointments] = await Promise.all([
      pool.query('SELECT * FROM symptoms WHERE patient_id = $1', [req.params.id]).then(r => r.rows),
      pool.query('SELECT * FROM diagnoses WHERE patient_id = $1', [req.params.id]).then(r => r.rows),
      pool.query('SELECT * FROM prescriptions WHERE patient_id = $1', [req.params.id]).then(r => r.rows),
      pool.query('SELECT * FROM bills WHERE patient_id = $1', [req.params.id]).then(r => r.rows),
      pool.query('SELECT * FROM appointments WHERE patient_id = $1', [req.params.id]).then(r => r.rows),
    ]);

    res.json({ ...patient, symptoms, diagnoses, prescriptions, bills, appointments });
  } catch (error) {
    console.error('Public Patient Fetch Error:', error);
    res.status(500).json({ message: 'Failed to fetch public patient data.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
