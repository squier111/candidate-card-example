import React from 'react';
import styled from 'styled-components';

import { AngularTemplate, AngularScopeProvider, useAngularScopeRef } from 'bridge/angular-bridge';
import { useCandidates } from 'hooks/angular/candidates/useCandidates.hook';

const StyledReminderAngularTemplate = styled(AngularTemplate)`
  .snooze-wrp {
    border-radius: 4px;
    padding: 10px;

    .personThumb {
      display: none;
    }

    .postComment {
      padding: 0;
    }

    .mention {
      .editor {
        border: none;
        outline: none;
        height: 150px;
      }
    }

    #sendTimeButton {
      
    }
  }
`;

type InternalDiscussionScope = {
	discussionContext: {
    type: string,
    id: number
  },
  onDiscussionSent: () => void,
  onDiscussionCancel: () => void,
  candidateUsers: []
};


export function CandidateActivityReminder() {
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
      <StyledReminderAngularTemplate
        template={`<div
          snooze
          discussion-context="discussionContext"
          on-sent="onDiscussionSent"
          on-cancel="onDiscussionCancel"
          users="candidateUsers">
        </div>`}
      />
    </AngularScopeProvider>
  );
}