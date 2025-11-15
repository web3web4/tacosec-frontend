import './Table.css';
import { TableProps } from '@/types';


function Table<T extends object>({
  columns,
  data,
  className = '',
  pagination = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: TableProps<T>) {
  const handlePrev = () => {
    if (onPageChange && currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (onPageChange && currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

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

      {pagination && (
        <div className="table-pagination">
          <button
            className="pagination-btn"
            onClick={handlePrev}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="pagination-btn"
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Table;
