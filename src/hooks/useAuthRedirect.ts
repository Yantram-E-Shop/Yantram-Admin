import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/hooks/useAuthContext';

const useAuthRedirect = () => {
  const { accessToken } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) {
      router.push('/login');
    }
  }, [accessToken, router]);
};

export default useAuthRedirect;
