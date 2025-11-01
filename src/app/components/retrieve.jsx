// --- NEW Component: RetrieveItem ---
// ... (component remains unchanged) ...
import {TextIcon, ImageIcon, AudioIcon,VideoIcon,FileIcon,CopyIcon, CheckIcon, AlertIcon, CloseIcon} from '../components/icons.jsx';
import { useState } from 'react';

export const RetrieveItem = ({ onRetrieve, status, onClose }) => {
  const [code, setCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.trim()) {
      onRetrieve(code.trim());
      setCode('');
    }
  };

  return (
    <div className="relative w-full rounded-b-lg rounded-tr-lg bg-gray-800 p-4 shadow-lg">
      <button
        onClick={onClose}
        className="btn-ghost btn-sm btn-circle absolute right-2 top-2 rounded-full p-1 text-gray-500 hover:bg-gray-700 hover:text-white"
        aria-label="Close"
      >
        <CloseIcon />
      </button>
      <h3 className="mb-2 font-semibold text-gray-300">Retrieve Item</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter 6-character code..."
          className="input input-bordered w-full rounded-md border border-gray-700 bg-gray-900 p-3 text-gray-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength="6"
        />
        <button
          type="submit"
          className="btn-primary btn mt-2 w-full rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
        >
          Retrieve
        </button>
      </form>
      {status.message && (
        <div className={`mt-2 flex items-center text-sm ${status.error ? 'text-red-400' : 'text-green-400'}`}>
          {status.error ? <AlertIcon /> : <CheckIcon />}
          <span>{status.message}</span>
        </div>
      )}
    </div>
  );
};
