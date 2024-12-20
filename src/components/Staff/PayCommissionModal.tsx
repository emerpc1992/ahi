import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface PayCommissionModalProps {
  staffName: string;
  totalCommission: number;
  onConfirm: () => void;
  onClose: () => void;
}

export default function PayCommissionModal({ 
  staffName, 
  totalCommission, 
  onConfirm, 
  onClose 
}: PayCommissionModalProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error paying commission:', error);
      alert('Error al pagar la comisión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <DollarSign className="w-6 h-6 text-green-500 mr-2" />
            Pagar Comisión
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600">Colaborador</p>
            <p className="text-xl font-semibold">{staffName}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-green-600">Total a Pagar</p>
            <p className="text-2xl font-bold text-green-700">{formatCurrency(totalCommission)}</p>
          </div>

          <p className="text-sm text-gray-500">
            Este monto será registrado como un gasto y las comisiones serán marcadas como pagadas.
          </p>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Confirmar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}