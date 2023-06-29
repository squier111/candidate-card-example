import styled from 'styled-components';

import { Stack } from 'components/common/Stack/Stack';
import * as S from './events/ActivityEventDiscussion/ActivityEventDiscussionAvatar.styled'

export const ActivityEventBox = styled.div`
  padding: 24px;
  position: relative;

  &:hover {
    background-color: ${props => props.theme.colors.functional.background.hover};

    .activity-event-controls {
      opacity: 1;
    }
  }
`

export const ActivityEventInline = styled.div`
  padding: 8px 24px 8px ${24 + 40 + 16}px; /* padding + avatar + gap */
  color: ${props => props.theme.colors.functional.text.subdued};
  background-color: ${props => props.theme.colors.functional.background.base};
`
export const ActivityDiscussionMessagesList = styled(Stack)`
  & > div {
    position: relative;
    padding-bottom: ${props => props.theme.spacing.loose};

    &:before {
      content: '';
      position: absolute;
      left: ${S.AVATAR_SIZE / 2 - 1}px;
      top: 0;
      width: 1px;
      height: calc(100% + ${props => props.theme.spacing.loose});
      background-color: ${props => props.theme.colors.base.grey[2]};
    }

    &:first-child {
      &:before {
        top: 0;
        height: 100%;
      }
    }

    &:last-child {
      padding-bottom: 0;

      &:before {
        height: ${S.AVATAR_SIZE}px;
      }
    }
  }
`