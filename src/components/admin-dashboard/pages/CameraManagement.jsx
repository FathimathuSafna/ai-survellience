import React, { useState } from 'react';
import { 
  FaChevronDown, 
  FaSync,       // Refresh
  FaCamera,     // Capture
  FaCog,        // Settings
  FaExpand,     // Fullscreen
  FaVideo,      // Camera Icon
  FaExclamationTriangle // Warning/Offline
} from 'react-icons/fa';

const CameraManagement = ({ data }) => {
  // --- State ---
  const [cameras] = useState(data.cameras);
  const [selectedCamera, setSelectedCamera] = useState(cameras[0]);
  const [selectedStore, setSelectedStore] = useState('All');

  // --- Logic ---
  const uniqueStores = ['All', ...new Set(cameras.map(item => item.store))];

  const filteredCameras = selectedStore === 'All' 
    ? cameras 
    : cameras.filter(camera => camera.store === selectedStore);

  const handleFilterChange = (e) => {
    const store = e.target.value;
    setSelectedStore(store);
    
    if (store !== 'All') {
      const firstCameraInStore = cameras.find(c => c.store === store);
      if (firstCameraInStore) setSelectedCamera(firstCameraInStore);
    }
  };

  return (
    <div>
      <style>{`
        /* --- Layout --- */
        .camera-layout { display: grid; grid-template-columns: 300px 1fr; gap: 20px; height: calc(100vh - 200px); }
        .camera-list { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 2px 8px rgba(22, 93, 60, 0.08); overflow-y: auto; display: flex; flex-direction: column; }
        
        /* --- Camera Item --- */
        .camera-item { padding: 16px; border-radius: 12px; margin-bottom: 8px; cursor: pointer; transition: all 0.2s ease; border: 2px solid transparent; }
        .camera-item:hover { background: #ebf2e9; }
        .camera-item.active { background: #bdf59a; border-color: #165d3c; }
        .camera-store-name { font-size: 14px; font-weight: 600; color: #1a252f; margin-bottom: 4px; }
        .camera-location-name { font-size: 13px; color: #5a6c7d; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
        .camera-status { display: flex; align-items: center; gap: 6px; font-size: 12px; }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; }
        .status-dot.online { background: #165d3c; animation: pulse 2s infinite; }
        .status-dot.offline { background: #dc2626; }

        /* --- Viewer --- */
        .camera-viewer { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 8px rgba(22, 93, 60, 0.08); display: flex; flex-direction: column; }
        .viewer-header { margin-bottom: 20px; }
        .viewer-title { font-size: 20px; font-weight: 600; color: #1a252f; margin-bottom: 8px; }
        .viewer-info { display: flex; gap: 20px; font-size: 14px; color: #5a6c7d; }
        .info-item { display: flex; align-items: center; gap: 6px; }
        
        .video-container { flex: 1; background: #000; border-radius: 12px; display: flex; align-items: center; justify-content: center; min-height: 400px; position: relative; overflow: hidden; }
        .video-placeholder { color: #333; display: flex; flex-direction: column; align-items: center; gap: 10px; }
        
        /* --- Buttons with Icons --- */
        .video-controls { display: flex; gap: 12px; margin-top: 16px; }
        .control-btn { 
          display: flex; align-items: center; gap: 8px; /* Spacing between icon and text */
          padding: 10px 20px; 
          background: #165d3c; color: white; 
          border: none; border-radius: 10px; 
          font-weight: 600; cursor: pointer; 
          transition: all 0.2s ease; 
        }
        .control-btn:hover { background: #1e7b4e; }
        .control-btn svg { font-size: 14px; } /* Adjust icon size inside button */

        /* --- Header & Dropdown --- */
        .header-section { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; }
        .header-titles h2 { font-size: 24px; font-weight: 600; color: #1a252f; margin: 0 0 4px 0; }
        .header-titles p { font-size: 14px; color: #5a6c7d; margin: 0; }

        .filter-wrapper { position: relative; width: 200px; }
        .store-select {
          width: 100%; padding: 10px 16px; font-size: 14px; color: #1a252f;
          background-color: white; border: 1px solid #e2e8f0; border-radius: 10px;
          appearance: none; cursor: pointer; font-weight: 500;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05); outline: none;
        }
        .store-select:focus { border-color: #165d3c; box-shadow: 0 0 0 3px rgba(22, 93, 60, 0.1); }
        .select-icon { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: #5a6c7d; pointer-events: none; }

        @media (max-width: 1024px) { .camera-layout { grid-template-columns: 1fr; } .camera-list { max-height: 200px; } .header-section { flex-direction: column; align-items: flex-start; gap: 12px; } }
      `}</style>

      {/* Header */}
      <div className="header-section">
        <div className="header-titles">
          <h2>Camera Management</h2>
          <p>Monitor security feeds across locations</p>
        </div>

        <div className="filter-wrapper">
          <select 
            className="store-select" 
            value={selectedStore} 
            onChange={handleFilterChange}
          >
            {uniqueStores.map(store => (
              <option key={store} value={store}>
                {store === 'All' ? 'All Stores' : store}
              </option>
            ))}
          </select>
          <FaChevronDown className="select-icon" size={12} />
        </div>
      </div>

      {/* Main Layout */}
      <div className="camera-layout">
        
        {/* Camera List */}
        <div className="camera-list">
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {selectedStore === 'All' ? 'All Feeds' : selectedStore} ({filteredCameras.length})
          </div>
          
          {filteredCameras.length > 0 ? (
            filteredCameras.map(camera => (
              <div 
                key={camera.id} 
                className={`camera-item ${selectedCamera.id === camera.id ? 'active' : ''}`} 
                onClick={() => setSelectedCamera(camera)}
              >
                <div className="camera-store-name">{camera.store}</div>
                <div className="camera-location-name">
                  <FaVideo size={12} style={{ color: '#94a3b8' }} /> {camera.location}
                </div>
                <div className="camera-status">
                  <span className={`status-dot ${camera.status}`}></span>
                  <span style={{ color: camera.status === 'online' ? '#165d3c' : '#dc2626' }}>{camera.status.toUpperCase()}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '11px' }}>{camera.lastCheck}</span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              No cameras found.
            </div>
          )}
        </div>

        {/* Camera Viewer */}
        <div className="camera-viewer">
          <div className="viewer-header">
            <div className="viewer-title">{selectedCamera.store} - {selectedCamera.location}</div>
            <div className="viewer-info">
              <span className="info-item"><FaVideo /> Cam #{selectedCamera.id}</span>
              <span className="info-item">
                Status: 
                <strong style={{ color: selectedCamera.status === 'online' ? '#165d3c' : '#dc2626' }}>
                  {selectedCamera.status.toUpperCase()}
                </strong>
              </span>
              <span className="info-item">{selectedCamera.lastCheck}</span>
            </div>
          </div>
          
          <div className="video-container">
            <div className="video-placeholder">
              {selectedCamera.status === 'online' ? (
                <>
                  <FaVideo size={64} style={{ opacity: 0.5, color: 'white' }} />
                  <span style={{ color: '#666', fontSize: '14px' }}>Live Feed</span>
                </>
              ) : (
                <>
                  <FaExclamationTriangle size={64} style={{ opacity: 0.5, color: '#ef4444' }} />
                  <span style={{ color: '#ef4444', fontSize: '14px' }}>Signal Lost</span>
                </>
              )}
            </div>
          </div>

          <div className="video-controls">
            <button className="control-btn">
              <FaSync /> Refresh
            </button>
            <button className="control-btn">
              <FaCamera /> Capture
            </button>
            <button className="control-btn">
              <FaCog /> Settings
            </button>
            <button className="control-btn" style={{ marginLeft: 'auto' }}>
              <FaExpand /> Fullscreen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraManagement;