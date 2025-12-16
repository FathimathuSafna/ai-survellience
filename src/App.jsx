import { useState } from 'react';
import CameraStream from './components/CameraStream';
import FaceRecognition from './components/FaceRecognition';
import RegisteredFaces from './components/RegisteredFaces';
import HRDashboard from './components/hr-dashboard/HRDashboard';
import AdminDashboard from './components/admin-dashboard/adminDashboard'
import './App.css';

function App() {
  const [view, setView] = useState('face'); // 'face' or 'hr'
  const [videoCanvas, setVideoCanvas] = useState(null);
  const [overlayCanvas, setOverlayCanvas] = useState(null);
  const [showControls, setShowControls] = useState(false);

  const handleStreamReady = (video, overlay) => {
    setVideoCanvas(video);
    setOverlayCanvas(overlay);
  };

  return (
    <div className="App">
      {/* View Toggle Button */}
      <div className="view-toggle-btn">
        <button 
          className={view === 'face' ? 'active' : ''}
          onClick={() => setView('face')}
        >
          <i className="fas fa-video"></i>
          Face Recognition
        </button>
        <button 
          className={view === 'hr' ? 'active' : ''}
          onClick={() => setView('hr')}
        >
          <i className="fas fa-tachometer-alt"></i>
          HR Dashboard
        </button>
        <button 
          className={view === 'admin' ? 'active' : ''}
          onClick={() => setView('admin')}
        >
          <i className="fas fa-tachometer-alt"></i>
          Admin Dashboard
        </button>
      </div>

      {/* Face Recognition View */}
      {view === 'face' && (
        <div className="face-recognition-view">
          <div className="video-container">
            <div className="video-header">
              <h1>
                <i className="fas fa-video"></i>
                Face Recognition System
              </h1>
            </div>
            
            <button 
              className="settings-btn"
              onClick={() => setShowControls(!showControls)}
              title="Toggle Controls"
            >
              <i className={`fas ${showControls ? 'fa-times' : 'fa-cog'}`}></i>
            </button>

            <CameraStream onStreamReady={handleStreamReady} />
          </div>
          
          <div className={`controls-panel ${showControls ? 'open' : ''}`}>
            <div className="controls-header">
              <h3>
                <i className="fas fa-user-shield"></i>
                Control Panel
              </h3>
              <button 
                className="close-btn"
                onClick={() => setShowControls(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <FaceRecognition 
              videoCanvas={videoCanvas} 
              overlayCanvas={overlayCanvas} 
            />
            <RegisteredFaces />
          </div>

          {showControls && (
            <div 
              className="backdrop"
              onClick={() => setShowControls(false)}
            />
          )}
        </div>
      )}

      {/* HR Dashboard View */}
      {view === 'hr' && (
        <HRDashboard />
      )}
       {view === 'admin' && (
        <AdminDashboard />
      )}
    </div>
  );
}

export default App;