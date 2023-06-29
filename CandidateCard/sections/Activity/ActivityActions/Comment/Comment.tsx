import React from 'react';
import styled from 'styled-components';

import { AngularTemplate, AngularScopeProvider, useAngularScopeRef } from 'bridge/angular-bridge';
import { useCandidates } from 'hooks/angular/candidates/useCandidates.hook';

type InternalDiscussionScope = {
	discussionContext: {
    type: string,
    id: number
  },
  onDiscussionSent: () => void,
  onDiscussionCancel: () => void,
  candidateUsers: []
};


const StyledCommentAngularTemplate = styled(AngularTemplate)`
  border: 1px solid ${props => props.theme.colors.functional.border.base};
  border-radius: 4px;
  padding: 10px;

  .personThumb {
    display: none;
  }

  .editor {
    height: 150px;
    border: none;
    outline: none;
  }

  .cardActionGroup {
    button {
      margin-left: 10px;
    }
  }
`;

export function CandidateActivityComment() {
  const candidateService = useCandidates();
	const currentCandidate = candidateService.getCurrent();

  const $scope = useAngularScopeRef<InternalDiscussionScope>({
    discussionContext: {
      type: 'candidate',
      id: currentCandidate.id
    },
    onDiscussionSent: () => {},
    onDiscussionCancel: () => {},
    candidateUsers: []
  });

  return (
    <AngularScopeProvider value={$scope.current}>
      <StyledCommentAngularTemplate
        template={`<div
          internal-discussion-sender
          discussion-context="discussionContext"
          on-sent="onDiscussionSent"
          on-cancel="onDiscussionCancel"
          users="candidateUsers">
        </div>`}
      />
    </AngularScopeProvider>
  );
}