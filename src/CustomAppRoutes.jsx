/* eslint-disable no-console */
import React, { useEffect, useMemo } from 'react';
import {
  Route,
  createRoutesFromElements,
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import { getConfig, getPath } from '@edx/frontend-platform';

import MyCourses from '@src/my-courses/MyCourses';
import LibrariesV2Tab from '@src/studio-home/tabs-section/libraries-v2-tab';
import Dashboard from './dashboard/Dashboard';
import {
  LibraryAndComponentPicker,
  CreateLibrary,
  CreateLegacyLibrary,
  LibraryLayout,
  PreviewChangesEmbed,
} from './library-authoring';
import CustomCourseAuthoringRoutes from './CustomCourseAuthoringRoutes';
import { StudioHome } from './studio-home';
import CourseRerun from './course-rerun';
import { TaxonomyLayout, TaxonomyDetailPage, TaxonomyListPage } from './taxonomy';
import { ContentTagsDrawer } from './content-tags-drawer';
import AccessibilityPage from './accessibility-page';
import { ContentType } from './library-authoring/routes';
import PageNotFound from './generic/PageNotFound';
import { LegacyLibMigrationPage } from './legacy-libraries-migration/LegacyLibMigrationPage';
import CustomCreateNewCourseForm from './studio-home/ps-course-form/CustomCreateNewCourseForm';
import Calendar from './calendar/pages/CalendarPage';
import AssignmentPage from './assignment/pages/AssignmentPage';
import registerFontAwesomeIcons from './utils/RegisterFontAwesome';
import CustomLayout from './CustomLayout';
import initializeCustomStore from './customStore';
import initCustomSentry from './customSentry';

registerFontAwesomeIcons();

/**
 * Custom UI of the authoring MFE, rendered in place of the stock router through
 * app_layout_plugin_slot (src/index.jsx): the custom shell (CustomLayout) with
 * the stock and custom pages, on a store that also has the custom UI data.
 */
const CustomAppRoutes = () => {
  const store = useMemo(() => initializeCustomStore(), []);

  useEffect(() => {
    initCustomSentry();
  }, []);

  const router = useMemo(() =>
    createBrowserRouter(
      createRoutesFromElements(
        <Route element={<CustomLayout />}>
          <Route path="/home" element={<Dashboard />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/libraries" element={<LibrariesV2Tab />} />
          <Route path="/libraries-v1" element={<StudioHome />} />
          <Route path="/libraries-v1/migrate" element={<LegacyLibMigrationPage />} />
          <Route path="/libraries-v1/create" element={<CreateLegacyLibrary />} />
          <Route path="/library/create" element={<CreateLibrary />} />
          <Route path="/library/:libraryId/*" element={<LibraryLayout />} />
          <Route
            path="/component-picker"
            element={
              <LibraryAndComponentPicker
                extraFilter={['NOT block_type = "unit"', 'NOT block_type = "section"', 'NOT block_type = "subsection"']}
                visibleTabs={[ContentType.home, ContentType.components, ContentType.collections]}
              />
            }
          />
          <Route
            path="/component-picker/multiple"
            element={
              <LibraryAndComponentPicker
                componentPickerMode="multiple"
                extraFilter={['NOT block_type = "unit"', 'NOT block_type = "section"', 'NOT block_type = "subsection"']}
                visibleTabs={[ContentType.home, ContentType.components, ContentType.collections]}
              />
            }
          />
          <Route path="/legacy/preview-changes/:usageKey" element={<PreviewChangesEmbed />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/assignments" element={<AssignmentPage />} />
          <Route path="/course/:courseId/*" element={<CustomCourseAuthoringRoutes />} />
          <Route path="/course_rerun/:courseId" element={<CourseRerun />} />
          <Route path="/new-course" element={<CustomCreateNewCourseForm />} />
          {getConfig().ENABLE_ACCESSIBILITY_PAGE === 'true' && (
            <Route path="/accessibility" element={<AccessibilityPage />} />
          )}
          {getConfig().ENABLE_TAGGING_TAXONOMY_PAGES === 'true' && (
            <>
              <Route path="/taxonomies" element={<TaxonomyLayout />}>
                <Route index element={<TaxonomyListPage />} />
              </Route>
              <Route path="/taxonomy" element={<TaxonomyLayout />}>
                <Route path="/taxonomy/:taxonomyId" element={<TaxonomyDetailPage />} />
              </Route>
              <Route
                path="/tagging/components/widget/:contentId"
                element={<ContentTagsDrawer />}
              />
            </>
          )}
          <Route path="*" element={<PageNotFound />} />
        </Route>,
      ),
      {
        basename: getPath(getConfig().PUBLIC_PATH),
      },
    ), []);

  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
};

export default CustomAppRoutes;
