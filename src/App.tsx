import { GameCanvas } from './components/GameCanvas';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { DeviceEditModal } from './components/DeviceEditModal';
import { PipelineEditModal } from './components/PipelineEditModal';
import { PipelineElementEditModal } from './components/PipelineElementEditModal';
import './App.css';

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main">
        <GameCanvas />
      </main>
      <Toolbar />
      <DeviceEditModal />
      <PipelineEditModal />
      <PipelineElementEditModal />
    </div>
  );
}

export default App;
