import React, { useState, useEffect, useMemo } from 'react';

// metadata
import { ActivityFiltersEnum } from 'metadata/activity/activity.meta';

// common components
import { Button } from 'components/common/Button/Button';
import { Stack } from 'components/common/Stack/Stack';

// incons
import { CaretDown } from 'components/icons';

//local components
import ActivityEvent from '../ActivityEvent/ActivityEvent';
import { ActivityFilter } from './ActivityFilter';

// styled
import * as S from '../Activity.styled';

import { useActivity, ActivityRequestParams } from 'hooks/angular/activity/useActivity.hook';
import { useActivityStatic } from 'hooks/angular/activity/useActivityStatic.hook';
import { useCandidates } from 'hooks/angular/candidates';
import { ActivityEventResource } from 'types/domain/activity.types';
import { Empty } from 'components/common/Empty/Empty';

type ActivityWidgetProps = {
	showEventLogs?: boolean;
};

export default function ActivityWidget({ showEventLogs = true }: ActivityWidgetProps) {
	const candidatesService = useCandidates();
	const activityService = useActivity();
	const activityStaticService = useActivityStatic();

	const currentCandidate = candidatesService.getCurrent();

	const [activityFilter, setActivityFilter] = useState<ActivityFiltersEnum>(ActivityFiltersEnum.RECENT);
	const [activityEvents, setActivityEvents] = useState<ActivityEventResource[]>([]);
	// const [filteredActivity, setFilteredActivity] = useState<ActivityEventResource[]>();
	const [fullActivityListLoaded, setFullActivityListLoaded] = useState(false);
	const [numberOfEventsToDisplay, setNumberOfEventsToDisplay] = useState(3);
	const [isLoadingMore, setIsLoadingMore] = useState(false);

	const displayActivity = useMemo(() => {
		const filterFunction = activityStaticService.activityFilters.get(activityFilter).filterFn;

		return filterFunction(activityEvents).splice(0, numberOfEventsToDisplay);
	}, [activityEvents, activityFilter, numberOfEventsToDisplay]);

	function loaderMoreActivities() {
		setActivityFilter(ActivityFiltersEnum.ALL);
		setNumberOfEventsToDisplay(numberOfEventsToDisplay + 2);

		if (!fullActivityListLoaded) {
			setIsLoadingMore(true);

			loadActivity().$promise.then(() => {
				setIsLoadingMore(false);
				setFullActivityListLoaded(true);
			});
		}
	}

	function loadActivity(params?: Partial<ActivityRequestParams>) {
		const requestParams: ActivityRequestParams = {
			id: currentCandidate.id,
			...params
		};

		return activityService.query(requestParams, (activityList) => {
			const activity = showEventLogs
				? activityList
				: activityList.filter((activityEvent) => activityEvent.type !== 'candidateeventlog');

			setActivityEvents(activity);
		});
	}

	useEffect(() => {
		loadActivity({ isRecent: true, limit: numberOfEventsToDisplay });
	}, []);

	return (
		<Stack vertical spacing="extraLoose">
			<ActivityFilter onFilterSelect={setActivityFilter} activeFilter={activityFilter} disabled={isLoadingMore} />

			{displayActivity.length > 0 ? (
				<>
					<S.ActivityListContainer>
						<Stack.Item>
							{displayActivity.map((activityEvent) => (
								<ActivityEvent event={activityEvent} key={activityEvent.id} />
							))}
						</Stack.Item>
					</S.ActivityListContainer>
					<Stack distribution="center">
						<Button type="link" icon={<CaretDown />} onClick={loaderMoreActivities} loading={isLoadingMore}>
							Show more
						</Button>
					</Stack>
				</>
			) : (
				<Empty />
			)}
		</Stack>
	);
}
