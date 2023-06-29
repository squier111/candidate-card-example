import styled from 'styled-components';

interface WorkflowMinimizedProps {
	completed?: boolean;
}

export const WorkflowMinimized = styled.div<WorkflowMinimizedProps>`
	padding: 1rem;

	${(props) => props.completed && `background-color: ${props.theme.colors.base.grey[1]}};`}

`;
