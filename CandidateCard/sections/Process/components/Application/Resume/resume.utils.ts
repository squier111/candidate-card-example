import { PersonResumeResource } from 'types/domain/person.types';
import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';

export type PositionResumes = {
	positionId: number;
	positionName: string;
	resumeList: PersonResumeResource[];
};

export function getDefaultSelectedResume(
	resumeList: PersonResumeResource[],
	candidateId: number
): PersonResumeResource {
	const currentResume = resumeList.find((resume) => resume.isCurrent && resume.candidateId == candidateId);
	if (currentResume) return currentResume;

	const resumeListSortedByTimeUpdated = sortBy(resumeList, (resume) => resume.timeUpdated).reverse();

	const firstResumeInProgress = resumeListSortedByTimeUpdated.find(
		(resume) => resume.positionInProgress && resume.isCurrent
	);
	if (firstResumeInProgress) return firstResumeInProgress;

	const firstCurrentResume = resumeListSortedByTimeUpdated.find((resume) => resume.isCurrent);
	if (firstCurrentResume) return firstCurrentResume;

	// no resume with isCurrent flag was found, seems like a bug in server, need to report it to New Relic for investigation

	return resumeListSortedByTimeUpdated[0];
}

export function groupResumesByPosition(
	resumeList: PersonResumeResource[],
	currentPositionId: number
): PositionResumes[] {
	const resumeListGrouped = groupBy(resumeList, (resume) => resume.positionId);

	const result: Array<PositionResumes> = Object.keys(resumeListGrouped).map((positionId) => {
		const currentPositionId = Number.parseInt(positionId);
		const positionResumes = resumeListGrouped[currentPositionId];
		const findPositionName = positionResumes.find((resume) => resume.positionId == currentPositionId);
		if (!findPositionName) throw new Error('Could not find findPositionName.');

		return {
			positionId: currentPositionId,
			positionName: findPositionName?.positionName,
			resumeList: sortBy(positionResumes, (resume) => resume.timeUpdated)
		};
	});

	return result.sort((a, b) => {
		if (a.positionId == currentPositionId) return -1;
		return a.positionId - b.positionId;
	});
}
