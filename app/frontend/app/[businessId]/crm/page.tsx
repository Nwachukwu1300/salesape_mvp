'use client';

import { useParams } from 'next/navigation';
import CRMDashboard from '@/components/CRMDashboard';

export default function CRMPage() {
  const params = useParams();
  const businessId = params.businessId as string;

  return <CRMDashboard businessId={businessId} />;
}
