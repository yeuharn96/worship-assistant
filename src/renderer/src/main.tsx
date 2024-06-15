import { name } from '../../../package.json';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/index.css';
import ControlPanel from './windows/ControlPanel';
import { Toaster } from './components/ui/sonner';
import GlobalModal from './components/GlobalModal';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ControlPanel />
    <Toaster
      expand
      richColors
      pauseWhenPageIsHidden
      position='bottom-right'
      theme='light'
      offset={'1vw'}
      gap={8}
      visibleToasts={4}
    />
    <GlobalModal />
  </React.StrictMode>,
);

document.head.title = name;
