import React, { useState } from 'react';

// hooks
import { useUsers } from 'hooks/angular/users';
import { useDiscussions } from 'hooks/angular/discussions';

import { useCandidates } from 'hooks/angular/candidates/useCandidates.hook';
import { Stack } from 'components/common/Stack/Stack';
import {
	EmailComposer,
	EmailComposerApi,
	EmailComposerDiscussionContext,
	EmailComposerMailAction
} from 'components/common/EmailComposer/EmailComposer';
import { Button } from 'components/common/Button/Button';
import { eventsEnum, actionsEnum, BLANK_TEMPLATE_ID } from 'metadata/message-templates/message-templates.meta';
import { DiscussionMessage, ExternalDiscussion } from 'types/domain/discussion.types';

// local utils
import { constructReplyEmail, getReceiverRole } from './utils';
import last from 'lodash/last';

type ReplyEmailProps = {
	onCancel: () => void;
	onSend: () => void;
	event: ExternalDiscussion;
	replyAll?: boolean;
};

export function ReplyEmail({ onCancel, onSend, event, replyAll = false }: ReplyEmailProps) {
	const usersService = useUsers();
	const candidateService = useCandidates();
	const discussionService = useDiscussions();

	const currentUser = usersService.getCurrent();
	const currentCandidate = candidateService.getCurrent();

	const [isMessageLoading, setIsMessageLoading] = useState(false);
	const [sending, setSending] = useState(false);
	const [emailComposerApi, setEmailComposerApi] = useState<EmailComposerApi | null>(null);

	const lastEmail = last(event.messages)!;

	const receiverRole = getReceiverRole(event.contact);
	const replyEmail = constructReplyEmail(lastEmail, replyAll, currentUser);

	const discussionContext: EmailComposerDiscussionContext = {
		type: 'candidate',
		id: currentCandidate.id
	};

	const mailAction: EmailComposerMailAction = {
		messages: [
			{
				referenceMessageId: lastEmail.id,
				discussionId: event.id,
				from: currentUser.fullName,
				to: replyEmail.to,
				receivers: replyEmail.receivers,
				action: actionsEnum.ASK,
				event: eventsEnum.MANUAL,
				isDelayed: false,
				subject: replyEmail.subject,
				delayHours: 0
			}
		],
		editMode: true,
		isNew: true
	};

	function sendEmail() {
		setSending(true);
		emailComposerApi!
			.send<DiscussionMessage>()
			.then((messages) => {
				event.messages.push(messages[0]);
				onSend();

				// in Angular also there is and event that is caught by discussionWidget
				// and calls initMinimalDiscussion.
			})
			.finally(() => {
				setSending(false);
			});
	}

	return (
		<Stack vertical>
			<EmailComposer
				mailAction={mailAction}
				discussionContext={discussionContext}
				hideTitle={true}
				isReply={true}
				receiverRole={receiverRole}
				template={{ id: BLANK_TEMPLATE_ID }}
				showVisibility={true}
				visibilityText={discussionService.visibility.data[event.visibility].text}
				onApiChange={setEmailComposerApi}
				onIsLoadingChange={setIsMessageLoading}
				showMinimizedToolbarForEmailBody={true}
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
