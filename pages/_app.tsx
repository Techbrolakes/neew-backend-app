import React from 'react';
import Router from 'next/router';
import nProgress from 'nprogress';
import 'antd/dist/antd.css';
import 'styles/output.scss';
import 'styles/globals.css';
import '../styles/override.scss';
import type { AppProps } from 'next/app';

Router.events.on('routeChangeStart', nProgress.start);
Router.events.on('routeChangeError', nProgress.done);
Router.events.on('routeChangeComplete', nProgress.done);

function MyApp({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />;
}

export default MyApp;
