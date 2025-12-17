import { useState } from 'react';
import CameraStream from './components/CameraStream';
import FaceRecognition from './components/FaceRecognition';
import RegisteredFaces from './components/RegisteredFaces';
import HRDashboard from './components/hr-dashboard/HRDashboard';
import AdminDashboard from './components/admin-dashboard/adminDashboard'
import LoginPage from './components/login';
import './App.css';

function App() {
  const [view, setView] = useState('login'); // 👈 login first
  const [videoCanvas, setVideoCanvas] = useState(null);
  const [overlayCanvas, setOverlayCanvas] = useState(null);
  const [showControls, setShowControls] = useState(false);

  const handleStreamReady = (video, overlay) => {
    setVideoCanvas(video);
    setOverlayCanvas(overlay);
  };

  return (
    <div className="App">

      {/* 🔑 LOGIN VIEW */}
      {view === 'login' && (
        <LoginPage setView={setView} />
      )}

      {/* 🔘 VIEW TOGGLE (hide during login) */}
      {view !== 'login' && (
        <div className="view-toggle-btn">
          <button
            className={view === 'face' ? 'active' : ''}
            onClick={() => setView('face')}
          >
            Face Recognition
          </button>

          <button
            className={view === 'hr' ? 'active' : ''}
            onClick={() => setView('hr')}
          >
            HR Dashboard
          </button>

          <button
            className={view === 'admin' ? 'active' : ''}
            onClick={() => setView('admin')}
          >
            Admin Dashboard
          </button>
        </div>
      )}

      {/* 🎥 FACE RECOGNITION */}
      {view === 'face' && (
        <div className="face-recognition-view">
          <CameraStream onStreamReady={handleStreamReady} />
          <FaceRecognition
            videoCanvas={videoCanvas}
            overlayCanvas={overlayCanvas}
          />
          <RegisteredFaces />
        </div>
      )}

      {/* 🧑‍💼 HR */}
      {view === 'hr' && <HRDashboard />}

      {/* 🛠 ADMIN */}
      {view === 'admin' && <AdminDashboard />}

    </div>
  );
}


export default App;