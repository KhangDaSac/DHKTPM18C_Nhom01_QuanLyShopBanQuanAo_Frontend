import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../header'
import Footer from '../footer'
import FloatingButton from "../floating-button/index"

import Chatbox from '../chatbox';

export default function RootLayout() {
    return (
        <div>
            <Header />
            <main>
                <Outlet />
            </main>
            <Footer />
            <FloatingButton />
            <Chatbox />
        </div>
    )
}
