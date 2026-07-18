'use client';

import * as React from 'react';

import type { ITocItem } from '@/shared/types';

export const TocContext = React.createContext<ITocItem[]>([]);
