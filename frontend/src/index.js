import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '~/App';
import reportWebVitals from './reportWebVitals';
import GlobalStyles from '~/components/GlobalStyles';
import { AuthProvider } from '~/contexts/AuthContext';
import { NotificationProvider } from '~/contexts/NotificationContext';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
        <AuthProvider>
            <NotificationProvider>
                <GlobalStyles>
                    <App />
                </GlobalStyles>
            </NotificationProvider>
        </AuthProvider> 
);

reportWebVitals();
