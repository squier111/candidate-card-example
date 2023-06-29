import React from "react";
import { Avatar } from 'antd';

// components
import { ChatCentered, EnvelopeSimple, Timer, User } from 'components/icons';

// metadata
import { DiscussionTypeEnum } from 'metadata/discussion/discussion.meta';

// styled
import * as S from './ActivityEventDiscussionAvatar.styled';

type MessageAvatarType = {
	imageUrl?: string | null;
	discussionType?: DiscussionTypeEnum;
};

// Explicitly use in component, remove from here
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
    <S.ActivityItemAvatar>
      <Avatar size={S.AVATAR_SIZE} src={imageUrl} icon={<User />} shape="square" />

      {discussionType &&
        <div className="discussion-type">{getDiscussionTypeIcon()}</div>
      }
    </S.ActivityItemAvatar>
  )
}
