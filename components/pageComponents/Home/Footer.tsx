import React from 'react';
import SCREEN_TEXTS from './constants';

const Footer: React.FC = () => {
    return (
        <div className="mt-12 space-y-4">
            <p className="cp-text !capitalize">
                Courseplug offers you access to top tech courses from top industry leading instructors like mosh
                hamedani, angela yu, Academind (maximilian schwarzmuller) and many others. Our courses are stored on a
                google drive meaning you get access to our courses immediately. Courses range from HTML & CSS,
                JAVASCRIPT , DOCKER , PYTHON , REACT.JS , NEXT.JS , FLUTTER, REACT NATIVE, BLOCKCHAIN, UI/UX DESIGN,
                REDUX, TYPESCRIPT, VUE JS , NODE JS, GOLANG AND MUCH MORE
            </p>
            <p className="cp-text">
                The courses are already group into categories ranging from Frontend development, mobile development,
                UI/UX Design, Blockchain, Backend Development, All you need to do is send a message indicating the track
                you want to join, send the cash and your are granted access all the videos are already downloaded you
                just watch them at your own pace
            </p>
            <p className="cp-text">
                Tech is a really competitve field why not get the headstart with top quality courses for only 8K
            </p>
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
        </div>
    );
};

export default Footer;
