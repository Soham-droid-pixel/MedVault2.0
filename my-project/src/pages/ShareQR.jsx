import { useState } from 'react';
import API from '../api/axios';
import QRCode from 'react-qr-code'; // ✅ New package

const ShareQR = ({ recordId }) => {
  const [qrUrl, setQrUrl] = useState('');

  const generateQR = async () => {
    try {
      const res = await API.post('/share/generate', { recordId });
      setQrUrl(res.data.qrUrl);
    } catch (err) {
      console.error('QR Generation Failed:', err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="p-4">
      <button onClick={generateQR} className="bg-green-500 text-white px-4 py-2 rounded">
        Generate QR
      </button>
      {qrUrl && (
        <div className="mt-4 bg-white p-4 inline-block rounded shadow">
          <QRCode value={qrUrl} size={256} />
        </div>
      )}
    </div>
  );
};

export default ShareQR;
