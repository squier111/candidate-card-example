import React, { useState } from 'react';
import { Tooltip, Popover } from 'antd';

//components
import { LockSimpleOpen, PencilSimple } from 'components/icons';
import { Tag } from 'components/common/Tag/Tag';
import { Button } from 'components/common/Button/Button';
import { Text } from 'components/common/Typography/Text';
import { Stack } from 'components/common/Stack/Stack';

// hooks
import { useCandidates } from 'hooks/angular/candidates/useCandidates.hook';

export function WorkflowCardUnlockPipeline() {
	const [unlockInProgress, setUnlockInProgress] = useState(false);

	const candidatesService = useCandidates();
	const currentCandidate = candidatesService.getCurrent();

	function unlockWorkflow() {
		setUnlockInProgress(true);

		candidatesService
			.put({ id: currentCandidate.id }, { ...currentCandidate, isPipelineLocked: false })
			.$promise.then(candidatesService.reloadCurrent, (error) => {
				currentCandidate.isPipelineLocked = true;
			})
			.finally(() => {
				setUnlockInProgress(false);
			});
	}

	if (currentCandidate.isPipelineLocked) {
		return currentCandidate.userPermissions.editCandidatePipeline ? (
			<Popover
				title="Unlock to customize workflow"
				trigger={'click'}
				overlayStyle={{ maxWidth: 320 }}
				content={
					<Stack vertical>
						<Text>
							When unlocked, future changes in the position's workflow will not affect this candidate. This action
							cannot be undone.
						</Text>
						<Button
							onClick={unlockWorkflow}
							type="primary"
							icon={<LockSimpleOpen weight="bold" />}
							loading={unlockInProgress}
						>
							Unlock
						</Button>
					</Stack>
				}
			>
				<Button icon={<PencilSimple />} type="link" size="small">
					Edit
				</Button>
			</Popover>
		) : (
			<Tooltip title="You do not have permission to customize this candidate's workflow">
				<Button icon={<PencilSimple />} type="link" size="small" disabled={true}>
					Edit
				</Button>
			</Tooltip>
		);
	} else {
		return (
			<Tag size="small" icon={<LockSimpleOpen weight="bold" />}>
				Editable
			</Tag>
		);
	}
}
