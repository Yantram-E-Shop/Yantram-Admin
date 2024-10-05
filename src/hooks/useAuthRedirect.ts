"use client";
import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/hooks/useAuthContext';
import axios from 'axios';
import { AuthContext } from '@/context/AuthContext';

const useAuthRedirect = () => {
  const auth = useContext(AuthContext);
  const accessToken = auth?.accessToken;
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) {
      router.push('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://13.201.54.226:5000/api/v1/user/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } catch (error) {
        router.push("/login");
      }
    };

    fetchUserData();
  }, [accessToken, router]);
};

export default useAuthRedirect;