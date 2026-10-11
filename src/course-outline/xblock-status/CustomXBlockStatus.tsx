import { ShowAnswerTypesKeys } from '@src/editors/data/constants/problem';
import type { UnitXBlock, XBlock } from '@src/data/types';
import { COURSE_BLOCK_NAMES } from '../constants';
import CustomReleaseStatus from './CustomReleaseStatus';
import GradingPolicyAlert from './GradingPolicyAlert';
import CustomGradingTypeAndDueDate from './CustomGradingTypeAndDueDate';
import StatusMessages from './StatusMessages';
import HideAfterDueMessage from './HideAfterDueMessage';
import NeverShowAssessmentResultMessage from './NeverShowAssessmentResultMessage';

interface CustomXBlockStatusProps {
  isSelfPaced: boolean;
  isCustomRelativeDatesActive: boolean;
  blockData: XBlock | UnitXBlock;
}

const CustomXBlockStatus = ({
  isSelfPaced,
  isCustomRelativeDatesActive,
  blockData,
}: CustomXBlockStatusProps) => {
  const {
    category,
    explanatoryMessage,
    releasedToStudents,
    releaseDate,
    isProctoredExam,
    isOnboardingExam,
    isPracticeExam,
    prereq,
    prereqs,
    staffOnlyMessage,
    userPartitionInfo,
    hasPartitionGroupComponents,
    format: gradingType,
    dueDate,
    relativeWeeksDue,
    isTimeLimited,
    graded,
    courseGraders,
    hideAfterDue,
    showCorrectness,
  } = blockData;

  const isInstructorPaced = !isSelfPaced;
  const isVertical = category === COURSE_BLOCK_NAMES.vertical.id;

  return (
    <div className="text-secondary-400 x-small mb-1">
      {category === COURSE_BLOCK_NAMES.sequential.id && showCorrectness === ShowAnswerTypesKeys.NEVER && (
        <NeverShowAssessmentResultMessage />
      )}
      {!isVertical && (
        <CustomReleaseStatus
          isInstructorPaced={isInstructorPaced}
          explanatoryMessage={explanatoryMessage}
          releaseDate={releaseDate}
          releasedToStudents={releasedToStudents}
        />
      )}
      {!isVertical && (
        <CustomGradingTypeAndDueDate
          isSelfPaced={isSelfPaced}
          isInstructorPaced={isInstructorPaced}
          isCustomRelativeDatesActive={isCustomRelativeDatesActive}
          isTimeLimited={isTimeLimited}
          isProctoredExam={isProctoredExam}
          isOnboardingExam={isOnboardingExam}
          isPracticeExam={isPracticeExam}
          graded={graded}
          gradingType={gradingType}
          dueDate={dueDate}
          relativeWeeksDue={relativeWeeksDue}
        />
      )}
      {hideAfterDue && <HideAfterDueMessage isSelfPaced={isSelfPaced} />}
      <StatusMessages
        isVertical={isVertical}
        staffOnlyMessage={staffOnlyMessage}
        prereq={prereq}
        prereqs={prereqs}
        userPartitionInfo={userPartitionInfo}
        hasPartitionGroupComponents={hasPartitionGroupComponents}
      />
      <GradingPolicyAlert
        graded={graded}
        gradingType={gradingType}
        courseGraders={courseGraders}
      />
    </div>
  );
};

export default CustomXBlockStatus;
