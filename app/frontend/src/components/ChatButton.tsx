import React from 'react';
import Button from './Button';

export default function ChatButton({ onOpen }: { onOpen: () => void }) {
  return (
    <Button onClick={onOpen} style={{ padding: '8px 12px' }}>
      Open Chat
n    </Button>
  );
}
