'use client';

import DemoPreviewPage from '../../../components/demo/demo-preview-page';
import { Suspense } from 'react';

export default function DemoPreviewRoutePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#111827', fontWeight: 700 }}>Loading demo preview...</div>}>
      <DemoPreviewPage />
    </Suspense>
  );
}
