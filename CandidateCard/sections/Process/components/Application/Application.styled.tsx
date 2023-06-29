import styled from 'styled-components';

export type JumpToBarProps = {
	isSticky: boolean;
};

export const JumpToBar = styled.div<JumpToBarProps>`
	background: ${(props) => props.theme.colors.base.white};
	z-index: 1;
	padding: 24px 0;
	border-bottom: 1px solid ${(props) => props.theme.colors.functional.border.split};
	margin-top: ${(props) => (props.isSticky ? '110px' : '0px')};
	width: 100%;
`;
