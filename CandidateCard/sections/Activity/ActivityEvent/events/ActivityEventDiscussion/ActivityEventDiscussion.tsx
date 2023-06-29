import React from 'react';

import { Comment } from './discussionTypes/ActivityEventComment';
import { EmailDiscussion } from 'components/discussion/EmailDiscussion';
import { Snooze } from './discussionTypes/ActivityEventSnooze';

// types
import { ActivityEventDiscussion } from 'types/domain/activity.types';

// metadata
import { DiscussionTypeEnum } from 'metadata/discussion/discussion.meta';

// styled
import * as S from '../../ActivityEvent.styled';

type ActivityEventDiscussionProps = {
	event: ActivityEventDiscussion;
};

export default function ActivityEventDiscussion({ event }: ActivityEventDiscussionProps) {
	const { messages, discussionType } = event;

	return (
		<S.ActivityEventBox>
			<S.ActivityDiscussionMessagesList spacing="none" vertical>
				{discussionType === DiscussionTypeEnum.INTERNAL && <Comment messages={messages} />}

				{discussionType === DiscussionTypeEnum.EXTERNAL && <EmailDiscussion event={event} />}

				{discussionType === DiscussionTypeEnum.SNOOZE && <Snooze messages={messages} />}

				{(discussionType === DiscussionTypeEnum.PARTNER_EMAIL ||
					discussionType === DiscussionTypeEnum.PARTNER_CHAT ||
					discussionType === DiscussionTypeEnum.PARTNER_SMS ||
					discussionType === DiscussionTypeEnum.PARTNER_INMAIL) && (
					<div>Partner app event {JSON.stringify(event)} </div>
				)}
			</S.ActivityDiscussionMessagesList>
		</S.ActivityEventBox>
	);
}
