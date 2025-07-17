import { useEffect, useRef } from 'react';
import { websocketClient } from '@/lib/websocket';

export function useWebSocket(userId?: number, projectId?: number) {
  const hasJoined = useRef(false);

  useEffect(() => {
    if (userId && projectId && !hasJoined.current) {
      websocketClient.joinProject(userId, projectId);
      hasJoined.current = true;
    }

    return () => {
      if (hasJoined.current) {
        websocketClient.leaveProject();
        hasJoined.current = false;
      }
    };
  }, [userId, projectId]);

  const on = (type: string, listener: Function) => {
    websocketClient.on(type, listener);
  };

  const off = (type: string, listener: Function) => {
    websocketClient.off(type, listener);
  };

  return { on, off };
}
