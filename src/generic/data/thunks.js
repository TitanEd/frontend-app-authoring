import { RequestStatus } from '../../data/constants';
import {
  fetchOrganizations,
  updatePostErrors,
  updateLoadingStatuses,
  updateRedirectUrlObj,
  updateCourseRerunData,
  updateSavingStatus,
} from './slice';
import {
  createOrRerunCourse,
  getOrganizations,
  getCourseRerun,
} from './api';

export function fetchOrganizationsQuery() {
  return async (dispatch) => {
    try {
      const organizations = await getOrganizations();
      dispatch(fetchOrganizations(organizations));
      dispatch(updateLoadingStatuses({ organizationLoadingStatus: RequestStatus.SUCCESSFUL }));
    } catch {
      dispatch(updateLoadingStatuses({ organizationLoadingStatus: RequestStatus.FAILED }));
    }
  };
}

export function fetchCourseRerunQuery(courseId) {
  return async (dispatch) => {
    try {
      const courseRerun = await getCourseRerun(courseId);
      dispatch(updateCourseRerunData(courseRerun));
      dispatch(updateLoadingStatuses({ courseRerunLoadingStatus: RequestStatus.SUCCESSFUL }));
    } catch {
      dispatch(updateLoadingStatuses({ courseRerunLoadingStatus: RequestStatus.FAILED }));
    }
  };
}

export function updateCreateOrRerunCourseQuery(courseData, isRerun = false) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));

    try {
      const response = await createOrRerunCourse(courseData);
      if (isRerun) {
        // The re-run is copied in the background: useCreateOrRerunCourse waits for it before
        // opening the new outline (or My Courses with a notice), so the outline never opens
        // before the course exists. A refused re-run (errMsg) stays on the form.
        dispatch(updateRedirectUrlObj(response.destinationCourseKey
          ? { url: '/course/', destinationCourseKey: response.destinationCourseKey }
          : {}));
      } else {
        dispatch(updateRedirectUrlObj('url' in response ? response : {}));
      }
      dispatch(updatePostErrors('errMsg' in response ? response : {}));
      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
      return true;
    } catch {
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
      return false;
    }
  };
}
