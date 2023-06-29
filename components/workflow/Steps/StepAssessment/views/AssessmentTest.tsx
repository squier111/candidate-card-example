import React, { useState, useEffect } from 'react';
import { Dropdown, Menu } from 'antd';

// components
import { Button } from 'components/common/Button/Button';
import { Text } from 'components/common/Typography/Text';
import { MenuItemEllipsis } from 'components/common/Menu/MenuItemEllipsis.styled';

//meta
import { StepTypesEnum } from 'metadata/candidate/workflow.meta';

//hooks
import { useAssessments } from 'hooks/angular/assessments';
import { useCandidateSteps } from 'hooks/angular/candidate-steps';

//types
import { AssessmentTests, CandidateStepResource } from 'types/domain/workflow.types';

export type AssessmentTestProps = {
	step: CandidateStepResource;
	allSteps: CandidateStepResource[];
};

export function AssessmentTest({ step, allSteps }: AssessmentTestProps) {
	const [getTestsLoading, setGetTestsLoading] = useState(false);
	const [tests, setTests] = useState<AssessmentTests[]>([]);
	const candidateStepsService = useCandidateSteps();

	const assessmentsService = useAssessments();

	const allStepsFilter = allSteps.filter((step) => step.stepType === StepTypesEnum.ASSESSMENT);

	useEffect(() => {
		setGetTestsLoading(true);
		if (step.assessmentPartnerId) {
			assessmentsService
				.getTests({ id: step.assessmentPartnerId })
				.$promise.then(function (disposition) {
					setTests(disposition);
					setGetTestsLoading(false);
				})
				.catch(function (error: unknown) {
					setGetTestsLoading(false);
				});
		}
	}, []);

	const saveCurrentTest = (testId: string) => {
		candidateStepsService.save(
			{ parentId: step.candidateId, id: step.id },
			{...step, testsInfo: [testId]}
		);
		// Trigger for update component will be here;
	};

	if (!tests || tests.length === 0) return null;

	return (
		<div style={{ position: 'relative' }}>
			<Dropdown
				trigger={['click']}
				overlay={renderTestMenu(tests, getTestsLoading, saveCurrentTest, allStepsFilter, step)}
				placement="bottom"
				getPopupContainer={(trigger) => trigger.parentElement as HTMLElement}
				overlayStyle={{ width: '100%' }}
			>
				<Button block disclosure={getTestsLoading ? false : 'down'} type="ghost" loading={getTestsLoading}>
					{!getTestsLoading && step.testsInfo?.length === 0
						? 'Select test'
						: tests.find((item) => item.testId === step.testsInfo?.[0])?.testName}
				</Button>
			</Dropdown>
		</div>
	);
}

function renderTestMenu(
	tests: AssessmentTests[],
	getTestsLoading: boolean,
	saveCurrentTest: (test: string) => void,
	allStepsFilter: CandidateStepResource[],
	step: CandidateStepResource
) {
	return (
		<Menu selectedKeys={[step.testsInfo?.[0]]}>
			{!getTestsLoading &&
				tests.map((test) => {
					return (
						<MenuItemEllipsis
							disabled={
								allStepsFilter.find(
									(currentStepFilter) =>
										currentStepFilter.testsInfo[0] === test.testId
								) && true
							}
							onClick={() =>
								saveCurrentTest(test.testId)
							}
							key={test.testId}
						>
							<Text ellipsis>{test.testName}</Text>
						</MenuItemEllipsis>
					);
				})}
		</Menu>
	);
}
