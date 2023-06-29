import React, { useState, useEffect } from 'react';

//components
import { Stack } from 'components/common/Stack/Stack';
import { CaretLeft, CaretRight } from 'components/icons';
import { Button } from 'components/common/Button/Button';

//types
import { StepResource, CandidateStepResource } from 'types/domain/workflow.types';
import { PositionStepType } from 'types/domain/workflow.types';
import { StepTypesEnum } from 'metadata/candidate/workflow.meta';

//hooks
import { useRequisitionsStepStatic } from 'hooks/angular/requisition-steps-static';
import { useCandidates } from 'hooks/angular/candidates';

// styled
import * as S from './WorkflowProgress.styled';

type WorkflowProgressProps<T> = {
	stepSet: T[];
	changeSelectedStepIndex: (index: number) => void;
	visibleSlides?: number;
	isNavigation?: boolean;
	stepIndex: number;
};

export function WorkflowProgress<T extends StepResource>({
	stepSet,
	changeSelectedStepIndex,
	visibleSlides = 5,
	isNavigation,
	stepIndex,
}: WorkflowProgressProps<T>) {
	const candidateService = useCandidates();
	const currentCandidate = candidateService.getCurrent();

	const findFilterIndexSendEmail = stepSet.findIndex((step) => step.stepType === StepTypesEnum.SEND_EMAIL);

	const findFilterIndex =
		findFilterIndexSendEmail > 0 ? findFilterIndexSendEmail : stepSet.findIndex((step) => !step.isCompleted) - 1;

	const selectedStepIndex = stepIndex < 0 ? stepSet.findIndex((step) => !step.isCompleted) : stepIndex;

	const stepSetFilter = candidateService.getStatus(currentCandidate.status).allowEditSteps
		? stepSet
		: stepSet.slice(0, findFilterIndex + 1);

	const [steps, setSteps] = useState<T[]>([]);
	const { types } = useRequisitionsStepStatic();
	const centerAlignmentIndex = Math.floor(visibleSlides / 2);
	const lastSlicedItem = steps.length - 1;
	const lastEqualItem = selectedStepIndex + centerAlignmentIndex >= stepSetFilter.length - 1;

	const startMoveIndex = selectedStepIndex - (steps.length - 1);
	const endMoveIndex = selectedStepIndex - lastSlicedItem + 1;

	useEffect(() => {
		const stepSetInitial = candidateService.getStatus(currentCandidate.status).allowEditSteps
			? stepSet.slice(0, visibleSlides)
			: stepSet.slice(0, findFilterIndex + 1).slice(0, visibleSlides);

		setSteps(stepSetInitial);
	}, [stepSet]);

	useEffect(() => {
		if (stepSetFilter.length > visibleSlides && selectedStepIndex >= centerAlignmentIndex) {
			setSteps(() => {
				return stepSetFilter.slice(
					lastEqualItem ? stepSetFilter.length - visibleSlides : startMoveIndex + centerAlignmentIndex,
					lastEqualItem ? stepSetFilter.length : lastSlicedItem + endMoveIndex + centerAlignmentIndex
				);
			});
		}
	}, [selectedStepIndex]);

	return (
		<S.StepHolder isNavigation={isNavigation}>
			<Stack wrap={false} distribution="center" alignment="center" spacing="none">
				{isNavigation && (
					<Stack.Item>
						<Button
							disabled={selectedStepIndex === 0}
							neutral
							type="text"
							onClick={() => changeSelectedStepIndex(selectedStepIndex - 1)}
							icon={<CaretLeft />}
						/>
					</Stack.Item>
				)}
				<Stack.Item fill={isNavigation}>
					<Stack wrap={false} alignment="center" distribution="center" spacing="none">
						{selectedStepIndex > centerAlignmentIndex && stepSetFilter.length > visibleSlides && <S.Marker />}
						{steps.map((step) => {
							return (
								<S.Step
									isCurrent={step.isCurrentStep}
									isCompleted={step.isCompleted}
									isFuture={!step.isCompleted && !step.isCurrentStep}
									isPassed={stepPassed(step, types)}
									isRejected={stepRejected(step)}
									selected={stepSet[selectedStepIndex]?.id === step.id}
									key={step.id}
								></S.Step>
							);
						})}
						{stepSetFilter.length > steps.length && !lastEqualItem && stepSetFilter.length > visibleSlides && (
							<S.Marker />
						)}
					</Stack>
				</Stack.Item>
				{isNavigation && (
					<Stack.Item>
						<Button
							disabled={selectedStepIndex === stepSetFilter.length - 1 || stepIndex < 0}
							neutral
							type="text"
							onClick={() => changeSelectedStepIndex(selectedStepIndex + 1)}
							icon={<CaretRight />}
						/>
					</Stack.Item>
				)}
			</Stack>
		</S.StepHolder>
	);
}

function stepPassed<T extends StepResource>(step: T, types: { [key in number]: PositionStepType }) {
	if (!isCandidateStepResource(step)) {
		return;
	}
	return (
		step.recommendation === 3 ||
		(step.proceed  && types[step.stepType]?.showEvaluation) ||
		(step.interview &&
			(step.interview.recommendation == 3 || (step.interview.proceed  && types[step.stepType]?.showEvaluation)))
	);
};

function stepRejected<T extends StepResource>(step: T) {
	if (!isCandidateStepResource(step)) {
		return;
	}
	return (
		step.recommendation === 1 ||
		step.proceed === false ||
		(step.interview && (step.interview.recommendation == 1 || step.interview.proceed === false))
	);
};

function isCandidateStepResource(step: StepResource ): step is CandidateStepResource {
	return 'proceed' in step && 'interview' in step;
};

