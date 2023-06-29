import React, { useState } from 'react';

import { useCandidates } from 'hooks/angular/candidates/useCandidates.hook';
import { Stack } from 'components/common/Stack/Stack';
import {
	EmailComposer,
	EmailComposerApi,
	EmailComposerDiscussionContext,
	EmailComposerMailAction
} from 'components/common/EmailComposer/EmailComposer';
import { Button } from 'components/common/Button/Button';
import {
	eventsEnum,
	actionsEnum,
	receiversEnum,
	BLANK_TEMPLATE_ID
} from 'metadata/message-templates/message-templates.meta';
import { ActivityEventDiscussion } from 'types/domain/activity.types';
import cloneDeep from 'lodash/cloneDeep';

type EmailProps = {
	onCancel: () => void;
	onSend: () => void;
};

export function EmailComponent({ onCancel, onSend }: EmailProps) {
	const [isMessageLoading, setIsMessageLoading] = useState(false);
	const [sending, setSending] = useState(false);
	const [emailComposerApi, setEmailComposerApi] = useState<EmailComposerApi | null>(null);

	function sendEmail() {
		setSending(true);
		emailComposerApi!
			.send<ActivityEventDiscussion>()
			.then((activityEvents) => {
				onSend();
			})
			.finally(() => {
				setSending(false);
			});
	}

	const candidateService = useCandidates();
	const currentCandidate = candidateService.getCurrent();
	const clonedCurrentCandidate = cloneDeep(currentCandidate);

	const discussionContext: EmailComposerDiscussionContext = {
		type: 'candidate',
		id: currentCandidate.id
	};

	const mailAction: EmailComposerMailAction = {
		messages: [
			{
				action: actionsEnum.ASK,
				discussionContext,
				event: eventsEnum.MANUAL,
				from: currentCandidate.fullName,
				isDelayed: false,
				receivers: [],
				to: [clonedCurrentCandidate]
			}
		],
		editMode: true,
		isNew: true
	};

	return (
		<Stack vertical>
			<EmailComposer
				discussionContext={discussionContext}
				hideTitle={true}
				mailAction={mailAction}
				onApiChange={setEmailComposerApi}
				onIsLoadingChange={setIsMessageLoading}
				receiverRole={receiversEnum.CANDIDATE}
				showMinimizedToolbarForEmailBody={true}
				showVisibility={true}
				template={{ id: BLANK_TEMPLATE_ID }}
			/>
			<Button block disabled={isMessageLoading || sending} onClick={onCancel}>
				Cancel
			</Button>
			<Button block type="primary" disabled={isMessageLoading || sending} onClick={sendEmail}>
				{emailComposerApi?.sendLater ? 'Schedule to send' : 'Send'}
			</Button>
		</Stack>
	);
}
