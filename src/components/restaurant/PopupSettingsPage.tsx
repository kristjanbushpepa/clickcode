
import React from 'react';
import { PopupSettings } from './PopupSettings';

export const PopupSettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Popup Settings</h1>
        <p className="text-muted-foreground">
          Configure popup messages and interactive elements for your menu visitors.
        </p>
      </div>
      <PopupSettings />
    </div>
  );
};
