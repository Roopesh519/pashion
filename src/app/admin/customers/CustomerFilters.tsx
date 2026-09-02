'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import styles from '../shared/listing.module.css';

type Props = {
  q: string;
  role: string;
};

export default function CustomerFilters({ q, role }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const input = inputRef.current;

    if (!input) return;

    let timeout: ReturnType<typeof setTimeout>;

    const handleInput = () => {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        formRef.current?.requestSubmit();
      }, 500);
    };

    input.addEventListener('input', handleInput);

    return () => {
      clearTimeout(timeout);
      input.removeEventListener('input', handleInput);
    };
  }, []);

  const handleRoleChange = () => {
    formRef.current?.requestSubmit();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();

    const search = formData.get('q')?.toString().trim();
    const selectedRole = formData.get('role')?.toString();

    if (search) {
      params.set('q', search);
    }

    if (selectedRole && selectedRole !== 'all') {
      params.set('role', selectedRole);
    }

    router.push(`/admin/customers?${params.toString()}`);
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      style={{ display: 'flex', gap: '0.5rem' }}
    >
      <select
        name="role"
        defaultValue={role}
        className={styles.filterSelect}
        style={{
          padding: '0.5rem',
          borderRadius: '0.375rem',
          border: '1px solid #e2e8f0',
          backgroundColor: '#fff',
        }}
        onChange={handleRoleChange}
      >
        <option value="all">All Roles</option>
        <option value="user">Regular User</option>
        <option value="admin">Admin</option>
      </select>

      <div className={styles.searchBox}>
        <Search size={18} />

        <input
          ref={inputRef}
          name="q"
          placeholder="Search customers..."
          defaultValue={q}
          className={styles.searchInput}
          autoComplete="off"
        />
      </div>
    </form>
  );
}