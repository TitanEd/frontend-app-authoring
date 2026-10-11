import {
  ActionRow, Button, Container, Form, StatefulButton,
} from '@openedx/paragon';
import { Formik } from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useNavigate } from 'react-router-dom';
import { REGEX_RULES } from '@src/constants';
import { useOrganizationListData } from '@src/generic/data/apiHooks';
import { useStudioHome } from '@src/studio-home/hooks';
import AlertError from '../../generic/alert-error';
import FormikControl from '../../generic/FormikControl';
import SubHeader from '../../generic/sub-header/SubHeader';
import { useCreateLibraryV2 } from './data/apiHooks';
import messages from './messages';

import FormikErrorFeedback from '../../generic/FormikErrorFeedback';

const CustomCreateLibrary = ({
  formatMessage,
  specialCharsRule,
  noSpaceRule,
  validSlugIdRegex,
  mutate,
  isOrganizationListLoading,
  organizationListData,
  handleOnClickCancel,
  isLoading,
  isError,
  error,
}) => (
  <Container size="xl" className="mt-3 custom-create-library-container">
    <SubHeader
      title={formatMessage(messages.createLibrary)}
    />
    <hr style={{ border: 'none', borderTop: '1px solid var(--pgn-color-light-400)', margin: '0 0 0 0' }} />
    <Formik
      initialValues={{
        title: '',
        org: '',
        slug: '',
      }}
      validationSchema={
            Yup.object().shape({
              title: Yup.string()
                .required(formatMessage(messages.requiredFieldError)),
              org: Yup.string()
                .required(formatMessage(messages.requiredFieldError))
                .matches(
                  specialCharsRule,
                  formatMessage(messages.disallowedCharsError),
                )
                .matches(noSpaceRule, formatMessage(messages.noSpaceError)),
              slug: Yup.string()
                .required(formatMessage(messages.requiredFieldError))
                .matches(
                  validSlugIdRegex,
                  formatMessage(messages.invalidSlugError),
                ),
            })
          }
      onSubmit={(values) => mutate(values)}
    >
      {(formikProps) => (
        <Form onSubmit={formikProps.handleSubmit}>
          <FormikControl
            name="title"
            label={<Form.Label>{formatMessage(messages.titleLabel)}</Form.Label>}
            value={formikProps.values.title}
            placeholder={formatMessage(messages.titlePlaceholder)}
            help={formatMessage(messages.titleHelp)}
            className=""
            controlClasses="pb-2"
          />
          <Form.Group>
            <Form.Label>{formatMessage(messages.orgLabel)}</Form.Label>
            <Form.Autosuggest
              name="org"
              isLoading={isOrganizationListLoading}
              onChange={(event) => formikProps.setFieldValue('org', event.selectionId)}
              placeholder={formatMessage(messages.orgPlaceholder)}
            >
              {organizationListData ? organizationListData.map((org) => (
                <Form.AutosuggestOption key={org} id={org}>{org}</Form.AutosuggestOption>
              )) : []}
            </Form.Autosuggest>
            <FormikErrorFeedback name="org">
              <Form.Text>{formatMessage(messages.orgHelp)}</Form.Text>
            </FormikErrorFeedback>
          </Form.Group>
          <FormikControl
            name="slug"
            label={<Form.Label>{formatMessage(messages.slugLabel)}</Form.Label>}
            value={formikProps.values.slug}
            placeholder={formatMessage(messages.slugPlaceholder)}
            help={formatMessage(messages.slugHelp)}
            className=""
            controlClasses="pb-2"
          />
          <ActionRow className="justify-content-start mt-3 bottom-button-container">
            <Button
              variant="tertiary"
              onClick={handleOnClickCancel}
            >
              {formatMessage(messages.cancelCreateLibraryButton)}
            </Button>
            <StatefulButton
              type="submit"
              variant="primary"
              className="action btn-primary"
              state={isLoading ? 'disabled' : 'enabled'}
              disabledStates={['disabled']}
              labels={{
                enabled: formatMessage(messages.createLibraryButton),
                disabled: formatMessage(messages.createLibraryButtonPending),
              }}
            />
          </ActionRow>
        </Form>
      )}
    </Formik>
    {isError && (<AlertError error={error} />)}
  </Container>
);

export default CustomCreateLibrary;

CustomCreateLibrary.propTypes = {
  formatMessage: PropTypes.func.isRequired,
  specialCharsRule: PropTypes.instanceOf(RegExp).isRequired,
  noSpaceRule: PropTypes.instanceOf(RegExp).isRequired,
  validSlugIdRegex: PropTypes.instanceOf(RegExp).isRequired,
  mutate: PropTypes.func.isRequired,
  isOrganizationListLoading: PropTypes.bool.isRequired,
  organizationListData: PropTypes.arrayOf(PropTypes.string),
  handleOnClickCancel: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),
};

CustomCreateLibrary.defaultProps = {
  organizationListData: [],
  error: null,
};

export const CustomCreateLibraryPage = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { noSpaceRule, specialCharsRule } = REGEX_RULES;
  const validSlugIdRegex = /^[a-zA-Z\d]+(?:[\w-]*[a-zA-Z\d]+)*$/;

  const {
    mutate,
    data,
    isPending,
    isError,
    error,
  } = useCreateLibraryV2();

  const {
    data: allOrganizations,
    isLoading: isOrganizationListLoading,
  } = useOrganizationListData();

  const {
    studioHomeData: {
      allowedOrganizationsForLibraries,
      allowToCreateNewOrg,
    },
  } = useStudioHome();

  const organizations = (
    allowToCreateNewOrg
      ? allOrganizations
      : allowedOrganizationsForLibraries
  ) || [];

  if (data) {
    navigate(`/library/${data.id}`);
  }

  return (
    <CustomCreateLibrary
      formatMessage={intl.formatMessage}
      specialCharsRule={specialCharsRule}
      noSpaceRule={noSpaceRule}
      validSlugIdRegex={validSlugIdRegex}
      mutate={mutate}
      isOrganizationListLoading={isOrganizationListLoading}
      organizationListData={organizations}
      handleOnClickCancel={() => navigate('/libraries')}
      isLoading={isPending}
      isError={isError}
      error={error}
    />
  );
};
