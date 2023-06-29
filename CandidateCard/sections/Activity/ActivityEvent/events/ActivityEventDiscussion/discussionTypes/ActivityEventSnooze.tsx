import React, { useState, useCallback } from "react";
import { Dropdown, Menu } from 'antd';
import DOMPurify from 'dompurify';

// components
import { Stack } from "components/common/Stack/Stack";
import { MessageAvatar } from "../ActivityEventDiscussionAvatar";
import ExpandableHtml from "components/common/Typography/ExpandableHtml";
import { Text } from "components/common/Typography/Text";
import { Button } from "components/common/Button/Button";
import { CommentBox } from "pages/Candidate/CandidateCard/sections/Activity/ActivityActions/Comment/CommentBox";
import Alert from 'components/common/Alert/Alert';
import { Info, DotsThree } from "components/icons";

// types
import { DiscussionMessage } from 'types/domain/discussion.types';

// metadata
import { DiscussionTypeEnum } from 'metadata/discussion/discussion.meta';

// hooks
import { useActivityEventDiscussionMessages } from 'hooks/angular/activity/useActiviteEventDiscussionMessages.hook';

// styled
import * as S from '../../../ActivityEvent.styled';

const snoozeActionMenu = (
	<Menu>
		<Menu.Item key="sendNow">Send now</Menu.Item>

		<Menu.Item key="delete">Delete</Menu.Item>
	</Menu>
);

type SnoozeProps = {
	messages: DiscussionMessage[];
};

export function Snooze({ messages }: SnoozeProps) {
	const { messagesList, toggleMessagesExpand } = useActivityEventDiscussionMessages(messages);
	const [showCommentBox, setShowCommentBox] = useState(false);

	const safePlainTextMessage = useCallback((message: DiscussionMessage) => {
		var dummyElement = document.createElement('div');
		dummyElement.insertAdjacentHTML('beforeend', message.content);

		var snoozeMessageNode = dummyElement.querySelector('.snooze-details');

		if (snoozeMessageNode?.innerHTML) {
			return DOMPurify.sanitize(snoozeMessageNode.innerHTML, {
				USE_PROFILES: {
					html: true
				}
			});
		} else {
			return message.content;
		}
	}, []);

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
							discussionType={DiscussionTypeEnum.SNOOZE}
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

								{!!message.delayHours && !message.timeSent && (
									<Alert
										showIcon
										icon={<Info />}
										description={`Email reminder will sent on: ${moment(message.timeCreated)
											.add(message.delayHours, 'h')
											.format('MMM D, YYYY - h:mm A')}`}
										action={
											<Dropdown overlay={snoozeActionMenu} trigger={['click']} placement="bottomRight">
												<Button
													icon={<DotsThree color="white" size={18} />}
													neutral
													type="ghost"
													size="small"
													style={{ backgroundColor: '#6F789B' }}
												/>
											</Dropdown>
										}
									/>
								)}

								<ExpandableHtml rawHtml={safePlainTextMessage(message)} />

								{index === messagesList.length - 1 && !messages[0].delayHours && (
									<Stack>
										<Button onClick={() => setShowCommentBox(true)}>Reply</Button>

										{messages.length > 1 && (
											<Button onClick={toggleMessagesExpand}>Messages ({messages.length})</Button>
										)}
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
