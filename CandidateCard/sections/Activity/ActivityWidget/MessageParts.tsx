import React, { useState, useEffect } from "react";
import { Typography, Avatar, Divider } from 'antd';
import styled from 'styled-components';
import DOMPurify from 'dompurify';

import { Button } from 'components/common/Button/Button';
import { Tooltip } from 'components/common/Tooltip/Tooltip';
import { Stack } from "components/common/Stack/Stack";
import { Tag } from 'components/common/Tag/Tag';
import { Rate } from "components/common/Rate/Rate";
import { Paperclip, ChatCentered, EnvelopeSimple, Timer, FileText, User } from 'components/icons';

// metadata
import { DiscussionTypeEnum } from 'metadata/discussion/discussion.meta';

//types
import {ActivityEventDiscussion} from 'types/domain/activity.types'
import { InterviewResource } from 'types/domain/interview.types';

const { Link, Text } = Typography;

export const AVATAR_SIZE = 40;


const StyledActivityItemAvatar = styled.div`
  position: relative;

  .discussion-type {
    background-color: ${props => props.theme.colors.base.grey[2]};
    color: ${props => props.theme.colors.base.grey[8]};
    text-align: center;
    border-radius: 4px;
    height: ${AVATAR_SIZE / 2}px;
    width: ${AVATAR_SIZE / 2}px;
    position: absolute;
    bottom: -5px;
    right: -4px;

    .anticon {
      vertical-align: 0;
    }
  }
`


export const MessageAttachment = ({ fileName }: { fileName: string }) => {
  return (
    <Tooltip title={fileName}>
      <Tag icon={<FileText />}>
          <Text
            style={{ maxWidth: '97px' }}
            ellipsis={true}
            title={fileName}
            onClick={() => {alert(fileName)}}
          >
            {fileName.length > 10 ? `${fileName.substring(0, 10)}...` : fileName}
          </Text>
      </Tag>
    </Tooltip>
  );
}



type MessageAvatarType = {
	imageUrl?: string;
	discussionType?: DiscussionTypeEnum;
};

export const MessageAvatar = ({ imageUrl, discussionType }: MessageAvatarType) => {
  const getDiscussionTypeIcon = () => {
    switch (discussionType) {
			case DiscussionTypeEnum.INTERNAL:
				return <ChatCentered size={12} weight="bold" />;

			case DiscussionTypeEnum.EXTERNAL:
				return <EnvelopeSimple size={12} weight="bold" />;

			case DiscussionTypeEnum.SNOOZE:
				return <Timer size={12} weight="bold" />;
		}
  }

  return (
    <StyledActivityItemAvatar>
      <Avatar size={AVATAR_SIZE} src={imageUrl} icon={<User />} shape="square" />

      {discussionType &&
        <div className="discussion-type">{getDiscussionTypeIcon()}</div>
      }
    </StyledActivityItemAvatar>
  )
}



type MessageActionsType = {
	expandMessages: () => void;
	config?: {
		showReply?: boolean;
		showMessagesCount?: boolean;
		showAttachmentsCount?: boolean;
		showUndo?: boolean;
		showMore?: boolean;
	};
} & Partial<ActivityEventDiscussion>;

export const MessageActions = ({
	messages,
	expandMessages,
	config = {
		showReply: true,
		showMessagesCount: true,
		showAttachmentsCount: true,
		showUndo: false,
		showMore: false
	}
}: MessageActionsType) => {
	const [messageAttachments, setMessageAttachments] = useState(0);

	useEffect(() => {
		if (!messages?.length) {
			return;
		}

		let filesInThread = messages.reduce((accum, current) => {
			if (current.files.length) {
				accum += current.files.length;
			}

			return accum;
		}, 0);

		setMessageAttachments(filesInThread);
	}, [messages]);

	return (
		<Stack alignment="center">
			{config.showReply && <Link>Reply</Link>}
			{config.showMessagesCount && messages && messages.length > 1 && (
				<Link onClick={expandMessages}>Messages ({messages.length})</Link>
			)}

			{config.showAttachmentsCount && messageAttachments && (
				<Tooltip
					placement="bottomLeft"
					title={`${messageAttachments} file attachment${messageAttachments > 1 ? 's' : ''}`}
				>
					<Button icon={<Paperclip />} />
				</Tooltip>
			)}

			{config.showUndo && <Link>Undo step</Link>}

			{config.showMore && <Link onClick={expandMessages}>Show more</Link>}
		</Stack>
	);
};

type FullInterviewProps = {
	interview: InterviewResource;
	positionName: string;
};

export const FullInterview = ({ interview, positionName }: FullInterviewProps) => {
	const { pros, concerns, furtherReview, notes, interviewrankSet } = interview;

	const sanitizeHtml = (htmlString: string) => {
		return DOMPurify.sanitize(htmlString, {
			USE_PROFILES: {
				html: true
			}
		});
	};

	const getScorecardMean = () => {
		const sum = interviewrankSet.reduce((result, rank) => {
			return (result += rank.value);
		}, 0);

		return (sum / interviewrankSet.length).toFixed(1);
	};

	const getScorecardTagColor = () => {
		const meanValue = parseInt(getScorecardMean(), 10);

		if (meanValue < 3) {
			return 'red';
		} else if (meanValue >= 4) {
			return 'green';
		} else {
			return 'yellow';
		}
	};

	return (
		<Stack vertical>
			{pros && (
				<Stack vertical spacing="none">
					<Text type="secondary">Pros</Text>

					<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(pros) }} />
				</Stack>
			)}

			{concerns && (
				<Stack vertical spacing="none">
					<Text type="secondary">Concerns</Text>

					<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(concerns) }} />
				</Stack>
			)}

			{furtherReview && (
				<Stack vertical spacing="none">
					<Text type="secondary">Further review</Text>
					<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(furtherReview) }} />
				</Stack>
			)}

			{notes && (
				<Stack vertical spacing="none">
					<Text type="secondary">Notes</Text>

					<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(notes) }} />
				</Stack>
			)}

			{interviewrankSet.length && (
				<Stack vertical>
					<Divider style={{ margin: '10px 0' }} />

					<Stack distribution="equalSpacing">
						<Text strong>{positionName}</Text>

						<Stack>
							<Text type="secondary">Total score</Text>
							<Tag color={getScorecardTagColor()}>{getScorecardMean()}</Tag>
						</Stack>
					</Stack>

					{interviewrankSet.map((rank) => (
						<Stack alignment="baseline" distribution="equalSpacing">
							<Stack vertical spacing="none">
								<Text type="secondary">{rank.name}</Text>
								{rank.notes && <Text>{rank.notes}</Text>}
							</Stack>

							<Rate disabled value={rank.value} />
						</Stack>
					))}
				</Stack>
			)}
		</Stack>
	);
};
