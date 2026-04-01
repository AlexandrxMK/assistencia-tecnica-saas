export function Panel({ title, children, actions }) {
  return (
    <article className="panel">
      <header className="panel-header">
        <div>
          <h2>{title}</h2>
        </div>
        {actions ? <div className="panel-actions">{actions}</div> : null}
      </header>
      <div className="panel-body">{children}</div>
    </article>
  );
}

export function InlineMessage({ type = 'info', children }) {
  if (!children) {
    return null;
  }

  return <p className={`inline-message inline-message-${type}`}>{children}</p>;
}

export function EmptyState({ children }) {
  return <p className="empty-state">{children}</p>;
}
