// import React from 'react' // Not needed in modern React
import { Outlet } from 'react-router-dom'
import Header from '../Header'
import Footer from '../Footer'
import FloatingButton from "@/components/floating-button/index"

import Chatbox from '@/components/chatbox';

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

