
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  onRetry: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Gabim në Lidhjen me Bazën e të Dhënave</h3>
        <p className="text-muted-foreground text-center mb-4">
          Nuk mund të lidhem me bazën e të dhënave të restorantit. Kontrolloni lidhjen tuaj.
        </p>
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Rifresko
        </Button>
      </CardContent>
    </Card>
  );
}
