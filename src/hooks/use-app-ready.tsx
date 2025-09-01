
'use client';

import { createContext, useContext } from 'react';

export const AppReadyContext = createContext<boolean>(false);

export const useAppReady = () => {
    return useContext(AppReadyContext);
}
