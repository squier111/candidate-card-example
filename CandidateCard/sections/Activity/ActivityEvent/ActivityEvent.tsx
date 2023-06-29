import React from 'react';

// components
import ActivityEventDiscussion from './events/ActivityEventDiscussion/ActivityEventDiscussion';
import ActivityEventCandidateStep from './events/ActivityEventCandidateStep/ActivityEventCandidateStep';
import ActivityEventCandidateEventLog from './events/ActivityEventCandidateEventLog/ActivityEventCandidateEventLog';

// metadata
import { ActivityEventResource } from 'types/domain/activity.types';

type ActivityEventProps = {
	event: ActivityEventResource;
};

export default function ActivityEvent({ event }: ActivityEventProps) {
	return (
		<>
			{event.type === 'discussion' && (
				<ActivityEventDiscussion event={event} />
			)}

			{event.type === 'candidatestep' && (
				<ActivityEventCandidateStep  event={event} />
			)}

			{event.type === 'candidateeventlog' && (
				<ActivityEventCandidateEventLog event={event} />
			)}
		</>
	);
}
