import { Link } from 'react-router-dom';

/**
 * NotFoundPage - 404エラーページ
 */
export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="container">
        <h1>404</h1>
        <p>ページが見つかりません</p>
        <Link to="/" className="back-link">
          ホームに戻る
        </Link>
      </div>
    </div>
  );
}
