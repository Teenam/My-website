import React from 'react';

interface LoadingScreenProps {
    isLoading: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading }) => {
    return (
        <div className={`loading-screen ${!isLoading ? 'hidden' : ''}`}>
            <div className="loading-content">
                <div className="loading-spinner"></div>
                <div className="loading-text">LOADING COLLECTION</div>
            </div>
        </div>
    );
};

export default LoadingScreen;
