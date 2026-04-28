import ReactModal from "react-modal";
import { useState, useEffect } from "react";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<IProps> = ({ isOpen, onClose, children }) => {
  const [modalIsOpen, setModalIsOpen] = useState(isOpen);

  useEffect(() => {
    setModalIsOpen(isOpen);
  }, [isOpen]);

  const handleModalClose = () => {
    setModalIsOpen(false);
    onClose();
  };

  return (
    <ReactModal
      isOpen={modalIsOpen}
      onRequestClose={handleModalClose}
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl p-6 max-w-[90vw]"
      overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
      closeTimeoutMS={300}
      ariaHideApp={false}
    >
      {children}
    </ReactModal>
  );
};

export default Modal;
