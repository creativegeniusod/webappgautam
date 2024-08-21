import React from 'react';
import App from './App';
import './index.css';
import './App.css';
import 'react-app-polyfill/stable'
import 'core-js'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './store'
import 'bootstrap/dist/css/bootstrap.css';

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <App />
    </Provider>
)