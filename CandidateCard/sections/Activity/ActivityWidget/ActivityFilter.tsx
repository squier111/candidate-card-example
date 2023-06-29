import * as React from 'react';

// metadata
import { ActivityFiltersEnum } from 'metadata/activity/activity.meta'

// common components
import {Button} from 'components/common/Button/Button';
import { Stack } from 'components/common/Stack/Stack';

export type ActivityFilterProps = {
	onFilterSelect: (id: ActivityFiltersEnum) => void,
	activeFilter: ActivityFiltersEnum,
  disabled: boolean
}

export function ActivityFilter ({onFilterSelect, activeFilter, disabled}: ActivityFilterProps) {

	return (
		<Stack wrap={false} distribution="equalSpacing">
			<Button
          onClick={() => {onFilterSelect(ActivityFiltersEnum.RECENT)}}
          neutral
          type={activeFilter === ActivityFiltersEnum.RECENT ? 'ghost' : 'text'}
          size="small"
          disabled={disabled}
        >
            Recent
        </Button>
        <Button
          onClick={() => {onFilterSelect(ActivityFiltersEnum.INTERNAL_DISCUSSION)}}
          neutral
          type={activeFilter === ActivityFiltersEnum.INTERNAL_DISCUSSION ? 'ghost' : 'text'}
          size="small"
          disabled={disabled}
        >
          Internal
        </Button>
        <Button
          onClick={() => {onFilterSelect(ActivityFiltersEnum.DISCUSSION_WITH_CANDIDATE)}}
          neutral
          type={activeFilter === ActivityFiltersEnum.DISCUSSION_WITH_CANDIDATE ? 'ghost' : 'text'}
          size="small"
          disabled={disabled}
        >
          Candidate
        </Button>
        <Button
          onClick={() => {onFilterSelect(ActivityFiltersEnum.DISCUSSION_WITH_CANDIDATE_SOURCE)}}
          neutral
          type={activeFilter === ActivityFiltersEnum.DISCUSSION_WITH_CANDIDATE_SOURCE ? 'ghost' : 'text'}
          size="small"
          disabled={disabled}
        >
          Source
        </Button>
		</Stack>
	);
}
