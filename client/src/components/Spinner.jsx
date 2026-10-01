export default () => (
  <div className="mx-auto max-w-7xl p-6"><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <div key={i} className="space-y-2"><div className="skeleton aspect-square" /><div className="skeleton h-4 w-3/4" /><div className="skeleton h-4 w-1/2" /></div>)}</div></div>
);
