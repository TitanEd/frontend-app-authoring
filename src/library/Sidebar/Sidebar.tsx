import React from 'react';
import { Button } from '@openedx/paragon';
// import { useSidebar } from '../../../hooks/useSidebar';
import { useSidebar } from '../hooks/useSidebar';
import './Sidebar.scss';

interface SidebarProps {
  buttons: {
    label: string;
    path: string;
    icon: React.ReactElement;
  }[];
  onNavigate: (path: string) => void;
  // isActive: (path: string) => boolean;
  presentPath: string;
}

const Sidebar: React.FC<SidebarProps> = ({ buttons, onNavigate, presentPath }) => {
  const { isCollapsed } = useSidebar();

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-buttons">
        {buttons.map((btn) => (
          <Button
            key={btn.path}
            variant="tertiary"
            className={`sidebar-btn ${btn.path === presentPath ? 'pgn-btn-active' : 'pgn-btn-inactive'}`}
            onClick={() => onNavigate(btn.path)}
          >
            <div className="btn-content">
              <span className="icon-container">{btn.icon}</span>
              <span className="btn-label">{btn.label}</span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
