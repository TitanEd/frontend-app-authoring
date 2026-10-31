/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/prop-types */
import { Helmet } from 'react-helmet';
import { Container } from '@openedx/paragon';
import { LmsBook } from '@openedx/paragon/icons';
import { useNavigate } from 'react-router-dom';
// import SubHeader from '../../generic/sub-header/SubHeader';
import {
  ClearFiltersButton,
  FilterByBlockType,
  FilterByTags,
  SearchContextProvider,
  SearchKeywordsField,
  SearchSortWidget,
} from '../../search-manager';
import { LibrarySidebar } from '../library-sidebar';
// import Header from '../../header';
import LibraryCollectionComponents from './LibraryCollectionComponents';
import customMessages from './customMessages';
import rootCustomMessages from '../../customMessages';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

const CustomLibraryCollectionPage = ({
  //   componentPickerMode,
  libraryData,
  extraFilter,
  subHeaderTitle,
  //   breadcumbs,
  headerActions,
  intl,
  libraryId,
  sidebarComponentInfo,
  breadcrumbTitle,
}) => {
  const navigate = useNavigate();
  return (
    <div className="d-flex library-authoring-page-container">
      {libraryData?.title && (
        <Helmet>
          <title>{libraryData.title} | {process.env.SITE_NAME}</title>
        </Helmet>
      )}
      <div className="flex-grow-1 library-authoring-page-content">
        <div className="ca-breadcrumb-bg">
          <div className="ca-breadcrumb-container">
            <div className="ca-breadcrumb d-flex align-items-center">
              <span
                className="ca-breadcrumb-icon collection-breadcrumb-icon"
                role="link"
                tabIndex={0}
                onClick={() => navigate(`/library/${libraryId}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { navigate(`/library/${libraryId}`); }
                }}
              >
                <LmsBook className="custom-icon" />
                {breadcrumbTitle || <FormattedMessage {...rootCustomMessages.loading} />}
              </span>
              <span className="ca-breadcrumb-divider">/</span>
              <span
                className="ca-breadcrumb-current collection-breadcrumb-icon"
                role="link"
                tabIndex={0}
                onClick={() => navigate(`/library/${libraryId}/collections`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { navigate(`/library/${libraryId}/collections`); }
                }}
              >
                <FormattedMessage {...customMessages.allCollections} />
              </span>
            </div>
            <div className="ca-title library-breadcrumb-title">
              {subHeaderTitle || <FormattedMessage {...rootCustomMessages.loading} />}
            </div>
          </div>
        </div>
        <Container className="library-authoring-page">
          <SearchContextProvider
            extraFilter={extraFilter}
          >
            {
              /* <SubHeader
              title={subHeaderTitle}
              breadcrumbs={breadcumbs}
              headerActions={headerActions}
            /> */
            }
            <div className="sub-header-container d-flex justify-content-between align-items-center">
              <SearchKeywordsField
                className="w-40"
                placeholder={intl.formatMessage(customMessages.searchPlaceholder)}
              />
              {headerActions}
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--pgn-color-light-400)', margin: '0 0 0 0' }} />
            <div className="d-flex mt-3 mb-4 align-items-center">
              <FilterByTags />
              <FilterByBlockType />
              <ClearFiltersButton />
              <div className="flex-grow-1" />
              <SearchSortWidget />
            </div>
            <LibraryCollectionComponents />
          </SearchContextProvider>
        </Container>
      </div>
      {!!sidebarComponentInfo?.type && (
        <div className="library-authoring-sidebar box-shadow-left-1 bg-white" data-testid="library-sidebar">
          <LibrarySidebar />
        </div>
      )}
    </div>
  );
};

export default CustomLibraryCollectionPage;
