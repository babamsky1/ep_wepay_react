import { Check, EyeOff, Minus, Pencil, Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/shared_components/button";
import { Input } from "@/components/shared_components/input";
import { formatCurrency } from "@/helpers/currency";
import { useLineItems } from "@/hooks/last_pay/useLineItems";
import { AdditionalsType } from "@/types/lastPayTypes";
import { useAuth } from "@/contexts/AuthContext";

// ─── Line Item Section ──────────────────────────────────────────────────────────

export function LineItemSection({
  type,
  items,
  isEditing = false,
  ref_no,
  onItemsChange,
}: {
  type: "P" | "D";
  items: AdditionalsType[];
  isEditing?: boolean;
  ref_no: string;
  onItemsChange?: (items: AdditionalsType[]) => void;
}) {
  const isDeduction = type === "D";
  const label = isDeduction ? "Deduction" : "Payable";
  const { user } = useAuth();

  const {
    role,
    showForm,
    setShowForm,
    editingId,
    form,
    setForm,
    resetForm,
    saveItem,
    startEdit,
    deleteItem,
    visibleItems,
    canEditItem,
  } = useLineItems({ items, type, last_pay_record_id: ref_no, onItemsChange, isEditing });

  const updateForm = (field: string, value: string) =>
    setForm({ 
      ...form, 
      [field]: field === 'is_confidential' ? value === 'true' : value 
    });

  return (
    <div className="border border-border rounded-t-xl overflow-hidden bg-card flex flex-col h-auto max-h-[81vh] shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div
        className={`bg-gradient-to-r px-6 py-4 flex-shrink-0 ${
          isDeduction
            ? "from-red-600 via-red-700 to-red-900"
            : "from-emerald-600 via-emerald-700 to-emerald-900"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white text-lg font-bold uppercase tracking-wide drop-shadow-md">
              {isDeduction ? "Deductions" : "Additional Pay"}
              <span className="text-white text-sm font-medium ml-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                {isDeduction ? "—" : "+"}
              </span>
            </h3>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden p-6 min-h-0 bg-gradient-to-b from-gray-50/50 to-white">
        {isEditing && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className={`w-full flex items-center justify-center gap-3 border-2 border-dashed rounded-xl py-3 text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md mb-4 ${
              isDeduction
                ? "border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400"
                : "border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400"
            }`}
          >
            <Plus className="h-5 w-5" />
            Add {label}
          </button>
        )}

        <div className="flex-1 overflow-y-auto space-y-4 min-h-0 pr-2">
          {isEditing && showForm && (
            <div
              className={`border-2 rounded-xl p-5 space-y-4 shadow-md transition-all duration-200 ${
                isDeduction
                  ? "border-red-300 bg-red-50/50"
                  : "border-emerald-300 bg-emerald-50/50"
              }`}
            >
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    isDeduction ? "bg-red-500" : "bg-emerald-500"
                  }`}
                >
                  <Plus className="h-3 w-3 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">
                  {editingId !== null ? `Edit ${label}` : `Add New ${label}`}
                </h4>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    Label
                  </label>
                  <Input
                    placeholder={`Enter ${label.toLowerCase()} label`}
                    value={form.label}
                    onChange={(e) => updateForm("label", e.target.value)}
                    className="bg-white shadow-sm border-gray-200"
                  />
                </div>
                {/* Date is now auto-filled — no manual input needed */}
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    Amount
                  </label>
                  <Input
                    placeholder="Enter amount"
                    type="number"
                    value={form.amount}
                    onChange={(e) => updateForm("amount", e.target.value)}
                    className="bg-white shadow-sm border-gray-200"
                  />
                </div>
                {/* Confidential toggle - for managers and superadmin */}
                {(role === "manager" || role === "superadmin") && (
                  <div className="flex items-center space-x-2 p-1">
                    <input
                      type="checkbox"
                      id="confidential-toggle"
                      checked={form.is_confidential}
                      onChange={(e) => updateForm("is_confidential", String(e.target.checked))}
                      className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                    />
                    <label htmlFor="confidential-toggle" className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-2">
                      Mark as confidential
                    </label>
                  </div>
                )}
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={resetForm}
                  className="hover:bg-gray-50"
                >
                  <X className="h-3 w-3 mr-1" /> Cancel
                </Button>
                <Button
                  size="sm"
                  className={`${
                    isDeduction
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  } transition-colors duration-200`}
                  onClick={saveItem}
                >
                  <Check className="h-3 w-3 mr-1" />
                  {editingId !== null ? "Save" : "Add"}
                </Button>
              </div>
            </div>
          )}

          {visibleItems.length === 0 && !showForm ? (
            <div className="text-center py-12">
              <h4 className="text-base font-medium text-gray-900 mb-1">
                No {type === "D" ? "deductions" : "payables"} added
              </h4>
              <p className="text-sm text-gray-500">
                {isEditing
                  ? `Click "Add ${label}" to get started`
                  : `No ${type === "D" ? "deduction" : "payable"} items available`}
              </p>
            </div>
          ) : (
            visibleItems.map((item) => {
              const isManager = role === "manager";
              const isOwnManagerItem =
                isManager && item.created_by === user?.name;

              return (
                <div
                  key={item.ad_type_id || item.description}
                  className={`bg-white border rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 flex justify-between items-center ${
                    isDeduction
                      ? "border-red-200 hover:border-red-300"
                      : "border-emerald-200 hover:border-emerald-300"
                  } ${
                    editingId === item.ad_type_id
                      ? "border-l-4 border-l-blue-500 bg-blue-50/30"
                      : ""
                  }`}
                >
                  <div className="flex-1">
                    {editingId === item.ad_type_id && (
                      <div className="flex items-center text-blue-600 mb-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                        <span className="text-xs font-medium">Editing</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {item.description ||
                          `Untitled ${type === "D" ? "deduction" : "payable"}`}
                      </h4>
                      {/* Confidential badge — visible to managers and superadmin */}
                      {item.is_confidential === "Y" && (isOwnManagerItem || role === "superadmin") && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                          <EyeOff className="h-3 w-3" />
                          Confidential
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {item.updated_by
                        ? `Updated by: ${item.updated_by}`
                        : item.created_by
                        ? `Created by: ${item.created_by}`
                        : "No date specified"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`font-mono font-bold text-lg ${
                        isDeduction ? "text-red-600" : "text-emerald-600"
                      }`}
                    >
                      {formatCurrency(Number(item.amount || 0))}
                    </div>
                    {isEditing && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(item)}
                          disabled={!canEditItem(item)}
                          className={`p-2 rounded-lg transition-colors duration-200 ${
                            canEditItem(item)
                              ? "hover:bg-blue-50 text-blue-600"
                              : "opacity-30 cursor-not-allowed text-gray-400"
                          }`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteItem(item)}
                          disabled={!canEditItem(item)}
                          className={`p-2 rounded-lg transition-colors duration-200 ${
                            canEditItem(item)
                              ? "hover:bg-red-50 text-red-600"
                              : "opacity-30 cursor-not-allowed text-gray-400"
                          }`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}