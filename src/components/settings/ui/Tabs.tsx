import React, { createContext, useContext, useState } from 'react';

type TabsContextType = {
  value: string;
  onValueChange: (value: string) => void;
};

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export function Tabs({ 
  defaultValue, 
  value, 
  onValueChange, 
  children 
}: { 
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}) {
  const [tabValue, setTabValue] = useState(defaultValue);
  
  const currentValue = value !== undefined ? value : tabValue;
  const handleValueChange = onValueChange || setTabValue;

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className="w-full">{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`flex ${className || ''}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({ 
  value, 
  className, 
  children 
}: { 
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsTrigger must be used within a Tabs component');
  }
  
  const isActive = context.value === value;
  
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? 'active' : 'inactive'}
      className={`${className || ''} ${
        isActive 
          ? 'text-[#2A5C9A] border-b-2 border-[#2A5C9A]' 
          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
      onClick={() => context.onValueChange(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ 
  value, 
  children 
}: { 
  value: string;
  children: React.ReactNode;
}) {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsContent must be used within a Tabs component');
  }
  
  return context.value === value ? <div>{children}</div> : null;
}