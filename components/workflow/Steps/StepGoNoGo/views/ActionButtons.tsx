import React, { useCallback, useEffect, useState } from 'react';
import { Input, Menu, Dropdown } from 'antd';

//components
import { Button } from 'components/common/Button/Button';
import { Text } from 'components/common/Typography/Text';
import { Square, Play } from 'components/icons';
import { MenuItemEllipsis } from 'components/common/Menu/MenuItemEllipsis.styled';
import { Stack } from 'components/common/Stack/Stack';

//types
import { Dispositions } from 'types/domain/disposition.types';

//hooks
import { useDisposition } from 'hooks/angular/disposition';
import { useSessionService } from 'hooks/angular/session';
import { useCompleteStepCallback } from 'hooks/workflow/useCompleteStepCallback';
import { CandidateStepResource, StepAssigneeResource } from 'types/domain/workflow.types';
import { UserResource } from 'types/domain/user.types';

type ActionButtonsProps = {
	step: CandidateStepResource;
	actingOnBehalf: undefined | StepAssigneeResource['candidateStepId'];
};

export function ActionButtons({ step, actingOnBehalf }: ActionButtonsProps) {
	const [dispositions, setDispositions] = useState<Dispositions[]>([]);
	const [dispositionsLoading, setDispositionsLoading] = useState(false);
	const [session] = useSessionService();
	const dispositionService = useDisposition();
	const [comment, setComment] = useState<string | undefined>('');

	const completeStep = useCompleteStepCallback(step);

	const completeStepNoGo = useCallback(
		(dispositionTypeId: number) =>
			completeStep({ furtherReview: comment, forStep: actingOnBehalf, dispositionTypeId, proceed: false }),
		[comment, actingOnBehalf]
	);

	useEffect(() => {
		setDispositionsLoading(true);
		dispositionService
			.get({ parentId: session.companyId, withUsage: true })
			.$promise.then(function (disposition) {
				setDispositions(disposition);
				setDispositionsLoading(false);
			})
			.catch(function (error: unknown) {
				setDispositionsLoading(false);
			});
	}, []);

	return (
		<Stack vertical spacing="loose">
			<Input onChange={(e) => setComment(e.target.value)} placeholder="Write a comment..." />
			<Stack vertical spacing="tight">
				<Button
					block
					success
					type="primary"
					onClick={() => completeStep({ furtherReview: comment, forStep: actingOnBehalf, proceed: true })}
					icon={<Play weight="bold" />}
				>
					GO
				</Button>
				<div style={{ position: 'relative' }}>
					<Dropdown
						trigger={['click']}
						overlay={renderNoGoMenu(dispositions, dispositionsLoading, completeStepNoGo)}
						placement="bottom"
						getPopupContainer={(trigger) => trigger.parentElement as HTMLElement}
						overlayStyle={{ width: '100%' }}
					>
						<Button block danger disclosure type="ghost" icon={<Square weight="bold" />}>
							NO-GO
						</Button>
					</Dropdown>
				</div>
			</Stack>
		</Stack>
	);
}

function renderNoGoMenu(
	dispositions: Dispositions[],
	dispositionsLoading: boolean,
	completeStepNoGo: (dispositionTypeId: number) => void
) {
	return (
		<Menu>
			{!dispositionsLoading &&
				dispositions.map((disposition) => {
					return (
						<MenuItemEllipsis key={disposition.id} onClick={() => completeStepNoGo(disposition.id)}>
							<Text ellipsis>{disposition.reason}</Text>
						</MenuItemEllipsis>
					);
				})}
		</Menu>
	);
}
