import React from 'react';
import { act, render, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { courseDetailsMock } from '../../__mocks__';
import messages from './messages';
import customMessages from './customMessages';
import IntroductionVideo from '.';

describe('<IntroductionVideo />', () => {
  const onChangeMock = jest.fn();
  const RootWrapper = (props) => (
    <IntlProvider locale="en">
      <IntroductionVideo {...props} />
    </IntlProvider>
  );

  const props = {
    intl: {},
    introVideo: courseDetailsMock.introVideo,
    onChange: onChangeMock,
  };

  it('renders successfully', () => {
    const {
      getByText,
      getByPlaceholderText,
      getByRole,
      getByTitle,
    } = render(
      <RootWrapper {...props} />,
    );
    expect(
      getByText(messages.courseIntroductionVideoLabel.defaultMessage),
    ).toBeInTheDocument();
    expect(
      getByText(customMessages.linkHelp.defaultMessage),
    ).toBeInTheDocument();
    expect(
      getByPlaceholderText(customMessages.linkPlaceholder.defaultMessage),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: messages.courseIntroductionVideoDelete.defaultMessage }),
    ).toBeInTheDocument();
    expect(getByTitle(messages.courseIntroductionVideoLabel.defaultMessage)).toBeInTheDocument();
  });

  it('should call onChange if video input id changed', async () => {
    const { getByPlaceholderText } = render(<RootWrapper {...props} />);
    const input = getByPlaceholderText(
      customMessages.linkPlaceholder.defaultMessage,
    );
    act(() => {
      fireEvent.change(input, { target: { value: '/assets' } });
    });
    expect(onChangeMock).toHaveBeenCalledWith(
      '/assets',
      'introVideo',
    );
  });

  it('should clear video input if button delete clicked', () => {
    const initialProps = { ...props, introVideo: 'BvgNgTPTkSo' };
    const { getByRole } = render(<RootWrapper {...initialProps} />);
    const button = getByRole('button', { name: messages.courseIntroductionVideoDelete.defaultMessage });
    fireEvent.click(button);
    expect(onChangeMock).toHaveBeenCalledWith('', 'introVideo');
  });

  it('disables input and delete button when isEditable is false', () => {
    const initialProps = { ...props, introVideo: 'BvgNgTPTkSo', isEditable: false };
    const { getByPlaceholderText, getByRole } = render(<RootWrapper {...initialProps} />);
    expect(getByPlaceholderText(customMessages.linkPlaceholder.defaultMessage)).toBeDisabled();
    expect(getByRole('button', { name: messages.courseIntroductionVideoDelete.defaultMessage })).toBeDisabled();
  });

  it('enables input and delete button when isEditable is true', () => {
    const initialProps = { ...props, introVideo: 'BvgNgTPTkSo', isEditable: true };
    const { getByPlaceholderText, getByRole } = render(<RootWrapper {...initialProps} />);
    expect(getByPlaceholderText(customMessages.linkPlaceholder.defaultMessage)).not.toBeDisabled();
    expect(getByRole('button', { name: messages.courseIntroductionVideoDelete.defaultMessage })).not.toBeDisabled();
  });

  it('hands on the video ID of a pasted YouTube link and shows it', () => {
    const { getByPlaceholderText, getByText, getByTitle } = render(<RootWrapper {...props} introVideo="" />);
    const input = getByPlaceholderText(customMessages.linkPlaceholder.defaultMessage);
    fireEvent.change(input, { target: { value: 'https://www.youtube.com/watch?v=BvgNgTPTkSo&t=42s' } });
    expect(onChangeMock).toHaveBeenLastCalledWith('BvgNgTPTkSo', 'introVideo');
    expect(input).toHaveValue('https://www.youtube.com/watch?v=BvgNgTPTkSo&t=42s');
    expect(getByText('YouTube video ID: BvgNgTPTkSo')).toBeInTheDocument();
    expect(getByTitle(messages.courseIntroductionVideoLabel.defaultMessage))
      .toHaveAttribute('src', '//www.youtube.com/embed/BvgNgTPTkSo');
  });

  it('says so when the text is not a YouTube link or ID', () => {
    const { getByPlaceholderText, getByText } = render(<RootWrapper {...props} introVideo="" />);
    fireEvent.change(
      getByPlaceholderText(customMessages.linkPlaceholder.defaultMessage),
      { target: { value: 'https://vimeo.com/123456789' } },
    );
    expect(onChangeMock).toHaveBeenLastCalledWith('https://vimeo.com/123456789', 'introVideo');
    expect(getByText(customMessages.linkInvalid.defaultMessage)).toBeInTheDocument();
  });

  it('shows a value changed elsewhere', () => {
    const { getByPlaceholderText, rerender } = render(<RootWrapper {...props} introVideo="BvgNgTPTkSo" />);
    rerender(<RootWrapper {...props} introVideo="" />);
    expect(getByPlaceholderText(customMessages.linkPlaceholder.defaultMessage)).toHaveValue('');
  });
});
