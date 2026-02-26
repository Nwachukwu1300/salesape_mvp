import React from 'react';

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  typedConfirmation?: string; // if provided, require user to type this exact phrase
  onCancel: () => void;
  onConfirm: (typedValue?: string) => void;
}

export function ConfirmModal({ open, title, description, confirmText = 'Confirm', cancelText = 'Cancel', typedConfirmation, onCancel, onConfirm }: ConfirmModalProps) {
  const [typed, setTyped] = React.useState('');

  React.useEffect(() => { if (!open) setTyped(''); }, [open]);

  if (!open) return null;

  const okDisabled = typedConfirmation ? typed.trim() !== (typedConfirmation || '') : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-lg w-full p-6">
        <h3 className="text-lg font-semibold mb-2">{title || 'Are you sure?'}</h3>
        {description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{description}</p>}

        {typedConfirmation && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Type <strong className="text-sm">{typedConfirmation}</strong> to confirm</p>
            <input className="w-full px-3 py-2 border rounded bg-gray-50 dark:bg-gray-800" value={typed} onChange={e => setTyped(e.target.value)} />
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button className="px-3 py-2 rounded border" onClick={onCancel}>{cancelText}</button>
          <button className={`px-3 py-2 rounded text-white ${okDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`} disabled={okDisabled} onClick={() => onConfirm(typed)}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
