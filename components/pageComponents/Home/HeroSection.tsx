import React from 'react';
import SCREEN_TEXTS from './constants';
import ReactPlayer from 'react-player/lazy';

const HeroSection: React.FC = () => {
    return (
        <div className="text-center py-4 space-y-6 lg:space-y-12">
            <h1 className="cp-heading cinzel">Courseplug</h1>
            <p className="cp-text">
                Courseplug is your ultimate solultion to getting access to premium tech udemy courses from top
                instructors
            </p>
            <section className="flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-8 w-fit">
                {SCREEN_TEXTS.herolinks.map((url) => (
                    <div key={url}>
                        <ReactPlayer url={url} className="hidden lg:block" />
                        <ReactPlayer url={url} className="lg:hidden" width={350} height={350} />
                    </div>
                ))}
            </section>
            <a
                href="https://wa.me/+2349057791158?text=Hi,%20I%20Want%20Access%20Into%20The%20Drive"
                target="_blank"
                rel="noreferrer"
                className="cp-btn"
            >
                {SCREEN_TEXTS.btnInfo}
            </a>
        </div>
    );
};

export default HeroSection;
