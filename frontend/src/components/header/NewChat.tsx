import React, { useState } from 'react';

import { Translator } from '@/components/i18n';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

import { EditSquare } from '../icons/EditSquare';

// This is the dialog component. It's mostly unchanged.
type NewChatDialogProps = {
  open: boolean;
  isLoading: boolean;
  error?: string | null;
  handleClose: () => void;
  handleConfirm: () => void;
};

export const NewChatDialog = ({
  open,
  isLoading,
  error,
  handleClose,
  handleConfirm
}: NewChatDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent id="new-chat-dialog" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            <Translator path="navigation.newChat.dialog.title" />
          </DialogTitle>
          <DialogDescription>
            <Translator path="navigation.newChat.dialog.description" />
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            <Translator path="common.actions.cancel" />
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            id="confirm"
            disabled={isLoading}
          >
            {isLoading ? (
              <Translator path="common.actions.loading" />
            ) : (
              <Translator path="common.actions.confirm" />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// This is the main button component with the simplified logic.
const NewChatButton = ({
  ...buttonProps
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClickOpen = () => {
    setError(null);
    setOpen(true);
  };

  const handleClose = () => {
    if (isLoading) return;
    setOpen(false);
  };

  // --- THIS IS THE SIMPLIFIED LOGIC ---
  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Make a single, direct call to the clear history endpoint.
      const res = await fetch('/api/clear-history', {
        method: 'POST',
        // CRUCIAL: This sends the user's session cookie for authentication.
        credentials: 'include'
      });

      if (!res.ok) {
        // Handle potential errors like not being logged in (401/403)
        throw new Error(`Failed to clear history (status: ${res.status})`);
      }

      // On success, reload the page to start the new session.
      window.location.reload();
    } catch (err: any) {
      console.error('Clear history failed:', err);
      setError(err.message || 'An unknown error occurred.');
      setIsLoading(false); // Stop loading so the user can see the error
    }
  };

  return (
    <div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              id="new-chat-button"
              className="text-muted-foreground hover:text-muted-foreground"
              onClick={handleClickOpen}
              {...buttonProps}
            >
              <EditSquare className="!size-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <Translator path="navigation.newChat.dialog.tooltip" />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <NewChatDialog
        open={open}
        isLoading={isLoading}
        error={error}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
      />
    </div>
  );
};

export default NewChatButton;
