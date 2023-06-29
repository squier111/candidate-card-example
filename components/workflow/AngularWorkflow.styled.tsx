import styled from 'styled-components';

export const AngularWorkflow = styled.div`
	padding-top: 20px;

	.pipeline {
		.taskInfoBoxWrap {
			outline: none !important;
			box-shadow: none !important;
			border: none !important;
			padding-top: 0 !important;
		}

		.task {
			border: none;
			border-bottom: 2px solid transparent;
			background-color: white !important;
			height: 145px;
			margin-left: 56px;

			&.active {
				border-color: ${(props) => props.theme.colors.base.blue[7]};
			}

			&.current {
				.personThumbWrap {
					border-color: ${(props) => props.theme.colors.base.blue[7]};
				}
			}

			&.withPrevious {
				margin-left: 2px;
			}

			.personThumbWrap {
				border-radius: 4px;
				border: 2px solid transparent;
			}

			.taskNameWrap {
				height: 50px;
			}

			.arrow-to-next {
				bottom: 20px;
			}

			.stepsGap {
				right: calc(100% + 12px);
			}

			.taskStatusIcon {
				display: none;
			}
		}

		.point-arrow {
			display: none;
		}

		.pipelineTopRow {
			border: none;
			padding: 0 24px;
		}

		.taskNamePrimaryContainer {
			border-top: 1px solid ${(props) => props.theme.colors.functional.border.split};
		}

		.pipelineTasks {
			height: auto;
		}

		.pipelineTasksContents {
			max-height: none;
		}

		.borderFixLine {
			display: none;
		}

		.taskInfoBox {
			background-color: white;
		}
	}
`;