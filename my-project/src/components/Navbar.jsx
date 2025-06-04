import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">MedVault</Link>
      <div className="space-x-4">
        <Link to="/dashboard" className="text-gray-700">Dashboard</Link>
        <Link to="/upload" className="text-gray-700">Upload</Link>
        <Link to="/appointments" className="text-gray-700">Appointments</Link>
        <Link to="/login" className="text-blue-600 font-semibold">Login</Link>
      </div>
    </nav>
  );
};

export default Navbar;

