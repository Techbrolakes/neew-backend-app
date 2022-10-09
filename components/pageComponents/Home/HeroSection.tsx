import React from 'react';
import SCREEN_TEXTS from './constants';
import ReactPlayer from 'react-player/lazy';

const HeroSection: React.FC = () => {
    return (
        <div className="text-center py-4">
            <h1 className="cp-heading cinzel">Courseplug</h1>
            {SCREEN_TEXTS.herolinks.map((url) => (
                <ReactPlayer key={url} url={url} />
            ))}
        </div>
    );
};

export default HeroSection;
