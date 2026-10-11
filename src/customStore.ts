import { configureStore } from '@reduxjs/toolkit';

// Same reducers as src/store.ts (FIXME there: the 'live' plugin uses Redux).
import { reducer as liveReducer } from '@openedx-plugins/course-app-live/data/slice';
import { reducer as modelsReducer } from './generic/model-store';
import { reducer as discussionsReducer } from './pages-and-resources/discussions/data/slice';
import { reducer as pagesAndResourcesReducer } from './pages-and-resources/data/slice';
import { reducer as customPagesReducer } from './custom-pages/data/slice';
import { reducer as studioHomeReducer } from './studio-home/data/slice';
import { reducer as scheduleAndDetailsReducer } from './schedule-and-details/data/slice';
import { reducer as filesReducer } from './files-and-videos/files-page/data/slice';
import { reducer as CourseUpdatesReducer } from './course-updates/data/slice';
import { reducer as courseOptimizerReducer } from './optimizer-page/data/slice';
import { reducer as genericReducer } from './generic/data/slice';
import { reducer as videosReducer } from './files-and-videos/videos-page/data/slice';
import { reducer as courseOutlineReducer } from './course-outline/data/slice';
import { reducer as courseUnitReducer } from './course-unit/data/slice';
import { reducer as textbooksReducer } from './textbooks/data/slice';
import { reducer as certificatesReducer } from './certificates/data/slice';
// Custom UI data: My Courses page and course details.
import { reducer as myCoursesReducer } from './my-courses/data/slice';
import { reducer as courseDetailReducer } from './data/slice';

import type { DeprecatedReduxState } from './store';

export interface CustomReduxState extends DeprecatedReduxState {
  myCourses: Record<string, any>;
  courseDetail: Record<string, any>;
}

/**
 * Redux store of the custom UI (CustomAppRoutes): the stock store plus the
 * reducers the custom pages need, so src/store.ts stays unchanged.
 */
export default function initializeCustomStore(preloadedState: Partial<CustomReduxState> | undefined = undefined) {
  return configureStore<CustomReduxState>({
    reducer: {
      customPages: customPagesReducer,
      discussions: discussionsReducer,
      assets: filesReducer,
      pagesAndResources: pagesAndResourcesReducer,
      scheduleAndDetails: scheduleAndDetailsReducer,
      studioHome: studioHomeReducer,
      models: modelsReducer,
      live: liveReducer,
      courseUpdates: CourseUpdatesReducer,
      courseOptimizer: courseOptimizerReducer,
      generic: genericReducer,
      videos: videosReducer,
      courseOutline: courseOutlineReducer,
      courseUnit: courseUnitReducer,
      certificates: certificatesReducer,
      textbooks: textbooksReducer,
      myCourses: myCoursesReducer,
      courseDetail: courseDetailReducer,
    },
    preloadedState: preloadedState as CustomReduxState | undefined,
  });
}
