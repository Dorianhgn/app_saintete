export const appConverters = ({ defaultConverters }: { defaultConverters: any }) => ({
  ...defaultConverters,
  quote: ({ node, nodesToJSX }: any) => (
    <blockquote
      className="pl-4 my-3 italic text-[var(--text-muted)]"
      style={{ borderLeft: '3px solid var(--liturgy)' }}
    >
      {nodesToJSX({ nodes: node.children })}
    </blockquote>
  ),
  paragraph: ({ node, nodesToJSX }: any) => (
    <p className="mb-4 last:mb-0">
      {nodesToJSX({ nodes: node.children })}
    </p>
  ),
  list: ({ node, nodesToJSX }: any) => {
    const children = nodesToJSX({ nodes: node.children })
    const NodeTag = node.tag
    const listClass =
      NodeTag === 'ol'
        ? 'list-decimal pl-6 mb-4 space-y-1'
        : NodeTag === 'ul'
          ? 'list-disc pl-6 mb-4 space-y-1'
          : 'mb-4 space-y-1'

    return <NodeTag className={listClass}>{children}</NodeTag>
  },
  heading: ({ node, nodesToJSX }: any) => {
    const children = nodesToJSX({ nodes: node.children })
    const NodeTag = node.tag

    if (NodeTag === 'h6') {
      return <h6 className="text-[var(--accent)] italic">{children}</h6>
    }

    return <NodeTag>{children}</NodeTag>
  },
})
