import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import DailyExpensesTracker from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <DailyExpensesTracker />
  </React.StrictMode>
);
