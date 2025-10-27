import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { useUserStore } from './store';
import './App.css';

/**
 * メインアプリケーションコンポーネント
 */
function App() {
  const initializeUser = useUserStore((state) => state.initializeUser);

  // Initialize user on app load
  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  return <RouterProvider router={router} />;
}

export default App;
