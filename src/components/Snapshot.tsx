import React from 'react';
import { useParams } from 'react-router-dom';
import MoireMandalaPattern from './custom-visuals/MoireMandalaPattern';
import FlowerOfLife from './custom-visuals/FlowerOfLife';
import HankiesInTheWind from './custom-visuals/HankiesInTheWind';
import TessellationPatterns from './custom-visuals/TessellationPatterns';
import AsciiBinaryFlow from './custom-visuals/AsciiBinaryFlow';
import ScrollingVerticalBars from './custom-visuals/ScrollingVerticalBars';
import EmptyParticles from './custom-visuals/EmptyParticles';
import ParticleVessel from './custom-visuals/ParticleVessel';
import ParticleFlower from './custom-visuals/ParticleFlower';
import PineconeDelicate from './custom-visuals/PineconeDelicate';
import WaterAscii from './custom-visuals/WaterAscii';
import CanyonMultiLayerFlows from './custom-visuals/CanyonMultiLayerFlows';
import WavyYinYangNoDots from './custom-visuals/WavyYinYangNoDots';
import TorusFieldDynamics from './custom-visuals/TorusFieldDynamics';
import PhaseDistortionWaves from './custom-visuals/PhaseDistortionWaves';
import BlackWhiteBlobs from './custom-visuals/BlackWhiteBlobs';
import ParticleReverie from './custom-visuals/ParticleReverie';
import WaveVariationSparse from './custom-visuals/WaveVariationSparse';
import OrganicCellularGrid from './custom-visuals/OrganicCellularGrid';
import ZoomedParticleAnimation from './custom-visuals/ZoomedParticleAnimation';
import VerticalBarsNoise from './custom-visuals/VerticalBarsNoise';
import TangledLines from './custom-visuals/TangledLines';
import MoireSixCircles from './custom-visuals/MoireSixCircles';
import IronFillings from './custom-visuals/IronFillings';
import WaterFlowingAroundObstacle from './custom-visuals/WaterFlowingAroundObstacle';
import WaveInterferenceOptimized3 from './custom-visuals/WaveInterferenceOptimized3';
import GentleWaves from './custom-visuals/GentleWaves';
import OrganicGrowth from './custom-visuals/OrganicGrowth';
import AsciiClarityFromStillness from './custom-visuals/AsciiClarityFromStillness';
import VoidArchitecture from './custom-visuals/VoidArchitecture';
import Metamorphosis from './custom-visuals/Metamorphosis';
import Artwork33 from './custom-visuals/Artwork33';
import LayeredSineWaves from './custom-visuals/LayeredSineWaves';
import WaveInterferenceV6 from './custom-visuals/WaveInterferenceV6';
import MorphingContours from './custom-visuals/MorphingContours';
import KaleidoscopeVariation3 from './custom-visuals/KaleidoscopeVariation3';
import HashArchitecture from './custom-visuals/HashArchitecture';
import VortexParticleSystemExact from './custom-visuals/VortexParticleSystemExact';
import TetheredFlow from './custom-visuals/TetheredFlow';
import KaleidoscopeWaveCenterSquare from './custom-visuals/KaleidoscopeWaveCenterSquare';
import Dispersing3DVase from './custom-visuals/Dispersing3DVase';
import FibonacciRectangleSpiral from './custom-visuals/FibonacciRectangleSpiral';
import SlidingEaseVerticalBars from './custom-visuals/SlidingEaseVerticalBars';
import EtherealTorusFlow from './custom-visuals/EtherealTorusFlow';
import ParticleCylinder from './custom-visuals/ParticleCylinder';
import BouncingPointCloud from './custom-visuals/BouncingPointCloud';
import CrystallineBiology from './custom-visuals/CrystallineBiology';
import Artwork55v1 from './custom-visuals/Artwork55v1';
import DimensionalResonance from './custom-visuals/DimensionalResonance';
import ShinyLoop from './custom-visuals/ShinyLoop';
import AnimatedAsciiMandala from './custom-visuals/AnimatedAsciiMandala';
import AsciiDiagonalPetals from './custom-visuals/AsciiDiagonalPetals';
import PineconeConstellation from './custom-visuals/PineconeConstellation';
import IntricateRadialMesh from './custom-visuals/IntricateRadialMesh';
import ContinuousLineDrawing from './custom-visuals/ContinuousLineDrawing';
import DramaticRibbonFold from './custom-visuals/DramaticRibbonFold';
import ShellRidgePattern from './custom-visuals/ShellRidgePattern';
import SwayingBranches from './custom-visuals/SwayingBranches';
import FlowingRibbons from './custom-visuals/FlowingRibbons';
import CanyonStratifiedUndulations from './custom-visuals/CanyonStratifiedUndulations';
import AsciiBlob from './custom-visuals/AsciiBlob';
import RadialGrowth from './custom-visuals/RadialGrowth';
import VectorFieldLines from './custom-visuals/VectorFieldLines';
import OscillatingHatching from './custom-visuals/OscillatingHatching';
import WaveInterferenceV4 from './custom-visuals/WaveInterferenceV4';
import BreathingRhombus from './custom-visuals/BreathingRhombus';
import ImplicitDreams from './custom-visuals/ImplicitDreams';
import SpiralStorm from './custom-visuals/SpiralStorm';
import FlowingLattice from './custom-visuals/FlowingLattice';
import Artwork63v2 from './custom-visuals/Artwork63v2';
import DelicateTorusKnot from './custom-visuals/DelicateTorusKnot';
import HourglassSpiral from './custom-visuals/HourglassSpiral';
import RadialMeshFlower from './custom-visuals/RadialMeshFlower';
import CanyonUndulatingWalls from './custom-visuals/CanyonUndulatingWalls';
import WaveInterferenceV5 from './custom-visuals/WaveInterferenceV5';
import EffortlessParticles from './custom-visuals/EffortlessParticles';
import QuantumLatticeBloom from './custom-visuals/QuantumLatticeBloom';
import FractalWaterfall from './custom-visuals/FractalWaterfall';
import PulsatingYinYangNebula from './custom-visuals/PulsatingYinYangNebula';
import NonEuclideanRippleMaze from './custom-visuals/NonEuclideanRippleMaze';
import FibonacciSpiralGarden from './custom-visuals/FibonacciSpiralGarden';
import MobiusFlowTunnel from './custom-visuals/MobiusFlowTunnel';
import StarfieldEntanglement from './custom-visuals/StarfieldEntanglement';
import HyperbolicMirrorSequence from './custom-visuals/HyperbolicMirrorSequence';
import EmergentTreeOfVoid from './custom-visuals/EmergentTreeOfVoid';
import PenroseTriangleIllusion from './custom-visuals/PenroseTriangleIllusion';
import SierpinskiBloom from './custom-visuals/SierpinskiBloom';
import AuroraStrings from './custom-visuals/AuroraStrings';
import VortexSandGarden from './custom-visuals/VortexSandGarden';
import TidalLattice from './custom-visuals/TidalLattice';
import GossamerPathways from './custom-visuals/GossamerPathways';
import CrystalBlooming from './custom-visuals/CrystalBlooming';
import GravityLanterns from './custom-visuals/GravityLanterns';
import HelicalGrove from './custom-visuals/HelicalGrove';
import PhantomConstellations from './custom-visuals/PhantomConstellations';
import HarmonicResonator from './custom-visuals/HarmonicResonator';

const customVisuals = {
  1: MoireMandalaPattern,
  2: FlowerOfLife,
  3: HankiesInTheWind,
  4: TessellationPatterns,
  5: AsciiBinaryFlow,
  6: ScrollingVerticalBars,
  7: EmptyParticles,
  8: ParticleVessel,
  9: ParticleFlower,
  10: PineconeDelicate,
  11: WaterAscii,
  12: CanyonMultiLayerFlows,
  13: WavyYinYangNoDots,
  14: TorusFieldDynamics,
  15: PhaseDistortionWaves,
  16: BlackWhiteBlobs,
  17: ParticleReverie,
  18: WaveVariationSparse,
  19: OrganicCellularGrid,
  20: ZoomedParticleAnimation,
  21: VerticalBarsNoise,
  22: TangledLines,
  23: MoireSixCircles,
  24: IronFillings,
  25: WaterFlowingAroundObstacle,
  26: WaveInterferenceOptimized3,
  27: GentleWaves,
  28: OrganicGrowth,
  29: AsciiClarityFromStillness,
  30: VoidArchitecture,
  31: Metamorphosis,
  32: Artwork33,
  33: LayeredSineWaves,
  34: WaveInterferenceV6,
  35: MorphingContours,
  36: KaleidoscopeVariation3,
  37: HashArchitecture,
  38: VortexParticleSystemExact,
  39: TetheredFlow,
  40: KaleidoscopeWaveCenterSquare,
  41: Dispersing3DVase,
  42: FibonacciRectangleSpiral,
  43: SlidingEaseVerticalBars,
  44: EtherealTorusFlow,
  45: ParticleCylinder,
  46: BouncingPointCloud,
  47: CrystallineBiology,
  48: Artwork55v1,
  49: DimensionalResonance,
  50: ShinyLoop,
  51: AnimatedAsciiMandala,
  52: AsciiDiagonalPetals,
  53: PineconeConstellation,
  54: IntricateRadialMesh,
  55: ContinuousLineDrawing,
  56: DramaticRibbonFold,
  57: ShellRidgePattern,
  58: SwayingBranches,
  59: FlowingRibbons,
  60: CanyonStratifiedUndulations,
  61: AsciiBlob,
  62: RadialGrowth,
  63: VectorFieldLines,
  64: OscillatingHatching,
  65: WaveInterferenceV4,
  66: BreathingRhombus,
  67: ImplicitDreams,
  68: SpiralStorm,
  69: FlowingLattice,
  70: Artwork63v2,
  71: DelicateTorusKnot,
  72: HourglassSpiral,
  73: RadialMeshFlower,
  74: CanyonUndulatingWalls,
  75: WaveInterferenceV5,
  76: EffortlessParticles,
  77: QuantumLatticeBloom,
  78: FractalWaterfall,
  79: PulsatingYinYangNebula,
  80: NonEuclideanRippleMaze,
  81: FibonacciSpiralGarden,
  82: MobiusFlowTunnel,
  83: StarfieldEntanglement,
  84: HyperbolicMirrorSequence,
  85: EmergentTreeOfVoid,
  86: PenroseTriangleIllusion,
  87: SierpinskiBloom,
  88: AuroraStrings,
  89: VortexSandGarden,
  90: TidalLattice,
  91: GossamerPathways,
  92: CrystalBlooming,
  93: GravityLanterns,
  94: HelicalGrove,
  95: PhantomConstellations,
  96: HarmonicResonator,
};

const Snapshot = () => {
  const { quoteId } = useParams();
  const Component = customVisuals[quoteId];

  if (!Component) {
    return <div>Visual not found</div>;
  }

  return (
    <div id="snapshot-container" style={{ width: '512px', height: '512px' }}>
      <Component width={512} height={512} />
    </div>
  );
};

export default Snapshot;
