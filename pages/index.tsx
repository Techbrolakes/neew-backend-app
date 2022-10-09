import React from 'react';
import type { NextPage } from 'next';
import HeroSection from '@/pageComponents/Home/HeroSection';
import PageHead from 'components/components';
import CourseSection from '@/pageComponents/Home/CourseSection';
import Footer from '@/pageComponents/Home/Footer';

const Home: NextPage = () => {
    return (
        <>
            <PageHead title="Get Access to premium Tech courses" />
            <section className="bg-black courseplug-container">
                <HeroSection />
                <CourseSection />
                <Footer />
            </section>
        </>
    );
};

export default Home;
