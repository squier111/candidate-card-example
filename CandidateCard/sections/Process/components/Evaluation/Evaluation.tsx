import React from 'react';
import { AngularTemplate } from 'bridge/angular-bridge';

export type EvaluationProps = {};

export function Evaluation({}: EvaluationProps) {
	return (
        <>
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
        </>
	);
}


