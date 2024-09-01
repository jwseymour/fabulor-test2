'use client';

import { useRef, useEffect, useState } from 'react';

export function SignUpForm({
  action,
  children,
}: {
  action: (formData: FormData) => Promise<void | { error: string }>;
  children: React.ReactNode;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleSubmit = async (e: Event) => {
      e.preventDefault();
      const formData = new FormData(formRef.current!);
      const result = await action(formData);
      if (result && 'error' in result) {
        setError(result.error);
        // Always clear the password field
        const passwordInput = formRef.current!.querySelector('input[name="password"]') as HTMLInputElement;
        passwordInput.value = '';
        
        // Clear username or email based on the error
        if (result.error.toLowerCase().includes('username')) {
          const usernameInput = formRef.current!.querySelector('input[name="username"]') as HTMLInputElement;
          usernameInput.value = '';
        } else if (result.error.toLowerCase().includes('email')) {
          const emailInput = formRef.current!.querySelector('input[name="email"]') as HTMLInputElement;
          emailInput.value = '';
        }
      } else {
        setError(null);
      }
    };

    formRef.current?.addEventListener('submit', handleSubmit);
    return () => formRef.current?.removeEventListener('submit', handleSubmit);
  }, [action]);

  return (
    <form
      ref={formRef}
      className="flex flex-col space-y-6 bg-white px-4 py-8 sm:px-16"
    >
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-gray-700"
        >
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          placeholder="johndoe"
          autoComplete="username"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="user@example.com"
          autoComplete="email"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {children}
    </form>
  );
}