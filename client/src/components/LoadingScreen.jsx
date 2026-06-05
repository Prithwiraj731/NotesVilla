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
                    <h2>NOTESVILLA</h2>
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
  background: radial-gradient(circle, rgba(251, 54, 64, 0.15) 0%, #000F08 100%);
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
    margin-bottom: 2.5rem;
  }
  
  .loading-text {
    h2 {
      font-size: 2.2rem;
      font-weight: 900;
      color: #ffffff;
      margin: 0 0 0.5rem 0;
      font-family: 'Orbitron', sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      background: linear-gradient(135deg, #ffffff 30%, #FB3640 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    p {
      font-family: 'Rajdhani', sans-serif;
      font-size: 1.1rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.6);
      margin: 0;
      font-weight: 600;
    }
  }
  
  @media (max-width: 768px) {
    .loading-text {
      h2 {
        font-size: 1.6rem;
      }
      
      p {
        font-size: 0.95rem;
      }
    }
  }
`;

export default LoadingScreen;
