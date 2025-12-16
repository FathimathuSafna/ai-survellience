import { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';

const FaceRecognition = ({ videoCanvas, overlayCanvas }) => {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('Waiting for camera...');
  const [isReady, setIsReady] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [currentPerson, setCurrentPerson] = useState(null);
  const [entryHistory, setEntryHistory] = useState([]);
  const [currentPeople, setCurrentPeople] = useState([]);
  const [todaySummary, setTodaySummary] = useState(null);
  const [unknownPersons, setUnknownPersons] = useState([]);
  
  const currentFacesRef = useRef(new Set());
  const unknownFacesRef = useRef(new Set());
  const faceAbsentCountRef = useRef(0);
  const recognitionIntervalRef = useRef(null);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    if (videoCanvas) {
      loadModels();
      fetchUnknownPersons();
    }
  }, [videoCanvas]);

  useEffect(() => {
    return () => {
      if (recognitionIntervalRef.current) {
        clearInterval(recognitionIntervalRef.current);
      }
    };
  }, []);

  const loadModels = async () => {
    try {
      setStatus('Loading face detection models...');
      const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
      
      await Promise.all([
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
      ]);
      
      setStatus('✅ Ready! Auto-starting face detection...');
      setIsReady(true);
      
      setTimeout(() => {
        if (videoCanvas && !isRecognizing) {
          console.log('🚀 Auto-starting face detection...');
          startRecognition();
        }
      }, 1000);
      
    } catch (err) {
      setStatus('❌ Error loading models: ' + err.message);
      console.error('Model loading error:', err);
    }
  };

  const getFaceDescriptor = async () => {
    if (!videoCanvas || videoCanvas.width === 0 || videoCanvas.height === 0) {
      return null;
    }

    try {
      const detections = await faceapi
        .detectAllFaces(videoCanvas)
        .withFaceLandmarks()
        .withFaceDescriptors();

      return detections && detections.length > 0 ? detections : null;
    } catch (err) {
      console.error('Face detection error:', err);
      return null;
    }
  };

  const clearDisplay = () => {
    if (overlayCanvas) {
      const ctx = overlayCanvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    }
    setCurrentPerson(null);
  };

  const drawDetection = (detection, label, color, message = '') => {
    if (!overlayCanvas) return;

    try {
      const ctx = overlayCanvas.getContext('2d');
      if (!ctx) return;

      const box = detection.detection.box;
      const scaleX = overlayCanvas.width / videoCanvas.width;
      const scaleY = overlayCanvas.height / videoCanvas.height;

      const x = box.x * scaleX;
      const y = box.y * scaleY;
      const w = box.width * scaleX;
      const h = box.height * scaleY;

      const cornerLength = 15;
      const lineWidth = 2;
      
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';

      // Top-left
      ctx.beginPath();
      ctx.moveTo(x + cornerLength, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + cornerLength);
      ctx.stroke();

      // Top-right
      ctx.beginPath();
      ctx.moveTo(x + w - cornerLength, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + cornerLength);
      ctx.stroke();

      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(x, y + h - cornerLength);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x + cornerLength, y + h);
      ctx.stroke();

      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(x + w - cornerLength, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + w, y + h - cornerLength);
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.font = '400 11px Arial';
      const labelText = label;
      const labelWidth = ctx.measureText(labelText).width;
      const padding = 6;
      
      ctx.fillRect(x, y - 20, labelWidth + padding * 2, 18);
      
      ctx.fillStyle = '#000';
      ctx.fillText(labelText, x + padding, y - 8);

      if (message) {
        ctx.fillStyle = color;
        ctx.font = '400 10px Arial';
        const msgWidth = ctx.measureText(message).width;
        ctx.fillRect(x, y + h + 3, msgWidth + padding * 2, 16);
        ctx.fillStyle = '#000';
        ctx.fillText(message, x + padding, y + h + 13);
      }

    } catch (err) {
      console.error('Draw error:', err);
    }
  };

  // ✅ CAPTURE FACE IMAGE FROM CANVAS
  const captureFaceImage = (detection) => {
    try {
      if (!videoCanvas) return null;

      const box = detection.detection.box;
      
      // Add padding around face
      const padding = 20;
      const x = Math.max(0, box.x - padding);
      const y = Math.max(0, box.y - padding);
      const width = Math.min(videoCanvas.width - x, box.width + padding * 2);
      const height = Math.min(videoCanvas.height - y, box.height + padding * 2);

      // Create temporary canvas for face crop
      const faceCanvas = document.createElement('canvas');
      faceCanvas.width = width;
      faceCanvas.height = height;
      const faceCtx = faceCanvas.getContext('2d');

      // Draw cropped face
      faceCtx.drawImage(
        videoCanvas,
        x, y, width, height,
        0, 0, width, height
      );

      // Convert to base64
      return faceCanvas.toDataURL('image/jpeg', 0.8);
    } catch (err) {
      console.error('Error capturing face image:', err);
      return null;
    }
  };

  const checkLastEvent = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/attendance/last/${userId}`);
      return response.data.lastEvent;
    } catch (err) {
      console.error('Error checking last event:', err);
      return null;
    }
  };

  const fetchDailySummary = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/attendance/summary/${userId}`);
      if (response.data.success) {
        setTodaySummary(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const fetchUnknownPersons = async () => {
    try {
      const response = await axios.get(`${API_URL}/unknown/list?limit=10`);
      if (response.data.success) {
        setUnknownPersons(response.data.unknownPersons);
      }
    } catch (err) {
      console.error('Error fetching unknown persons:', err);
    }
  };

  const getBreakEmoji = (breakType) => {
    const emojis = {
      'tea': '☕',
      'lunch': '🍽️',
      'snacks': '🍪',
      'other': '⏸️',
      'none': '🚪'
    };
    return emojis[breakType] || '⏸️';
  };

  // ✅ LOG UNKNOWN PERSON WITH FACE IMAGE
  const logUnknownPerson = async (detection, confidence) => {
    try {
      const descriptor = detection.descriptor;
      
      // Create a unique key for this descriptor to prevent duplicate logs
      const descriptorKey = Array.from(descriptor).slice(0, 10).join(',');
      
      // Check if we already logged this unknown person recently (within last 30 seconds)
      if (unknownFacesRef.current.has(descriptorKey)) {
        console.log(`⏱️ Unknown person already logged recently - skipping`);
        return;
      }
      
      console.log(`⚠️ Logging unknown person (${confidence}%)`);
      
      // ✅ CAPTURE FACE IMAGE
      const faceImage = captureFaceImage(detection);
      
      const response = await axios.post(`${API_URL}/unknown/log`, {
        descriptor: Array.from(descriptor),
        confidence: parseFloat(confidence),
        faceImage: faceImage  // ✅ Send face image
      });

      if (response.data.success) {
        const { displayName, timestamp, totalDetections, isNew } = response.data.data;
        
        if (isNew) {
          console.log(`✅ NEW unknown person logged: ${displayName}`);
        } else {
          console.log(`✅ Existing unknown person detected: ${displayName}`);
        }
        
        // Add to cooldown set (30 seconds cooldown)
        unknownFacesRef.current.add(descriptorKey);
        
        // Remove from cooldown after 30 seconds
        setTimeout(() => {
          unknownFacesRef.current.delete(descriptorKey);
        }, 30000); // 30 seconds
        
        if (isNew) {
          setStatus(`⚠️ NEW: ${displayName} detected at ${new Date(timestamp).toLocaleTimeString()}`);
        } else {
          setStatus(`⚠️ ${displayName} detected again`);
        }
        
        // Refresh unknown persons list
        fetchUnknownPersons();
        
        setTimeout(() => {
          setStatus(`🟢 Ready - Monitoring door...`);
        }, 5000);
      }
    } catch (err) {
      console.error('❌ Error logging unknown person:', err);
    }
  };

  const logDoorEntry = async (userId, employeeName) => {
    try {
      const lastEvent = await checkLastEvent(userId);
      
      if (lastEvent === 'cooldown') {
        console.log(`⏱️ Cooldown active for ${employeeName} - ignoring detection`);
        return;
      }
      
      const currentEvent = lastEvent === 'in' ? 'out' : 'in';
      
      console.log(`🚪 Last event: ${lastEvent || 'none'} → Current: ${currentEvent.toUpperCase()}`);
      
      const endpoint = currentEvent === 'in' 
        ? `${API_URL}/attendance/in` 
        : `${API_URL}/attendance/out`;
      
      const response = await axios.post(endpoint, {
        userId,
        employeeName
      });

      if (response.data.success) {
        const { timeIn, timeOut, sessionDuration, breakType, breakLabel, todayTotal, entryNumber } = response.data.data;
        
        if (currentEvent === 'in') {
          setStatus(`🚪 Welcome ${employeeName}!`);
        } else {
          const breakEmoji = getBreakEmoji(breakType);
          setStatus(`${breakEmoji} ${employeeName} - ${breakLabel} | Today: ${todayTotal}`);
        }
        
        fetchDailySummary(userId);
        
        setEntryHistory(prev => {
          const existingIndex = prev.findIndex(
            entry => entry.userId === userId && 
            new Date(entry.time).toDateString() === new Date().toDateString()
          );
          
          if (existingIndex !== -1) {
            const updated = [...prev];
            updated[existingIndex] = {
              ...updated[existingIndex],
              event: currentEvent,
              time: currentEvent === 'in' ? timeIn : timeOut,
              duration: sessionDuration || updated[existingIndex].duration,
              breakType: breakType || 'none',
              breakLabel: breakLabel || '',
              todayTotal: todayTotal || 'N/A',
              lastUpdate: Date.now()
            };
            return updated;
          } else {
            return [{
              employeeName,
              userId,
              event: currentEvent,
              time: currentEvent === 'in' ? timeIn : timeOut,
              duration: sessionDuration || 'N/A',
              breakType: breakType || 'none',
              breakLabel: breakLabel || '',
              todayTotal: todayTotal || 'N/A',
              entryNumber: entryNumber || '-',
              timestamp: Date.now()
            }, ...prev.slice(0, 9)];
          }
        });
        
        setTimeout(() => {
          setStatus(`🟢 Ready - Monitoring door...`);
        }, 3000);
      }
    } catch (err) {
      console.error('❌ Error logging attendance:', err);
      setStatus(`❌ Error logging attendance for ${employeeName}`);
    }
  };

  const handleSaveFace = async () => {
    if (!name.trim()) {
      alert('Please enter a name!');
      return;
    }

    if (!isReady) {
      alert('Please wait for models to load!');
      return;
    }

    setStatus('⏳ Detecting face...');
    const detections = await getFaceDescriptor();
    
    if (!detections) {
      setStatus('❌ No face detected. Please face the camera.');
      return;
    }

    const detection = detections[0];
    drawDetection(detection, name.trim(), '#32a629');

    const faceData = {
      name: name.trim(),
      descriptor: Array.from(detection.descriptor)
    };

    setStatus('⏳ Saving to database...');

    try {
      const response = await axios.post(`${API_URL}/faces/save`, faceData);
      if (response.data.success) {
        setStatus(`✅ Face saved: ${name}`);
        setName('');
        setTimeout(() => clearDisplay(), 2000);
      } else {
        setStatus('❌ Save failed: ' + response.data.message);
      }
    } catch (err) {
      console.error('Save error:', err);
      setStatus('❌ Network error. Is the server running?');
    }
  };

  const startRecognition = async () => {
    if (!isReady) {
      alert('Please wait for models to load!');
      return;
    }

    if (isRecognizing) {
      setStatus('✅ Already monitoring door!');
      return;
    }

    setIsRecognizing(true);
    setStatus('🔍 Monitoring door (Confidence: ≥50%)...');
    currentFacesRef.current.clear();
    unknownFacesRef.current.clear();
    setCurrentPeople([]);
    faceAbsentCountRef.current = 0;

    const interval = setInterval(async () => {
      const detections = await getFaceDescriptor();

      if (!detections) {
        faceAbsentCountRef.current++;
        
        if (faceAbsentCountRef.current >= 3) {
          if (currentFacesRef.current.size > 0) {
            console.log(`👋 All people left (${currentFacesRef.current.size} faces)`);
            clearDisplay();
            currentFacesRef.current.clear();
            setCurrentPeople([]);
            setStatus('🟢 Ready - Waiting for next entry...');
          }
        }
        return;
      }

      faceAbsentCountRef.current = 0;

      try {
        const response = await axios.get(`${API_URL}/faces`);
        const faces = response.data;

        if (!Array.isArray(faces) || faces.length === 0) {
          detections.forEach(detection => {
            const confidence = 0;
            
            // ✅ LOG UNKNOWN PERSON WITH IMAGE
            logUnknownPerson(detection, confidence);
            
            drawDetection(detection, 'Unknown', '#ff4444', '❌ No faces in database');
          });
          setStatus('❌ No faces in database');
          return;
        }

        clearDisplay();

        const detectedInThisCycle = new Set();
        const peopleInfo = [];

        detections.forEach(detection => {
          let bestMatch = { name: 'Unknown', distance: 999, userId: null };

          faces.forEach(face => {
            const savedDescriptor = new Float32Array(face.descriptor);
            const distance = faceapi.euclideanDistance(detection.descriptor, savedDescriptor);
            
            if (distance < bestMatch.distance) {
              bestMatch = { 
                name: face.name, 
                distance,
                userId: face._id 
              };
            }
          });

          if (bestMatch.distance < 0.5) {
            const confidence = ((1 - bestMatch.distance) * 100).toFixed(1);
            
            if (parseFloat(confidence) >= 50) {
              detectedInThisCycle.add(bestMatch.userId);
              
              if (!currentFacesRef.current.has(bestMatch.userId)) {
                console.log(`✅ NEW: ${bestMatch.name} (${confidence}%)`);
                
                currentFacesRef.current.add(bestMatch.userId);
                logDoorEntry(bestMatch.userId, bestMatch.name);
              }
              
              peopleInfo.push({
                name: bestMatch.name,
                userId: bestMatch.userId,
                confidence,
                status: 'detected',
                color: '#32a629',
                detectedAt: Date.now()
              });
              
              drawDetection(
                detection, 
                `${bestMatch.name} (${confidence}%)`, 
                '#32a629',
                '✅ Recognized'
              );
              
            } else if (parseFloat(confidence) >= 40) {
              drawDetection(
                detection,
                `${bestMatch.name} - Low (${confidence}%)`,
                '#ff9900',
                '⚠️ Move closer & face camera'
              );
            } else {
              drawDetection(
                detection,
                `Unknown (${confidence}%)`,
                '#ff4444',
                '❌ Not recognized'
              );
            }

          } else {
            // ✅ UNKNOWN PERSON - Distance > 0.5
            const confidence = ((1 - bestMatch.distance) * 100).toFixed(1);
            
            // ✅ LOG UNKNOWN PERSON WITH IMAGE
            logUnknownPerson(detection, confidence);
            
            drawDetection(
              detection,
              'Unknown Person',
              '#ff4444',
              '❌ Not in database'
            );
          }
        });

        setCurrentPeople(peopleInfo);
        
        const peopleWhoLeft = [];
        currentFacesRef.current.forEach(userId => {
          if (!detectedInThisCycle.has(userId)) {
            peopleWhoLeft.push(userId);
          }
        });
        
        peopleWhoLeft.forEach(userId => {
          currentFacesRef.current.delete(userId);
        });

      } catch (err) {
        console.error('Recognition error:', err);
        setStatus('❌ Recognition error');
      }

    }, 2000);

    recognitionIntervalRef.current = interval;
  };

  const stopRecognition = () => {
    if (recognitionIntervalRef.current) {
      clearInterval(recognitionIntervalRef.current);
      recognitionIntervalRef.current = null;
    }
    setIsRecognizing(false);
    currentFacesRef.current.clear();
    unknownFacesRef.current.clear();
    setCurrentPeople([]);
    faceAbsentCountRef.current = 0;
    clearDisplay();
    setStatus('✅ Recognition stopped');
    setCurrentPerson(null);
  };

  const deleteUnknownPerson = async (unknownId) => {
    try {
      const response = await axios.delete(`${API_URL}/unknown/${unknownId}`);
      if (response.data.success) {
        console.log(`🗑️ Deleted unknown person: ${unknownId}`);
        fetchUnknownPersons(); // Refresh list
      }
    } catch (err) {
      console.error('Error deleting unknown person:', err);
    }
  };

  return (
    <div style={{ width: '100%', padding: '20px' }}>
      {/* Status Bar */}
      <div style={{
        padding: '10px 15px',
        background: 'linear-gradient(135deg, #1a1a1a, #0a0a0a)',
        borderRadius: '8px',
        color: '#f1fff0',
        marginBottom: '15px',
        textAlign: 'center',
        border: `2px solid ${isRecognizing ? '#32a629' : '#666'}`,
        boxShadow: isRecognizing ? '0 4px 15px rgba(50, 166, 41, 0.3)' : 'none',
        fontSize: '13px',
        fontWeight: '400'
      }}>
        <i className={`fas ${isReady ? 'fa-check-circle' : 'fa-spinner fa-spin'}`} style={{ marginRight: '8px', fontSize: '12px' }}></i>
        {status}
      </div>

      {/* Today's Summary */}
      {todaySummary && (
        <div style={{
          background: 'linear-gradient(135deg, #1a1a1a, #0a0a0a)',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '15px',
          border: '2px solid #32a629',
          boxShadow: '0 4px 15px rgba(50, 166, 41, 0.3)'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#32a629', fontSize: '14px', fontWeight: '400' }}>
            <i className="fas fa-calendar-day" style={{ fontSize: '12px' }}></i> Today's Summary - {todaySummary.employeeName}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div style={{ background: '#0a0a0a', padding: '10px', borderRadius: '6px', border: '1px solid #32a629' }}>
              <div style={{ color: '#888', fontSize: '10px', marginBottom: '4px' }}>Total Time</div>
              <div style={{ color: '#32a629', fontSize: '16px', fontWeight: 'bold' }}>
                {todaySummary.totalHours || '0h 0m'}
              </div>
            </div>
            
            <div style={{ background: '#0a0a0a', padding: '10px', borderRadius: '6px', border: '1px solid #32a629' }}>
              <div style={{ color: '#888', fontSize: '10px', marginBottom: '4px' }}>Sessions</div>
              <div style={{ color: '#32a629', fontSize: '16px', fontWeight: 'bold' }}>
                {todaySummary.sessions?.length || 0}
              </div>
            </div>
          </div>

          {todaySummary.breaks && (todaySummary.breaks.tea > 0 || todaySummary.breaks.lunch > 0 || todaySummary.breaks.snacks > 0) && (
            <div style={{ background: '#0a0a0a', padding: '10px', borderRadius: '6px', marginTop: '10px' }}>
              <div style={{ color: '#888', fontSize: '10px', marginBottom: '6px' }}>Break Times (included in total)</div>
              <div style={{ display: 'flex', gap: '10px', fontSize: '11px' }}>
                {todaySummary.breaks.tea > 0 && (
                  <span style={{ color: '#f1fff0' }}>☕ {Math.floor(todaySummary.breaks.tea)}m</span>
                )}
                {todaySummary.breaks.lunch > 0 && (
                  <span style={{ color: '#f1fff0' }}>🍽️ {Math.floor(todaySummary.breaks.lunch)}m</span>
                )}
                {todaySummary.breaks.snacks > 0 && (
                  <span style={{ color: '#f1fff0' }}>🍪 {Math.floor(todaySummary.breaks.snacks)}m</span>
                )}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px', fontSize: '11px' }}>
            {todaySummary.firstIn && (
              <div style={{ color: '#888' }}>
                🚪 First In: <span style={{ color: '#32a629' }}>{new Date(todaySummary.firstIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
              </div>
            )}
            {todaySummary.lastOut && (
              <div style={{ color: '#888' }}>
                👋 Last Out: <span style={{ color: '#ff9900' }}>{new Date(todaySummary.lastOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Register New Face */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '15px', 
        flexWrap: 'wrap',
        padding: '15px',
        background: '#1a1a1a',
        borderRadius: '8px',
        border: '1px solid #333'
      }}>
        <h3 style={{ width: '100%', margin: '0 0 10px 0', color: '#f1fff0', fontSize: '13px', fontWeight: '400' }}>
          <i className="fas fa-user-plus" style={{ fontSize: '12px' }}></i> Register New Employee
        </h3>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter employee name..."
          disabled={!isReady || !videoCanvas}
          style={{
            padding: '10px 14px',
            border: '2px solid #32a629',
            borderRadius: '8px',
            background: '#0a0a0a',
            color: '#f1fff0',
            fontSize: '13px',
            flex: 1,
            minWidth: '180px',
            outline: 'none',
            fontWeight: '300'
          }}
        />
        <button
          onClick={handleSaveFace}
          disabled={!isReady || !videoCanvas}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            background: isReady && videoCanvas ? 'linear-gradient(135deg, #32a629, #2d9524)' : '#333',
            color: isReady && videoCanvas ? '#f1fff0' : '#666',
            fontWeight: '400',
            cursor: isReady && videoCanvas ? 'pointer' : 'not-allowed',
            fontSize: '13px'
          }}
        >
          <i className="fas fa-save" style={{ fontSize: '12px' }}></i> Save Face
        </button>
      </div>

      {/* Door Monitoring Controls */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '15px',
        padding: '15px',
        background: '#1a1a1a',
        borderRadius: '8px',
        border: '1px solid #333'
      }}>
        <h3 style={{ width: '100%', margin: '0 0 10px 0', color: '#f1fff0', fontSize: '13px', fontWeight: '400' }}>
          <i className="fas fa-door-open" style={{ fontSize: '12px' }}></i> Door Monitoring (Confidence: ≥50%)
        </h3>
        <button
          onClick={startRecognition}
          disabled={!isReady || isRecognizing || !videoCanvas}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            background: isReady && !isRecognizing && videoCanvas ? 'linear-gradient(135deg, #32a629, #2d9524)' : '#333',
            color: isReady && !isRecognizing && videoCanvas ? '#f1fff0' : '#666',
            fontWeight: '400',
            cursor: isReady && !isRecognizing && videoCanvas ? 'pointer' : 'not-allowed',
            fontSize: '13px',
            flex: 1
          }}
        >
          <i className="fas fa-play" style={{ fontSize: '12px' }}></i> Start Monitoring
        </button>
        <button
          onClick={stopRecognition}
          disabled={!isRecognizing}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            background: isRecognizing ? 'linear-gradient(135deg, #ff4444, #cc0000)' : '#333',
            color: isRecognizing ? '#f1fff0' : '#666',
            fontWeight: '400',
            cursor: isRecognizing ? 'pointer' : 'not-allowed',
            fontSize: '13px',
            flex: 1
          }}
        >
          <i className="fas fa-stop" style={{ fontSize: '12px' }}></i> Stop
        </button>
      </div>

      {/* Break Info Panel */}
      <div style={{
        background: '#1a1a1a',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '15px',
        border: '1px solid #333'
      }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#f1fff0', fontSize: '12px', fontWeight: '400' }}>
          <i className="fas fa-info-circle" style={{ fontSize: '11px' }}></i> Confidence Levels & Break Schedule
        </h4>
        <div style={{ marginBottom: '10px', fontSize: '11px', color: '#888' }}>
          <div style={{ marginBottom: '4px' }}>
            🟢 <span style={{ color: '#32a629' }}>≥50%</span> - Recognized & Logged
          </div>
          <div style={{ marginBottom: '4px' }}>
            🟠 <span style={{ color: '#ff9900' }}>40-49%</span> - Uncertain (move closer)
          </div>
          <div style={{ marginBottom: '4px' }}>
            🔴 <span style={{ color: '#ff4444' }}>&lt;40%</span> - Not recognized (logged as unknown)
          </div>
        </div>
        <div style={{ borderTop: '1px solid #333', paddingTop: '8px', marginTop: '8px' }}>
          <div style={{ color: '#888', fontSize: '10px', marginBottom: '6px' }}>Break Times (included in work hours):</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '11px' }}>
            <div style={{ background: '#0a0a0a', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ marginBottom: '4px' }}>☕ Tea</div>
              <div style={{ color: '#888', fontSize: '10px' }}>10-11 AM</div>
              <div style={{ color: '#32a629', fontSize: '10px' }}>15 min</div>
            </div>
            <div style={{ background: '#0a0a0a', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ marginBottom: '4px' }}>🍽️ Lunch</div>
              <div style={{ color: '#888', fontSize: '10px' }}>12-2 PM</div>
              <div style={{ color: '#32a629', fontSize: '10px' }}>1 hour</div>
            </div>
            <div style={{ background: '#0a0a0a', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ marginBottom: '4px' }}>🍪 Snacks</div>
              <div style={{ color: '#888', fontSize: '10px' }}>4-5 PM</div>
              <div style={{ color: '#32a629', fontSize: '10px' }}>15 min</div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ UPDATED - Unknown Persons Panel WITH FILE-BASED IMAGES */}
      {unknownPersons.length > 0 && (
        <div style={{
          background: '#1a1a1a',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '15px',
          border: '2px solid #ff4444',
          boxShadow: '0 4px 15px rgba(255, 68, 68, 0.3)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#ff4444', fontSize: '13px', fontWeight: '400' }}>
            <i className="fas fa-user-secret" style={{ fontSize: '12px' }}></i> Unknown Persons Detected ({unknownPersons.length})
          </h3>
          {unknownPersons.map((person, index) => (
            <div key={index} style={{
              background: '#0a0a0a',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '8px',
              borderLeft: '3px solid #ff4444',
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
              {/* ✅ FACE IMAGE FROM FILE SYSTEM */}
              {person.faceImageUrl && (
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '2px solid #ff4444',
                  flexShrink: 0,
                  backgroundColor: '#000'
                }}>
                  <img 
                    src={person.faceImageUrl}
                    alt={person.displayName}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #ff4444; font-size: 10px;">No Image</div>';
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              )}
              
              {!person.faceImageUrl && (
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '8px',
                  border: '2px solid #ff4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#000',
                  color: '#ff4444',
                  fontSize: '10px',
                  flexShrink: 0
                }}>
                  No Image
                </div>
              )}
              
              <div style={{ flex: 1 }}>
                <div style={{ color: '#ff4444', fontWeight: 'bold', fontSize: '13px', marginBottom: '4px' }}>
                  ⚠️ {person.displayName}
                </div>
                <div style={{ color: '#888', fontSize: '11px', marginBottom: '2px' }}>
                  First Seen: {new Date(person.firstSeen).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </div>
                <div style={{ color: '#888', fontSize: '11px', marginBottom: '2px' }}>
                  Last Seen: {new Date(person.lastSeen).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </div>
                <div style={{ color: '#ff9900', fontSize: '11px', fontWeight: '400' }}>
                  Detection Count: {person.totalDetections}
                </div>
              </div>
              
              <button
                onClick={() => deleteUnknownPerson(person.unknownId)}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  background: '#ff4444',
                  color: '#fff',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: '400',
                  alignSelf: 'flex-start'
                }}
              >
                <i className="fas fa-trash" style={{ fontSize: '10px' }}></i> Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Currently Detected */}
      {currentPeople.length > 0 && (
        <div style={{
          background: '#1a1a1a',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '15px',
          border: '1px solid #333'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#f1fff0', fontSize: '13px', fontWeight: '400' }}>
            <i className="fas fa-users" style={{ fontSize: '12px' }}></i> Currently Detected ({currentPeople.length})
          </h3>
          {currentPeople.map((person, index) => (
            <div key={index} style={{
              background: 'linear-gradient(135deg, #1a1a1a, #0a0a0a)',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '8px',
              border: `2px solid ${person.color}`,
              boxShadow: `0 4px 15px ${person.color}40`
            }}>
              <div style={{ color: '#f1fff0', fontSize: '13px', marginBottom: '6px', fontWeight: '400' }}>
                <strong>👤 {person.name}</strong>
              </div>
              <div style={{ color: '#f1fff0', fontSize: '11px', marginBottom: '4px', fontWeight: '300' }}>
                <strong>🆔 ID:</strong> {person.userId.slice(0, 16)}...
              </div>
              <div style={{ 
                color: person.color, 
                fontSize: '11px', 
                marginBottom: '4px',
                fontWeight: '400' 
              }}>
                <strong>📊 Match:</strong> {person.confidence}%
              </div>
              <div style={{ color: '#888', fontSize: '10px', fontWeight: '300' }}>
                <strong>⏰</strong> {new Date(person.detectedAt).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Today's Activity */}
      {entryHistory.length > 0 && (
        <div style={{
          background: '#1a1a1a',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #333'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#f1fff0', fontSize: '13px', fontWeight: '400' }}>
            <i className="fas fa-history" style={{ fontSize: '12px' }}></i> Today's Activity (One Entry Per Person)
          </h3>
          {entryHistory.map((entry, index) => {
            const breakEmoji = getBreakEmoji(entry.breakType);
            const isCurrentlyIn = entry.event === 'in';
            
            return (
              <div key={index} style={{
                background: '#0a0a0a',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '8px',
                borderLeft: `3px solid ${isCurrentlyIn ? '#32a629' : '#ff9900'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    color: isCurrentlyIn ? '#32a629' : '#ff9900', 
                    fontWeight: 'bold', 
                    fontSize: '14px', 
                    marginBottom: '6px' 
                  }}>
                    👤 {entry.employeeName}
                  </div>
                  
                  <div style={{ color: '#888', fontSize: '11px', marginBottom: '4px' }}>
                    Status: <span style={{ color: isCurrentlyIn ? '#32a629' : '#ff9900', fontWeight: '400' }}>
                      {isCurrentlyIn ? '🚪 Currently IN Office' : `${breakEmoji} Currently OUT (${entry.breakLabel})`}
                    </span>
                  </div>
                  
                  {!isCurrentlyIn && entry.duration !== 'N/A' && (
                    <div style={{ color: '#888', fontSize: '10px', marginBottom: '2px' }}>
                      ⏱️ Last Session: {entry.duration}
                    </div>
                  )}
                  
                  {entry.todayTotal && entry.todayTotal !== 'N/A' && (
                    <div style={{ color: '#32a629', fontSize: '11px', fontWeight: '400' }}>
                      📊 Today's Total: {entry.todayTotal}
                    </div>
                  )}
                </div>
                
                <div style={{ 
                  color: '#f1fff0', 
                  fontSize: '11px', 
                  textAlign: 'right', 
                  fontWeight: '300',
                  minWidth: '100px'
                }}>
                  <div style={{ 
                    color: isCurrentlyIn ? '#32a629' : '#ff9900', 
                    fontWeight: '400',
                    marginBottom: '2px'
                  }}>
                    {isCurrentlyIn ? '⏰ IN at' : '👋 OUT at'}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                    {new Date(entry.time).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FaceRecognition;