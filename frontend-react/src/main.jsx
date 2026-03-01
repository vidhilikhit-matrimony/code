import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import { store } from './redux/store';
import AppRouter from './routes/AppRouter';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Provider store={store}>
            <AppRouter />
            <Toaster
                position="top-center"
                richColors
                closeButton
                duration={4000}
            />
        </Provider>
    </React.StrictMode>
);
