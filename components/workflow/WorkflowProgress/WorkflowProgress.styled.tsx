import styled from 'styled-components';

interface StepProps {
	selected?: boolean;
	type?: string;
	isCurrent?: boolean;
	isPassed?: boolean | null;
	isRejected?: boolean | null;
	isCompleted?: boolean;
	isFuture?: boolean;
}

interface NavigationProps {
	isNavigation?: boolean;
}

export const StepHolder = styled.div<NavigationProps>`
	${(props) => props.isNavigation && `padding: 1rem`}
`;


export const Step = styled.div<StepProps>`
	flex: 0 0 auto;
	width: 14px;
	height: 14px;
	border-radius: 4px;
	position: relative;
	border-width: 2px;
	border-style: solid;
	border-color: ${(props) => props.theme.colors.base.white};
	background-color: ${(props) => props.theme.colors.base.grey[2]};

	${(props) => props.selected && `border-color: ${props.theme.colors.semantic.primary}};`}
	${(props) => props.isCurrent && `background-color: ${props.theme.colors.base.grey[9]}};`}
	${(props) => props.isCompleted && `background-color: ${props.theme.colors.base.grey[2]}};`}
	${(props) => props.isPassed && `background-color: ${props.theme.colors.semantic.success}};`}
	${(props) => props.isRejected && `background-color: ${props.theme.colors.semantic.error}};`}
	${(props) =>
		props.isFuture &&
		`background-color: ${props.theme.colors.base.white};
		box-shadow: inset 0px 0px 0px 1px  ${props.theme.colors.base.grey[3]}
	`}
	${(props) => props.isFuture && props.selected && `box-shadow: none`}
`;

export const Marker = styled.div<StepProps>`
	width: 8px;
	height: 8px;
	margin: 0 2px;
	border-radius: 2px;
	position: relative;
	border-width: 1px;
	border-style: solid;
	border-color: ${(props) => props.theme.colors.base.grey[3]};
	background-color: ${(props) => props.theme.colors.base.white};
`;

	/* ${(props) => styledSteps(props)} */
