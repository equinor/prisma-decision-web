import { Node } from '@xyflow/react';
import { Issue } from '../../../validators';

export type InfluenceParentNode = Node<{
	issue: Issue;
}>;
