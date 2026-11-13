export default function OrderLoading() {
  return (
    <main className="cust-main order-main" aria-busy="true" aria-label="Memuat menu">
      <div className="order-container">
        <div className="order-skeleton-title" />
        <div className="order-skeleton-subtitle" />
        <div className="order-skeleton-search" />
        <div className="order-skeleton-tabs">
          {[1, 2, 3, 4].map((item) => <span key={item} />)}
        </div>
      </div>
      <div className="order-skeleton-list">
        {[1, 2, 3, 4].map((item) => (
          <div className="order-skeleton-card" key={item}>
            <div className="order-skeleton-copy">
              <span />
              <strong />
              <em />
              <b />
            </div>
            <div className="order-skeleton-thumb" />
          </div>
        ))}
      </div>
    </main>
  );
}
