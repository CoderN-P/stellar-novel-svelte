import Heading from '@tiptap/extension-heading';

export const CustomHeading = Heading.extend({
	renderHTML({ node, HTMLAttributes }) {
		const level = node.attrs.level;
		const classMap = {
			1: 'text-4xl font-bold',
			2: 'text-3xl font-semibold',
			3: 'text-2xl font-medium',
			4: 'text-xl',
			5: 'text-lg',
			6: 'text-base'
		};

		return [
			`h${level}`,
			{
				...HTMLAttributes,
				class: classMap[level] || 'text-base'
			},
			0
		];
	}
});