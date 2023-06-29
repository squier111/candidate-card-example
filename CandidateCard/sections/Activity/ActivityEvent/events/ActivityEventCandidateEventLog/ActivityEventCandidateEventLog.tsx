import React from 'react';

// components
import { candidateEventLogComponents } from './CandidateEventLogComponents';

// metadata
import { ActivityEventCandidateEventLog } from 'types/domain/activity.types';

// styled
import * as S from '../../ActivityEvent.styled';

type ActivityEventCandidateEventLogProps = {
	event: ActivityEventCandidateEventLog;
};

export default function ActivityEventCandidateEventLog({ event }: ActivityEventCandidateEventLogProps) {
	const { createdBy, message, payload, timeCreated } = event;

	if (payload !== null && payload.id) {
		if (candidateEventLogComponents[payload.id] !== undefined) {
			const CandidateEventLogComponent = candidateEventLogComponents[payload.id]!;

			return (
				<CandidateEventLogComponent
					createdBy={createdBy}
					message={message}
					payload={payload}
					timeCreated={timeCreated}
				/>
			);
		} else {
			/* TODO: clear this no renderer message */
			return <S.ActivityEventInline>[no renderer] {event.message}</S.ActivityEventInline>;
		}
	}

	return (
		<S.ActivityEventInline>
			{event.createdBy.fullName} {event.message}
		</S.ActivityEventInline>
	);
}
