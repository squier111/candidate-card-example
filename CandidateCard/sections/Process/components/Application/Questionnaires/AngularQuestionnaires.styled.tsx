import styled from 'styled-components';

export const AngularQuestionnaires = styled.div`
	.questionnaires {
		.metaLabel {
			color: ${(props) => props.theme.colors.base.grey[7]};
		}

		.questionnaire {
			padding: 20px 0;

			.questionnaire-name {
				font-size: 14px;
			}

			.question {
				padding-left: 20px;

				ul.options {
					margin: 0;
					li {
						margin: 0 0 8px;
					}
				}
			}

			.question-title {
				font-size: 12px;
				color: ${(props) => props.theme.colors.base.grey[7]};
				margin: 0 0 16px;
			}

			textarea.form-control {
				background: transparent;
				font-size: 14px;
				line-height: 16px;
				margin: 0;
				padding: 0;
				outline: none;
				min-height: auto;
				height: auto !important;
				color: ${(props) => props.theme.colors.base.grey[9]};
			}

			.checkboxLabel {
				padding-left: 20px;
			}
			.fa-stack {
				margin: 0 10px 0 0;
			}

			.fa-stack .fa-circle {
				border-radius: 50%;
			}

			.fa-stack .fa-square {
				border-radius: 4px;
			}

			.fa-stack .fa-square,
			.fa-stack .fa-circle {
				height: 16px;
				text-shadow: none;
				border: 1px solid ${(props) => props.theme.colors.base.grey[2]};
			}

			.fa-stack .fa-check {
				color: ${(props) => props.theme.colors.base.grey[4]};
				bottom: 1px;
				left: 0;
				font-size: 10px;
			}
		}
	}
`;
