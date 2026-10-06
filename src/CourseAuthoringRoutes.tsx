import React, { Suspense } from 'react';
import {
  Navigate,
  Routes,
  Route,
  useParams,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';
import { PageWrap } from '@edx/frontend-platform/react';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { LmsBook } from '@openedx/paragon/icons';
import { Textbooks } from './textbooks';
import CourseAuthoringPage from './CourseAuthoringPage';
import { PagesAndResources } from './pages-and-resources';
import EditorContainer from './editors/EditorContainer';
import VideoSelectorContainer from './selectors/VideoSelectorContainer';
import CustomPages from './custom-pages';
import { FilesPage, VideosPage } from './files-and-videos';
import { AdvancedSettings } from './advanced-settings';
import {
  CourseOutline,
  OutlineSidebarProvider,
  OutlineSidebarPagesProvider,
} from './course-outline';
import { CourseOutlineProvider } from './course-outline/CourseOutlineContext';
import ScheduleAndDetails from './schedule-and-details';
import { GradingSettings } from './grading-settings';
import CourseTeam from './course-team/CourseTeam';
import { CourseUpdates } from './course-updates';
import { CourseUnit, SubsectionUnitRedirect } from './course-unit';
import { Certificates } from './certificates';
import CourseExportPage from './export-page/CourseExportPage';
import CourseOptimizerPage from './optimizer-page/CourseOptimizerPage';
import CourseImportPage from './import-page/CourseImportPage';
import { DECODED_ROUTES } from './constants';
import CourseChecklist from './course-checklist';
import GroupConfigurations from './group-configurations';
import { CourseLibraries } from './course-libraries';
import { IframeProvider } from './generic/hooks/context/iFrameContext';
import { CourseAuthoringProvider, useCourseAuthoringContext } from './CourseAuthoringContext';
import { CourseImportProvider } from './import-page/CourseImportContext';
import { CourseExportProvider } from './export-page/CourseExportContext';
import CustomCreateNewCourseFormJsx from './studio-home/ps-course-form/CustomCreateNewCourseForm';

// CustomCreateNewCourseForm is a JSX component whose propTypes don't match how it is used here.
const CustomCreateNewCourseForm = CustomCreateNewCourseFormJsx as unknown as React.ComponentType<Record<string, unknown>>;

interface SidebarItem {
  label: string;
  path: string;
}

const MobileCourseNavigation = ({ items }: { items: SidebarItem[] }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (event: React.ChangeEvent<HTMLSelectElement>) => {
    navigate(event.target.value);
  };

  return (
    <div className="ca-mobile-nav">
      <select
        className="ca-mobile-nav-select"
        style={{
          display: localStorage.getItem('oldUI') === 'true' ? 'none' : 'block',
        }}
        value={location.pathname}
        onChange={handleNavigation}
      >
        {items.map(item => (
          <option key={item.path} value={item.path}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
};

interface CoursePageLayoutProps {
  children: React.ReactNode;
  courseId: string;
  courseName?: string;
  sidebarItems: SidebarItem[];
}

const CoursePageLayout = ({
  children, courseId, courseName: courseNameProp, sidebarItems,
}: CoursePageLayoutProps) => {
  const navigate = useNavigate();
  // In Verawood the course details are provided by CourseAuthoringContext
  // (previously `useCourseOutline({ courseId }).courseName` from the redux store).
  const { courseDetails } = useCourseAuthoringContext();
  const courseName = courseNameProp || courseDetails?.name;

  const handleMyCoursesClick = () => {
    navigate('/my-courses');
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleMyCoursesClick();
    }
  };
  return (
    <>
      {localStorage.getItem('oldUI') === 'false'
      && (
      <div className="ca-breadcrumb-bg">
        <div className="ca-breadcrumb-container">
          <div className="ca-breadcrumb">
            <span
              className="ca-breadcrumb-icon ca-breadcrumb-link"
              onClick={handleMyCoursesClick}
              onKeyDown={handleKeyDown}
              role="button"
              tabIndex={0}
              style={{ cursor: 'pointer' }}
            >
              <LmsBook className="custom-icon" />
              My Courses
            </span>
            <span className="ca-breadcrumb-divider">/</span>
            <span className="ca-breadcrumb-current">{courseName || 'Loading...'}</span>
          </div>
          <div className="ca-title">
            {courseName || 'Loading...'}
          </div>
        </div>
      </div>
      )}
      <div
        className="ca-main-layout"
        style={{
          marginTop: localStorage.getItem('oldUI') === 'true' ? '1rem' : 0,
        }}
      >
        <MobileCourseNavigation items={sidebarItems} />
        <div className="ca-sidebar">
          <PluginSlot id="course_sidebar_plugin_slot" pluginProps={{ courseId, sidebarItems }} />
        </div>
        <main className="ca-main-content">
          <Suspense>
            {children}
          </Suspense>
        </main>
      </div>
    </>
  );
};

/**
 * As of this writing, these routes are mounted at a path prefixed with the following:
 *
 * /course/:courseId
 *
 * Meaning that their absolute paths look like:
 *
 * /course/:courseId/course-pages
 * /course/:courseId/proctored-exam-settings
 * /course/:courseId/editor/:blockType/:blockId
 *
 * This component and CourseAuthoringPage should maybe be combined once we no longer need to have
 * CourseAuthoringPage split out for use in LegacyProctoringRoute.  Once that route is removed, we
 * can move the Header/Footer rendering to this component and likely pull the course detail loading
 * in as well, and it'd feel a bit better-factored and the roles would feel more clear.
 */
const CourseAuthoringRoutes = () => {
  const { courseId } = useParams();

  if (courseId === undefined) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Error: route is missing courseId.');
  }

  const sidebarItems: SidebarItem[] = [
    { label: 'Course Outline', path: `/course/${courseId}/` },
    { label: 'Schedule & Details', path: `/course/${courseId}/settings/details` },
    { label: 'Grading', path: `/course/${courseId}/settings/grading` },
    { label: 'Course Team', path: `/course/${courseId}/course_team` },
    { label: 'Certificates', path: `/course/${courseId}/certificates` },
    { label: 'Updates', path: `/course/${courseId}/course_info` },
    { label: 'Group Configurations', path: `/course/${courseId}/group_configurations` },
    { label: 'Advanced Settings', path: `/course/${courseId}/settings/advanced` },
    { label: 'Import', path: `/course/${courseId}/import` },
    { label: 'Export', path: `/course/${courseId}/export` },
    { label: 'Files', path: `/course/${courseId}/assets` },
    { label: 'Pages & Resources', path: `/course/${courseId}/pages-and-resources` },
  ];

  /** Custom (TitanEd) course layout: breadcrumb + course sidebar plugin slot around each course page. */
  const withLayout = (children: React.ReactNode) => (
    <CoursePageLayout courseId={courseId} sidebarItems={sidebarItems}>
      {children}
    </CoursePageLayout>
  );

  return (
    <CourseAuthoringProvider courseId={courseId}>
      <CourseAuthoringPage>
        <Routes>
          <Route
            path="/"
            element={
              <PageWrap>
                {withLayout(
                  <CourseOutlineProvider>
                    <OutlineSidebarPagesProvider>
                      <OutlineSidebarProvider>
                        <CourseOutline />
                      </OutlineSidebarProvider>
                    </OutlineSidebarPagesProvider>
                  </CourseOutlineProvider>,
                )}
              </PageWrap>
            }
          />
          <Route
            path="outline"
            element={<Navigate replace to={`/course/${courseId}/`} />}
          />
          <Route
            path="course_info"
            element={
              <PageWrap>
                {withLayout(
                  <CourseUpdates />,
                )}
              </PageWrap>
            }
          />
          <Route
            path="libraries"
            element={
              <PageWrap>
                <CourseLibraries />
              </PageWrap>
            }
          />
          <Route
            path="assets"
            element={
              <PageWrap>
                {withLayout(
                  <FilesPage />,
                )}
              </PageWrap>
            }
          />
          <Route
            path="videos"
            element={getConfig().ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN === 'true'
              ? (
                <PageWrap>
                  {withLayout(
                    <VideosPage />,
                  )}
                </PageWrap>
              )
              : null}
          />
          <Route
            path="pages-and-resources/*"
            element={
              <PageWrap>
                {withLayout(
                  <PagesAndResources />,
                )}
              </PageWrap>
            }
          />
          <Route
            path="proctored-exam-settings"
            element={<Navigate replace to={`/course/${courseId}/pages-and-resources`} />}
          />
          <Route
            path="custom-pages/*"
            element={
              <PageWrap>
                {withLayout(
                  <CustomPages />,
                )}
              </PageWrap>
            }
          />
          <Route
            path="/subsection/:subsectionId"
            element={
              <PageWrap>
                <SubsectionUnitRedirect />
              </PageWrap>
            }
          />
          {DECODED_ROUTES.COURSE_UNIT.map((path) => (
            <Route
              key={path}
              path={path}
              element={
                <PageWrap>
                  {withLayout(
                    <IframeProvider>
                      <CourseUnit />
                    </IframeProvider>,
                  )}
                </PageWrap>
              }
            />
          ))}
          <Route
            path="editor/course-videos/:blockId"
            element={
              <PageWrap>
                <VideoSelectorContainer />
              </PageWrap>
            }
          />
          <Route
            path="editor/:blockType/:blockId?"
            element={
              <PageWrap>
                <EditorContainer learningContextId={courseId} />
              </PageWrap>
            }
          />
          <Route
            path="settings/details"
            element={
              <PageWrap>
                {withLayout(
                  <ScheduleAndDetails />,
                )}
              </PageWrap>
            }
          />
          <Route
            path="settings/grading"
            element={
              <PageWrap>
                {withLayout(
                  <GradingSettings />,
                )}
              </PageWrap>
            }
          />
          <Route
            path="course_team"
            element={
              <PageWrap>
                {withLayout(
                  <CourseTeam />,
                )}
              </PageWrap>
            }
          />
          <Route
            path="group_configurations"
            element={
              <PageWrap>
                {withLayout(
                  <GroupConfigurations />,
                )}
              </PageWrap>
            }
          />
          <Route
            path="settings/advanced"
            element={
              <PageWrap>
                {withLayout(
                  <AdvancedSettings />,
                )}
              </PageWrap>
            }
          />
          <Route
            path="import"
            element={
              <PageWrap>
                {withLayout(
                  <CourseImportProvider>
                    <CourseImportPage />
                  </CourseImportProvider>,
                )}
              </PageWrap>
            }
          />
          <Route
            path="export"
            element={
              <PageWrap>
                {withLayout(
                  <CourseExportProvider>
                    <CourseExportPage />
                  </CourseExportProvider>,
                )}
              </PageWrap>
            }
          />
          <Route
            path="optimizer"
            element={
              <PageWrap>
                <CourseOptimizerPage />
              </PageWrap>
            }
          />
          <Route
            path="checklists"
            element={
              <PageWrap>
                {withLayout(
                  <CourseChecklist />,
                )}
              </PageWrap>
            }
          />
          <Route
            path="certificates"
            element={getConfig().ENABLE_CERTIFICATE_PAGE === 'true'
              ? (
                <PageWrap>
                  {withLayout(
                    <Certificates />,
                  )}
                </PageWrap>
              )
              : null}
          />
          <Route
            path="textbooks"
            element={
              <PageWrap>
                {withLayout(
                  <Textbooks />,
                )}
              </PageWrap>
            }
          />
          <Route
            path="/new-course"
            element={
              <PageWrap>
                <CustomCreateNewCourseForm handleOnClickCancel={() => window.history.back()} />
              </PageWrap>
            }
          />
        </Routes>
      </CourseAuthoringPage>
    </CourseAuthoringProvider>
  );
};

export default CourseAuthoringRoutes;
