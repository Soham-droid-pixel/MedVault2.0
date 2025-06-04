import React, { useEffect, useState } from 'react';
import API from '../api/axios';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({ doctor: '', date: '', notes: '' });

  const fetchAppointments = async () => {
    const res = await API.get('/appointments');
    setAppointments(res.data);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await API.post('/appointments', form);
    setForm({ doctor: '', date: '', notes: '' });
    fetchAppointments();
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Add Appointment</h2>
      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <input
          name="doctor"
          onChange={handleChange}
          value={form.doctor}
          placeholder="Doctor Name"
          className="border p-2 w-full rounded"
          required
        />
        <input
          name="date"
          type="datetime-local"
          onChange={handleChange}
          value={form.date}
          className="border p-2 w-full rounded"
          required
        />
        <textarea
          name="notes"
          onChange={handleChange}
          value={form.notes}
          placeholder="Optional Notes"
          className="border p-2 w-full rounded"
        />
        <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          Add
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-2">Your Appointments</h2>
      <div className="space-y-2">
        {appointments.map((appt) => (
          <div
            key={appt._id}
            className="bg-white p-3 border rounded shadow-sm"
          >
            <p className="font-semibold">Dr. {appt.doctor}</p>
            <p className="text-sm text-gray-600">{new Date(appt.date).toLocaleString()}</p>
            {appt.notes && <p className="text-sm">{appt.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Appointments;
