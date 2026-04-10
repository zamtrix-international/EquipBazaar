import React from 'react';
import './EmptyState.css';

/**
 * EmptyState Component - Shows when no data is available
 */
const EmptyState = ({ 
  icon = '📭',
  title = 'No Data Found',
  message = 'There is no data to display at the moment.',
  action = null,
  actionLabel = 'Go Back'
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {action && (
        <button className="btn btn-primary mt-3" onClick={action}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

/**
 * ErrorState Component - Shows when there's an error
 */
export const ErrorState = ({ 
  title = 'Something went wrong',
  message = 'An error occurred while loading the content.',
  action = null,
  actionLabel = 'Try Again'
}) => {
  return (
    <div className="error-state">
      <div className="error-state-icon">⚠️</div>
      <h3 className="error-state-title">{title}</h3>
      <p className="error-state-message">{message}</p>
      {action && (
        <button className="btn btn-primary mt-3" onClick={action}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

/**
 * NoResults Component - Shows when search/filter returns no results
 */
export const NoResults = ({
  searchTerm = 'items',
  onReset = null
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">🔍</div>
      <h3 className="empty-state-title">No Results Found</h3>
      <p className="empty-state-message">
        We couldn't find any {searchTerm} matching your search.
      </p>
      {onReset && (
        <button className="btn btn-secondary mt-3" onClick={onReset}>
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default EmptyState;
