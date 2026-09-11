/**
 * DOMAIN MODULE - placeholder for a custom result renderer.
 *
 * ResultViewer routes here whenever `resultData.domain` is present.
 * Replace this with charts, maps, recommendation cards, or whatever
 * visualization the final problem statement calls for.
 */
export function DomainResultCard({ data }) {
  return (
    <div className="domain-result-card">
      <p>Domain-specific result rendering goes here.</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default DomainResultCard;
