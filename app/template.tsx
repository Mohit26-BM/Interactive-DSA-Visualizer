// A template (unlike a layout) is re-created on every navigation, so each page eases in.
// Only opacity is animated, so it cannot disturb the page layout.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-fade flex-1 flex flex-col">{children}</div>;
}
