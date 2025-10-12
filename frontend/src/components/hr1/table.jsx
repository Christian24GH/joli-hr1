export default function TableComponent({ list = [], columns = [], recordName = "applicant"}) {
  return (
    <div className="overflow-x-auto border dark:border-gray-700 rounded-lg">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            {columns.map((col, i) => (
              <th key={i} className="p-2 font-medium text-gray-900 dark:text-white">
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center p-4 text-gray-600 dark:text-gray-400">
                No {recordName}s found.
              </td>
            </tr>
          ) : (
            list.map((row, idx) => (
              <tr key={idx} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                {columns.map((col, i) => (
                  <td key={i} className="p-2 text-gray-900 dark:text-gray-200">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
