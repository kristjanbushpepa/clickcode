
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ConnectionErrorProps {
  connectionError: string;
}

export function ConnectionError({ connectionError }: ConnectionErrorProps) {
  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {connectionError}
        </AlertDescription>
      </Alert>
      <Button onClick={() => window.location.href = '/restaurant/login'}>
        Return to Login
      </Button>
    </div>
  );
}
