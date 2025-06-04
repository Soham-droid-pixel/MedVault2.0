import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/register', form);
      alert(res.data.message);
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4">Register</h2>

        <input type="text" name="name" placeholder="Full Name" required
          onChange={handleChange} className="mb-3 w-full px-3 py-2 border rounded" />
        
        <input type="email" name="email" placeholder="Email" required
          onChange={handleChange} className="mb-3 w-full px-3 py-2 border rounded" />
        
        <input type="password" name="password" placeholder="Password" required
          onChange={handleChange} className="mb-4 w-full px-3 py-2 border rounded" />

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Register
        </button>

        <p className="mt-4 text-sm text-center">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
