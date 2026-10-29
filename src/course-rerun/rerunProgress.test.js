import { getStudioHomeCoursesV2 } from '../studio-home/data/api';
import { RERUN_STATES, rerunStateOf, waitForRerun } from './rerunProgress';

jest.mock('../studio-home/data/api', () => ({ getStudioHomeCoursesV2: jest.fn() }));

const inProcess = (actions) => ({ results: { inProcessCourseActions: actions } });

describe('rerunProgress', () => {
  it('reads the state of a re-run from the in-process list', () => {
    expect(rerunStateOf('k', [])).toBe(RERUN_STATES.ready);
    expect(rerunStateOf('k', [{ courseKey: 'k', isFailed: false, isInProgress: true }])).toBe(RERUN_STATES.inProgress);
    expect(rerunStateOf('k', [{ courseKey: 'k', isFailed: true, isInProgress: false }])).toBe(RERUN_STATES.failed);
    expect(rerunStateOf('k', [{ courseKey: 'other', isFailed: false }])).toBe(RERUN_STATES.ready);
  });

  it('returns as soon as the re-run has finished', async () => {
    getStudioHomeCoursesV2
      .mockResolvedValueOnce(inProcess([{ courseKey: 'k', isFailed: false }]))
      .mockResolvedValueOnce(inProcess([]));
    await expect(waitForRerun('k', { attempts: 4, interval: 0 })).resolves.toBe(RERUN_STATES.ready);
    expect(getStudioHomeCoursesV2).toHaveBeenCalledTimes(2);
  });

  it('says "in progress" when the copy outlasts the checks, also when a check fails', async () => {
    getStudioHomeCoursesV2.mockReset();
    getStudioHomeCoursesV2
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValue(inProcess([{ courseKey: 'k', isFailed: false }]));
    await expect(waitForRerun('k', { attempts: 3, interval: 0 })).resolves.toBe(RERUN_STATES.inProgress);
  });
});
