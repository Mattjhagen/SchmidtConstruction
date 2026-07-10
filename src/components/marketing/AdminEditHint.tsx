'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Props {
  href: string;
  label: string;
}

export default function AdminEditHint({ href, label }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(!!localStorage.getItem('schmidt_auth_session'));
    } catch {}
  }, []);

  if (!visible) return null;

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-xs text-yellow-600 border border-yellow-300 bg-yellow-50 hover:bg-yellow-100 px-2.5 py-1 rounded-full transition-colors ml-3"
    >
      ✏️ Edit in Site Builder
    </Link>
  );
}
