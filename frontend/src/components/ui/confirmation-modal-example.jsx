import React from "react";
import { ConfirmationModal, useConfirmation } from "./confirmation-modal";
import { Button } from "./button";

/**
 * EXAMPLE 1: Using the useConfirmation hook (Recommended)
 * This is the easiest and most flexible way to use the confirmation modal
 */
export function Example1_WithHook() {
  const confirmation = useConfirmation();

  const handleDelete = () => {
    console.log("Item deleted!");
    // Your delete logic here
  };

  const handleSubmit = () => {
    console.log("Form submitted!");
    // Your submit logic here
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Example 1: Using Hook</h2>
      
      {/* Delete button with destructive variant */}
      <Button
        variant="destructive"
        onClick={() => confirmation.confirm(handleDelete)}
      >
        Delete Item
      </Button>

      {/* Submit button */}
      <Button
        onClick={() => confirmation.confirm(handleSubmit)}
      >
        Submit Form
      </Button>

      {/* The confirmation modal */}
      <ConfirmationModal
        open={confirmation.isOpen}
        onOpenChange={confirmation.setIsOpen}
        onConfirm={confirmation.onConfirm}
        title="Confirm Action"
        description="Are you sure you want to proceed with this action?"
        confirmText="Yes, Continue"
        cancelText="No, Cancel"
      />
    </div>
  );
}

/**
 * EXAMPLE 2: Using state manually
 * More control but requires more code
 */
export function Example2_WithState() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [actionType, setActionType] = React.useState("");

  const handleConfirm = () => {
    if (actionType === "delete") {
      console.log("Deleting...");
      // Delete logic
    } else if (actionType === "approve") {
      console.log("Approving...");
      // Approve logic
    }
  };

  const openDeleteConfirmation = () => {
    setActionType("delete");
    setIsOpen(true);
  };

  const openApproveConfirmation = () => {
    setActionType("approve");
    setIsOpen(true);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Example 2: Manual State</h2>
      
      <Button variant="destructive" onClick={openDeleteConfirmation}>
        Delete
      </Button>

      <Button onClick={openApproveConfirmation}>
        Approve
      </Button>

      <ConfirmationModal
        open={isOpen}
        onOpenChange={setIsOpen}
        onConfirm={handleConfirm}
        title={actionType === "delete" ? "Delete Item" : "Approve Request"}
        description={
          actionType === "delete"
            ? "This will permanently delete the item. This action cannot be undone."
            : "Are you sure you want to approve this request?"
        }
        confirmText={actionType === "delete" ? "Delete" : "Approve"}
        variant={actionType === "delete" ? "destructive" : "default"}
      />
    </div>
  );
}

/**
 * EXAMPLE 3: Multiple confirmation modals for different actions
 */
export function Example3_MultipleModals() {
  const deleteConfirmation = useConfirmation();
  const approveConfirmation = useConfirmation();
  const rejectConfirmation = useConfirmation();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Example 3: Multiple Modals</h2>
      
      <div className="flex gap-2">
        <Button
          variant="destructive"
          onClick={() => deleteConfirmation.confirm(() => {
            console.log("Deleted!");
          })}
        >
          Delete
        </Button>

        <Button
          onClick={() => approveConfirmation.confirm(() => {
            console.log("Approved!");
          })}
        >
          Approve
        </Button>

        <Button
          variant="outline"
          onClick={() => rejectConfirmation.confirm(() => {
            console.log("Rejected!");
          })}
        >
          Reject
        </Button>
      </div>

      {/* Delete confirmation */}
      <ConfirmationModal
        open={deleteConfirmation.isOpen}
        onOpenChange={deleteConfirmation.setIsOpen}
        onConfirm={deleteConfirmation.onConfirm}
        title="Delete Item"
        description="This will permanently delete the item. This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />

      {/* Approve confirmation */}
      <ConfirmationModal
        open={approveConfirmation.isOpen}
        onOpenChange={approveConfirmation.setIsOpen}
        onConfirm={approveConfirmation.onConfirm}
        title="Approve Request"
        description="Are you sure you want to approve this request?"
        confirmText="Approve"
      />

      {/* Reject confirmation */}
      <ConfirmationModal
        open={rejectConfirmation.isOpen}
        onOpenChange={rejectConfirmation.setIsOpen}
        onConfirm={rejectConfirmation.onConfirm}
        title="Reject Request"
        description="Are you sure you want to reject this request?"
        confirmText="Reject"
        cancelText="Go Back"
      />
    </div>
  );
}

/**
 * EXAMPLE 4: With async operations (API calls)
 */
export function Example4_AsyncOperations() {
  const confirmation = useConfirmation();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleDeleteWithAPI = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("API call successful!");
      // Show success message
    } catch (error) {
      console.error("API call failed:", error);
      // Show error message
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Example 4: Async Operations</h2>
      
      <Button
        variant="destructive"
        onClick={() => confirmation.confirm(handleDeleteWithAPI)}
        disabled={isLoading}
      >
        {isLoading ? "Deleting..." : "Delete Item"}
      </Button>

      <ConfirmationModal
        open={confirmation.isOpen}
        onOpenChange={confirmation.setIsOpen}
        onConfirm={confirmation.onConfirm}
        title="Delete Item"
        description="This will permanently delete the item from the database."
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
