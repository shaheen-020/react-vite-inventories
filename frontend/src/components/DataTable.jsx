import React from "react";

export default function DataTable({ columns, data, loading, onEdit, onDelete }) {
    if (loading) {
        return <div className="text-center p-4">Loading...</div>;
    }

    if (!data || data.length === 0) {
        return <div className="text-center p-4">No data available</div>;
    }

    return (
        <div className="table-responsive">
            <table className="table table-striped table-md">
                <thead>
                    <tr>
                        <th>#</th>
                        {columns.map((col, index) => (
                            <th key={index}>{col.header}</th>
                        ))}
                        {(onEdit || onDelete) && <th>Action</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            {columns.map((col, colIndex) => (
                                <td key={colIndex}>
                                    {col.render
                                        ? col.render(item, index)
                                        : item[col.accessor]}
                                </td>
                            ))}
                            {(onEdit || onDelete) && (
                                <td>
                                    {onEdit && (
                                        <button
                                            onClick={() => onEdit(item)}
                                            className="btn btn-primary btn-sm mr-2"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={() => onDelete(item)}
                                            className="btn btn-danger btn-sm"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
