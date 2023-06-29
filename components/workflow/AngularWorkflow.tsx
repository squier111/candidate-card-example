import React from 'react';

import { AngularTemplate } from 'bridge/angular-bridge';

import * as S from './AngularWorkflow.styled';

export default function AngularWorkflow() {
	return (
		<S.AngularWorkflow>
			<AngularTemplate
				template={`<div
					pipeline-widget
					pipeline-type="candidate"
					is-editable="true"
					connect-to-model="true"
					steps="steps"
					parent-non-editable-id="{}"></div>
				`}
			/>
		</S.AngularWorkflow>
	);
}
