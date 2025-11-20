'use client';

import React, { useState } from 'react';
import { Appointment } from '@/types/appointment';

  const [error, setError] = useState<string | null>(null);

  // Initialize form data with all required fields from the Appointment type
  const [formData, setFormData] = useState<Omit<Appointment, 'id' | 'status'>>({ // Omit id and status
    patientId: '',
    doctorId: '',
    date: new Date(),
    time: '',
    patientName: '', // Add patientName here
    reason: '',
  });


