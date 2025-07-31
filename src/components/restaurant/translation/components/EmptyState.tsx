
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Languages } from 'lucide-react';

export function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Languages className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nuk ka artikuj për përkthim</h3>
        <p className="text-muted-foreground text-center">
          Shtoni kategori dhe artikuj menuje për t'i përkthyer në gjuhë të ndryshme
        </p>
      </CardContent>
    </Card>
  );
}
