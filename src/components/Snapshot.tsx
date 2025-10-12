import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { customVisuals } from './MathVisual';
import { useVisualBackgroundOverride } from '../utils/visualBackgroundOverride';

const Snapshot = () => {
  const { quoteId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const backgroundParam = searchParams.get('bg');
  const backgroundOverride = backgroundParam === 'white' ? '#ffffff' : null;
  useVisualBackgroundOverride(backgroundOverride);
  const numericQuoteId = parseInt(quoteId, 10);

  // Check if quoteId is a valid number
  if (isNaN(numericQuoteId)) {
    return <div>Invalid visual ID</div>;
  }

  // The customVisuals array is 0-indexed, but quote IDs are 1-indexed
  const visualIndex = numericQuoteId - 1;

  // Check if the visual exists in the array
  if (visualIndex < 0 || visualIndex >= customVisuals.length) {
    return <div>Visual not found</div>;
  }

  const Component = customVisuals[visualIndex];

  return (
    <div id="snapshot-container" style={{ width: '512px', height: '512px' }}>
      <Component width={512} height={512} />
    </div>
  );
};

export default Snapshot;
