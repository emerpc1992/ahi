import React from 'react';
import { Edit, Trash2, History, DollarSign, Eraser } from 'lucide-react';
import { Staff } from '../../types/staff';
import { formatCurrency } from '../../utils/format';

interface StaffListProps {
  staff: Staff[];
  onEdit: (staff: Staff) => void;
  onDelete: (staffId: string) => void;
  onViewHistory: (staff: Staff) => void;
  onAddDiscount: (staff: Staff) => void;
  onClearHistory: (staff: Staff) => void;
  onPayCommission: (staff: Staff) => void;
}

export default function StaffList({ 
  staff, 
  onEdit, 
  onDelete, 
  onViewHistory, 
  onAddDiscount,
  onClearHistory,
  onPayCommission
}: StaffListProps) {
  const calculatePendingCommission = (member: Staff) => {
    const totalCommission = member.sales
      .filter(sale => !sale.commissionPaid)
      .reduce((sum, sale) => sum + sale.commission, 0);

    const activeDiscounts = member.discounts
      .filter(discount => discount.status === 'active')
      .reduce((sum, discount) => sum + discount.amount, 0);

    return Math.max(0, totalCommission - activeDiscounts);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comisión</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Ventas</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comisión Pendiente</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {staff.map((member) => {
            const pendingCommission = calculatePendingCommission(member);
            return (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.commissionRate}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(member.sales.reduce((total, sale) => total + sale.total, 0))}
                  <div className="text-xs text-gray-500">
                    {member.sales.length} ventas realizadas
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(pendingCommission)}
                  {member.discounts.filter(d => d.status === 'active').length > 0 && (
                    <div className="text-xs text-red-500">
                      {member.discounts.filter(d => d.status === 'active').length} descuentos activos
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onViewHistory(member)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Ver historial"
                    >
                      <History className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onAddDiscount(member)}
                      className="text-yellow-600 hover:text-yellow-900"
                      title="Agregar descuento"
                    >
                      <DollarSign className="w-4 h-4" />
                    </button>
                    {pendingCommission > 0 && (
                      <button
                        onClick={() => onPayCommission(member)}
                        className="text-green-600 hover:text-green-900"
                        title="Pagar comisión"
                      >
                        <DollarSign className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(member)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onClearHistory(member)}
                      className="text-orange-600 hover:text-orange-900"
                      title="Borrar historial"
                    >
                      <Eraser className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(member.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}