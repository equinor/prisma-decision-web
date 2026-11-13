/* eslint-disable @typescript-eslint/no-unused-vars */
import { atom, useAtom } from 'jotai';

import { atomFamily } from 'jotai-family';
import { useSelectedProject } from '../components/ProjectPage/ProjectContext';

export const useInfluenceDiagramEvidence = () => {
	const project = useSelectedProject();
	const [evidence, setEvidence] = useAtom(influenceDiagramEvidence({ projectId: project.id }));

	const toggleEvidence = (evidenceId: string, issueId: string) => {
		setEvidence(prev => {
			const newEvidence = new Map(prev);
			const currentEvidence = newEvidence.get(issueId);
			if (currentEvidence === evidenceId) {
				newEvidence.delete(issueId);
			} else {
				newEvidence.set(issueId, evidenceId);
			}
			return newEvidence;
		});
	};
	const clearEvidence = (issueId: string) => {
		setEvidence(prev => {
			const next = new Map(prev);
			next.delete(issueId);
			return next;
		});
	};

	return {
		evidence: Array.from(evidence.values()),
		toggleEvidence,
		clearEvidence,
	};
};
export const influenceDiagramEvidence = atomFamily(
	// @ts-expect-error - atomFamily is not correctly typed
	({ projectId }: { projectId: string }) => atom<Map<string, string>>(new Map()),
	(a, b) => a.projectId === b.projectId,
);
