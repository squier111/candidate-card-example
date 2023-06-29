import { useCandidates } from 'hooks/angular/candidates';
import { useUsers } from 'hooks/angular/users';
import { CandidateResourceAngular } from 'types/domain/candidate.types';

export function CreatedByTooltip({
	sourceMethod,
	createdBy,
	sourceContact,
	timeCreated
}: Pick<CandidateResourceAngular, 'sourceMethod' | 'createdBy' | 'sourceContact' | 'timeCreated'>) {
	const userService = useUsers();
	const candidatesService = useCandidates();

	const candidatesSourceMethod = candidatesService.sources[sourceMethod];

	const creationVerb =
		sourceMethod && candidatesSourceMethod.creationVerb
			? candidatesSourceMethod.creationVerb.charAt(0).toUpperCase() + candidatesSourceMethod.creationVerb.slice(1)
			: 'Added ';

	const showSourceContactCondition = !sourceMethod || (sourceMethod && candidatesSourceMethod.showSourceContact);

	const ownerType = userService.getCurrent().id === createdBy?.id ? ' (you)' : ' (teammate)';

	const createdByConditionTypeUserName =
		showSourceContactCondition &&
		createdBy &&
		(createdBy.type === 'user'
			? `by ${createdBy?.fullName} ${ownerType}`
			: 'by ' + createdBy.fullName || createdBy.email);

	const createdByUserName =
		showSourceContactCondition && sourceContact ? `by + ${sourceContact.name}` : createdByConditionTypeUserName;

	const creationText = sourceMethod && candidatesSourceMethod.creationText;

	return `${creationVerb} ${createdByUserName} ${creationText} on ${moment(timeCreated).format('lll')}`;
}
