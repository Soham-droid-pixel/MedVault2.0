import React from 'react';

const RecordCard = ({ record }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 border hover:shadow-lg transition">
      <p className="text-lg font-semibold">{record.fileName}</p>
      <p className="text-sm text-gray-600">Doctor: {record.doctor}</p>
      <p className="text-sm text-gray-600">Hospital: {record.hospital}</p>
      <p className="text-sm text-gray-600">Condition: {record.condition}</p>
      <p className="text-sm text-gray-600">Date: {new Date(record.date).toLocaleDateString()}</p>
      <a
        href={record.fileUrl}
        target="_blank"
        rel="noreferrer"
        className="text-blue-600 hover:underline mt-2 block"
      >
        View Record
      </a>
    </div>
  );
};

export default RecordCard;
