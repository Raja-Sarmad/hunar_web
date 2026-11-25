import { Suspense } from "react";
import AdminUsersPage from "./users-view";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="ad-shell ad-shell-admin">
          <div className="wrap ad-main">
            <div className="ad-loading">
              <span className="ad-spinner" />
              Loading users…
            </div>
          </div>
        </div>
      }
    >
      <AdminUsersPage />
    </Suspense>
  );
}
