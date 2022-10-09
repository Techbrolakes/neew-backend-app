import React from 'react';
import type { NextPage } from 'next';
import HeroSection from '@/pageComponents/Home/HeroSection';
import PageHead from 'components/components';

const Home: NextPage = () => {
    return (
        <>
            <PageHead title="Get Access to premium Tech courses" />
            <section className="bg-black min-h-screen courseplug-container">
                <HeroSection />
            </section>
        </>
    );
};

export default Home;
