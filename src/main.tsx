import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { testConnection } from './firebase/config';

// Validate Firestore connection on boot
testConnection();

createRoot(document.getElementById('root')!).render(<App />);
