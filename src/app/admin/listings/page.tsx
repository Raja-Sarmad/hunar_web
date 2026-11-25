import { Suspense } from "react";
import AdminListingsPage from "./listings-view";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="ad-shell ad-shell-admin">
          <div className="wrap ad-main">
            <div className="ad-loading">
              <span className="ad-spinner" />
              Loading listings…
            </div>
          </div>
        </div>
      }
    >
      <AdminListingsPage />
    </Suspense>
  );
}
