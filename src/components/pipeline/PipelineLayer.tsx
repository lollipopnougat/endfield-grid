import { useGameStore } from '../../store/useGameStore';
import { PipelineCellRect } from './PipelineCellRect';
import { PipelineElementRect } from './PipelineElementRect';

export function PipelineLayer() {
  const pipelineCells = useGameStore((s) => s.pipelineCells);
  const pipelineElements = useGameStore((s) => s.pipelineElements);
  const crossBridgeSet = new Set(
    pipelineElements
      .filter((e) => e.kind === 'cross_bridge')
      .map((e) => `${e.col},${e.row}`)
  );

  return (
    <>
      {pipelineCells
        .filter((c) => !crossBridgeSet.has(`${c.col},${c.row}`))
        .map((c) => (
          <PipelineCellRect key={c.id} cell={c} />
        ))}
      {pipelineElements.map((e) => (
        <PipelineElementRect key={e.id} element={e} />
      ))}
    </>
  );
}
