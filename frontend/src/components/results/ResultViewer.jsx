import { DomainResultCard } from "../../modules/domain/components/DomainResultCard";

export function TextResult({ data }) {
  return (
    <div className="result-text">
      <p>{data.summary || JSON.stringify(data)}</p>
      {typeof data.confidence === "number" && (
        <p className="result-confidence">Confidence: {(data.confidence * 100).toFixed(0)}%</p>
      )}
      {Array.isArray(data.tags) && data.tags.length > 0 && (
        <div className="result-tags">
          {data.tags.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function TableResult({ rows }) {
  if (!rows || rows.length === 0) return <p>No tabular data to display.</p>;
  const columns = Object.keys(rows[0]);
  return (
    <table className="result-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {columns.map((col) => (
              <td key={col}>{String(row[col])}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ImageResult({ url, alt = "AI generated result" }) {
  return <img className="result-image" src={url} alt={alt} />;
}

/**
 * ResultViewer picks a renderer based on the shape of the result data.
 * Domain-specific result shapes should be handled by DomainResultCard
 * (see modules/domain/components) rather than by adding cases here.
 */
export function ResultViewer({ resultData, metadata }) {
  if (!resultData) return <p>No result data available.</p>;

  let body;
  if (Array.isArray(resultData.rows)) {
    body = <TableResult rows={resultData.rows} />;
  } else if (resultData.imageUrl) {
    body = <ImageResult url={resultData.imageUrl} />;
  } else if (resultData.domain) {
    body = <DomainResultCard data={resultData} />;
  } else {
    body = <TextResult data={resultData} />;
  }

  return (
    <div className="result-viewer">
      {body}
      {metadata && (
        <p className="result-metadata">
          {metadata.provider && `Provider: ${metadata.provider}`}
          {metadata.model && ` · Model: ${metadata.model}`}
          {typeof metadata.processing_time === "number" &&
            ` · ${metadata.processing_time}s`}
        </p>
      )}
    </div>
  );
}

export default ResultViewer;
