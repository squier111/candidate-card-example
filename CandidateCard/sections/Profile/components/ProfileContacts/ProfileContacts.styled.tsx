import styled from 'styled-components';

interface NavigationProps {
	isMobile?: boolean;
}

export const ProfileContactsWrapper = styled.div<NavigationProps>`
	${(props) => (props.isMobile ? `padding: 0` : `padding-top: 15px`)}
`;