import { useEffect, useState } from 'react';
import API from '../api/axios';
import RecordCard from '../components/RecordCard';
import ShareQR from './ShareQR';

const Dashboard = () => {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await API.get('/records/all');
        setRecords(res.data);
      } catch (err) {
        console.error('Failed to fetch records:', err);
      }
    };

    fetchRecords();
  }, []);

  const filtered = records.filter((r) =>
    r.condition?.toLowerCase().includes(search.toLowerCase()) ||
    r.doctor?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4">
      <input
        placeholder="Search by condition or doctor"
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 w-full rounded mb-4"
      />
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((record) => (
          <div key={record._id} className="border rounded p-4 shadow">
            <RecordCard record={record} />
            <ShareQR recordId={record._id} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
