import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { HeatMapDataProvider } from './components/Heatmap.js';

/*import 'bootstrap/dist/css/bootstrap.css'*/
import 'bootswatch/dist/lux/bootstrap.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
// Usamos HeatMapDataProvider para envolver el componente App, esto hará que los datos del mapa de calor estén disponibles para todos los componentes hijos de App
root.render(
  <React.StrictMode>
    <HeatMapDataProvider>
      <App />
    </HeatMapDataProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
