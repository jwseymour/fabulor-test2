'use client';

import { useRef, useEffect, useState } from 'react';

export function SignInForm({
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
      setError(null);
      const formData = new FormData(formRef.current!);
      const result = await action(formData);
      if (result && 'error' in result) {
        setError(result.error);
        const passwordInput = formRef.current!.querySelector('input[name="password"]') as HTMLInputElement;
        passwordInput.value = '';
      }
    };
  
    formRef.current?.addEventListener('submit', handleSubmit);
    return () => formRef.current?.removeEventListener('submit', handleSubmit);
  }, [action]);

  return (
    <form
      ref={formRef}
      className="flex flex-col space-y-4 bg-gray-50 px-4 py-8 sm:px-16"
    >
      <div>
        <label
          htmlFor="email"
          className="block text-xs text-gray-600 uppercase"
        >
          Email Address or Username
        </label>
        <input
          id="email"
          name="email"
          type="text"
          placeholder="user@example.com or username"
          autoComplete="email"
          required
          className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-xs text-gray-600 uppercase"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {children}
    </form>
  );
}