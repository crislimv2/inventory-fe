import React from "react";
import CheckoutProductModalProps from "./interfaces/CheckoutProductModalProps";
import { Modal } from "antd";

const CheckoutProductModal : React.FC<CheckoutProductModalProps> = ({ isOpen, onClose }) => {
  return (
    <div>
        <Modal
          title="Checkout"
          width={1000}
          open={isOpen}
          onCancel={onClose}
          footer={null}
        >
          {/* Modal content goes here */}
          <h2>Checkout Modal</h2>
        </Modal>
    </div>
    );
};

export default CheckoutProductModal;