import logo from './logo.svg';
import './App.css';

import Login from './Components/Login/Login';
import Register from './Components/Register/Register';
import MainPage from './Components/MainPage/MainPage';
import Profile from './Components/Profile/Profile';
import AddAnnouncement from './Components/AddAnnouncement/AddAnnouncement';
import Announcements from './Components/Announcements/Announcements';

import { GlobalProvider } from './GlobalContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';


function App() {
  return (
    <GlobalProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/add-announcement" element={<AddAnnouncement />} />
          <Route path="/announcements" element={<Announcements />} />
        </Routes>
      </BrowserRouter>
    </GlobalProvider>
  );
}

export default App;