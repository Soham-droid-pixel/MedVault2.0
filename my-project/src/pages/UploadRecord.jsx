import React, { useState } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

const UploadRecord = () => {
  const [form, setForm] = useState({
    doctor: '',
    hospital: '',
    condition: '',
    date: '',
  });
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a file');

    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => formData.append(key, val));
    formData.append('file', file);

    try {
      await API.post('/records/upload', formData);
      navigate('/dashboard');
    } catch (err) {
      alert('Upload failed');
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Upload Medical Record</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="doctor"
          onChange={handleChange}
          placeholder="Doctor Name"
          className="border w-full p-2 rounded"
          required
        />
        <input
          name="hospital"
          onChange={handleChange}
          placeholder="Hospital Name"
          className="border w-full p-2 rounded"
          required
        />
        <input
          name="condition"
          onChange={handleChange}
          placeholder="Medical Condition"
          className="border w-full p-2 rounded"
          required
        />
        <input
          name="date"
          type="date"
          onChange={handleChange}
          className="border w-full p-2 rounded"
          required
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="border w-full p-2 rounded"
          accept="image/*,.pdf"
          required
        />
        <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
          Upload
        </button>
      </form>
    </div>
  );
};

export default UploadRecord;
