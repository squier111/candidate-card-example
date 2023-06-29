import React, { useState } from 'react';
import { Card } from 'antd';

//components
import { Stack } from 'components/common/Stack/Stack';
import { Heading } from 'components/common/Typography/Heading';
import { ArrowsOutSimple, Star } from 'components/icons';
import { Button } from 'components/common/Button/Button';
import { Rate } from 'components/common/Rate/Rate';
import { DrawerMobileComponent } from 'pages/Candidate/CandidateCard/layout/DrawerMobileComponent';

import { AngularTemplate } from 'bridge/angular-bridge';

//types
import { CandidateResourceAngular } from 'types/domain/candidate.types';

export type EvaluationProps = {
	candidate: CandidateResourceAngular;
};

export function EvaluationMobile({ candidate }: EvaluationProps) {
	const [expanded, setExpanded] = useState(false);

	return (
		<Card
			bodyStyle={{ display: candidate.canViewInterviews && candidate.averageRank ? 'block' : 'none' }}
			size="small"
			title={
				<Stack wrap={false} alignment="center" spacing="tight">
					<Star weight="duotone" />
					<Heading level={4}>Evaluation</Heading>
				</Stack>
			}
			extra={
				true && (
					<Button neutral type="link" onClick={() => setExpanded(true)} icon={<ArrowsOutSimple />}>
						Expand
					</Button>
				)
			}
		>
			{candidate.canViewInterviews && candidate.averageRank ? (
				<Stack distribution="equalSpacing" wrap={false} alignment="center" spacing="tight">
					<Heading level={1}>{candidate.averageRank.toFixed(1)}</Heading>
					<Rate
						style={{ fontSize: '28px' }}
						allowHalf
						allowClear={false}
						defaultValue={candidate.averageRank.toFixed(0)}
					/>
				</Stack>
			) : null}
			<DrawerMobileComponent
				drawerIcon={<Star weight="duotone" />}
				title="Evaluation"
				expanded={expanded}
				setExpanded={setExpanded}
			>
				<AngularTemplate
					template={`<div
						evaluation-widget
						candidate-id="candidate.id"
						candidate-status="candidate.status"
						user-permissions="candidate.userPermissions"
						expand-notes="state.printCandidateCard"
						show-only-step-id="state.evaluationsToPrint"
						evaluations-list="state.interviewQuestions"
						candidate="candidate"
					></div>
				`}
				/>
				<AngularTemplate
					template={`<accordion close-others="true" class="angular-animate">
						<accordion-group is-open="otherEvaluations[process.candidateId].visible"
								ng-repeat="process in candidate.otherProcesses | filter: {hasEvaluation: true} | orderBy:'timeUpdated':true"
								is-disabled="!(process.userPermissions.seeReq || process.derivedPermissions.canSeeAllPastProcessData) || !process.derivedPermissions.canSeeHiredReviews"
								>
								<accordion-heading>
										<multiple-positions-accordion-heading process="process" heading="Evaluation">
										</multiple-positions-accordion-heading>
								</accordion-heading>

								<div class="accordion-body">
										<div evaluation-widget
												ng-if="otherEvaluations[process.candidateId].loaded || otherEvaluations[process.candidateId].visible"
												candidate-id="process.candidateId"
												candidate-status="process.candidateStatus"
												user-permissions="process.userPermissions"
												inactive-flag="true"
												disable-flag="!process.isProcessAlive"
												evaluation-data="otherEvaluations[process.candidateId].evaluation"
												evaluation-data-loaded="otherEvaluations[process.candidateId].loaded"
										>
										</div>
								</div>
						</accordion-group>
				</accordion>
				`}
				/>
			</DrawerMobileComponent>
		</Card>
	);
}
