import { getStudioHomeCoursesV2 } from '../studio-home/data/api';

/**
 * Where a course re-run stands. Studio copies the course in a background task; until it ends the
 * new course is listed in `in_process_course_actions` of the home API (a failed one stays listed
 * until dismissed, a finished one leaves the list).
 */
export const RERUN_STATES = {
  ready: 'ready',
  inProgress: 'in_progress',
  failed: 'failed',
};

/** State Router passes to My Courses when a re-run is not finished yet (see RerunNotice). */
export const RERUN_NOTICE_STATE_KEY = 'telsRerun';

export const rerunStateOf = (courseKey, inProcessCourseActions = []) => {
  const action = inProcessCourseActions.find((item) => item.courseKey === courseKey);
  if (!action) {
    return RERUN_STATES.ready;
  }
  return action.isFailed ? RERUN_STATES.failed : RERUN_STATES.inProgress;
};

/** Ask Studio where the re-run of ``courseKey`` stands (one course page, so the request stays small). */
export async function fetchRerunState(courseKey) {
  const data = await getStudioHomeCoursesV2('', { page: 1, pageSize: 1 });
  return rerunStateOf(courseKey, data?.results?.inProcessCourseActions);
}

const pause = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

/**
 * Wait a little for a re-run: return as soon as it is ready or failed, or "in progress" after
 * ``attempts`` checks (a large course keeps copying in the background).
 */
export async function waitForRerun(courseKey, { attempts = 4, interval = 1500 } = {}) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (attempt) {
      // eslint-disable-next-line no-await-in-loop
      await pause(interval);
    }
    try {
      // eslint-disable-next-line no-await-in-loop
      const state = await fetchRerunState(courseKey);
      if (state !== RERUN_STATES.inProgress) {
        return state;
      }
    } catch (error) {
      // A failed check is not a failed re-run: keep waiting, then say it is in progress.
    }
  }
  return RERUN_STATES.inProgress;
}
