import React, { forwardRef } from 'react';
import { Typography } from 'antd';
import { AngularTemplate } from 'bridge/angular-bridge';

//type
import { CandidateResourceAngular } from 'types/domain/candidate.types';

//styled
import * as S from './AngularQuestionnaires.styled';

const { Title } = Typography;

type QuestionnairesProps = {
  candidate: CandidateResourceAngular;
}

export const Questionnaires = forwardRef(({candidate}: QuestionnairesProps, ref: React.Ref<HTMLDivElement>) => {
	return (
		<div ref={ref}>
			<Title level={3}>Questionnaires for {candidate.requisition.name}</Title>
			<S.AngularQuestionnaires>
				<AngularTemplate
					template={`<div candidate-questionnaires
                  candidate-id="candidate.id"
                  questionnaire-loaded="state.questionnaireLoaded"
                  questionnaire-data="candidateQuestionnaires">
              </div>
            `}
				/>
				<AngularTemplate
					template={`<accordion close-others="true" class="angular-animate">
											<accordion-group
													is-open="otherQuestionnaires[process.candidateId].visible"
													ng-repeat="process in candidate.otherProcesses | filter: {hasQuestionnaires: true}  | orderBy:'timeUpdated':true"
													is-disabled="!(process.userPermissions.seeReq || process.derivedPermissions.canSeeAllPastProcessData)">
													<accordion-heading>
															<multiple-positions-accordion-heading process="process" heading="Questionnaires">
															</multiple-positions-accordion-heading>
													</accordion-heading>

													<div class="accordion-body">
															<div candidate-questionnaires
																	ng-if="otherQuestionnaires[process.candidateId].loaded || otherQuestionnaires[process.candidateId].visible"
																	candidate-id="process.candidateId"
																	questionnaire-loaded="otherQuestionnaires[process.candidateId].loaded"
																	questionnaire-data="otherQuestionnaires[process.candidateId].questionnaire">
															</div>
													</div>
											</accordion-group>
									</accordion>
							`}/>
			</S.AngularQuestionnaires>
		</div>
	);
});
