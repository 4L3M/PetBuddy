import logo from './logo.svg';
import './App.css';

import Login from './Components/Login/Login';
import Register from './Components/Register/Register';

import { GlobalProvider } from './GlobalContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';


function App() {
  return (
    <GlobalProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </GlobalProvider>
  );
}

export default App;