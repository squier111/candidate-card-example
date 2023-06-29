import reject from 'lodash/reject';

import { receiversEnum } from 'metadata/message-templates/message-templates.meta';
import { DiscussionReceiverTypeEnum } from 'metadata/discussion/discussion.meta';

import { DiscussionMessage } from 'types/domain/discussion.types';
import { UserResource } from 'types/domain/user.types';
import { DiscussionReceiver, ExternalDiscussion, DiscussionParticipant } from 'types/domain/discussion.types';

type replyEmail = {
	receivers: DiscussionParticipant[];
	to: DiscussionParticipant[];
	subject: string;
};

export function constructReplyEmail(
	originalEmail: DiscussionMessage,
	replyAll: boolean,
	currentUser: UserResource
): replyEmail {
	const replyEmail: replyEmail = {
		receivers: [],
		to: [],
		subject: ''
	};

	const replyToEmail = {
		sentByCurrentUser: originalEmail.createBy.type === 'user' && originalEmail.createBy.id === currentUser.id,
		subject: originalEmail.subject,
		from: originalEmail.createBy,
		to: originalEmail.sentTo.filter((participant) => participant.receiverType === DiscussionReceiverTypeEnum.TO),
		cc: originalEmail.sentTo.filter((participant) => participant.receiverType === DiscussionReceiverTypeEnum.CC)
	};

	/* if user is replying his own email */
	if (replyToEmail.sentByCurrentUser) {
		if (replyAll) {
			replyEmail.to = excludeCurrentUserFromReceivers(replyToEmail.to, currentUser.id).map(
				(receiver) => receiver.participant
			);
		} else if (replyToEmail.to.length /*  && replyToMessage.to[0].participant */) {
			replyEmail.to.push(replyToEmail.to[0].participant);
		}
	} else {
		replyEmail.to.push(replyToEmail.from);

		if (replyAll) {
			replyEmail.to = replyEmail.to.concat(
				excludeCurrentUserFromReceivers(replyToEmail.to, currentUser.id).map((receiver) => receiver.participant)
			);
		}
	}

	if (replyAll) {
		replyEmail.receivers = replyToEmail.cc.map((receiver) => {
			// @ts-ignore Actually there is no "cc" property on participant object,
			// but this is required for send-single-message to display checked checkbox
			// in from of participant name
			receiver.participant.cc = true;
			return receiver.participant;
		});
	}

	replyEmail.subject = `${replyToEmail.subject.toLowerCase().startsWith('re') ? '' : 'RE: '}${replyToEmail.subject}`;

	return replyEmail;
}

export function getReceiverRole(eventContact: DiscussionParticipant) {
	switch (eventContact!.type) {
		case 'candidate':
			return receiversEnum.CANDIDATE;
		case 'sourcecontact':
			return receiversEnum.SOURCE;
		case 'user':
			return receiversEnum.ANY;
		case 'discussionexternalcontact':
			return receiversEnum.ANY;
		default:
			return receiversEnum.ANY;
	}
}

function excludeCurrentUserFromReceivers(receivers: DiscussionReceiver[], currentUserId: number) {
	return reject(
		receivers,
		(receiver) => receiver.participant.type === 'user' && receiver.participant.id === currentUserId
	);
}
