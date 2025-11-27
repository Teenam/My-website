import React from 'react';

interface HeaderProps {
    title: string;
    subtitle: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
    return (
        <header>
            <div className="header-content">
                <h1>{title}</h1>
                <div className="decorative-bar"></div>
                <p className="subtitle">{subtitle}</p>
            </div>
        </header>
    );
};

export default Header;
