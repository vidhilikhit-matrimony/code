import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import { store } from './redux/store';
import AppRouter from './routes/AppRouter';
import './styles/index.css';

import { ConfirmProvider } from './components/ConfirmContext';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Provider store={store}>
            <ConfirmProvider>
                <AppRouter />
                <Toaster
                    position="top-right"
                    richColors
                    closeButton
                    duration={4000}
                />
            </ConfirmProvider>
        </Provider>
    </React.StrictMode>
);
