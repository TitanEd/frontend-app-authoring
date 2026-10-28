import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Button, Card } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';
import customMessages from './customMessages';
import { youTubeVideoId } from './youtube';

// The field takes a YouTube link or a video ID and hands the ID on (Studio stores the ID only).
// Text that is neither is handed on as typed, so the page can refuse to save it.
const IntroductionVideo = ({ introVideo, isEditable = true, onChange }) => {
  const intl = useIntl();
  // What the author typed or pasted; `introVideo` is the ID taken from it.
  const [text, setText] = useState(introVideo || '');

  // The value changed elsewhere (cancel, delete, a saved course): show it.
  useEffect(() => {
    const value = introVideo || '';
    if (text !== value && (youTubeVideoId(text) || text) !== value) {
      setText(value);
    }
  }, [introVideo]); // eslint-disable-line react-hooks/exhaustive-deps

  const videoId = youTubeVideoId(text);
  const isInvalid = Boolean(text.trim()) && !videoId;
  const embedVideoUrl = videoId
    ? `//www.youtube.com/embed/${videoId}`
    : '';

  const handleChange = (event) => {
    const { value } = event.target;
    setText(value);
    onChange(youTubeVideoId(value) || value, 'introVideo');
  };

  let feedback = intl.formatMessage(customMessages.linkHelp);
  if (isInvalid) {
    feedback = intl.formatMessage(customMessages.linkInvalid);
  } else if (videoId && videoId !== text.trim()) {
    feedback = intl.formatMessage(customMessages.linkFound, { id: videoId });
  }

  return (
    <Form.Group className="form-group-custom" isInvalid={isInvalid}>
      <Form.Label>
        {intl.formatMessage(messages.courseIntroductionVideoLabel)}
      </Form.Label>
      <Card>
        <Card.Body className="embed-video-container">
          <div className="introduction-video">
            <iframe
              title={intl.formatMessage(messages.courseIntroductionVideoLabel)}
              width="618"
              height="350"
              src={embedVideoUrl}
              frameBorder="0"
              allowFullScreen
            />
          </div>
        </Card.Body>
        <Card.Divider />
        <Card.Footer className="p-2.5">
          <Form.Control
            value={text}
            placeholder={intl.formatMessage(customMessages.linkPlaceholder)}
            onChange={handleChange}
            disabled={!isEditable}
            inputMode="url"
            spellCheck={false}
          />
          <Button
            variant="outline-primary"
            onClick={() => {
              setText('');
              onChange('', 'introVideo');
            }}
            disabled={!text || !isEditable}
          >
            {intl.formatMessage(messages.courseIntroductionVideoDelete)}
          </Button>
        </Card.Footer>
      </Card>
      <Form.Control.Feedback type={isInvalid ? 'invalid' : 'default'} hasIcon={false}>
        {feedback}
      </Form.Control.Feedback>
    </Form.Group>
  );
};

IntroductionVideo.defaultProps = {
  introVideo: '',
};

IntroductionVideo.propTypes = {
  introVideo: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default IntroductionVideo;
