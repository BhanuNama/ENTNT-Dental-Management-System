import React from 'react';
import { CreditCard, X, DollarSign } from 'lucide-react';
import Loader from './Loader';

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  amount: number;
  treatment: string;
  isProcessing?: boolean;
}

const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  amount,
  treatment,
  isProcessing = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Payment Confirmation
            </h3>
          </div>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
              <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Confirm Payment
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to proceed with the payment?
              </p>
            </div>

            {/* Payment Details */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Treatment:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{treatment}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Amount:</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  ${amount.toFixed(2)}
                </span>
              </div>
            </div>

            {isProcessing && (
              <div className="flex items-center justify-center space-x-2 py-2">
                <Loader size="sm" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Processing payment...</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 p-6 border-t dark:border-gray-700">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <>
                <Loader size="sm" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Yes, Pay Now</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmationModal; 