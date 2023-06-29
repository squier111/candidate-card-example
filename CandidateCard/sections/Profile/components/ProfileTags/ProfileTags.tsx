import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Plus } from 'components/icons';
import { Space, Skeleton } from 'antd';

import { useClickAway } from 'ahooks';

//components
import { Stack } from 'components/common/Stack/Stack';
import { CandidateTagSelect } from '../../../../../common/CandidateTagSelect/CandidateTagSelect';
import { PersonTag } from 'components/person/PersonTag/PersonTag';
import { Button } from 'components/common/Button/Button';
import { SkeletonInput } from 'components/common/Skeleton/Skeleton.styled';

//types
import { PersonTagResource } from 'types/domain/tag.types';

//hooks
import { usePersons } from 'hooks/angular/persons';

type TagsProps = {
	person: number;
};

export function ProfileTags({ person }: TagsProps) {
	const [tagSelectorVisible, setTagSelectorVisible] = useState(false);
	const [tagsLoading, setTagsLoading] = useState(false);
	const [tagsAddLoading, setAddTagsLoading] = useState(false);
	const [tags, setTags] = useState<PersonTagResource[]>([]);
	const ref = useRef(null);

	useClickAway(
		() => {
			if (tagSelectorVisible) {
				setTagSelectorVisible(false);
			}
		},
		ref,
		'mousedown'
	);

	const personsService = usePersons();
	const getTags = () => {
		personsService
			.getTags({ id: person })
			.$promise.then(function (tags: PersonTagResource[]) {
				setTags(tags);
				setTagsLoading(false);
			})
			.catch(function (error: unknown) {
				console.log('error', error);
				setTagsLoading(false);
			});
	};

	useEffect(() => {
		setTagsLoading(true);
		getTags();
	}, []);

	function addTag(tagId: number) {
		setAddTagsLoading(true);
		personsService.addTag({ id: person }, { tagId }).$promise.then((newTag) => {
			setTags([...tags, newTag]);
			setAddTagsLoading(false);
		});
	}

	function removeTag(removeTag: PersonTagResource) {
		personsService.removeTag({ id: person, tagId: removeTag.id }).$promise.then(() => {
			tags.splice(tags.indexOf(removeTag), 1);
			setTags([...tags]);
		});
	}

	return (
		<Stack wrap={true} spacing="extraTight" alignment="center" distribution="leading">
			{tagsLoading && (
				<Skeleton loading={!tagsLoading}>
					<Space>
						<SkeletonInput style={{ width: 100 }} active size={'small'} />
						<SkeletonInput style={{ width: 100 }} active size={'small'} />
						<SkeletonInput style={{ width: 100 }} active size={'small'} />
					</Space>
				</Skeleton>
			)}
			<Stack spacing="extraTight" alignment="center">
				{tags.map((tag) => (
					<PersonTag
						key={tag.id}
						tag={tag}
						closable
						onClose={(e: React.SyntheticEvent) => {
							e.preventDefault();
							removeTag(tag);
						}}
					/>
				))}
				{tagsAddLoading && <SkeletonInput style={{ width: 100 }} active size={'small'} />}
				{tagSelectorVisible && (
					<div ref={ref}>
						<CandidateTagSelect
							onSelect={(tagId: number) => {
								addTag(tagId);
								setTagSelectorVisible(false);
							}}
							style={{ width: 184 }}
							defaultOpen
							autoFocus
							excludedTagsIds={tags.map((tag) => tag.id)}
						/>
					</div>
				)}
				{!tagSelectorVisible && !tagsLoading && (
					<Button neutral size="small" type="text" icon={<Plus />} onClick={() => setTagSelectorVisible(true)}>
						Add tag
					</Button>
				)}
			</Stack>
		</Stack>
	);
}
