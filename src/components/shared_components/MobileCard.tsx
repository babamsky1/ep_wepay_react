interface MobileCardProps<T> {
  row: T;
  render: (row: T) => React.ReactNode;
}

export function MobileCard<T>({ row, render }: MobileCardProps<T>) {
  return (
    <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm space-y-3">
      {render(row)}
    </div>
  );
}
