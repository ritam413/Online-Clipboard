// --- ClipboardItem Component ---
// ... (component remains unchanged) ...
import {TextIcon, ImageIcon, AudioIcon,VideoIcon,FileIcon,CopyIcon, CheckIcon, AlertIcon, CloseIcon} from '../components/icons.jsx';
import { useState } from 'react';
export const ClipboardItem = ({ item, onCopyText }) => {
  const renderContent = () => {
    switch (item.type) {
      case 'text':
        return (
          <div className="relative">
            <pre className="whitespace-pre-wrap break-all rounded-md bg-gray-700 p-3 font-sans text-gray-200">
              {item.content}
            </pre>
            <button
              onClick={() => onCopyText(item.content)}
              className="btn-ghost btn-sm btn absolute right-2 top-2 rounded p-1 text-gray-400 hover:bg-gray-600 hover:text-white"
              aria-label="Copy text"
            >
              <CopyIcon />
            </button>
          </div>
        );
      case 'image':
        return (
          <img
            src={item.url}
            alt={item.name || 'Clipboard Image'}
            className="max-h-[400px] w-full max-w-full rounded-lg object-contain"
          />
        );
      case 'video':
        return (
          <video
            src={item.url}
            controls
            className="w-full rounded-lg"
          >
            Your browser does not support the video tag.
          </video>
        );
      case 'audio':
        return (
          <audio
            src={item.url}
            controls
            className="w-full"
          >
            Your browser does not support the audio element.
          </audio>
        );
      case 'file':
        return (
          <div className="flex items-center rounded-lg bg-gray-700 p-3">
            <FileIcon />
            <span className="flex-1 truncate text-gray-300" title={item.name}>
              {item.name}
            </span>
            <a
              href={item.url}
              download={item.name}
              className="btn-primary btn-sm btn ml-3 inline-block rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
            >
              Download
            </a>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="card w-full rounded-lg bg-gray-800 shadow-lg">
      <div className="card-body p-4">
        {renderContent()}

        {/* --- NEW: Display Code if it exists --- */}
        {item.code && (
          <div className="mt-3 rounded-lg border border-gray-700 bg-gray-900 p-3">
            <div className="mb-1 text-xs font-semibold uppercase text-gray-400">
              Share Code
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold tracking-widest text-blue-400">
                {item.code}
              </span>
              <button
                onClick={() => onCopyText(item.code)}
                className="btn-ghost btn-sm btn rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
                aria-label="Copy code"
              >
                <CopyIcon />
              </button>
            </div>
          </div>
        )}

        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>{new Date(item.id).toLocaleTimeString()}</span>
          <span>{item.source}</span>
        </div>
      </div>
    </div>
  );
};
