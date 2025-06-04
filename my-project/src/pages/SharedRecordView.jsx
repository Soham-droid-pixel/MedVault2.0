import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const SharedRecordView = () => {
  const { token } = useParams();
  const [record, setRecord] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/share/access/${token}`);
        setRecord(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Something went wrong');
      }
    };
    fetchRecord();
  }, [token]);

  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!record) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Shared Record</h2>
      <p><strong>Doctor:</strong> {record.doctor}</p>
      <p><strong>Hospital:</strong> {record.hospital}</p>
      <p><strong>Condition:</strong> {record.condition}</p>
      <p><strong>Date:</strong> {new Date(record.date).toLocaleDateString()}</p>
      <a href={record.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
        View File
      </a>
    </div>
  );
};

export default SharedRecordView;
