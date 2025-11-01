// --- InputTabs Component ---
// ... (component remains unchanged) ...
import {TextIcon, ImageIcon, AudioIcon,VideoIcon,FileIcon,CopyIcon, CheckIcon, AlertIcon, CloseIcon} from '../components/icons.jsx';
import { useState } from 'react';
import { useRef } from 'react';
export const InputTabs = ({ onSendText, onSendFile }) => {
  const [activeTab, setActiveTab] = useState('text');
  const [textContent, setTextContent] = useState('');
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);

  const TABS = [
    { id: 'text', icon: <TextIcon />, label: 'Text' },
    { id: 'image', icon: <ImageIcon />, label: 'Image' },
    { id: 'video', icon: <VideoIcon />, label: 'Video' },
    { id: 'audio', icon: <AudioIcon />, label: 'Audio' },
    { id: 'file', icon: <FileIcon />, label: 'File' },
  ];

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (textContent.trim()) {
      onSendText(textContent);
      setTextContent('');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
    }
  };

  const handleFileSubmit = (e) => {
    e.preventDefault();
    if (file) {
      onSendFile(file, activeTab);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset file input
      }
    }
  };

  const getFileInputAccept = () => {
    switch (activeTab) {
      case 'image':
        return 'image/*';
      case 'video':
        return 'video/*';
      case 'audio':
        return 'audio/*';
      case 'file':
        return '*/*';
      default:
        return '*/*';
    }
  };

  return (
    <div className="w-full rounded-b-lg rounded-tr-lg bg-gray-800 p-4 shadow-lg">
      {/* Tab Headers */}
      <div className="tabs -mb-px flex border-b border-gray-700">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-lifted tab flex items-center border-b-2 px-4 py-2 font-medium transition-all duration-150 ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:border-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pt-4">
        {activeTab === 'text' ? (
          <form onSubmit={handleTextSubmit}>
            <textarea
              className="textarea w-full rounded-md border border-gray-700 bg-gray-900 p-3 text-gray-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows="4"
              placeholder="Paste text here..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
            ></textarea>
            <button
              type="submit"
              className="btn-primary btn mt-2 w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
            >
              Send Text
            </button>
          </form>
        ) : (
          <form onSubmit={handleFileSubmit}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="file-input file-input-bordered w-full rounded-lg border border-gray-700 bg-gray-900 text-sm text-gray-400
                         file:mr-4 file:rounded-l-lg file:border-0 file:bg-gray-700 file:px-4
                         file:py-2 file:font-semibold file:text-gray-200 hover:file:bg-gray-600"
              accept={getFileInputAccept()}
            />
            {file && (
              <div className="mt-2 truncate text-sm text-gray-400">
                Selected: {file.name}
              </div>
            )}
            <button
              type="submit"
              disabled={!file}
              className="btn-primary btn mt-2 w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send {TABS.find(t => t.id === activeTab)?.label || 'File'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};