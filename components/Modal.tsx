import React from 'react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  buttonText: string;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children, buttonText }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-2xl border-2 border-yellow-400 p-8 max-w-md w-full text-center">
        <h2 className="text-3xl font-bold text-yellow-400 mb-4">{title}</h2>
        <div className="text-lg mb-6">{children}</div>
        <button
          onClick={onClose}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default Modal;
