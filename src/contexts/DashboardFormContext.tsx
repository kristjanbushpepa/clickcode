
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DashboardFormData {
  [key: string]: any;
}

interface DashboardFormContextType {
  formData: DashboardFormData;
  setFormData: (key: string, data: any) => void;
  getFormData: (key: string) => any;
  clearFormData: (key: string) => void;
}

const DashboardFormContext = createContext<DashboardFormContextType | undefined>(undefined);

export const useDashboardForm = () => {
  const context = useContext(DashboardFormContext);
  if (!context) {
    throw new Error('useDashboardForm must be used within a DashboardFormProvider');
  }
  return context;
};

interface DashboardFormProviderProps {
  children: ReactNode;
}

export const DashboardFormProvider: React.FC<DashboardFormProviderProps> = ({ children }) => {
  const [formData, setFormDataState] = useState<DashboardFormData>({});

  const setFormData = (key: string, data: any) => {
    setFormDataState(prev => ({
      ...prev,
      [key]: data
    }));
  };

  const getFormData = (key: string) => {
    return formData[key];
  };

  const clearFormData = (key: string) => {
    setFormDataState(prev => {
      const newData = { ...prev };
      delete newData[key];
      return newData;
    });
  };

  return (
    <DashboardFormContext.Provider value={{
      formData,
      setFormData,
      getFormData,
      clearFormData
    }}>
      {children}
    </DashboardFormContext.Provider>
  );
};
