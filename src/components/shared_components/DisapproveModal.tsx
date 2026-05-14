import { useState } from "react";
import { Button } from "./button";

interface DisapproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (remark: string) => void;
  emp_name: string;
}

export const DisapproveModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  emp_name 
}: DisapproveModalProps) => {
  const [remark, setRemark] = useState("");

  const handleConfirm = () => {
    if (!remark.trim()) return;
    onConfirm(remark);
    setRemark("");
  };

  const handleClose = () => {
    setRemark("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-md p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">
          Disapprove Quit Claim
        </h3>
        <div className="space-y-3">
          <p>
            Are you sure you want to disapprove this quit claim for{" "}
            {emp_name}?
          </p>
          <div>
            <label className="block text-sm font-medium mb-1">
              Remark (required):
            </label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Please provide a reason for disapproval..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!remark.trim()}
          >
            Disapprove
          </Button>
        </div>
      </div>
    </div>
  );
};