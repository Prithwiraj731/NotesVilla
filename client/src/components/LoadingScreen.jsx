import React from 'react';
import styled from 'styled-components';
import Loader from './Loader';

const LoadingScreen = ({ isLoading }) => {
    if (!isLoading) return null;

    return (
        <StyledWrapper>
            <div className="loading-container">
                <div className="loader-wrapper">
                    <Loader />
                </div>
                <div className="loading-text">
                    <h2>NotesVilla</h2>
                    <p>Loading your knowledge repository...</p>
                </div>
            </div>
        </StyledWrapper>
    );
}

const StyledWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #0f0f23 0%, #0a0a0a 50%, #141414 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  
  .loader-wrapper {
    margin-bottom: 2rem;
  }
  
  .loading-text {
    h2 {
      font-size: 2rem;
      font-weight: 900;
      color: #ffffff;
      margin: 0 0 0.5rem 0;
      font-family: 'Orbitron', 'Bebas Neue', monospace;
      text-transform: uppercase;
      background: linear-gradient(135deg, #a855f7 0%, #8b5cf6 25%, #7c3aed 50%, #6366f1 75%, #818cf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    p {
      font-size: 1rem;
      color: #a1a1aa;
      margin: 0;
      font-weight: 400;
    }
  }
  
  @media (max-width: 768px) {
    .loading-text {
      h2 {
        font-size: 1.5rem;
      }
      
      p {
        font-size: 0.875rem;
      }
    }
  }
`;

export default LoadingScreen;
