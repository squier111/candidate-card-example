import React from "react";
import { Input } from "antd";

// styled
import * as S from './CommentBox.styled'

// components
import { Stack } from "components/common/Stack/Stack";
import { Button } from "components/common/Button/Button";
import { Text } from "components/common/Typography/Text";
import { File, ArrowsOutSimple, Eye, Clock } from 'components/icons';

const { TextArea } = Input;

type CommentBoxProps = {
 cancelComment: () => void
}

export function CommentBox({
  cancelComment
}: CommentBoxProps) {
  return (
    <S.CommentBox>
      <Stack vertical>
        <TextArea rows={6} />

        <Stack distribution="equalSpacing">
          <Stack spacing="extraTight">
            <Button icon={<Eye />}></Button>
            <Button icon={<Clock />}></Button>
          </Stack>

          <Stack spacing="extraTight">
            <Button onClick={cancelComment}>Cancel</Button>
            <Button type="primary">Send</Button>
          </Stack>
        </Stack>
      </Stack>
    </S.CommentBox>
  )
}