import React from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

interface LibraryCardProps {
  title: string;
  org: string;
  id: string;
  path: string;
}

const LibraryCard: React.FC<LibraryCardProps> = ({
  title,
  org,
  id,
  path,
}) => (
  <Link to={path} style={{ textDecoration: 'none' }}>
    <div className="library-card-container">
      <div className="library-card-title">{title}</div>
      <div className="library-card-info-container">
        <div>
          <div className="library-card-info-label">
            <FormattedMessage
              id="course-authoring.studio-home.libraries.card.organization"
              defaultMessage="ORGANIZATION"
              description="Label above the organization of a library card"
            />
          </div>
          <div className="library-card-info-value">{org}</div>
        </div>
        <div>
          <div className="library-card-info-label">
            <FormattedMessage
              id="course-authoring.studio-home.libraries.card.id"
              defaultMessage="ID"
              description="Label above the identifier of a library card"
            />
          </div>
          <div className="library-card-info-value">{id}</div>
        </div>
      </div>
    </div>
  </Link>
);

export default LibraryCard;
