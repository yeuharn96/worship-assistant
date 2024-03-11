import { name } from '../../../package.json';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/index.css';
import OutputWindow from './windows/OutputWindow';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <OutputWindow />
  </React.StrictMode>,
);

document.head.title = name;
