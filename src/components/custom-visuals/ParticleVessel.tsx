import React from 'react';
import EmptyParticles from './EmptyParticles';
import { VisualProps } from '../../types';

const ParticleVessel: React.FC<VisualProps> = ({ width, height }) => {
  return <EmptyParticles width={width} height={height} />;
};

const metadata = {
  themes: "impartiality, empty potential, stillness as power",
  visualization: "Particles define a vessel through their movement around emptiness, showing how stillness contains infinite possibility",
  promptSuggestion: "1. Add subtle void variations\n2. Create empty vessel patterns\n3. Vary spatial definitions naturally\n4. Introduce gentle utility waves\n5. Make emptiness follow natural forms"
};

ParticleVessel.metadata = metadata;

export default ParticleVessel;