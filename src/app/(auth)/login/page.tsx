import Link from 'next/link';
import { SignInForm } from '@/components/auth/SignInForm';
import { signIn } from '@/lib/auth/auth';
import { SubmitButton } from '@/components/auth/submit-button';
import { redirect } from 'next/navigation';

export default function Login() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <div className="z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 bg-white px-4 py-6 pt-8 text-center sm:px-16">
          <h3 className="text-xl font-semibold">Log In</h3>
          <p className="text-sm text-gray-500">
            Use your email or username and password to sign in
          </p>
        </div>
        <SignInForm
          action={async (formData: FormData) => {
            'use server';
            try {
              await signIn('credentials', {
                redirectTo: '/protected',
                email: formData.get('email') as string,
                password: formData.get('password') as string,
                redirect: false,
              });
            } catch (error) {
              return { error: 'Invalid credentials' };
            }
            redirect('/protected')
          }}
        >
          <SubmitButton>Sign in</SubmitButton>
          <p className="text-center text-sm text-gray-600">
            {"Don't have an account? "}
            <Link href="/register" className="font-semibold text-gray-800">
              Sign up
            </Link>
            {' for free.'}
          </p>
        </SignInForm>
      </div>
    </div>
  );
}