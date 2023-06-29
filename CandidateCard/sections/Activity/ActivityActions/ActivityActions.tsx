import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from 'components/common/Button/Button';

import { ChatCentered, EnvelopeSimple, Timer } from 'components/icons';
import { Stack } from 'components/common/Stack/Stack';

import { CandidateActivityComment } from './Comment/Comment';
import { CandidateActivityReminder } from './Reminder/Reminder';
import { EmailComponent } from './Email/Email';

export enum ActivityActionTypes {
	COMMENT,
	EMAIL,
	REMINDER
}

export default function ActivityActions() {
	const [activityActionType, setActivityActionType] = useState<ActivityActionTypes | undefined>();

	function selectAction(selectedActionType: ActivityActionTypes) {
		setActivityActionType(activityActionType === selectedActionType ? undefined : selectedActionType);
	}

	return (
		<Stack vertical spacing="loose">
			<Stack distribution="equalSpacing" wrap={false} spacing="none">
				<Button
					neutral
					type={activityActionType === ActivityActionTypes.COMMENT ? 'ghost' : 'text'}
					onClick={() => {
						selectAction(ActivityActionTypes.COMMENT);
					}}
				>
					<ChatCentered />
					Comment
				</Button>

				<Button
					neutral
					type={activityActionType === ActivityActionTypes.EMAIL ? 'ghost' : 'text'}
					onClick={() => {
						selectAction(ActivityActionTypes.EMAIL);
					}}
				>
					<EnvelopeSimple />
					Email
				</Button>

				<Button
					neutral
					type={activityActionType === ActivityActionTypes.REMINDER ? 'ghost' : 'text'}
					onClick={() => {
						selectAction(ActivityActionTypes.REMINDER);
					}}
				>
					<Timer />
					Reminder
				</Button>
			</Stack>

			{activityActionType !== undefined && (
				<Stack.Item>
					{activityActionType === ActivityActionTypes.COMMENT && <CandidateActivityComment />}

					{activityActionType === ActivityActionTypes.EMAIL && (
						<EmailComponent
							onCancel={() => setActivityActionType(undefined)}
							onSend={() => setActivityActionType(undefined)}
						/>
					)}

					{activityActionType === ActivityActionTypes.REMINDER && <CandidateActivityReminder />}
				</Stack.Item>
			)}
		</Stack>
	);
}
