import { useState } from 'react';
import API from '../api/axios';
import QRCode from 'qrcode.react';

const ShareQR = ({ recordId }) => {
  const [qrUrl, setQrUrl] = useState('');

  const generateQR = async () => {
    const res = await API.post('/share/generate', { recordId });
    setQrUrl(res.data.qrUrl);
  };

  return (
    <div className="p-4">
      <button onClick={generateQR} className="bg-green-500 text-white px-4 py-2 rounded">
        Generate QR
      </button>
      {qrUrl && <QRCode value={qrUrl} className="mt-4" />}
    </div>
  );
};

export default ShareQR;
