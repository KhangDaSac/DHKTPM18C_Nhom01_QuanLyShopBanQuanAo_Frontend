import React from 'react';

const ThemeTest: React.FC = () => {
    const testTheme = () => {
        document.documentElement.setAttribute('data-theme', 'dark');
    };

    const resetTheme = () => {
        document.documentElement.setAttribute('data-theme', 'light');
    };

    return (
        <div className="p-4">
            <h1 className="text-primary text-2xl font-bold mb-4">Theme Test</h1>
            <div className="space-y-4">
                <button className="btn btn-primary" onClick={testTheme}>
                    Set Dark Theme
                </button>
                <button className="btn btn-secondary" onClick={resetTheme}>
                    Set Light Theme
                </button>
                <div className="card bg-base-100 shadow-xl p-4">
                    <h2 className="text-primary">Primary Text</h2>
                    <p className="text-base-content">Base content text</p>
                </div>
            </div>
        </div>
    );
};

export default ThemeTest;