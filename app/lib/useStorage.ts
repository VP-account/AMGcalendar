'use client';

import { useEffect, useState } from 'react';
import { storage as realStorage } from '@/app/lib/storage';

export function useStorage() {
    const [storage, setStorage] = useState<typeof realStorage | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setStorage(realStorage);
        }
    }, []);

    return storage;
}
