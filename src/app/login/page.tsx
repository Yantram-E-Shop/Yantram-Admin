"use client"
import LoginForm from '@/components/LoginForm'
import { useAuthContext } from '@/hooks/useAuthContext';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useEffect } from 'react';

const LoginPage = () => {
  let accessToken = null;
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem("accessToken");
  }

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