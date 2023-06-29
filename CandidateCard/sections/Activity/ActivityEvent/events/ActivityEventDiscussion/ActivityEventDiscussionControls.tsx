import React  from "react";
import { Dropdown, Menu } from 'antd';

// components
import { DotsThree } from 'components/icons';
import { Button } from 'components/common/Button/Button';

// styled
import * as S from './ActivityEventDiscussionControls.styled';

// metadata
import { DiscussionTypeEnum } from 'metadata/discussion/discussion.meta';


function getDropdownMenu(discussionType: DiscussionTypeEnum) {
	return (
		<Menu>
			<Menu.Item key="send-now">Send now</Menu.Item>

			<Menu.Item key="reply">Reply</Menu.Item>

			<Menu.Item key="delete">Delete</Menu.Item>
		</Menu>
	);
}

type ActivityEventDiscussionControlsProps = {
	discussionType: DiscussionTypeEnum;
};

export default function ActivityEventDiscussionControls({ discussionType }: ActivityEventDiscussionControlsProps) {
  return (
    <S.DropdownButton className="activity-event-controls">
      <Dropdown
        overlay={getDropdownMenu(discussionType)}
        trigger={["click"]}
        placement="bottomRight"
        getPopupContainer={(triggerNode) => {console.log(triggerNode); return triggerNode as HTMLElement}}
      >
        <Button
          icon={<DotsThree size={18} />}
          neutral
          type="ghost"
          size="small"
        />
      </Dropdown>
    </S.DropdownButton>
  );
}
