import React from "react";
import { Typography } from 'antd';

import { Tooltip } from 'components/common/Tooltip/Tooltip';
import { Tag } from 'components/common/Tag/Tag';
import { FileText } from 'components/icons';

const { Text } = Typography;


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
