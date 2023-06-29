import React  from "react";
import { Dropdown, Menu } from 'antd';

// components
import { DotsThree } from 'components/icons';
import { Button } from 'components/common/Button/Button';


function getDropdownMenu() {
  return (
    <Menu>
      <Menu.Item key="send-now">
        Send now
      </Menu.Item>

      <Menu.Item key="reply">
        Reply
      </Menu.Item>

      <Menu.Item key="delete">
        Delete
      </Menu.Item>
    </Menu>
  )
}


export default function ActivityEventCandidateStepControls() {
  return (
      <Dropdown
        overlay={getDropdownMenu()}
        trigger={["click"]}
        placement="bottomRight"
        getPopupContainer={(triggerNode) => {console.log(triggerNode); return triggerNode.parentNode as HTMLElement}}
      >
        <Button
          icon={<DotsThree size={18} />}
          neutral
          type="ghost"
          size="small"
        />
      </Dropdown>
  );
}
