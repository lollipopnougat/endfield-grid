import { useRef } from 'react';
import { useGameStore } from '../store/useGameStore';

export function SaveLoad() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const getSceneData = useGameStore((s) => s.getSceneData);
  const loadSceneData = useGameStore((s) => s.loadSceneData);

  const handleSave = () => {
    const data = getSceneData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipeline-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (data.version != null && data.devices && data.pipelineCells && data.pipelineElements) {
          loadSceneData(data);
        }
      } catch (_) {
        // ignore
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <>
      <button type="button" onClick={handleSave}>
        保存 JSON
      </button>
      <button type="button" onClick={() => fileInputRef.current?.click()}>
        加载 JSON
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={handleLoad}
      />
    </>
  );
}
