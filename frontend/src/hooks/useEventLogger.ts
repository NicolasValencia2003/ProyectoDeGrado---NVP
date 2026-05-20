import { useCallback } from 'react';
import { logEvent } from '../services/api';
import type { UserEvent } from '../types';

export function useEventLogger() {
  return useCallback(
    (
      type: UserEvent['event_type'],
      asset: { ticker: string; asset_class: string; sector: string },
      extra?: { dwell_seconds?: number }
    ) => {
      logEvent({ event_type: type, asset_ticker: asset.ticker, asset_class: asset.asset_class, sector: asset.sector, ...extra }).catch(() => {});
    },
    []
  );
}
