import React from 'react';
import SCREEN_TEXTS from './constants';
import ReactPlayer from 'react-player/lazy';

const CourseSection: React.FC = () => {
    return (
        <div className="space-y-4 mt-12">
            <h1 className="cp-heading cinzel text-center">Some of the courses available</h1>
            <p className="cp-text pb-4">This is just a sneakpeak of the courses available</p>
            <section className="grid grid-cols-1 lg:grid-cols-2 w-fit !gap-28 !space-y-8">
                {SCREEN_TEXTS.courselinks.map((url) => (
                    <div key={url}>
                        <ReactPlayer url={url} className="hidden lg:block" />
                        <ReactPlayer url={url} className="text-center lg:hidden" width={350} height={350} />
                    </div>
                ))}
                <div className="text-center">
                    <a
                        href="https://wa.me/+2349057791158?text=Hi,%20I%20Want%20Access%20Into%20The%20Drive"
                        target="_blank"
                        rel="noreferrer"
                        className="cp-btn"
                    >
                        {SCREEN_TEXTS.btnInfo}
                    </a>
                </div>
            </section>
        </div>
    );
};

export default CourseSection;
