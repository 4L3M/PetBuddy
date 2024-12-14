import logo from './logo.svg';
import './App.css';

import Login from './Components/Login/Login';
import Register from './Components/Register/Register';
import MainPage from './Components/MainPage/MainPage';
import Profile from './Components/Profile/Profile';
import AddAnnouncement from './Components/AddAnnouncement/AddAnnouncement';
import UserAnnouncements from './Components/Announcements/UserAnnouncements';
import EditAnnouncement from './Components/Announcements/EditAnnouncement';
import YourAnimals from './Components/Animals/YourAnimals';
import AddAnimal from './Components/Animals/AddAnimal';
import EditAnimal from './Components/Animals/EditAnimal';
import AnnouncementDetails from './Components/Announcements/AnnouncementDetails';
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
          <Route path="/announcements" element={<UserAnnouncements />} />
          <Route path="/edit-announcement/:id" element={<EditAnnouncement />} />
          <Route path="/edit-animal/:id" element={<EditAnimal />} />
          <Route path="/animals" element={<YourAnimals />} />
          <Route path="/add-animal" element={<AddAnimal />} />

          <Route path="/ad/:id" element={<AnnouncementDetails />} />
        </Routes>
      </BrowserRouter>
    </GlobalProvider>
  );
}

export default App;