import styled from 'styled-components';

interface ProfileProps {
	isMobile?: boolean;
	isMobileOnly?: boolean;
}

export const ProfileLayout = styled.div<ProfileProps>`
	/* same as Card small horizontal padding */
	${(props) => props.isMobile && `padding: 0 ${props.theme.spacing.normal}`};
	${(props) => props.isMobileOnly && `padding: ${props.theme.spacing.normal}`}
`;

export const FixedHeaderBar = styled.div`
	background: ${(props) => props.theme.colors.functional.background.base};
	padding: ${(props) => props.theme.spacing.normal};
	border-bottom: 1px solid ${(props) => props.theme.colors.functional.border.base};
`;
