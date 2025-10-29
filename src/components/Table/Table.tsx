import './Table.css';
import { TableProps } from '@/types';


function Table<T extends object>({ columns, data, className = '' }: TableProps<T>) {
  return (
    <div className={`table-container ${className}`}>
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} style={column.width ? { width: column.width } : {}}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => {
                const value = row[column.key];
                return (
                  <td key={colIndex}>
                    {column.render ? column.render(value, row) : String(value)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
