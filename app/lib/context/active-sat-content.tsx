import { createContext, useContext, useState, ReactNode } from 'react';

type ActiveSatContextType = {
  activeSatIndex: number | undefined;
  setActiveSatIndex: (index: number | undefined) => void;
};

const ActiveSatContext = createContext<ActiveSatContextType | undefined>(undefined);

export const ActiveSatProvider = ({ children }: { children: ReactNode }) => {
  const [activeSatIndex, setActiveSatIndex] = useState<number | undefined>(undefined);
  return (
    <ActiveSatContext.Provider value={{ activeSatIndex, setActiveSatIndex }}>
      {children}
    </ActiveSatContext.Provider>
  );
};

export const useActiveSat = () => {
  const context = useContext(ActiveSatContext);
  if (context === undefined) {
    throw new Error('useActiveSat must be used within an ActiveSatProvider');
  }
  return context;
};
