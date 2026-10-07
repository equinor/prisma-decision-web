import { Button, Icon, Tooltip } from '@equinor/eds-core-react';
import { format_bold, format_list_bulleted, format_list_numbered } from '@equinor/eds-icons';
import Link from '@tiptap/extension-link';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { cn } from '../../../utils/cn';

type OpportunityStatementEditorProps = {
	initialValue?: string;
	onChange: (value: string) => void;
	onBlur: () => void;
};

export const OpportunityStatementEditor = ({
	initialValue,
	onChange,
	onBlur,
}: OpportunityStatementEditorProps) => {
	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				blockquote: false,
				code: false,
				codeBlock: false,
				heading: false,
				horizontalRule: false,
				italic: false,
				link: false,
				strike: false,
				underline: false,
			}),
			Link.configure({
				autolink: true,
				defaultProtocol: 'https',
				linkOnPaste: true,
				openOnClick: true,
			}),
		],
		content: initialValue ?? '',
		editorProps: {
			attributes: {
				'aria-label': 'Opportunity Statement',
				'data-placeholder': 'Enter opportunity statement...',
			},
		},
		onBlur,
		onUpdate: ({ editor }) => onChange(editor.isEmpty ? '' : editor.getHTML()),
	});

	const toolbarButtonClass = (isActive: boolean) =>
		cn('size-8!', isActive && 'bg-primary-hover-alt! text-primary-hover!');

	return (
		<div className='flex flex-col gap-1'>
			<label className='text-sm font-medium'>Opportunity Statement</label>
			<div className='border-text-tertiary focus-within:border-primary-resting overflow-hidden rounded-sm border'>
				<div className='bg-background-light flex items-center gap-1 border-b px-2 py-1'>
					<Tooltip title='Bold'>
						<Button
							type='button'
							variant='ghost_icon'
							label='Bold'
							className={toolbarButtonClass(editor?.isActive('bold') ?? false)}
							onMouseDown={event => event.preventDefault()}
							onClick={() => editor?.chain().focus().toggleBold().run()}
						>
							<Icon data={format_bold} size={18} />
						</Button>
					</Tooltip>
					<Tooltip title='Bulleted list'>
						<Button
							type='button'
							variant='ghost_icon'
							label='Bulleted list'
							className={toolbarButtonClass(editor?.isActive('bulletList') ?? false)}
							onMouseDown={event => event.preventDefault()}
							onClick={() => editor?.chain().focus().toggleBulletList().run()}
						>
							<Icon data={format_list_bulleted} size={18} />
						</Button>
					</Tooltip>
					<Tooltip title='Numbered list'>
						<Button
							type='button'
							variant='ghost_icon'
							label='Numbered list'
							className={toolbarButtonClass(editor?.isActive('orderedList') ?? false)}
							onMouseDown={event => event.preventDefault()}
							onClick={() => editor?.chain().focus().toggleOrderedList().run()}
						>
							<Icon data={format_list_numbered} size={18} />
						</Button>
					</Tooltip>
				</div>
				<EditorContent
					editor={editor}
					className='[&_.tiptap:has(>p:only-child>br.ProseMirror-trailingBreak)::before]:text-text-tertiary [&_a]:text-primary-resting [&_.tiptap]:relative
						[&_.tiptap]:min-h-32
						[&_.tiptap]:p-3
						[&_.tiptap:focus]:outline-none
						[&_.tiptap:has(>p:only-child>br.ProseMirror-trailingBreak)::before]:pointer-events-none
						[&_.tiptap:has(>p:only-child>br.ProseMirror-trailingBreak)::before]:absolute
						[&_.tiptap:has(>p:only-child>br.ProseMirror-trailingBreak)::before]:content-[attr(data-placeholder)] [&_a]:cursor-pointer [&_a]:underline [&_ol]:mt-2 [&_ol]:list-decimal
						[&_ol]:pl-6 [&_p+p]:mt-2 [&_ul]:mt-2 [&_ul]:list-disc
						[&_ul]:pl-6'
				/>
			</div>
		</div>
	);
};
