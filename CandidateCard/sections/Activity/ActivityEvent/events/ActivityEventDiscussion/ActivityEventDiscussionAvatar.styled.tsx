import styled from "styled-components";

export const AVATAR_SIZE = 40;

export const ActivityItemAvatar = styled.div`
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