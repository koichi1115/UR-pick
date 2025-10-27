import { createBrowserRouter } from 'react-router-dom';
import RequestPage from '../pages/RequestPage';
import SwipePage from '../pages/SwipePage';
import NotFoundPage from '../pages/NotFoundPage';

/**
 * アプリケーションのルーター設定
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RequestPage />,
  },
  {
    path: '/swipe',
    element: <SwipePage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
