import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {Provider} from 'react-redux'
import {store} from './store/store.js'
import {GoogleOAuthProvider} from '@react-oauth/google';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
    <GoogleOAuthProvider clientId="727133925578-9ane1lvnk3bu5qpptp8og0lh9ju9br67.apps.googleusercontent.com">
    <App />
    </GoogleOAuthProvider>
    </Provider>
  </StrictMode>,
)
