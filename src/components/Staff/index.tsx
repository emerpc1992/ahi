import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import StaffList from './StaffList';
import StaffForm from './StaffForm';
import StaffHistory from './StaffHistory';
import AddDiscountModal from './AddDiscountModal';
import CancelDiscountModal from './CancelDiscountModal';
import DeleteStaffModal from './DeleteStaffModal';
import ClearHistoryModal from './ClearHistoryModal';
import PayCommissionModal from './PayCommissionModal';
import { Staff } from '../../types/staff';
import { storage } from '../../utils/storage';

export default function StaffManager() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | undefined>();
  const [selectedStaff, setSelectedStaff] = useState<Staff | undefined>();
  const [cancellingDiscountId, setCancellingDiscountId] = useState<string | undefined>();
  const [discountingStaff, setDiscountingStaff] = useState<Staff | undefined>();
  const [deletingStaffId, setDeletingStaffId] = useState<string | undefined>();
  const [clearingStaff, setClearingStaff] = useState<Staff | undefined>();
  const [payingCommission, setPayingCommission] = useState<Staff | undefined>();
  const [deleteError, setDeleteError] = useState('');

  // Load initial data
  useEffect(() => {
    const loadStaff = async () => {
      try {
        const data = await storage.staff.load();
        setStaff(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading staff:', error);
        setStaff([]);
      }
    };
    loadStaff();
  }, []);

  const handleAddStaff = (staffData: Omit<Staff, 'id' | 'sales' | 'discounts'>) => {
    const newStaff = {
      ...staffData,
      id: Date.now().toString(),
      sales: [],
      discounts: []
    };
    setStaff([...staff, newStaff]);
    setShowStaffForm(false);
  };

  const handleEditStaff = (staffData: Omit<Staff, 'id' | 'sales' | 'discounts'>) => {
    if (editingStaff) {
      setStaff(staff.map(s => 
        s.id === editingStaff.id ? { ...s, ...staffData } : s
      ));
      setEditingStaff(undefined);
      setShowStaffForm(false);
    }
  };

  const handleAddDiscount = (amount: number, reason: string) => {
    if (discountingStaff) {
      const discount = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        amount,
        reason,
        status: 'active' as const
      };

      setStaff(staff.map(s =>
        s.id === discountingStaff.id
          ? { ...s, discounts: [...s.discounts, discount] }
          : s
      ));
      setDiscountingStaff(undefined);
    }
  };

  const handleCancelDiscount = (discountId: string) => {
    setStaff(staff.map(s => ({
      ...s,
      discounts: s.discounts.map(d =>
        d.id === discountId
          ? { ...d, status: 'cancelled' as const }
          : d
      )
    })));
    setCancellingDiscountId(undefined);
  };

  const handleDeleteStaff = (password: string) => {
    if (deletingStaffId) {
      setStaff(staff.filter(s => s.id !== deletingStaffId));
      setDeletingStaffId(undefined);
      setDeleteError('');
    }
  };

  const handleClearHistory = async (password: string) => {
    if (clearingStaff) {
      const updatedStaff = staff.map(s => {
        if (s.id === clearingStaff.id) {
          return {
            ...s,
            sales: [],
            discounts: []
          };
        }
        return s;
      });
      setStaff(updatedStaff);
      await storage.staff.save(updatedStaff);
      setClearingStaff(undefined);
    }
  };

  const handlePayCommission = async () => {
    if (!payingCommission) return;

    try {
      // Calculate commission amount
      const totalUnpaidCommission = payingCommission.sales
        .filter(sale => !sale.commissionPaid)
        .reduce((sum, sale) => sum + sale.commission, 0);

      // Get total of active discounts
      const totalActiveDiscounts = payingCommission.discounts
        .filter(discount => discount.status === 'active')
        .reduce((sum, discount) => sum + discount.amount, 0);

      // Calculate final commission amount
      const finalCommissionAmount = Math.max(0, totalUnpaidCommission - totalActiveDiscounts);

      if (finalCommissionAmount > 0) {
        // Create expense entry for the commission payment
        const expense = {
          id: Date.now().toString(),
          category: 'Comisiones',
          reason: `Pago de comisión a ${payingCommission.name}`,
          amount: finalCommissionAmount,
          date: new Date().toISOString(),
          status: 'active' as const,
          note: `Comisión total: ${totalUnpaidCommission}\nDescuentos aplicados: ${totalActiveDiscounts}`
        };

        // Save expense
        const currentExpenses = await storage.expenses.load();
        await storage.expenses.save([...currentExpenses, expense]);

        // Update staff member's records
        const updatedStaff = staff.map(s => {
          if (s.id === payingCommission.id) {
            // Mark all unpaid sales as paid
            const updatedSales = s.sales.map(sale => ({
              ...sale,
              commissionPaid: true
            }));

            // Mark all active discounts as applied
            const updatedDiscounts = s.discounts.map(discount => 
              discount.status === 'active' 
                ? { ...discount, status: 'applied' }
                : discount
            );

            return {
              ...s,
              sales: updatedSales,
              discounts: updatedDiscounts
            };
          }
          return s;
        });

        setStaff(updatedStaff);
        await storage.staff.save(updatedStaff);
      }

      setPayingCommission(undefined);
    } catch (error) {
      console.error('Error paying commission:', error);
      alert('Error al procesar el pago de comisión');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Colaboradores</h2>
        <button
          onClick={() => {
            setEditingStaff(undefined);
            setShowStaffForm(true);
          }}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Colaborador
        </button>
      </div>

      {staff.length > 0 ? (
        <StaffList
          staff={staff}
          onEdit={setEditingStaff}
          onDelete={setDeletingStaffId}
          onViewHistory={setSelectedStaff}
          onAddDiscount={setDiscountingStaff}
          onClearHistory={setClearingStaff}
          onPayCommission={setPayingCommission}
        />
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No hay colaboradores registrados. Comienza agregando uno nuevo.
        </div>
      )}

      {showStaffForm && (
        <StaffForm
          staff={editingStaff}
          onSubmit={editingStaff ? handleEditStaff : handleAddStaff}
          onClose={() => {
            setShowStaffForm(false);
            setEditingStaff(undefined);
          }}
          existingCodes={staff.map(s => s.code)}
        />
      )}

      {selectedStaff && (
        <StaffHistory
          staff={selectedStaff}
          onCancelDiscount={setCancellingDiscountId}
          onClose={() => setSelectedStaff(undefined)}
        />
      )}

      {discountingStaff && (
        <AddDiscountModal
          staffName={discountingStaff.name}
          onConfirm={handleAddDiscount}
          onClose={() => setDiscountingStaff(undefined)}
        />
      )}

      {deletingStaffId && (
        <DeleteStaffModal
          onConfirm={handleDeleteStaff}
          onClose={() => {
            setDeletingStaffId(undefined);
            setDeleteError('');
          }}
          error={deleteError}
        />
      )}
      
      {clearingStaff && (
        <ClearHistoryModal
          staffName={clearingStaff.name}
          onConfirm={handleClearHistory}
          onClose={() => setClearingStaff(undefined)}
        />
      )}

      {payingCommission && (
        <PayCommissionModal
          staffName={payingCommission.name}
          totalCommission={
            Math.max(0,
              payingCommission.sales
                .filter(sale => !sale.commissionPaid)
                .reduce((sum, sale) => sum + sale.commission, 0) -
              payingCommission.discounts
                .filter(discount => discount.status === 'active')
                .reduce((sum, discount) => sum + discount.amount, 0)
            )
          }
          onConfirm={handlePayCommission}
          onClose={() => setPayingCommission(undefined)}
        />
      )}
    </div>
  );
}