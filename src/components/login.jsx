import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, Camera, Scan } from 'lucide-react';

export default function LoginPage({ setView }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    // Clear previous errors
    setError('');

    // Authentication Logic
    if (email === "face@gmail.com" && password === "1234") {
      setView("face");
    } 
    else if (email === "hr@gmail.com" && password === "1234") {
      setView("hr");
    } 
    else if (email === "admin@gmail.com" && password === "1234") {
      setView("admin");
    } 
    else {
      setError("Invalid email or password");
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7f6 0%, #ebf2e9 100%)',
      position: 'relative',
      overflow: 'hidden',
      padding: '20px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        /* Smooth Scan Line with Easing */
        @keyframes scanLine {
          0% { top: -10%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
        
        @keyframes gridPulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        
        @keyframes hexFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(10deg); }
        }

        /* Global Smooth Transitions for UI elements */
        input, button, .feature-item {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
      `}</style>

      {/* Background Elements */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>      
        {[...Array(8)].map((_, i) => (
          <div
            key={`hex-${i}`}
            className="hex-shape"
            style={{
              position: 'absolute',
              width: '40px',
              height: '40px',
              opacity: 0.1,
              clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
              background: i % 2 === 0 ? '#165d3c' : '#bdf59a',
              left: `${(i % 4) * 25 + 10}%`,
              top: `${Math.floor(i / 4) * 50 + 10}%`,
              animation: `hexFloat ${7 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>

      {/* Main Login Container */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        maxWidth: '800px', 
        width: '100%',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(22, 93, 60, 0.15), 0 0 1px rgba(22, 93, 60, 0.2)',
        border: '1px solid rgba(189, 245, 154, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        
        {/* Left Side */}
        <div style={{
          background: 'linear-gradient(135deg, #1e7b4ef8 0%, #bdf59a 100%)',
          padding: '30px 25px',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>          
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(189, 245, 154, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(189, 245, 154, 0.1) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
            opacity: 0.3
          }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <div style={{
                width: '50px',
                height: '50px',
                background: 'rgba(189, 245, 154, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                border: '3px solid rgba(189, 245, 154, 0.4)',
                position: 'relative'
              }}>
                <Shield size={25} color="#bdf59a" />
                <div style={{
                  position: 'absolute',
                  inset: '-6px',
                  border: '1px solid rgba(189, 245, 154, 0.2)',
                  borderRadius: '50%',
                  animation: 'gridPulse 2.5s ease-in-out infinite'
                }} />
              </div>
            </div>

            <h1 style={{
              fontSize: '20px',
              marginBottom: '8px',
              textAlign: 'center',
              fontWeight: 700,
              letterSpacing: '-0.5px'
            }}>
              AI Surveillance System
            </h1>

            <p style={{
              fontSize: '12px',
              opacity: 0.9,
              textAlign: 'center',
              marginBottom: '25px',
              fontWeight: 400,
              color: '#bdf59a'
            }}>
              Advanced Security & Monitoring Platform
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { icon: Camera, text: 'Real-time Video Analytics' },
                { icon: Scan, text: 'AI-Powered Threat Detection' },
                { icon: Shield, text: 'End-to-End Encryption' }
              ].map((feature, idx) => (
                <div key={idx} className="feature-item" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  background: 'rgba(189, 245, 154, 0.08)',
                  borderRadius: '6px',
                  border: '1px solid rgba(189, 245, 154, 0.15)'
                }}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    background: 'rgba(189, 245, 154, 0.15)',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <feature.icon size={18} color="#bdf59a" />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 500 }}>{feature.text}</span>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '25px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(189, 245, 154, 0.2)',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '15px',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#bdf59a' }}>99.9%</div>
                <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>Uptime</div>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#bdf59a' }}>24/7</div>
                <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>Monitoring</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div style={{
          padding: '30px 30px',
          background: 'white',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{ width: '100%', maxWidth: '320px', margin: '0 auto' }}>
            
            <div style={{ marginBottom: '25px' }}>
              <h2 style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#165d3c',
                marginBottom: '6px',
                letterSpacing: '-0.5px'
              }}>
                Secure Access
              </h2>
              <p style={{ color: '#5a6c7d', fontSize: '13px' }}>
                Enter your credentials to access the system
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#2d3748',
                  marginBottom: '6px'
                }}>
                  <Mail size={12} color="#165d3c" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if(error) setError(''); 
                  }}
                  placeholder="you@company.com"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #e8ede8',
                    borderRadius: '6px',
                    background: '#fafbfa',
                    fontSize: '13px',
                    fontFamily: 'Inter, sans-serif',
                    color: '#2d3748',
                    outline: 'none',
                    borderColor: error ? '#fca5a5' : '#e8ede8'
                  }}
                  onFocus={(e) => {
                    if (!error) {
                      e.target.style.borderColor = '#165d3c';
                      e.target.style.background = 'white';
                      e.target.style.boxShadow = '0 0 0 3px rgba(22, 93, 60, 0.08)';
                    }
                  }}
                  onBlur={(e) => {
                    if (!error) {
                      e.target.style.borderColor = '#e8ede8';
                      e.target.style.background = '#fafbfa';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#2d3748',
                  marginBottom: '6px'
                }}>
                  <Lock size={12} color="#165d3c" />
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if(error) setError('');
                    }}
                    placeholder="Enter your password"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      paddingRight: '40px',
                      border: '2px solid #e8ede8',
                      borderRadius: '6px',
                      background: '#fafbfa',
                      fontSize: '13px',
                      fontFamily: 'Inter, sans-serif',
                      color: '#2d3748',
                      outline: 'none',
                      borderColor: error ? '#fca5a5' : '#e8ede8'
                    }}
                    onFocus={(e) => {
                      if (!error) {
                        e.target.style.borderColor = '#165d3c';
                        e.target.style.background = 'white';
                        e.target.style.boxShadow = '0 0 0 3px rgba(22, 93, 60, 0.08)';
                      }
                    }}
                    onBlur={(e) => {
                      if (!error) {
                        e.target.style.borderColor = '#e8ede8';
                        e.target.style.background = '#fafbfa';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#5a6c7d',
                      padding: '3px'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ width: '14px', height: '14px', cursor: 'pointer', accentColor: '#165d3c' }}
                  />
                  <span style={{ fontSize: '12px', color: '#5a6c7d', fontWeight: 500 }}>Remember me</span>
                </label>
                <button
                  onClick={() => console.log('Forgot password')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#165d3c',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Error Message Display */}
              {error && (
                <div style={{
                  color: '#e53e3e',
                  fontSize: '12px',
                  fontWeight: 500,
                  background: '#fff5f5',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #fed7d7',
                  textAlign: 'center'
                }}>
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #165d3c 0%, #1e7b4e 100%)',
                  color: 'white',
                  padding: '12px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 8px rgba(22, 93, 60, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 20px rgba(22, 93, 60, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 8px rgba(22, 93, 60, 0.2)';
                }}
              >
                <span>Access System</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <div style={{ position: 'relative', margin: '20px 0', textAlign: 'center' }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center'
              }}>
                <div style={{ width: '100%', borderTop: '1px solid #e8ede8' }} />
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{
                  padding: '0 10px',
                  background: 'white',
                  color: '#9ca3af',
                  fontSize: '11px',
                  fontWeight: 500
                }}>
                  OR CONTINUE WITH
                </span>
              </div>
            </div>

            <button 
              onClick={() => console.log('Google login')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                border: '1px solid #e8ede8',
                background: 'white',
                borderRadius: '6px',
                fontWeight: 600,
                color: '#2d3748',
                fontSize: '13px',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#165d3c';
                e.target.style.background = '#fafbfa';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e8ede8';
                e.target.style.background = 'white';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>

            <p style={{ textAlign: 'center', marginTop: '18px', color: '#5a6c7d', fontSize: '12px' }}>
              Need access?{' '}
              <button
                onClick={() => console.log('Contact admin')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#165d3c',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '12px',
                  textDecoration: 'underline'
                }}
              >
                Contact Administrator
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}