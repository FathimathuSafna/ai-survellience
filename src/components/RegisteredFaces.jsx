import { useState, useEffect } from 'react';
import axios from 'axios';

const RegisteredFaces = () => {
  const [faces, setFaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    loadFaces();
  }, []);

  const loadFaces = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/faces`);
      setFaces(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading faces:', err);
      setLoading(false);
    }
  };

  const deleteFace = async (id, name) => {
    if (!window.confirm(`Delete ${name} from the system?`)) return;

    try {
      const response = await axios.delete(`${API_URL}/faces/${id}`);
      if (response.data.success) {
        loadFaces();
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete face');
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a1a1a, #0a0a0a)',
      padding: '20px',
      borderRadius: '12px',
      margin: '20px',
      border: '2px solid #32a629',
      boxShadow: '0 4px 15px rgba(50, 166, 41, 0.2)'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '2px solid #32a629'
      }}>
        <h3 style={{ 
          color: '#f1fff0',
          fontSize: '20px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          margin: 0
        }}>
          <i className="fas fa-users"></i>
          Registered Employees
          <span style={{
            background: '#32a629',
            color: '#000',
            padding: '3px 12px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold',
            marginLeft: '8px'
          }}>
            {faces.length}
          </span>
        </h3>
        <button
          onClick={loadFaces}
          style={{
            padding: '8px 18px',
            border: 'none',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #32a629, #2d9524)',
            color: '#f1fff0',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            boxShadow: '0 3px 10px rgba(50, 166, 41, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 5px 15px rgba(50, 166, 41, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 3px 10px rgba(50, 166, 41, 0.3)';
          }}
        >
          <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
          Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ 
          color: '#f1fff0', 
          textAlign: 'center', 
          padding: '30px',
          fontSize: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '15px'
        }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#32a629' }}></i>
          Loading employees...
        </div>
      ) : faces.length === 0 ? (
        <div style={{ 
          color: '#888', 
          textAlign: 'center', 
          padding: '30px',
          fontSize: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '15px',
          background: '#0a0a0a',
          borderRadius: '8px',
          border: '2px dashed #333'
        }}>
          <i className="fas fa-user-slash" style={{ fontSize: '48px', color: '#333' }}></i>
          <div>
            <div style={{ marginBottom: '8px' }}>No employees registered yet</div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Register your first employee using the form above
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          maxHeight: '400px',
          overflowY: 'auto',
          paddingRight: '5px'
        }}>
          {faces.map((face, index) => (
            <div
              key={face._id}
              style={{
                background: '#0a0a0a',
                padding: '15px',
                margin: '10px 0',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '2px solid #222',
                transition: 'all 0.3s ease',
                animation: `slideIn 0.3s ease-out ${index * 0.1}s both`,
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#32a629';
                e.currentTarget.style.transform = 'translateX(5px)';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(50, 166, 41, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#222';
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                <div style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #32a629, #2d9524)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  color: '#f1fff0',
                  boxShadow: '0 3px 10px rgba(50, 166, 41, 0.3)'
                }}>
                  <i className="fas fa-user"></i>
                </div>
                <div>
                  <div style={{
                    color: '#f1fff0',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    marginBottom: '4px'
                  }}>
                    {face.name}
                  </div>
                  <div style={{
                    color: '#888',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    <i className="fas fa-clock"></i>
                    {new Date(face.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <button
                onClick={() => deleteFace(face._id, face.name)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #ff4444, #cc0000)',
                  color: '#f1fff0',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '13px',
                  transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                  boxShadow: '0 3px 10px rgba(255, 68, 68, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 5px 15px rgba(255, 68, 68, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 3px 10px rgba(255, 68, 68, 0.3)';
                }}
              >
                <i className="fas fa-trash-alt"></i>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
      
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        /* Custom scrollbar */
        div::-webkit-scrollbar {
          width: 6px;
        }
        
        div::-webkit-scrollbar-track {
          background: #0a0a0a;
          border-radius: 3px;
        }
        
        div::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #32a629, #2d9524);
          border-radius: 3px;
        }
        
        div::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #3bb82f, #32a629);
        }
      `}</style>
    </div>
  );
};

export default RegisteredFaces;