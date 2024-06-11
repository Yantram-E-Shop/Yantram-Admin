"use client"
import LoginForm from '@/components/LoginForm'
import { useAuthContext } from '@/hooks/useAuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const LoginPage = () => {
  const { accessToken } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (accessToken) {
      router.push('/');
    }
  }, [accessToken, router]);

  return (
    <>
        <LoginForm />
    </>
  )
}

export default LoginPage