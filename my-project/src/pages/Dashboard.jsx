import { useEffect, useState } from 'react';
import API from '../api/axios';
import RecordCard from '../components/RecordCard';

const Dashboard = () => {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    API.get('/records/all').then((res) => setRecords(res.data));
  }, []);

  const filtered = records.filter(r =>
    r.condition.toLowerCase().includes(search.toLowerCase()) ||
    r.doctor.toLowerCase().includes(search.toLowerCase())
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
          <RecordCard key={record._id} record={record} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
