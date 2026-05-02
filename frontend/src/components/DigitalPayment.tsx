import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Smartphone, CheckCircle2, XCircle, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

interface PaymentProps {
  amount: number;
  method: 'telebirr' | 'cbebirr';
  onSuccess: () => void;
  onCancel: () => void;
}

export const DigitalPayment = ({ amount, method, onSuccess, onCancel }: PaymentProps) => {
  const [step, setStep] = React.useState<'input' | 'processing' | 'success'>('input');
  const [phoneNumber, setPhoneNumber] = React.useState('');

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    setStep('success');
    setTimeout(onSuccess, 2000);
  };

  return (
    <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-gray-100 max-w-md w-full mx-auto">
      <AnimatePresence mode="wait">
        {step === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/5 rounded-lg">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-primary capitalize">{method} Payment</h3>
              </div>
              <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-gray-50 p-6 rounded-3xl space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Amount to Pay</p>
              <p className="text-3xl font-bold text-primary">{amount.toLocaleString()} ETB</p>
            </div>

            <form onSubmit={handlePayment} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
                <input 
                  type="tel" 
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="09XX XXX XXX"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 flex items-start space-x-2 px-1">
                <ShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>A payment request will be sent to your phone. Please confirm the transaction in your {method} app.</span>
              </p>
              <button 
                type="submit"
                className="w-full blue-gradient text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
              >
                <span>Pay Now</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}

        {step === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-12 flex flex-col items-center space-y-6 text-center"
          >
            <div className="relative">
              <div className="w-20 h-20 border-4 border-primary/10 rounded-full" />
              <div className="absolute inset-0 w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <Smartphone className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-primary">Processing Payment</h3>
              <p className="text-sm text-gray-500">Waiting for confirmation from your phone...</p>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-12 flex flex-col items-center space-y-6 text-center"
          >
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-primary">Payment Successful!</h3>
              <p className="text-sm text-gray-500">Transaction ID: TXN-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
