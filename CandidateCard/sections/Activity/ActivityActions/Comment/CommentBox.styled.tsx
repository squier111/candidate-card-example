import styled from "styled-components";

export const CommentBox = styled.div`
  border: 1px solid ${props => props.theme.colors.functional.border.base};
  border-radius: 4px;
  padding: 12px;
  background-color: white;
  position: relative;
  z-index: 1;
`