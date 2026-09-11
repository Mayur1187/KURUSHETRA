export function Loader({ label = "Loading...", fullPage = false }) {
  return (
    <div className={fullPage ? "loader-fullpage" : "loader-inline"}>
      <div className="spinner" aria-hidden="true" />
      <span className="loader-label">{label}</span>
    </div>
  );
}

export default Loader;
