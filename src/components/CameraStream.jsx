import { useEffect, useRef, useState } from 'react';

const CameraStream = ({ onStreamReady }) => {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const detectionCanvasRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  const playerRef = useRef(null);
  const copyIntervalRef = useRef(null);

  useEffect(() => {
    // Load JSMpeg
    const script = document.createElement('script');
    script.src = '/jsmpeg.min.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ JSMpeg loaded');
      initializeStream();
    };
    script.onerror = () => {
      setError('Failed to load JSMpeg');
    };
    document.body.appendChild(script);

    return () => {
      cleanup();
      try {
        document.body.removeChild(script);
      } catch (e) {
        // Ignore
      }
    };
  }, []);

  const cleanup = () => {
    if (copyIntervalRef.current) {
      clearInterval(copyIntervalRef.current);
    }
    if (playerRef.current) {
      playerRef.current.destroy();
    }
  };

  const copyFramesToDetectionCanvas = () => {
    const canvas = canvasRef.current;
    const detCanvas = detectionCanvasRef.current;
    
    if (!canvas || !detCanvas) return;
    if (canvas.width === 0 || canvas.height === 0) return;

    const ctx = detCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    try {
      ctx.drawImage(canvas, 0, 0, detCanvas.width, detCanvas.height);
    } catch (err) {
      console.error('Frame copy error:', err);
    }
  };

  const initializeStream = () => {
    if (!window.JSMpeg) {
      console.error('❌ JSMpeg not available');
      return;
    }

    console.log('🎥 Initializing 720p HD MPEG1 stream...');
    
    const canvas = canvasRef.current;
    const detCanvas = detectionCanvasRef.current;
    const overlay = overlayRef.current;

    if (!canvas || !detCanvas || !overlay) {
      console.error('❌ Canvas elements not available');
      return;
    }

    detCanvas.width = 1280;
    detCanvas.height = 720;
    overlay.width = 1280;
    overlay.height = 720;

    try {
      const player = new window.JSMpeg.Player('ws://localhost:5000', {
        canvas: canvas,
        autoplay: true,
        audio: false,
        loop: false,
        disableGl: false,
        disableWebAssembly: false,
        preserveDrawingBuffer: true,
        progressive: true,
        throttled: false,
        chunkSize: 1024 * 1024,
        maxAudioLag: 0,
        videoBufferSize: 1024 * 1024,
        onVideoDecode: () => {
          if (!isConnected) {
            console.log('✅ 720p HD video playing!');
            setIsConnected(true);
            setError('');

            // Start frame copying
            if (copyIntervalRef.current) {
              clearInterval(copyIntervalRef.current);
            }
            copyIntervalRef.current = setInterval(copyFramesToDetectionCanvas, 40);

            // Notify parent
            onStreamReady(detCanvas, overlay);
            console.log('✅ 720p HD stream initialized!');
          }
        },
        onSourceCompleted: () => {
          console.log('📡 Stream completed');
          setIsConnected(false);
        }
      });

      playerRef.current = player;

      // Timeout check
      setTimeout(() => {
        if (!isConnected) {
          setError('Stream timeout - check camera connection');
        }
      }, 10000);

    } catch (err) {
      console.error('❌ Player init error:', err);
      setError('Failed to initialize player');
    }
  };

  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: '#000',
      overflow: 'hidden'
    }}>
      <canvas 
        ref={canvasRef}
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%', 
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          zIndex: 1,
          imageRendering: 'auto'
        }}
      />
      
      <canvas 
        ref={detectionCanvasRef}
        style={{ display: 'none' }}
      />
      
      <canvas 
        ref={overlayRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          pointerEvents: 'none',
          zIndex: 2
        }}
      />
      
      {!isConnected && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          color: error ? '#ff4444' : '#32a629',
          fontSize: '20px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(26, 26, 26, 0.95))',
          padding: '40px 60px',
          borderRadius: '16px',
          zIndex: 100,
          maxWidth: '80%',
          border: `3px solid ${error ? '#ff4444' : '#32a629'}`,
          boxShadow: `0 8px 32px ${error ? 'rgba(255, 68, 68, 0.3)' : 'rgba(50, 166, 41, 0.3)'}`,
          backdropFilter: 'blur(10px)',
          fontWeight: '600'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '20px',
            animation: error ? 'none' : 'spin 2s linear infinite'
          }}>
            {error ? '⚠️' : '⏳'}
          </div>
          {error || 'Connecting to 720p HD stream...'}
          <div style={{
            fontSize: '14px',
            marginTop: '15px',
            color: '#888',
            fontWeight: '400'
          }}>
            High Quality Mode
          </div>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {isConnected && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '10px 16px',
          borderRadius: '8px',
          color: '#32a629',
          fontSize: '13px',
          fontWeight: 'bold',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '4px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(50, 166, 41, 0.3)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#32a629',
              animation: 'pulse 2s infinite',
              boxShadow: '0 0 8px rgba(50, 166, 41, 0.6)'
            }}></div>
            <span>LIVE HD</span>
          </div>
          <div style={{
            fontSize: '11px',
            color: '#888',
            fontWeight: 'normal'
          }}>
            720p @ 25fps
          </div>
          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.6; transform: scale(1.2); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default CameraStream;