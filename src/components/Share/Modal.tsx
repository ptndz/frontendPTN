import ReactModal from "react-modal";
import { useState } from "react";
interface IProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}
const Modal: React.FC<IProps> = ({ isOpen, onClose, children }) => {
  const [modalIsOpen, setModalIsOpen] = useState(isOpen);

  const handleModalClose = () => {
    setModalIsOpen(false);
    onClose();
  };

  return (
    <ReactModal
      isOpen={modalIsOpen}
      onRequestClose={handleModalClose}
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-md p-6"
      overlayClassName="fixed inset-0 bg-black bg-opacity-25"
      closeTimeoutMS={500}
      ariaHideApp={false}>
      {children}
    </ReactModal>
  );
};

export default Modal;
