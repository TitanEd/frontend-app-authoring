import React, { useEffect, useState } from 'react';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Loading from '../generic/Loading';

/** Block types the course outline can show and scroll to. */
const OUTLINE_BLOCK_TYPES = ['chapter', 'sequential', 'vertical'];

/** Return the block type of a usage key (`block-v1:…+type@problem+block@…` gives "problem"). */
export const blockTypeOf = (usageKey: string): string | undefined => /\+type@([^+]+)\+block@/.exec(usageKey)?.[1];

interface Ancestor {
  id: string;
  category: string;
}

/**
 * Return the unit page that shows ``usageKey``, from its ancestors (nearest first), or null.
 *
 * A component of a library content block is shown by that block, as Studio's own search does.
 */
export const unitPageOf = (courseId: string, usageKey: string, ancestors: Ancestor[]): string | null => {
  const unitIndex = ancestors.findIndex((ancestor) => ancestor.category === 'vertical');
  if (unitIndex === -1) {
    return null;
  }
  const parent = ancestors[unitIndex - 1];
  const shown = parent?.category === 'library_content' ? parent.id : usageKey;
  return `/course/${courseId}/container/${ancestors[unitIndex].id}?show=${encodeURIComponent(shown)}`;
};

interface Props {
  courseId: string;
  children: React.ReactNode;
}

/**
 * Open the unit page when the course outline is asked to show a component (`?show=<component key>`).
 *
 * The outline only shows sections, subsections and units, so such a link (the header search sends every
 * result to the outline) would land at the top of the outline. When the unit cannot be found, the outline
 * opens as before.
 */
const ShowComponentInUnit = ({ courseId, children }: Props) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const show = searchParams.get('show') || '';
  const blockType = show ? blockTypeOf(show) : undefined;
  const needsUnit = !!blockType && !OUTLINE_BLOCK_TYPES.includes(blockType);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!needsUnit) {
      return undefined;
    }
    let cancelled = false;
    setFailed(false);
    getAuthenticatedHttpClient()
      .get(`${getConfig().STUDIO_BASE_URL}/xblock/${show}?fields=ancestorInfo`)
      .then(({ data }) => {
        if (cancelled) {
          return;
        }
        const target = unitPageOf(courseId, show, data?.ancestors || []);
        if (target) {
          navigate(target, { replace: true });
        } else {
          setFailed(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [courseId, show, needsUnit]);

  if (needsUnit && !failed) {
    return <Loading />;
  }
  return <>{children}</>;
};

export default ShowComponentInUnit;
