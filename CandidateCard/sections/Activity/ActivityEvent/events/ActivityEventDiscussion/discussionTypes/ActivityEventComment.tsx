import React, { useState } from "react";

// components
import { Stack } from "components/common/Stack/Stack";
import { MessageAvatar } from "../ActivityEventDiscussionAvatar";
import ExpandableHtml from "components/common/Typography/ExpandableHtml";
import { Text } from "components/common/Typography/Text";
import { Button } from "components/common/Button/Button";
import { CommentBox } from "pages/Candidate/CandidateCard/sections/Activity/ActivityActions/Comment/CommentBox";

// metadata
import { DiscussionTypeEnum } from 'metadata/discussion/discussion.meta';

// types
import { DiscussionMessage } from 'types/domain/discussion.types';

// hooks
import { useActivityEventDiscussionMessages } from 'hooks/angular/activity/useActiviteEventDiscussionMessages.hook';

// styled
import * as S from '../../../ActivityEvent.styled';

type CommentProps = {
	messages: DiscussionMessage[];
};

export function Comment({ messages }: CommentProps) {
	const { messagesList, toggleMessagesExpand } = useActivityEventDiscussionMessages(messages);
	const [showCommentBox, setShowCommentBox] = useState(false);

	function expandMessages() {
		toggleMessagesExpand();
	}

	return (
		<S.ActivityDiscussionMessagesList spacing="none" vertical>
			{/* <ActivityEventDiscussionControls discussionType={discussionType} /> */}

			{messagesList.map((message, index) => (
				<Stack.Item fill key={index}>
					<Stack alignment="leading" wrap={false}>
						<MessageAvatar
							imageUrl={
								message.createBy.type === 'discussionexternalcontact' || message.createBy.type === 'sourcecontact'
									? undefined
									: message.createBy.picThumbUrl
							}
							discussionType={DiscussionTypeEnum.INTERNAL}
						/>

						<Stack.Item fill>
							<Stack vertical>
								<Stack spacing="none">
									<Text type="secondary" ellipsis>
										{message.createBy.type === 'sourcecontact' ? message.createBy.name : message.createBy.fullName}
									</Text>

									<Text type="secondary" size="small">
										{moment.min(moment(message.timeCreated), moment()).fromNow()}
									</Text>
								</Stack>

								<ExpandableHtml rawHtml={message.content} />

								{index === messagesList.length - 1 && (
									<Stack>
										<Button onClick={() => setShowCommentBox(true)}>Reply</Button>

										{messages.length > 1 && <Button onClick={expandMessages}>Messages ({messages.length})</Button>}
									</Stack>
								)}
							</Stack>
						</Stack.Item>
					</Stack>
				</Stack.Item>
			))}

			{showCommentBox && <CommentBox cancelComment={() => setShowCommentBox(false)} />}
		</S.ActivityDiscussionMessagesList>
	);
}
