import React, { memo } from 'react';

interface HeaderProps {
    title: string;
    subtitle: string;
    version?: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, version }) => {
    return (
        <header>
            <div className="header-content">
                <div className="decorative-bar"></div>
                <h1>{title}</h1>
                <div className="decorative-bar"></div>
                <p className="subtitle">
                    {subtitle}
                    {version && <span className="version-tag">{version}</span>}
                </p>
            </div>
        </header>
    );
};

export default memo(Header);
