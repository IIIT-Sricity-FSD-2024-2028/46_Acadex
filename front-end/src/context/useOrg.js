import { useContext } from 'react';
import OrgContext from './orgContextInstance';

export function useOrg() {
  const context = useContext(OrgContext);

  if (!context) {
    throw new Error('useOrg must be used within an OrgProvider');
  }

  return context;
}
