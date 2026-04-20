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
})
