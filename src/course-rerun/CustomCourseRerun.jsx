import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Card } from '@openedx/paragon';

import CourseRerunForm from './course-rerun-form';
import CourseRerunSideBar from './course-rerun-sidebar';
import customMessages from './customMessages';
import './CustomCourseRerun.scss';

/**
 * Content of the course re-run page inside the custom layout (course_rerun_content_plugin_slot):
 * page header, the stock re-run form in a card and the help column, on one grid.
 */
const CustomCourseRerun = ({
  rerunTitle,
  displayName,
  originalCourseData,
  initialFormValues,
  handleRerunCourseCancel,
}) => {
  const intl = useIntl();

  return (
    <div className="tels-course-rerun">
      <header className="tels-course-rerun__header">
        <h2 className="tels-course-rerun__title">{rerunTitle} {displayName}</h2>
        <p className="tels-course-rerun__lead">
          {intl.formatMessage(customMessages.originalCourse, {
            course: <span className="tels-course-rerun__course" key="course">{originalCourseData}</span>,
          })}
        </p>
      </header>
      <div className="tels-course-rerun__layout">
        <Card className="tels-course-rerun__card">
          <Card.Section>
            <CourseRerunForm
              initialFormValues={initialFormValues}
              onClickCancel={handleRerunCourseCancel}
            />
          </Card.Section>
        </Card>
        <div className="tels-course-rerun__aside">
          <CourseRerunSideBar />
        </div>
      </div>
    </div>
  );
};

CustomCourseRerun.propTypes = {
  rerunTitle: PropTypes.string.isRequired,
  displayName: PropTypes.string,
  originalCourseData: PropTypes.string,
  initialFormValues: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    org: PropTypes.string.isRequired,
    number: PropTypes.string.isRequired,
    run: PropTypes.string,
  }).isRequired,
  handleRerunCourseCancel: PropTypes.func.isRequired,
};

CustomCourseRerun.defaultProps = {
  displayName: '',
  originalCourseData: '',
};

export default CustomCourseRerun;
